import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

// Initialize Supabase and OpenAI
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, walletAddress } = body;

    if (!action || !walletAddress) {
      return new Response(JSON.stringify({ error: "Missing required fields action or walletAddress" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "submit_kyc") {
      const { firstName, lastName, dateOfBirth, country, documentType, documentNumber } = body;
      
      const errors: string[] = [];

      // Validation
      if (!firstName || !lastName || !/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName) || firstName.length < 2 || lastName.length < 2) {
         errors.push("Invalid first or last name");
      }
      
      let age = 0;
      if (!dateOfBirth) {
         errors.push("Missing date of birth");
      } else {
         const dob = new Date(dateOfBirth);
         const ageDiffMs = Date.now() - dob.getTime();
         const ageDate = new Date(ageDiffMs);
         age = Math.abs(ageDate.getUTCFullYear() - 1970);
         if (age < 18 || age > 100) errors.push("Age must be between 18 and 100");
      }

      if (!country || country.length !== 2) errors.push("Invalid country code");
      if (!documentNumber || documentNumber.length < 6 || !/^[A-Za-z0-9]+$/.test(documentNumber)) {
         errors.push("Invalid document number");
      }
      if (!["passport", "drivers_license", "national_id"].includes(documentType)) {
         errors.push("Invalid document type");
      }

      const applicantId = crypto.randomUUID();

      if (errors.length > 0) {
        const { error: upsertErr } = await supabase.from("participants").upsert({
           wallet_address: walletAddress,
           first_name: firstName,
           last_name: lastName,
           date_of_birth: dateOfBirth,
           country,
           document_type: documentType,
           document_number: documentNumber,
           kyc_status: "rejected", 
           rejection_reason: errors.join(", "),
           kyc_applicant_id: applicantId,
           submitted_at: new Date().toISOString()
        }, { onConflict: "wallet_address" });
        if(upsertErr) console.error("Participant Upsert Error (Reject):", upsertErr);

        const { error: auditErr } = await supabase.from("audit_logs").insert({
           wallet_address: walletAddress,
           action: "kyc_rejected",
           blocked: true,
           blocked_reason: "Validation failed"
        });
        if(auditErr) console.error("Audit Insert Error:", auditErr);

        return new Response(JSON.stringify({ success: false, status: "rejected", errors }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Passed basic validation
      const { error: upsertErr } = await supabase.from("participants").upsert({
         wallet_address: walletAddress,
         first_name: firstName,
         last_name: lastName,
         date_of_birth: dateOfBirth,
         country,
         document_type: documentType,
         document_number: documentNumber,
         kyc_status: "under_review",
         kyc_applicant_id: applicantId,
         submitted_at: new Date().toISOString()
      }, { onConflict: "wallet_address" });
      if(upsertErr) console.error("Participant Upsert Error (Success):", upsertErr);

      const { error: auditErr } = await supabase.from("audit_logs").insert({
         wallet_address: walletAddress,
         action: "kyc_submitted"
      });
      if(auditErr) console.error("Audit Insert Error:", auditErr);

      return new Response(JSON.stringify({ success: true, status: "under_review", applicantId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "auto_review") {
      // Step 1 - Get Participant
      const { data: participant, error: pErr } = await supabase
         .from("participants")
         .select("*")
         .eq("wallet_address", walletAddress)
         .single();
         
      if (pErr || !participant) {
         return new Response(JSON.stringify({ error: "Participant not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
      }

      // Step 2 - Rule Based Checks
      const HIGH_RISK_COUNTRIES = ["IR","KP","SY","CU","SD","BY","MM","RU","VE"];
      
      const dob = new Date(participant.date_of_birth);
      const ageDiffMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      const checks = [
        { 
          name: "Jurisdiction check", 
          passed: !HIGH_RISK_COUNTRIES.includes(participant.country),
          reason: "High-risk jurisdiction" 
        },
        { 
          name: "Age verification",
          passed: age >= 18 && age <= 100,
          reason: "Age requirement not met" 
        },
        { 
          name: "Document validity",
          passed: participant.document_number?.length >= 6,
          reason: "Invalid document number" 
        },
        { 
          name: "Name validation",
          passed: /^[a-zA-Z\s]+$/.test(participant.first_name + participant.last_name),
          reason: "Name contains invalid characters" 
        },
      ];

      // Step 3 - OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a compliance risk assessment engine for an institutional DeFi vault. Evaluate KYC submissions and return a risk score and decision. Be conservative but fair. Return ONLY valid JSON."
        }, {
          role: "user", 
          content: `Assess this KYC submission:
          Name: ${participant.first_name} ${participant.last_name}
          Country: ${participant.country}
          Document: ${participant.document_type} - ${participant.document_number}
          Age: ${age}
          Rule checks passed: ${checks.filter(c=>c.passed).length}/${checks.length}
          
          Return JSON only:
          {
            "riskScore": 0-100,
            "decision": "approved" or "rejected",
            "riskLevel": "LOW" or "MEDIUM" or "HIGH",
            "reasoning": "one sentence",
            "flags": ["any concerns"]
          }`
        }],
        response_format: { type: "json_object" }
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      
      // Step 4 - Decision
      const allRulesPassed = checks.every(c => c.passed);
      const ruleFailures = checks.filter(c => !c.passed).map(c => c.reason).join(", ");
      
      const finalRiskScore = aiResult.riskScore || 0;
      const rejectedByAI = aiResult.decision === "rejected" || finalRiskScore >= 75;
      
      if (!allRulesPassed || rejectedByAI) {
         const reason = !allRulesPassed ? `Rule failures: ${ruleFailures}` : aiResult.reasoning;
         
         await supabase.from("participants").update({
             kyc_status: "rejected", 
             rejection_reason: reason 
         }).eq("wallet_address", walletAddress);
         
         await supabase.from("audit_logs").insert({
             wallet_address: walletAddress,
             action: "kyc_rejected",
             risk_score: finalRiskScore,
             blocked: true,
             blocked_reason: reason
         });
         
         return new Response(JSON.stringify({ 
             status: "rejected", 
             checks, 
             riskScore: finalRiskScore, 
             reasoning: reason 
         }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Approved
      await supabase.from("participants").update({
          kyc_status: "approved", 
          approved_at: new Date().toISOString(), 
          risk_score: finalRiskScore 
      }).eq("wallet_address", walletAddress);
      
      await supabase.from("audit_logs").insert({
          wallet_address: walletAddress,
          action: "kyc_approved",
          risk_score: finalRiskScore
      });
      
      return new Response(JSON.stringify({ 
          status: "approved", 
          checks, 
          riskScore: finalRiskScore, 
          reasoning: aiResult.reasoning 
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_status") {
       const { data: participant, error } = await supabase
         .from("participants")
         .select("*")
         .eq("wallet_address", walletAddress)
         .single();
         
       if (error || !participant) {
          return new Response(JSON.stringify({ status: "not_registered" }), {
             status: 200,
             headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
       }
       
       return new Response(JSON.stringify({ 
           status: participant.kyc_status, 
           applicantId: participant.kyc_applicant_id, 
           riskScore: participant.risk_score, 
           isSanctioned: participant.is_sanctioned, 
           approvedAt: participant.approved_at 
       }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "admin_approve") {
       await supabase.from("participants").update({
          kyc_status: "approved",
          approved_at: new Date().toISOString()
       }).eq("wallet_address", walletAddress);
       
       await supabase.from("audit_logs").insert({
          wallet_address: walletAddress,
          action: "kyc_manually_approved"
       });
       
       return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("KYC Internal Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

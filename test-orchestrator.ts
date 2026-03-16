import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkuzzzgfjhrcbzpumnpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXp6emdmamhyY2J6cHVtbnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDUxMTcsImV4cCI6MjA4OTIyMTExN30.FNQmEavz8zKZJxwn1EKFk9AcSQFPAMaNm4f2oX2J3EA";

const supabase = createClient(supabaseUrl, supabaseKey);
const walletAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

async function testOrchestrator() {
  console.log("=== Testing Central Orchestrator (Mockless) ===");
  
  const steps = ['kyc', 'aml', 'travel', 'sof'];
  
  for (const stepId of steps) {
    console.log(`\nVerifying step: ${stepId}...`);
    const { data, error } = await supabase.functions.invoke('compliance-verify', {
      body: { stepId, walletAddress }
    });

    if (error) {
      console.error(`Error for ${stepId}:`, error);
      try {
        const errJson = await (error as any).context?.json();
        console.error("Error Detail:", JSON.stringify(errJson, null, 2));
      } catch {}
    } else {
      console.log(`Response for ${stepId}:`, JSON.stringify(data, null, 2));
    }
  }
}

testOrchestrator();

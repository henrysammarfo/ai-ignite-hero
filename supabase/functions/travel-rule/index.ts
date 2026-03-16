import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const TRAVEL_RULE_THRESHOLD = 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==========================================
// Copied ivms101 pure-ts methods locally
// ==========================================
export interface Ivms101Payload {
  originator: {
    originatorPersons: [{
      naturalPerson: {
        name: [{
          nameIdentifier: [{
            primaryIdentifier: string;
            secondaryIdentifier: string;
            nameIdentifierType: 'LEGL';
          }];
        }];
      };
    }];
    accountNumber: string[];
  };
  beneficiary: {
    beneficiaryPersons: [{
      naturalPerson: {
        name: [{
          nameIdentifier: [{
            primaryIdentifier: string;
            secondaryIdentifier: string;
            nameIdentifierType: 'LEGL';
          }];
        }];
      };
    }];
    accountNumber: string[];
  };
  originatingVasp: {
    originatingVasp: {
      legalPerson: {
        name: {
          nameIdentifier: [{
            legalPersonName: string;
            legalPersonNameIdentifierType: 'LEGL';
          }];
        };
      };
    };
  };
  beneficiaryVasp: {
    beneficiaryVasp: {
      legalPerson: {
        name: {
          nameIdentifier: [{
            legalPersonName: string;
            legalPersonNameIdentifierType: 'LEGL';
          }];
        };
      };
    };
  };
  payloadMetadata: {
    transliterationMethod: ['ROMN'];
  };
}

function buildIvms101(params: {
  senderWallet: string;
  senderFirstName: string;
  senderLastName: string;
  receiverWallet: string;
  receiverFirstName: string;
  receiverLastName: string;
  originatingVaspName?: string;
  beneficiaryVaspName?: string;
}): Ivms101Payload {
  return {
    originator: {
      originatorPersons: [{
        naturalPerson: {
          name: [{
            nameIdentifier: [{
              primaryIdentifier: params.senderLastName,
              secondaryIdentifier: params.senderFirstName,
              nameIdentifierType: 'LEGL'
            }]
          }]
        }
      }],
      accountNumber: [params.senderWallet]
    },
    beneficiary: {
      beneficiaryPersons: [{
        naturalPerson: {
          name: [{
            nameIdentifier: [{
              primaryIdentifier: params.receiverLastName,
              secondaryIdentifier: params.receiverFirstName,
              nameIdentifierType: 'LEGL'
            }]
          }]
        }
      }],
      accountNumber: [params.receiverWallet]
    },
    originatingVasp: {
      originatingVasp: {
        legalPerson: {
          name: {
            nameIdentifier: [{
              legalPersonName: params.originatingVaspName || 'ComplianceVault',
              legalPersonNameIdentifierType: 'LEGL'
            }]
          }
        }
      }
    },
    beneficiaryVasp: {
      beneficiaryVasp: {
        legalPerson: {
          name: {
            nameIdentifier: [{
              legalPersonName: params.beneficiaryVaspName || 'ComplianceVault',
              legalPersonNameIdentifierType: 'LEGL'
            }]
          }
        }
      }
    },
    payloadMetadata: {
      transliterationMethod: ['ROMN']
    }
  };
}

function validateIvms101(payload: Ivms101Payload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const orig = payload.originator?.originatorPersons?.[0]?.naturalPerson?.name?.[0]?.nameIdentifier?.[0];
  if (!orig?.primaryIdentifier) errors.push('Originator last name required');
  if (!orig?.secondaryIdentifier) errors.push('Originator first name required');

  const bene = payload.beneficiary?.beneficiaryPersons?.[0]?.naturalPerson?.name?.[0]?.nameIdentifier?.[0];
  if (!bene?.primaryIdentifier) errors.push('Beneficiary last name required');
  if (!bene?.secondaryIdentifier) errors.push('Beneficiary first name required');

  if (!payload.originator?.accountNumber?.[0]) errors.push('Sender wallet required');
  if (!payload.beneficiary?.accountNumber?.[0]) errors.push('Receiver wallet required');

  return { valid: errors.length === 0, errors };
}

async function hashIvms101(payload: Ivms101Payload): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// ==========================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "check_required") {
      const { amount } = body;
      return new Response(JSON.stringify({
        required: amount >= TRAVEL_RULE_THRESHOLD,
        threshold: TRAVEL_RULE_THRESHOLD
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "validate") {
      const { payload } = body;
      const result = validateIvms101(payload);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "submit") {
      const {
        senderWallet,
        senderFirstName,
        senderLastName,
        receiverWallet,
        receiverFirstName,
        receiverLastName,
        amount
      } = body;

      const payload = buildIvms101({
        senderWallet,
        senderFirstName,
        senderLastName,
        receiverWallet,
        receiverFirstName,
        receiverLastName
      });

      const validation = validateIvms101(payload);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: "Invalid IVMS101 Payload", errors: validation.errors }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const hash = await hashIvms101(payload);
      const referenceId = crypto.randomUUID();

      await supabase.from("travel_rule_submissions").insert({
        reference_id: referenceId,
        payload_json: payload,
        payload_hash: hash,
        sender_wallet: senderWallet,
        receiver_wallet: receiverWallet,
        amount: amount
      });

      await supabase.from("audit_logs").insert({
        wallet_address: senderWallet,
        action: "travel_rule_submitted",
        amount: amount,
        travel_rule_required: true,
        travel_rule_hash: hash,
        provider_used: "ivms101",
        layer: "travel_rule"
      });

      return new Response(JSON.stringify({
        success: true,
        hash,
        referenceId,
        payloadSummary: {
          sender: senderFirstName + ' ' + senderLastName,
          receiver: receiverFirstName + ' ' + receiverLastName,
          amount,
          threshold: TRAVEL_RULE_THRESHOLD
        }
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Travel Rule Error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

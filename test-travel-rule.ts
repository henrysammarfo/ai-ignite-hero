import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkuzzzgfjhrcbzpumnpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXp6emdmamhyY2J6cHVtbnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDUxMTcsImV4cCI6MjA4OTIyMTExN30.FNQmEavz8zKZJxwn1EKFk9AcSQFPAMaNm4f2oX2J3EA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubmitTravelRule() {
  console.log("=== Testing submit travel rule ===");
  const { data, error } = await supabase.functions.invoke('travel-rule', {
    body: {
      action: 'submit',
      senderWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      senderFirstName: 'John', 
      senderLastName: 'Doe',
      receiverWallet: 'BRnRb5V7SRxpDLAqLzMQ7zkyNLBGnEVZF4aSLFCKDPGw',
      receiverFirstName: 'Jane', 
      receiverLastName: 'Smith',
      amount: 5000
    }
  });

  if (error) {
    console.error("Error submitting Travel Rule:", error);
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

async function runTests() {
  await testSubmitTravelRule();
}

runTests();

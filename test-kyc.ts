import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkuzzzgfjhrcbzpumnpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXp6emdmamhyY2J6cHVtbnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDUxMTcsImV4cCI6MjA4OTIyMTExN30.FNQmEavz8zKZJxwn1EKFk9AcSQFPAMaNm4f2oX2J3EA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubmitKyc() {
  console.log("=== Testing submit_kyc ===");
  const { data, error } = await supabase.functions.invoke('kyc-internal', {
    body: { 
      action: 'submit_kyc',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      firstName: 'John', lastName: 'Doe',
      dateOfBirth: '1990-01-15', country: 'US',
      documentType: 'passport', documentNumber: 'AB123456'
    }
  });

  if (error) {
    console.error("Error submitting KYC:", error);
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

async function testAutoReview() {
  console.log("\n=== Testing auto_review ===");
  const { data, error } = await supabase.functions.invoke('kyc-internal', {
    body: { 
      action: 'auto_review',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    }
  });

  if (error) {
    console.error("Error running auto review:", error);
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

async function runTests() {
  await testSubmitKyc();
  // Adding a slight delay just in case
  await new Promise(r => setTimeout(r, 2000));
  await testAutoReview();
}

runTests();

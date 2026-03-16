import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkuzzzgfjhrcbzpumnpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXp6emdmamhyY2J6cHVtbnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDUxMTcsImV4cCI6MjA4OTIyMTExN30.FNQmEavz8zKZJxwn1EKFk9AcSQFPAMaNm4f2oX2J3EA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetStats() {
  console.log("=== Testing get_stats ===");
  const { data, error } = await supabase.functions.invoke('ofac-screening', {
    body: { action: 'get_stats' }
  });

  if (error) {
    console.error("Error running get_stats:", error);
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

async function testScreenAddress() {
  console.log("\n=== Testing screen_address ===");
  const { data, error } = await supabase.functions.invoke('ofac-screening', {
    body: { 
      action: 'screen_address', 
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' 
    }
  });

  if (error) {
    console.error("Error screening address:", error);
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

async function runTests() {
  await testGetStats();
  await new Promise(r => setTimeout(r, 2000));
  await testScreenAddress();
}

runTests();

async function testRaw() {
  const url = 'https://jkuzzzgfjhrcbzpumnpj.supabase.co/functions/v1/kyc-internal';
  const anonKey = 'sb_publishable_XpyGulnmqnCZtM1XRn9l3Q_sf0REk0s';

  console.log("Pinging", url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'submit_kyc',
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        country: 'US',
        documentType: 'passport',
        documentNumber: 'AB123456'
      })
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

testRaw();

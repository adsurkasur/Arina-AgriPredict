// Test the demands processing API
const testCases = [
  "I need 100 kg of tomatoes at $2.50 per kg",
  "Sold 50kg rice for $3.20/kg yesterday",
  "Purchase: 200kg potatoes @ $1.80 each",
  "Need to buy 75kg onions at market price"
];

async function testAPI(text) {
  try {
    const response = await fetch('/api/demands/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS for:', text);
      console.log('Extracted data:', data.data);
    } else {
      console.log('❌ ERROR for:', text);
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ FETCH ERROR for:', text);
    console.log('Error:', error.message);
  }
}

// Test all cases
testCases.forEach(testCase => testAPI(testCase));

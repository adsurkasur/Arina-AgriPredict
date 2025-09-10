// Test script for demands processing API
const testData = {
  text: "I need 100 kg of tomatoes at $2.50 per kg"
};

fetch('http://localhost:3000/api/demands/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('✅ API Test Successful!');
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ API Test Failed:', error.message);
});

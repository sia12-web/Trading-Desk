
const apiKey = '990b8d45fcae403e7f005ccea9bfbb0f-7d843874e931148ca332aabe32b6b69d';
const accountId = '101-002-36082256-001';
const baseUrl = 'https://api-fxpractice.oanda.com';

async function testConnection() {
    console.log('--- OANDA Connection Test (DEMO) ---');
    const url = `${baseUrl}/v3/accounts/${accountId}/summary`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);

        if (response.ok) {
            console.log('✅ Success! Account Balance:', data.account?.balance);
        } else {
            console.error('❌ Failed:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

testConnection();

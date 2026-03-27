
const apiKey = '9eacfb18fd6efe5db2b23dbd83dca787-7858952ee72cba6e87c911c452e6e59b';
const accountId = '001-002-17823794-001';
const baseUrl = 'https://api-fxtrade.oanda.com';

async function testConnection() {
    console.log('--- OANDA Connection Test (LIVE) ---');
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

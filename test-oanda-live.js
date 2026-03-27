
async function testLive() {
    const accountId = process.env.OANDA_LIVE_ACCOUNT_ID;
    const apiKey = process.env.OANDA_LIVE_API_KEY;
    const baseUrl = process.env.OANDA_LIVE_API_URL || 'https://api-fxtrade.oanda.com';

    console.log('Testing Live OANDA connection...');
    console.log('Account ID:', accountId);
    console.log('Base URL:', baseUrl);
    console.log('API Key length:', apiKey?.length);

    if (!accountId || !apiKey) {
        console.error('ERROR: Missing Account ID or API Key in env');
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/v3/accounts/${accountId}/summary`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();

        if (res.ok) {
            console.log('SUCCESS: Connected to Live Account');
            console.log('Balance:', data.account.balance, data.account.currency);
        } else {
            console.error('FAILURE:', res.status, data);
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

testLive();

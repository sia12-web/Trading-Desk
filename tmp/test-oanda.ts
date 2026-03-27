import { readFileSync } from 'fs';
import path from 'path';

// Manually load .env.local (dotenv not in dependencies)
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envFile = readFileSync(envPath, 'utf-8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=:#]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        });
    } catch (error) {
        console.warn('Could not load .env.local:', (error as Error).message);
    }
}

loadEnv();

const apiKey = process.env.OANDA_DEMO_API_KEY;
const accountId = process.env.OANDA_DEMO_ACCOUNT_ID;
const baseUrl = process.env.OANDA_DEMO_API_URL || 'https://api-fxpractice.oanda.com';

async function testConnection() {
    console.log('--- OANDA Connection Test ---');
    console.log('Mode: DEMO');
    console.log('Account ID:', accountId);
    console.log('Base URL:', baseUrl);
    console.log('API Key length:', apiKey?.length || 0);

    if (!apiKey || !accountId) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const endpoint = `/v3/accounts/${accountId}/summary`;
    const url = `${baseUrl}${endpoint}`;

    try {
        console.log('Fetching:', url);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', response.status);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success! Account Balance:', data.account?.balance);
        } else {
            console.error('❌ Failed:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error('❌ Exception:', error.message);
    }
}

testConnection();

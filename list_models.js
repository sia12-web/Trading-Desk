const Anthropic = require('@anthropic-ai/sdk').default
const fs = require('fs')

try {
    const env = fs.readFileSync('.env.local', 'utf-8')
    const key = env.split('\n').find(l => l.startsWith('ANTHROPIC_API_KEY=')).split('=')[1].trim()
    
    if (!key) {
        console.error("Missing ANTHROPIC_API_KEY in .env.local")
        process.exit(1)
    }

    const anthropic = new Anthropic({ apiKey: key })

    async function main() {
        try {
            const response = await anthropic.models.list()
            console.log("Anthropic Models Available:")
            console.log(response.data.map(m => m.id))
        } catch (e) {
            console.error("Failed to list Anthropic models:", e.message || e)
        }
    }

    main()
} catch (err) {
    console.error("Failed to read .env.local:", err.message)
}

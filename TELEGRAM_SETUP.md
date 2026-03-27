# Telegram 24/7 Mentor Setup Guide

## Step 1: Create Your Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Follow the prompts:
   - Choose a name for your bot (e.g., "Trade Desk Mentor")
   - Choose a username (must end in 'bot', e.g., "tradedesk_mentor_bot")
4. BotFather will give you a **BOT TOKEN** - copy it
5. Add this to your `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

## Step 2: Get Your Chat ID

1. Search for your bot in Telegram (use the @username you created)
2. Start a chat and send any message (e.g., "/start")
3. Open this URL in your browser (replace YOUR_BOT_TOKEN):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789}` in the response
5. Copy that number - this is your **CHAT ID**
6. Save it in your Daily Plan settings in the app

## Step 3: Configure in Trade Desk

1. Go to `/daily-plan` in your Trade Desk app
2. Scroll to "24/7 Mentor Settings"
3. Enter your Chat ID
4. Enable Telegram notifications
5. Configure your wake-up time, trading hours, and notification preferences
6. Save settings

## Step 4: Test

1. The cron job runs every 15 minutes
2. You should receive notifications based on:
   - Your wake-up time
   - Market session openings
   - Trading hours
   - Hourly check-ins (if enabled)
   - Break reminders (if enabled)
   - Mental coaching (if enabled)

## Notification Types You'll Receive:

- 🌅 Wake-up call
- ☕ Pre-market routine (30 min before trading)
- 📊 Session opens (Tokyo, London, NY)
- 🔥 Session overlaps (high liquidity)
- 📈 Hourly check-ins during trading hours
- ⏸️ Break reminders (every 2 hours)
- 🎯 Strategy Gate reminders
- 🌙 Evening routine
- 💤 End of day

All messages are **pre-written templates** - no AI API costs!

## Privacy & Security

- Your chat ID is stored encrypted in the database
- Only you receive messages from your bot
- You can disable Telegram anytime from settings
- The bot cannot read your messages or access your Telegram data

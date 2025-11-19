# AI Real Estate Prospector

A Next.js 14 application that helps real estate investors find high-intent seller leads and automate personalized outreach via email and SMS.

## Features

- **Smart Lead Generation**: Fetch 50 hot seller leads from any ZIP code
  - Absentee owners with >50% equity
  - Properties owned for 7+ years
  - Intent scores (0-100) based on equity and ownership duration

- **AI-Powered Messaging**: GPT-4o generates personalized cold emails and SMS for each lead

- **Automated Outreach**: Send bulk emails (SendGrid) and SMS (Twilio) with one click

- **Demo Mode**: Test the app with mock data without API keys

- **Supabase Integration**: All leads saved to cloud database

## Tech Stack

- **Framework**: Next.js 13.5 with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **APIs**: ATTOM Data, OpenAI GPT-4o, Twilio, SendGrid
- **Deployment**: Replit-ready with `.replit` config

## Prerequisites

- Node.js 20+
- Supabase account (free tier works)
- Optional: ATTOM, OpenAI, Twilio, SendGrid API keys (demo mode available without)

## Quick Start

### 1. Clone and Install

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:

\`\`\`env
# Required: Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Set to 'true' to use demo mode with mock data
DEMO_MODE=true

# Optional: For production use
ATTOM_API_KEY=your-attom-api-key
OPENAI_API_KEY=your-openai-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-sender@example.com
\`\`\`

### 3. Database Setup

Run the SQL migration in your Supabase SQL Editor (see `DATABASE_SETUP.md`):

\`\`\`sql
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text NOT NULL,
  address text NOT NULL,
  owner_name text NOT NULL,
  owner_phone text,
  owner_email text,
  equity_percent numeric(5, 2) NOT NULL,
  years_owned integer NOT NULL,
  intent_score integer NOT NULL CHECK (intent_score >= 0 AND intent_score <= 100),
  email_content text,
  sms_content text,
  email_sent boolean DEFAULT false,
  sms_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to leads"
  ON leads FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert access to leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public update access to leads"
  ON leads FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_zip_code ON leads(zip_code);
CREATE INDEX IF NOT EXISTS idx_leads_intent_score ON leads(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter ZIP Code**: Type a 5-digit US ZIP code
2. **Fetch Leads**: Click "Fetch 50 Hot Seller Leads"
3. **Review Results**: Browse the generated leads table with intent scores
4. **Send Outreach**:
   - Click "Send First 10 Emails" to email the top prospects
   - Click "Send First 10 SMS" to text the top prospects

## Demo Mode

Set `DEMO_MODE=true` in `.env.local` to:
- Generate 50 realistic mock leads
- Create AI-like personalized messages
- Simulate email/SMS sending without actual API calls
- Perfect for testing and demos

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── leads/route.ts          # Lead generation endpoint
│   │   ├── send-emails/route.ts    # Email sending endpoint
│   │   └── send-sms/route.ts       # SMS sending endpoint
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main dashboard
├── components/
│   ├── LeadTable.tsx               # Leads data table
│   ├── ProspectorForm.tsx          # ZIP input & action buttons
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── supabase.ts                 # Supabase client & types
│   ├── attom.ts                    # ATTOM API integration
│   ├── openai.ts                   # OpenAI GPT-4o integration
│   ├── twilio.ts                   # Twilio SMS integration
│   ├── sendgrid.ts                 # SendGrid email integration
│   └── scoring.ts                  # Intent score calculation
├── .env.example                    # Environment template
├── .replit                         # Replit deployment config
└── DATABASE_SETUP.md               # Supabase migration guide
\`\`\`

## Deployment

### Replit

1. Import this project to Replit
2. Add environment variables in Secrets
3. Click "Run" - it deploys automatically!

### Vercel/Netlify

\`\`\`bash
npm run build
\`\`\`

Add environment variables in your platform's dashboard.

## API Keys

### Supabase (Required)
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Find credentials in Settings → API

### ATTOM Data (Optional)
- Get API key at [api.developer.attomdata.com](https://api.developer.attomdata.com)
- Free tier: 1,000 requests/month

### OpenAI (Optional)
- Get API key at [platform.openai.com](https://platform.openai.com)
- GPT-4o required for best results

### Twilio (Optional)
- Sign up at [twilio.com](https://twilio.com)
- Get trial credits for testing

### SendGrid (Optional)
- Sign up at [sendgrid.com](https://sendgrid.com)
- Verify sender email address

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

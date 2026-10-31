# Submission Note — Catch-Up Lens

## Fan Problem

Fans are split-attention. During a live T20 match, they step away — a call, a commute, a snack — and return lost. The scoreboard shows numbers but not what happened or why it matters. They're also watching alone, with no one to react with or share the tension.

## How the Solution Helps

Catch-Up Lens is an AI-powered second-screen artifact that welcomes fans back into a live cricket match in under 20 seconds. When it detects you've been away (tab switch, inactivity, or manual trigger), it slides up a Catch-Up card with a punchy headline, a concise summary of what you missed (≤ 45 words), why it matters to the chase, and what to watch next. Three tone options — Simple, Cricket Nerd, and Hinglish — let fans consume the summary their way. After catching up, fans immediately re-engage through free-to-play over predictions (runs and wickets) with a simulated demo crowd showing live opinion splits, emoji reactions, and a Fan IQ streak score. A deterministic match engine ensures the full experience works offline with zero errors.

## AI Tools Used

- **Google Antigravity** — Used for pair-programming, architecture design, code generation, component design, test authoring, browser verification, and end-to-end build automation.
- **Groq API (Llama 3.3 70B Versatile)** — Powers the server-side `/api/catchup` endpoint via OpenAI-compatible REST endpoint for sub-second generation of natural-language match summaries from structured data, with a deterministic template-based fallback ensuring 100% uptime without an API key.

# Verbal Nova

Master SAT vocabulary with interactive flashcards and quizzes.

## Features

- 📚 Interactive flashcards for SAT vocabulary
- 🎯 Adaptive quizzes to test your knowledge
- 📊 Track your progress and improvement
- 🎨 Modern, responsive UI with dark mode
- 🔐 Secure authentication with Appwrite

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite
- **UI Components**: Radix UI
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Appwrite account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd verbal-nova
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Appwrite credentials:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`: Your database ID
- `NEXT_PUBLIC_APPWRITE_VOCABULARY_COLLECTION_ID`: Vocabulary collection ID
- `NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID`: User progress collection ID
- `APPWRITE_API_KEY`: Your Appwrite API key

### Database Setup

Run the SQL script to create necessary tables:
```bash
# Check scripts/01-create-tables.sql for the schema
```

### Development

Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Environment Variables

Make sure to set all required environment variables on your deployment platform. See `.env.example` for the complete list.

## License

© 2025 Verbal Nova. All rights reserved.

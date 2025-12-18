import { Client, Account, Databases, ID, OAuthProvider } from "appwrite"

// Next.js requires direct access to NEXT_PUBLIC_* env vars for client-side code
// Dynamic access via process.env[key] doesn't work as the bundler can't inline them
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  throw new Error(
    "Missing required Appwrite environment variables.\n" +
      "Please ensure NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID are set in .env.local"
  )
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

// Add dev key for bypassing rate limits in development
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APPWRITE_DEV_KEY) {
  client.headers['X-Appwrite-Dev-Key'] = process.env.NEXT_PUBLIC_APPWRITE_DEV_KEY
}

export const account = new Account(client)
export const databases = new Databases(client)
export { OAuthProvider }

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const VOCABULARY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_VOCABULARY_COLLECTION_ID!
export const USER_PROGRESS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID!

export { ID }

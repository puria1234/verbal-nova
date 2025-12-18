# Appwrite Setup Instructions

## Step 1: Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

Or if you prefer using Homebrew (macOS):
```bash
brew install appwrite
```

## Step 2: Login to Appwrite

```bash
appwrite login
```

You'll be prompted to enter:
- **Endpoint**: `https://cloud.appwrite.io/v1`
- **Email**: Your Appwrite Cloud email
- **Password**: Your Appwrite Cloud password

## Step 3: Initialize Your Project

```bash
appwrite init project
```

This will create an `appwrite.json` file. Choose your project when prompted.

## Step 4: Update appwrite.json

Replace the `appwrite.json` file in your project with the provided configuration file. Make sure to update:
- `"projectId"`: Replace with YOUR_PROJECT_ID from your Appwrite console

## Step 5: Get Your Project ID

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Select your project
3. Go to **Settings** > **General**
4. Copy your **Project ID**
5. Replace `YOUR_PROJECT_ID` in `appwrite.json`

## Step 6: Create Collections Using CLI

```bash
appwrite init collections
```

This will prompt you to set up your collections from the `appwrite.json` config.

## Step 7: Push Configuration to Appwrite

```bash
appwrite push collections
```

This will create:
- **sat_vocab_db** database
- **vocabulary** collection with all word attributes
- **user_progress** collection for tracking learning progress
- **quiz_results** collection for storing quiz scores

## Step 8: Add Environment Variables to v0

In the v0 Vars section, add:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID=sat_vocab_db
NEXT_PUBLIC_APPWRITE_VOCABULARY_COLLECTION_ID=vocabulary
NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID=user_progress
NEXT_PUBLIC_APPWRITE_QUIZ_RESULTS_COLLECTION_ID=quiz_results
```

## Step 9: Enable Email/Password Authentication

1. Go to your Appwrite console
2. Navigate to **Auth** > **Settings**
3. Enable **Email/Password** authentication
4. Your app is now ready to use!

## Troubleshooting

- **API Key Error**: Make sure you're logged in with `appwrite login`
- **Project Not Found**: Verify your PROJECT_ID matches what's in your console
- **Collection Already Exists**: Use `appwrite push collections --all --force` to overwrite

## Next Steps

Your database is now set up! The app will:
1. Allow users to sign up/login
2. Save their progress on vocabulary words
3. Track quiz results
4. Display a dashboard with statistics

You can add vocabulary words directly in your Appwrite console or through the app's admin panel.

# Supabase Backend Setup Guide

Follow these steps to set up the backend for SmartPlan.

## 1. Create a Supabase Project
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click **"New Project"**.
3.  Select your organization.
4.  Enter a name (e.g., "SmartPlan").
5.  Set a strong database password (save this!).
6.  Choose a region close to you.
7.  Click **"Create new project"**.
8.  Wait for the project to provision.

## 2. Get Credentials
1.  Once the project is ready, go to **Project Settings** (cog icon) -> **API**.
2.  Copy the **Project URL**.
3.  Copy the **anon public** key.
    *   **WARNING**: Never expose the `service_role` key in your frontend app.

## 3. Enable Authentication Providers
1.  Go to **Authentication** -> **Providers**.
2.  **Email/Phone**: Ensure "Email" is enabled.
    *   (Optional) Disable "Confirm email" if you want to skip email verification for development: **Authentication** -> **URL Configuration** -> **Site URL**.
3.  **Google (Optional)**:
    *   Enable "Google".
    *   You will need to set up a Google Cloud Project to get the "Client ID" and "Client Secret".
    *   Add your Supabase "Callback URL" (found on the provider page) to your Google Console "Authorized redirect URIs".

## 4. Database Setup
1.  Go to the **SQL Editor** (terminal icon) in the sidebar.
2.  Click **"New Query"**.
3.  Copy the content of `schema.sql` (provided in the codebase) and paste it into the query editor.
4.  Click **"Run"**.
    *   This creates the `tasks` and `monthly_goals` tables and sets up strict security policies.

## 5. Edge Functions Setup (AI Chat)
You will need the Supabase CLI installed on your machine.
1.  **Login**:
    ```bash
    npx supabase login
    ```
2.  **Link Project**:
    ```bash
    npx supabase link --project-ref <your-project-id>
    ```
    *   Get `<your-project-id>` from your Project URL: `https://<your-project-id>.supabase.co`.
    *   Enter your database password when prompted.
3.  **Set Secrets**:
    You need an API key for the AI service (e.g., Grok/xAI or OpenAI).
    ```bash
    npx supabase secrets set AI_API_KEY=your-api-key-here
    ```
4.  **Deploy Function**:
    ```bash
    npx supabase functions deploy ai-chat-proxy
    ```

## 6. Frontend Connection
1.  Create a `.env` file in the root of your React project (copy `.env.example` if it exists).
2.  Add your credentials:
    ```env
    VITE_SUPABASE_URL=your-project-url
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```
3.  The app captures these variables to initialize the Supabase client.

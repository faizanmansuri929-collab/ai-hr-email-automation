# AI HR Email Automation

A beautiful, production-ready web application built with Next.js 15, Tailwind CSS, and the Gmail API to automate sending job application emails in bulk.

## Features

- **Google OAuth Login**: Secure authentication with NextAuth.js.
- **Gmail API Integration**: Send emails directly from your Gmail account without SMTP configurations.
- **Bulk Sending**: Paste multiple comma-separated emails and send individually with progress tracking.
- **Rate Limiting**: Built-in 1-second delay between emails to avoid hitting Gmail API limits.
- **Rich UI**: Modern, beautiful dashboard built with Shadcn UI and Tailwind CSS.
- **Dark/Light Mode**: Full theme support.
- **Automatic Attachments**: Automatically attaches your `resume.pdf` to every email.

---

## 🚀 Environment Variables Guide

Before running the application, create a `.env.local` file in the root directory and add the following variables:

```env
# Generate a secret using: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here

# Used for NextAuth routing in production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (see setup guide below)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🛠 Google Cloud & Gmail API Setup Guide

To use this application, you must configure a Google Cloud Project with the Gmail API enabled.

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name it "AI HR Email Automation" and click **Create**.

### 2. Enable the Gmail API
1. In the sidebar, go to **APIs & Services** > **Library**.
2. Search for **Gmail API**.
3. Click on it and click **Enable**.

### 3. Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (or Internal if you have a Google Workspace) and click **Create**.
3. Fill in the required fields:
   - App Name: AI HR Email
   - User Support Email: Your email
   - Developer Contact Email: Your email
4. Click **Save and Continue**.
5. On the **Scopes** step, click **Add or Remove Scopes**.
6. Manually add this scope: `https://www.googleapis.com/auth/gmail.send`
7. Click **Save and Continue**.
8. Add your email address under **Test Users** so you can login while the app is unpublished.

### 4. Create OAuth Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Web application** as the Application type.
4. Name it "Next.js Web App".
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://your-vercel-domain.vercel.app` (for production)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret** into your `.env.local` file.

---

## 📄 Attachment Setup

Place your resume in the `public/` directory and name it exactly `resume.pdf`. The application is hardcoded to look for this file and attach it to the emails.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Vercel Deployment Guide

This application is ready to be deployed on Vercel's Free Plan with zero modifications.

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add the same variables from your `.env.local` file:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set this to your production Vercel domain)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Click **Deploy**.

> **Note**: Don't forget to update your Google Cloud Credentials with the new Vercel Authorized Redirect URI (`https://your-app.vercel.app/api/auth/callback/google`) after deployment!

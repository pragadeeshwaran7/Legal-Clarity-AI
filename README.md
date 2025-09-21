# Legal Clarity AI

Welcome to Legal Clarity AI, your AI-powered assistant for analyzing, understanding, and improving legal documents. This application is built with Next.js, TypeScript, and Google's Generative AI to provide powerful legal insights.

## Features

This application comes with a suite of tools to help you navigate complex legal texts:

*   **Authentication**: Secure sign-in with Google to protect your session.
*   **Document Upload**: Analyze documents by either pasting text directly or uploading a PDF file.
*   **AI-Powered Analysis**: Once a document is submitted, you get a comprehensive breakdown including:
    *   **Executive Summary**: A quick, easy-to-understand summary of the document.
    *   **Risk Assessment**: A general overview of potential risks.
    *   **Compliance Analysis**: A check against relevant laws and regulations.
    *   **Key Clause Explanations**: Understand the most critical parts of your document.
    *   **Detailed Clause-by-Clause Analysis**: An itemized list of risky clauses, their potential impact, and compliance issues.
*   **Legal Chatbot**: An interactive chat interface to ask specific questions about your document in plain English (e.g., "What are the penalties for breaking this clause?").
*   **Clause Comparer**: Select a risky clause identified by the AI and receive an improved, safer, and legally compliant version.
*   **Text Simplifier**: Paste any piece of complex legal jargon and get a simple, plain-English explanation.
*   **Text-to-Speech**: Listen to the executive summary for a hands-free overview.

## Getting Started

The application is ready to run. To start the development server, use the following command:

```bash
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The main entry point for the application's user interface is located at `src/app/page.tsx`.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (React)
*   **Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)

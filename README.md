This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

To start python virtual environment:
source backend/venv/bin/activate

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up Python environment: `pip install requests`
4. Set your OpenAI API key:
   - create .env.local and add OPENAI_API_KEY
5. Start the development server: `npm run dev`
6. Open http://localhost:3000 in your browser

## Project Structure

- `/components`: React components
- `/app`: Next.js app router
- `/backend`: Python backend for OpenAI
- `/uploads`: Temporary storage for uploaded documents

# Document Summarizer Backend

This directory contains the Python scripts used for document processing and integration with OpenAI's API.

## Setup

### Prerequisites

- Python 3.8 or higher
- OpenAI API key with access to GPT-4 Vision

### Virtual Environment Setup

1. Create the virtual environment (if not already created):

   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### API Key Configuration

Set your OpenAI API key as an environment variable:

- On Windows:

  ```bash
  set OPENAI_API_KEY=your-openai-api-key
  ```

- On macOS/Linux:
  ```bash
  export OPENAI_API_KEY=your-openai-api-key
  ```

For production, consider using a more secure method to store your API key, such as environment variables in your deployment platform or a secrets management service.

## Usage

The Python script is designed to be called from the Next.js API route and not directly. However, for testing purposes, you can run:

```bash
python process_document.py /path/to/document.pdf
```

The script will output a JSON object containing the document summary.

## Configuration

You can modify the following aspects of the script:

- `max_tokens`: Controls the length of the generated summary (default: 1000)
- The system prompt to change how the document is analyzed
- The OpenAI model, though GPT-4 Vision is recommended for document analysis

## Troubleshooting

- If you encounter an error about the OpenAI API key, make sure it's set correctly as an environment variable
- If the script fails to process certain file types, check that they're supported by GPT-4 Vision
- For large documents, consider breaking them into smaller chunks or adjusting the max_tokens parameter

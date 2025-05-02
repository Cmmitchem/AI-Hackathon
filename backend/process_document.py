import os 
import sys 
import json 
import base64
import requests
import base64
import mimetypes
from pathlib import Path 

from docx import Document
import PyPDF2
import io

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

def extract_text_from_docx(file_path):
    """Extract text from a word document (.docx)"""
    try: 
        doc = Document(file_path)
        full_text = []

        #extract text from each paragraph
        for para in doc.paragraphs: 
            full_text.append(para.text)

        for table in doc.tables:
            for row in table.row: 
                for cell in row.cells: 
                    full_text.append(cell.text)

        return '\n'.join(full_text)
    except Exception as e: 
        raise Exception(f"Error extracting text from word document: {str(e)}")
    
def extract_text_from_pdf(file_path):
    """Extract text from a PDF doc"""
    try: 
        with open(file_path, 'rb') as file: 
            pdf_reader = PyPDF2.PdfReader(file)
            full_text=[]
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                full_text.append(page.extract_text())
            return '\n'.join(full_text)
    except Exception as e:
        Exception(f"Error extracting text from PDF: {str(e)}")

def get_document_text(file_path):
    """Extract text from document based on file type"""
    file_extension = Path(file_path).suffix.lower()

    if file_extension == '.docx': 
        return extract_text_from_docx(file_path)
    elif file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension in ['.txt', '.md', '.csv']:
        # for text files read the content
        with open(file_path, 'r', encoding='utf-8', errors="ignore") as file:
            return file.read()
        
    else: 
        raise Exception(f"unsupported file format: {file_extension}. Supported formats are .docx, .pdf,.txt, .md, and .csv")

def  get_document_summary(file_path):
    """Send document to openAI API and get summary response"""
    if not OPENAI_API_KEY: 
        raise ValueError("OpenAI API key not found, please set the OPENAI_API_KEY env variable.")
    
    #get file content 
    document_text = get_document_text(file_path)
    
    # prepare the API request
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    #create message payload 
    payload = {
        "model": 'gpt-4o', 
        "max_tokens": 1000, 
        "messages": [
            {
                "role": "system",
                "content": "You are a document analysis assistant that provides concise summaries, extracts key points, and identifies next steps from documents. Focus on the most important information."
            },
            {
                "role": "user", 
                "content": [
                    {
                        "type": "text",
                        "text": f"""Please analyze this document and provide: 1) A concise summary, 2) The key points or takeaways and 3) Recommended next steps or actions based on the content. Here is the document content: {document_text}"""
                    },
                    
                ]
            }
        ]
    }

    # make the API request
    response = requests.post(
        "https://api.openai.com/v1/chat/completions", 
        headers=headers,
        json=payload
    )

    #handle the openAi response
    if response.status_code != 200:
        print(f'Error: {response.status_code}')
        print(response.text)
        raise Exception(f"API request failed with status code {response.status_code}: {response.text}")
    
    response_data = response.json()
    summary = response_data["choices"][0]["message"]["content"]

    return summary

def main():
    """Main function to process the document"""
    if len(sys.argv) != 2: 
        print("Usage: python process_document.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path): 
        print(f"Error: file {file_path} does not exist")
        sys.exit(1)

        #check if api key is not set 
        if not OPENAI_API_KEY: 
            print(json.dumps({"error": "OpenAI API key not found, please set the OPENAI_API_KEY env variable"}))
            sys.exit(1)
    
    try: 
        #get doc summary from openAI
        summary = get_document_summary(file_path)

        print(json.dumps({"summary": summary}))

    except Exception as e: 
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
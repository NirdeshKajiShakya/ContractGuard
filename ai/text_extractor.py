import PyPDF2
import requests
from bs4 import BeautifulSoup

def from_pdf(file_stream) -> str | None:
    """Extracts text from a PDF file stream."""
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text if text else None
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def from_url(url: str) -> str | None:
    """Fetches and extracts clean text from a URL."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
            
        text = soup.get_text(separator='\n', strip=True)
        return text if text else None
    except requests.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None
from ai import analyzer, text_extractor

def test_with_plain_text():
    print("\n--- 1. Testing with plain text ---")
    sample_text = """
    5. Termination: We reserve the right to terminate or suspend your account
    at our sole discretion, without notice, for any reason. No refunds will be provided.
    """
    result = analyzer.run(sample_text)
    print(result)

def test_with_url():
    print("\n--- 2. Testing with a live URL ---")
    url = "https://www.atlassian.com/legal/cloud-terms-of-service"
    print(f"Fetching text from: {url}")
    text = text_extractor.from_url(url)
    
    if text:
        print("Text extracted successfully.  Analyzing...")
        result = analyzer.run(text)
        print(result)
    else:
        print("Failed to extract text from URL.")

def test_with_pdf():
    print("\n--- 3. Testing with a PDF file ---")
    pdf_path = 'sample.pdf' 
    try:
        with open(pdf_path, "rb") as pdf_file:
            print(f"Extracting text from: {pdf_path}")
            text = text_extractor.from_pdf(pdf_file)
            if text:
                print("Text extracted successfully. Analyzing...")
                result = analyzer.run(text)
                print(result)
            else:
                print("Failed to extract text from PDF.")
    except FileNotFoundError:
        print(f"SKIPPING TEST: File '{pdf_path}' not found. Please create a sample PDF to test.")

if __name__ == "__main__":
    test_with_plain_text()
    test_with_url()

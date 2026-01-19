from ai import humanizer, text_extractor
import json

def print_separator():
    print("\n" + "="*70 + "\n")

def test_simple_clause():
    print("--- TEST 1: Humanizing a Single Complex Clause ---")
    
    legal_text = """
    The Lessor reserves the right to enter the demised premises at any time 
    during reasonable hours for the purpose of inspection, maintenance, or to 
    show the premises to prospective tenants or purchasers, provided that the 
    Lessor shall endeavor to provide the Lessee with not less than twenty-four 
    (24) hours prior written notice, except in cases of emergency.
    """
    
    print("ORIGINAL TEXT:")
    print(legal_text)
    print("\nHUMANIZING.. .\n")
    
    result = humanizer.simplify(legal_text)
    
    if "error" in result:
        print(f"ERROR: {result['error']}")
    else:
        print("SIMPLIFIED TEXT:")
        print(result. get("humanized_text", "No text returned"))
        print("\nKEY POINTS:")
        for i, point in enumerate(result. get("key_points", []), 1):
            print(f"  {i}. {point}")
    
    print_separator()

def test_termination_clause():
    print("--- TEST 2: Humanizing a Termination Clause ---")
    
    legal_text = """
    Either party may terminate this Agreement upon thirty (30) days written 
    notice to the other party. Notwithstanding the foregoing, Company may 
    terminate this Agreement immediately upon written notice if User breaches 
    any material term hereof. Upon termination, User shall immediately cease 
    all use of the Service and Company shall have no obligation to refund any 
    prepaid fees. 
    """
    
    print("ORIGINAL TEXT:")
    print(legal_text)
    print("\nHUMANIZING...\n")
    
    result = humanizer.simplify(legal_text)
    
    if "error" in result:
        print(f"ERROR: {result['error']}")
    else:
        print("SIMPLIFIED TEXT:")
        print(result.get("humanized_text", "No text returned"))
        print("\nKEY POINTS:")
        for i, point in enumerate(result.get("key_points", []), 1):
            print(f"  {i}. {point}")
    
    print_separator()

def test_full_document_from_url():
    print("--- TEST 3: Humanizing Text from a URL ---")
    
    url = "https://www.atlassian.com/legal/cloud-terms-of-service"
    print(f"Fetching text from: {url}")
    
    text = text_extractor.from_url(url)
    
    if text:
        # Take only the first 2000 characters for testing (to avoid long outputs)
        sample_text = text[:2000]
        print(f"Extracted {len(text)} characters. Using first 2000 for test.")
        print("\nHUMANIZING.. .\n")
        
        result = humanizer.simplify(sample_text)
        
        if "error" in result:
            print(f"ERROR: {result['error']}")
        else:
            print("SIMPLIFIED TEXT (excerpt):")
            print(result. get("humanized_text", "No text returned")[:500] + "...")
            print("\nKEY POINTS:")
            for i, point in enumerate(result.get("key_points", []), 1):
                print(f"  {i}. {point}")
    else:
        print("Failed to extract text from URL.")
    
    print_separator()

def test_liability_clause():
    print("--- TEST 4: Humanizing a Liability Limitation Clause ---")
    
    legal_text = """
    IN NO EVENT SHALL THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS 
    BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR 
    CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY (I) ERRORS, MISTAKES, OR 
    INACCURACIES OF CONTENT, (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY 
    NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF OUR SERVICES, 
    (III) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND 
    ALL PERSONAL INFORMATION STORED THEREIN. 
    """
    
    print("ORIGINAL TEXT:")
    print(legal_text)
    print("\nHUMANIZING...\n")
    
    result = humanizer.simplify(legal_text)
    
    if "error" in result:
        print(f"ERROR: {result['error']}")
    else:
        print("SIMPLIFIED TEXT:")
        print(result.get("humanized_text", "No text returned"))
        print("\nKEY POINTS:")
        for i, point in enumerate(result.get("key_points", []), 1):
            print(f"  {i}. {point}")
    
    print_separator()

if __name__ == "__main__": 
    print("\n" + "🔄 LEGAL TEXT HUMANIZER - TEST SUITE". center(70))
    print_separator()
    
    test_simple_clause()
    test_termination_clause()
    test_liability_clause()
    test_full_document_from_url()
    
    print("✅ All tests completed!")
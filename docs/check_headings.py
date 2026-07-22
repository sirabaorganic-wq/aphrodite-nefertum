import zipfile
import os
import xml.etree.ElementTree as ET

namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def check_file(path):
    print("="*60)
    print(f"File: {os.path.basename(path)}")
    print("="*60)
    with zipfile.ZipFile(path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        paragraphs = root.findall('.//w:p', namespaces)
        
        # print first 10 paragraphs
        print("--- First 10 Paragraphs ---")
        for i, p in enumerate(paragraphs[:10]):
            p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
            print(f"P {i}: {repr(p_text)}")
            
        # print last 10 paragraphs
        print("--- Last 10 Paragraphs ---")
        for i, p in enumerate(paragraphs[-10:]):
            idx = len(paragraphs) - 10 + i
            p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
            print(f"P {idx}: {repr(p_text)}")

for filename in os.listdir('docs'):
    if filename.endswith('.docx') and not filename.startswith('~$'):
        check_file(os.path.join('docs', filename))

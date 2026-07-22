import zipfile
import xml.etree.ElementTree as ET

docx_path = 'docs/Terms_and_Conditions.docx'
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    
    paragraphs = root.findall('.//w:p', namespaces)
    for i, p in enumerate(paragraphs):
        p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
        print(f"P {i}: {repr(p_text)}")

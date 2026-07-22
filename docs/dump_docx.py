import zipfile
import xml.etree.ElementTree as ET

docx_path = 'docs/Terms_and_Conditions.docx'
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    
    paragraphs = root.findall('.//w:p', namespaces)
    print(f"Total paragraphs: {len(paragraphs)}")
    for i, p in enumerate(paragraphs[:40]):
        # Get style if any
        style_elem = p.find('.//w:pStyle', namespaces)
        style = style_elem.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if style_elem is not None else None
        
        # Get numbering info if any
        num_elem = p.find('.//w:numPr', namespaces)
        is_list = num_elem is not None
        
        # Get text
        p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
        print(f"P {i} | Style: {style} | List: {is_list} | Text: {repr(p_text)}")

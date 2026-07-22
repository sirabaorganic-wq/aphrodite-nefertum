import zipfile
import xml.etree.ElementTree as ET

docx_path = 'docs/Terms_and_Conditions.docx'
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    
    paragraphs = root.findall('.//w:p', namespaces)
    for i, p in enumerate(paragraphs[:30]):
        num_elem = p.find('.//w:numPr', namespaces)
        if num_elem is not None:
            ilvl = num_elem.find('.//w:ilvl', namespaces)
            numId = num_elem.find('.//w:numId', namespaces)
            ilvl_val = ilvl.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if ilvl is not None else None
            numId_val = numId.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if numId is not None else None
            
            p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
            print(f"P {i} | ilvl: {ilvl_val} | numId: {numId_val} | Text: {repr(p_text)}")

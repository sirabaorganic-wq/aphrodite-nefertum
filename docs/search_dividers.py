import zipfile
import os
import xml.etree.ElementTree as ET

namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

for filename in os.listdir('docs'):
    if not filename.endswith('.docx'):
        continue
    path = os.path.join('docs', filename)
    with zipfile.ZipFile(path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        paragraphs = root.findall('.//w:p', namespaces)
        
        has_underscores = False
        for p in paragraphs:
            p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
            if '_' in p_text:
                has_underscores = True
                print(f"File {filename} has underscores: {repr(p_text[:100])}")
                break
        if not has_underscores:
            print(f"File {filename} has NO underscores.")

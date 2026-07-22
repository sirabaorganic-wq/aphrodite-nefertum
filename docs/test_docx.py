import zipfile
import xml.etree.ElementTree as ET

docx_path = 'docs/Terms_and_Conditions.docx'

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    # Print first 2000 chars of the XML to see the structure
    print(xml_content[:2000].decode('utf-8'))

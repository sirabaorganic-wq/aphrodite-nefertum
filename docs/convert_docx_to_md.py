import os
import zipfile
import xml.etree.ElementTree as ET
import re

namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

file_mapping = {
    'Privacy_Policy.docx': 'privacy-policy.md',
    'Terms_and_Conditions.docx': 'terms-and-conditions.md',
    'Refund_and_Cancellation_Policy.docx': 'refund-policy.md',
    'Shipping_Policy.docx': 'shipping-policy.md',
    'Cookie_Policy.docx': 'cookie-policy.md',
    'Authenticity_Policy.docx': 'authenticity-policy.md',
    'Grievance_Policy.docx': 'grievance-policy.md',
    'INTELLECTUAL PROPERTY.docx': 'intellectual-property.md',
    'Product_Usage_Disclaimer.docx': 'product-disclaimer.md'
}

output_dir = 'frontend/content/legal'
os.makedirs(output_dir, exist_ok=True)

def clean_text(text):
    if not text:
        return ""
    text = text.replace('\xa0', ' ')
    text = text.replace('\t', ' ')
    text = re.sub(r' +', ' ', text)
    return text.strip()

for docx_name, md_name in file_mapping.items():
    docx_path = os.path.join('docs', docx_name)
    if not os.path.exists(docx_path):
        print(f"Warning: {docx_path} does not exist!")
        continue
        
    print(f"Converting {docx_name} to {md_name}...")
    
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        paragraphs = root.findall('.//w:p', namespaces)
        
        md_lines = []
        title_seen = False
        last_updated_seen = False
        
        for idx, p in enumerate(paragraphs):
            num_elem = p.find('.//w:numPr', namespaces)
            is_list = num_elem is not None
            
            p_text = "".join(t.text for t in p.findall('.//w:t', namespaces) if t.text)
            p_text = clean_text(p_text)
            
            if not p_text:
                if md_lines and md_lines[-1] != "":
                    md_lines.append("")
                continue
                
            # Handle Title
            if not title_seen:
                title_text = p_text
                # Clean up repeated title suffixes
                for word in ["PRIVACY POLICY", "TERMS & CONDITIONS", "SHIPPING POLICY", "COOKIE POLICY", "AUTHENTICITY POLICY", "GRIEVANCE POLICY", "PRODUCT USAGE DISCLAIMER"]:
                    if title_text.endswith(word + word):
                        title_text = title_text[:-len(word)]
                
                md_lines.append(f"# {title_text}")
                md_lines.append("")
                title_seen = True
                continue
                
            # Check if it is a duplicate title line
            if title_seen and not last_updated_seen and ("APHRODITE NEFERTUM" in p_text) and ("Last Updated" not in p_text):
                continue
                
            # Handle Last Updated
            if "Last Updated" in p_text:
                # Extract only from "Last Updated" onwards
                updated_text = p_text[p_text.index("Last Updated"):]
                updated_text = updated_text.replace("[Insert Date]", "June 2026")
                md_lines.append(f"**{updated_text}**")
                md_lines.append("")
                last_updated_seen = True
                continue
                
            # Handle Section Headings
            is_heading = False
            is_num_heading = re.match(r'^\d+\.\s+(.*)', p_text)
            is_letter_heading = re.match(r'^[A-Z]\.\s+(.*)', p_text)
            is_footer_statement = (p_text == "Footer Statement")
            
            if is_num_heading:
                if md_lines and md_lines[-1] != "---":
                    if md_lines[-1] == "":
                        md_lines[-1] = "---"
                    else:
                        md_lines.append("---")
                    md_lines.append("")
                md_lines.append(f"## {p_text}")
                md_lines.append("")
                is_heading = True
            elif is_letter_heading:
                if md_lines and md_lines[-1] != "---":
                    if md_lines[-1] == "":
                        md_lines[-1] = "---"
                    else:
                        md_lines.append("---")
                    md_lines.append("")
                md_lines.append(f"### {p_text}")
                md_lines.append("")
                is_heading = True
            elif is_footer_statement:
                if md_lines and md_lines[-1] != "---":
                    if md_lines[-1] == "":
                        md_lines[-1] = "---"
                    else:
                        md_lines.append("---")
                    md_lines.append("")
                md_lines.append(f"## {p_text}")
                md_lines.append("")
                is_heading = True
                
            if is_heading:
                continue
                
            if is_list:
                md_lines.append(f"- {p_text}")
            else:
                md_lines.append(p_text)
                md_lines.append("")
                
        # Write to md file
        output_path = os.path.join(output_dir, md_name)
        with open(output_path, 'w', encoding='utf-8') as out_f:
            out_f.write("\n".join(md_lines))
            
print("Conversion complete!")

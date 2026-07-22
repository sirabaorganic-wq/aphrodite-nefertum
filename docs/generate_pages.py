import os

pages = [
    {
        'dir': 'privacy-policy',
        'file': 'privacy-policy.md',
        'title': 'APHRODITE NEFERTUM PRIVACY POLICY'
    },
    {
        'dir': 'terms-and-conditions',
        'file': 'terms-and-conditions.md',
        'title': 'APHRODITE NEFERTUM TERMS & CONDITIONS'
    },
    {
        'dir': 'refund-policy',
        'file': 'refund-policy.md',
        'title': 'APHRODITE NEFERTUM REFUND & CANCELLATION POLICY'
    },
    {
        'dir': 'shipping-policy',
        'file': 'shipping-policy.md',
        'title': 'APHRODITE NEFERTUM SHIPPING POLICY'
    },
    {
        'dir': 'cookie-policy',
        'file': 'cookie-policy.md',
        'title': 'APHRODITE NEFERTUM COOKIE POLICY'
    },
    {
        'dir': 'authenticity-policy',
        'file': 'authenticity-policy.md',
        'title': 'APHRODITE NEFERTUM AUTHENTICITY POLICY'
    },
    {
        'dir': 'grievance-policy',
        'file': 'grievance-policy.md',
        'title': 'APHRODITE NEFERTUM GRIEVANCE POLICY'
    },
    {
        'dir': 'intellectual-property',
        'file': 'intellectual-property.md',
        'title': 'APHRODITE NEFERTUM INTELLECTUAL PROPERTY & TRADEMARK POLICY'
    },
    {
        'dir': 'product-disclaimer',
        'file': 'product-disclaimer.md',
        'title': 'APHRODITE NEFERTUM PRODUCT USAGE DISCLAIMER'
    }
]

app_dir = 'frontend/app'

template = """import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import LegalLayout from '@/components/LegalLayout';
import {{ Metadata }} from 'next';

const docName = '{doc_file}';
const docTitle = '{doc_title}';

function getDocData() {{
  const filePath = path.join(process.cwd(), 'content', 'legal', docName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const {{ content }} = matter(fileContent);
  return content;
}}

export async function generateMetadata(): Promise<Metadata> {{
  const content = getDocData();
  const lines = content.split('\\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('---'));
  const description = lines[0] || 'Aphrodite Nefertum Legal Document';
  
  return {{
    title: docTitle,
    description: description.substring(0, 160),
  }};
}}

export default async function Page() {{
  const content = getDocData();
  return (
    <LegalLayout
      title={{docTitle}}
      lastUpdated="June 2026"
      content={{content}}
    />
  );
}}
"""

for page in pages:
    page_dir = os.path.join(app_dir, page['dir'])
    os.makedirs(page_dir, exist_ok=True)
    
    page_content = template.format(
        doc_file=page['file'],
        doc_title=page['title']
    )
    
    page_path = os.path.join(page_dir, 'page.tsx')
    print(f"Creating page: {page_path}...")
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(page_content)

print("Page generation complete!")

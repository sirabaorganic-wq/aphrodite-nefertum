import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import LegalLayout from '@/components/LegalLayout';
import { Metadata } from 'next';

const docName = 'terms-and-conditions.md';
const docTitle = 'APHRODITE NEFERTUM TERMS & CONDITIONS';

function getDocData() {
  const filePath = path.join(process.cwd(), 'content', 'legal', docName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContent);
  return content;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = getDocData();
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('---'));
  const description = lines[0] || 'Aphrodite Nefertum Legal Document';
  
  return {
    title: docTitle,
    description: description.substring(0, 160),
  };
}

export default async function Page() {
  const content = getDocData();
  return (
    <LegalLayout
      title={docTitle}
      lastUpdated="June 2026"
      content={content}
    />
  );
}

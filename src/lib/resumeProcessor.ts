import * as mammoth from 'mammoth';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Spacing } from 'docx';
import { jsPDF } from 'jspdf';

// Configure PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ProcessedResume {
  content: string;
  keywords: string[];
  score: number;
}

export async function processResume(file: File): Promise<ProcessedResume> {
  let content = '';

  if (file.type === 'application/pdf') {
    content = await extractPdfContent(file);
  } else if (file.type.includes('word')) {
    content = await extractDocxContent(file);
  } else {
    content = await file.text();
  }

  const keywords = extractKeywords(content);
  const score = calculateATSScore(content, keywords);

  return {
    content: formatContent(content),
    keywords,
    score
  };
}

async function extractPdfContent(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
  let content = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    content += textContent.items.map((item: any) => item.str).join(' ');
  }

  return content;
}

async function extractDocxContent(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function extractKeywords(content: string): string[] {
  // Enhanced keyword extraction
  const commonKeywords = [
    'experience', 'skills', 'education', 'projects', 'achievements',
    'javascript', 'typescript', 'react', 'node', 'git', 'api',
    'development', 'programming', 'software', 'engineering',
    'communication', 'problem-solving', 'team', 'leadership'
  ];
  
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  return Array.from(new Set(words.filter(word => 
    word.length > 3 && commonKeywords.includes(word)
  )));
}

function calculateATSScore(content: string, keywords: string[]): number {
  // Enhanced scoring based on keyword presence and formatting
  let score = 0;
  
  // Check for required sections
  const sections = ['experience', 'education', 'skills'];
  sections.forEach(section => {
    if (content.toLowerCase().includes(section)) score += 15;
  });

  // Check for keywords
  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) score += 10;
  });

  // Check for proper formatting
  if (content.includes('\n')) score += 5; // Has line breaks
  if (content.includes('•') || content.includes('-')) score += 5; // Has bullet points
  if (content.match(/\d{4}/)) score += 5; // Has dates

  return Math.min(100, score);
}

function formatContent(content: string): string {
  // Split content into sections
  const sections = content.split(/\n\s*\n/);
  
  // Process each section
  const formattedSections = sections.map(section => {
    // Clean up the section
    section = section.trim();
    
    // Add section headers if missing
    if (!section.toLowerCase().includes('experience') && 
        !section.toLowerCase().includes('education') && 
        !section.toLowerCase().includes('skills')) {
      // Try to detect section type based on content
      if (section.match(/\d{4}/)) {
        section = 'EXPERIENCE\n' + section;
      } else if (section.toLowerCase().includes('degree') || 
                 section.toLowerCase().includes('university') || 
                 section.toLowerCase().includes('college')) {
        section = 'EDUCATION\n' + section;
      } else {
        section = 'SKILLS\n' + section;
      }
    }
    
    // Format bullet points
    section = section.replace(/^[-•*]\s*/gm, '• ');
    
    // Add spacing between sections
    return section + '\n\n';
  });
  
  return formattedSections.join('');
}

export async function generateDownloadFile(content: string, format: 'pdf' | 'docx' | 'txt'): Promise<Blob> {
  switch (format) {
    case 'pdf': {
      const doc = new jsPDF();
      let y = 20;
      const sections = content.split(/\n\s*\n/);
      
      sections.forEach(section => {
        const lines = section.split('\n');
        lines.forEach(line => {
          if (line.trim().toUpperCase() === line.trim()) {
            // This is a section header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(line, 20, y);
          } else {
            // This is regular content
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(line, 20, y);
          }
          y += 10;
        });
        y += 10; // Add extra space between sections
      });
      
      return doc.output('blob');
    }
    
    case 'docx': {
      const doc = new Document({
        sections: [{
          properties: {},
          children: content.split('\n\n').map(section => {
            const lines = section.split('\n');
            const children = lines.map((line, index) => {
              if (line.trim().toUpperCase() === line.trim()) {
                // This is a section header
                return new Paragraph({
                  text: line,
                  heading: HeadingLevel.HEADING_1,
                  spacing: {
                    after: 200,
                    line: 360,
                  },
                });
              } else {
                // This is regular content
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Arial',
                      size: 24,
                    }),
                  ],
                  spacing: {
                    after: 100,
                    line: 360,
                  },
                });
              }
            });
            return children;
          }).flat(),
        }],
      });

      return await Packer.toBlob(doc);
    }
    
    case 'txt':
      return new Blob([content], { type: 'text/plain' });
    
    default:
      throw new Error('Unsupported format');
  }
}
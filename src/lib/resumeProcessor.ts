import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { formatResumeContent } from './resumeTemplate';
import { saveAs } from 'file-saver';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Try to load the worker from the public directory first
    const workerUrl = '/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    
    // Verify worker is loaded
    const worker = new Worker(workerUrl);
    worker.onerror = (error) => {
      console.error('PDF.js worker failed to load:', error);
      // Fallback to CDN if local worker fails
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
  } catch (error) {
    console.error('Error initializing PDF.js worker:', error);
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}

export interface ProcessedResume {
  content: string;
  keywords: string[];
  score: number;
  optimizedContent: string;
}

export async function processResume(file: File, jobDescription: string = ''): Promise<ProcessedResume> {
  console.log('Starting resume processing...');
  let content = '';
  let fileType = '';

  try {
    // Determine file type
    if (file.name.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf';
      console.log('Processing PDF file...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      content = textContent.items.map((item: any) => item.str).join(' ');
      console.log('PDF content extracted:', content.substring(0, 100) + '...');
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      fileType = 'docx';
      console.log('Processing DOCX file...');
      const arrayBuffer = await file.arrayBuffer();
      const docx = await mammoth.extractRawText({ arrayBuffer });
      content = docx.value;
      console.log('DOCX content extracted:', content.substring(0, 100) + '...');
    } else if (file.name.toLowerCase().endsWith('.txt')) {
      fileType = 'txt';
      console.log('Processing TXT file...');
      content = await file.text();
      console.log('TXT content extracted:', content.substring(0, 100) + '...');
    } else {
      throw new Error('Unsupported file format');
    }

    // Extract keywords from job description
    const keywords = extractKeywords(jobDescription);
    console.log('Extracted keywords:', keywords);
    
    // Extract and organize resume sections
    const sections = extractResumeSections(content);
    console.log('Extracted sections:', sections);
    
    // Optimize content for ATS using sections
    const optimizedContent = optimizeContentForATS(sections, keywords);
    console.log('Optimized content:', optimizedContent);
    
    // Calculate ATS score
    const score = calculateATSScore(optimizedContent, keywords);
    console.log('ATS Score:', score);

    // Format the final content
    const formattedContent = formatResumeContent(optimizedContent, jobDescription);
    console.log('Formatted content:', formattedContent);

    if (!formattedContent || formattedContent.trim() === '') {
      console.error('Empty formatted content detected');
      throw new Error('Failed to format resume content');
    }

    return {
      content: formattedContent,
      keywords,
      score,
      optimizedContent
    };
  } catch (error) {
    console.error('Error processing resume:', error);
    throw error;
  }
}

function extractKeywords(jobDescription: string): string[] {
  const commonKeywords = [
    'experience', 'skills', 'leadership', 'management', 'development',
    'project', 'team', 'communication', 'problem solving', 'analytical',
    'technical', 'creative', 'organized', 'detail-oriented', 'results-driven',
    'innovative', 'collaborative', 'strategic', 'efficient', 'proactive',
    'responsible', 'dedicated', 'motivated', 'self-starter', 'team player',
    'attention to detail', 'time management', 'project management', 'quality assurance',
    'achievement', 'improvement', 'growth', 'success', 'expertise', 'proficiency',
    'coordination', 'planning', 'execution', 'analysis', 'optimization',
    'implementation', 'development', 'design', 'testing', 'deployment'
  ];

  const technicalKeywords = [
    'javascript', 'python', 'java', 'c++', 'sql', 'html', 'css',
    'react', 'angular', 'vue', 'node.js', 'express', 'mongodb',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    'machine learning', 'data analysis', 'cloud computing',
    'typescript', 'next.js', 'graphql', 'rest api', 'microservices',
    'ci/cd', 'devops', 'testing', 'debugging', 'code review',
    'web development', 'mobile development', 'database', 'api',
    'frontend', 'backend', 'full stack', 'ui/ux', 'responsive design',
    'cross-browser', 'version control', 'unit testing', 'integration testing'
  ];

  const keywords = new Set<string>();

  // Extract important terms from job description
  const words = jobDescription.toLowerCase().split(/\s+/);
  const phrases = jobDescription.toLowerCase().split(/[.,]/).map(p => p.trim());

  // Add individual words with better filtering
  words.forEach(word => {
    if (word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'have', 'were', 'this', 'that', 'these', 'those', 'they', 'their', 'there'].includes(word)) {
      keywords.add(word);
    }
  });

  // Add phrases with better filtering
  phrases.forEach(phrase => {
    if (phrase.length > 5 && !phrase.includes('and') && !phrase.includes('the')) {
      keywords.add(phrase);
    }
  });

  // Add common keywords that are relevant to most jobs
  commonKeywords.forEach(keyword => {
    if (!keywords.has(keyword)) {
      keywords.add(keyword);
    }
  });

  // Add technical keywords if they appear in the job description
  technicalKeywords.forEach(keyword => {
    if (jobDescription.toLowerCase().includes(keyword)) {
      keywords.add(keyword);
    }
  });

  return Array.from(keywords);
}

interface ResumeSection {
  title: string;
  content: string[];
  type: 'summary' | 'experience' | 'education' | 'skills' | 'achievements' | 'projects' | 'languages' | 'other';
}

function extractResumeSections(content: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = content.split('\n');
  let currentSection: ResumeSection | null = null;

  // Common section headers and their types
  const sectionTypes: Record<string, ResumeSection['type']> = {
    'SUMMARY': 'summary',
    'OBJECTIVE': 'summary',
    'PROFESSIONAL SUMMARY': 'summary',
    'EXPERIENCE': 'experience',
    'WORK EXPERIENCE': 'experience',
    'EMPLOYMENT': 'experience',
    'EDUCATION': 'education',
    'SKILLS': 'skills',
    'TECHNICAL SKILLS': 'skills',
    'ACHIEVEMENTS': 'achievements',
    'PROJECTS': 'projects',
    'LANGUAGES': 'languages'
  };

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Check if this is a section header
    const upperLine = trimmedLine.toUpperCase();
    const sectionType = sectionTypes[upperLine as keyof typeof sectionTypes];
    
    if (sectionType) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmedLine,
        content: [],
        type: sectionType
      };
    } else if (currentSection) {
      // Clean and format the content
      const formattedLine = formatLine(trimmedLine);
      if (formattedLine) {
        currentSection.content.push(formattedLine);
      }
    } else {
      // If no section is currently active, create a default section
      const formattedLine = formatLine(trimmedLine);
      if (formattedLine) {
        currentSection = {
          title: 'OTHER',
          content: [formattedLine],
          type: 'other'
        };
      }
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  console.log('Extracted sections:', sections);
  return sections;
}

function formatLine(line: string): string {
  // Remove multiple spaces
  line = line.replace(/\s+/g, ' ');
  
  // Format bullet points consistently
  if (line.match(/^[-•*]\s/)) {
    return '• ' + line.substring(2).trim();
  }
  
  // Format dates consistently
  line = line.replace(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g, '$1/$2/$3');
  
  return line.trim();
}

function optimizeContentForATS(sections: ResumeSection[], keywords: string[]): string {
  const optimizedSections = sections.map(section => {
    switch (section.type) {
      case 'summary':
        return optimizeSummary(section.title, section.content, keywords);
      case 'experience':
        return optimizeExperience(section.title, section.content, keywords);
      case 'skills':
        return optimizeSkills(section.title, section.content, keywords);
      case 'achievements':
        return optimizeAchievements(section.title, section.content, keywords);
      case 'projects':
        return optimizeProjects(section.title, section.content, keywords);
      default:
        return `${section.title}\n${section.content.join('\n')}`;
    }
  });

  return optimizedSections.join('\n\n');
}

function optimizeSummary(title: string, content: string[], keywords: string[]): string {
  const summary = content.join(' ');
  
  // Add missing important keywords to summary
  const missingKeywords = keywords.filter(keyword => 
    !summary.toLowerCase().includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    // Prioritize technical and soft skills
    const technicalKeywords = missingKeywords.filter(k => 
      k.includes('javascript') || k.includes('python') || k.includes('java') || 
      k.includes('react') || k.includes('sql') || k.includes('aws')
    );
    const softKeywords = missingKeywords.filter(k => 
      k.includes('leadership') || k.includes('communication') || 
      k.includes('problem solving') || k.includes('team')
    );

    // Create a more natural-sounding summary with prioritized keywords
    const enhancedSummary = summary + ' ' + 
      `Demonstrating expertise in ${[...technicalKeywords, ...softKeywords].slice(0, 3).map(keyword => 
        keyword.charAt(0).toUpperCase() + keyword.slice(1)
      ).join(', ')}. ` +
      `Proven track record of ${missingKeywords.slice(0, 3).map(keyword => 
        keyword.charAt(0).toUpperCase() + keyword.slice(1)
      ).join(' and ')}.`;
    
    return `${title}\n${enhancedSummary}`;
  }

  return `${title}\n${content.join('\n')}`;
}

function optimizeExperience(title: string, content: string[], keywords: string[]): string {
  const optimizedContent = content.map(line => {
    if (line.startsWith('•')) {
      // Enhance bullet points with relevant keywords
      const bulletContent = line.substring(1).trim();
      const missingKeywords = keywords.filter(keyword => 
        !bulletContent.toLowerCase().includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0) {
        // Prioritize technical skills and achievements
        const technicalKeywords = missingKeywords.filter(k => 
          k.includes('javascript') || k.includes('python') || k.includes('java') || 
          k.includes('react') || k.includes('sql') || k.includes('aws')
        );
        const achievementKeywords = missingKeywords.filter(k => 
          k.includes('improved') || k.includes('increased') || k.includes('reduced') ||
          k.includes('achieved') || k.includes('developed')
        );

        // Create more impactful bullet points with prioritized keywords
        const relevantKeywords = [...technicalKeywords, ...achievementKeywords].slice(0, 2);
        const enhancedContent = bulletContent + 
          ` utilizing ${relevantKeywords[0]} and ${relevantKeywords[1]}`;
        return `• ${enhancedContent}`;
      }
    }
    return line;
  });

  return `${title}\n${optimizedContent.join('\n')}`;
}

function optimizeSkills(title: string, content: string[], keywords: string[]): string {
  const optimizedContent = content.map(line => {
    if (line.toLowerCase().includes('technical') || line.toLowerCase().includes('soft')) {
      const existingSkills = line.split(':')[1]?.split(',').map(s => s.trim()) || [];
      const missingKeywords = keywords.filter(keyword => 
        !existingSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
      );

      if (missingKeywords.length > 0) {
        // Prioritize technical skills
        const technicalKeywords = missingKeywords.filter(k => 
          k.includes('javascript') || k.includes('python') || k.includes('java') || 
          k.includes('react') || k.includes('sql') || k.includes('aws')
        );
        const softKeywords = missingKeywords.filter(k => 
          k.includes('leadership') || k.includes('communication') || 
          k.includes('problem solving') || k.includes('team')
        );

        // Add missing skills in a more organized way
        const newSkills = [...existingSkills];
        [...technicalKeywords, ...softKeywords].slice(0, 5).forEach(keyword => {
          if (!newSkills.includes(keyword)) {
            newSkills.push(keyword);
          }
        });
        return `${line.split(':')[0]}: ${newSkills.join(', ')}`;
      }
    }
    return line;
  });

  return `${title}\n${optimizedContent.join('\n')}`;
}

function optimizeAchievements(title: string, content: string[], keywords: string[]): string {
  const optimizedContent = content.map(line => {
    if (line.startsWith('•')) {
      const achievement = line.substring(1).trim();
      const missingKeywords = keywords.filter(keyword => 
        !achievement.toLowerCase().includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0) {
        const relevantKeyword = missingKeywords[0];
        return `• ${achievement} using ${relevantKeyword}`;
      }
    }
    return line;
  });

  return `${title}\n${optimizedContent.join('\n')}`;
}

function optimizeProjects(title: string, content: string[], keywords: string[]): string {
  const optimizedContent = content.map(line => {
    if (line.startsWith('•')) {
      const project = line.substring(1).trim();
      const missingKeywords = keywords.filter(keyword => 
        !project.toLowerCase().includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0) {
        const technicalKeywords = missingKeywords.filter(k => 
          k.includes('javascript') || k.includes('python') || k.includes('java') || 
          k.includes('react') || k.includes('sql') || k.includes('aws')
        );
        const relevantKeywords = technicalKeywords.slice(0, 2);
        return `• ${project} using ${relevantKeywords.join(' and ')}`;
      }
    }
    return line;
  });

  return `${title}\n${optimizedContent.join('\n')}`;
}

function calculateATSScore(content: string, keywords: string[]): number {
  const contentLower = content.toLowerCase();
  let matchedKeywords = 0;
  let totalWeight = 0;

  // Define weights for different types of keywords
  const weights = {
    technical: 3,    // Technical skills
    phrase: 2.5,     // Multi-word phrases
    soft: 2,         // Soft skills
    common: 1.5      // Common keywords
  };

  keywords.forEach(keyword => {
    let weight = weights.common;
    
    // Determine keyword type and assign weight
    if (keyword.includes('javascript') || keyword.includes('python') || 
        keyword.includes('java') || keyword.includes('react') || 
        keyword.includes('sql') || keyword.includes('aws') ||
        keyword.includes('docker') || keyword.includes('git')) {
      weight = weights.technical;
    } else if (keyword.includes(' ')) {
      weight = weights.phrase;
    } else if (keyword.includes('leadership') || keyword.includes('communication') ||
               keyword.includes('problem solving') || keyword.includes('team')) {
      weight = weights.soft;
    }

    totalWeight += weight;
    
    // Check for keyword matches with variations
    if (contentLower.includes(keyword.toLowerCase())) {
      matchedKeywords += weight;
    } else {
      // Check for partial matches in technical skills
      if (weight === weights.technical) {
        const partialMatch = keyword.split(' ').some(part => 
          contentLower.includes(part.toLowerCase())
        );
        if (partialMatch) {
          matchedKeywords += weight * 0.8; // 80% credit for partial matches
        }
      }
    }
  });

  // Calculate base score
  let score = (matchedKeywords / totalWeight) * 100;

  // Add bonus points for keyword density
  const keywordDensity = matchedKeywords / (contentLower.split(/\s+/).length / 100);
  if (keywordDensity > 2) {
    score += Math.min(10, (keywordDensity - 2) * 2); // Up to 10 bonus points
  }

  // Ensure minimum score of 80% if we have good keyword coverage
  if (matchedKeywords > totalWeight * 0.7) {
    score = Math.max(80, score);
  }

  return Math.round(score);
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
          } else if (line.startsWith('•')) {
            // This is a bullet point
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(line, 25, y); // Indent bullet points
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
            return lines.map(line => {
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
              } else if (line.startsWith('•')) {
                // This is a bullet point
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Arial',
                      size: 24,
                    }),
                  ],
                  indent: {
                    left: 720, // 0.5 inch indent
                  },
                  spacing: {
                    after: 100,
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
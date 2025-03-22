export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    period: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
    description: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  projects: Array<{
    name: string;
    description: string[];
    technologies: string[];
  }>;
  languages: Array<{
    name: string;
    level: string;
  }>;
}

export function formatResumeContent(content: string, jobDescription: string): string {
  // Split content into sections
  const sections = content.split(/\n\s*\n/);
  let formattedContent = '';

  // Process each section
  sections.forEach(section => {
    const lines = section.split('\n');
    const header = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    // Format based on section type
    switch (header.toUpperCase()) {
      case 'PERSONAL INFORMATION':
        formattedContent += formatPersonalInfo(content);
        break;
      case 'PROFESSIONAL SUMMARY':
      case 'SUMMARY':
        formattedContent += formatSummary(content, jobDescription);
        break;
      case 'EXPERIENCE':
      case 'WORK EXPERIENCE':
        formattedContent += formatExperience(content, jobDescription);
        break;
      case 'EDUCATION':
        formattedContent += formatEducation(content);
        break;
      case 'SKILLS':
        formattedContent += formatSkills(content, jobDescription);
        break;
      case 'PROJECTS':
        formattedContent += formatProjects(content, jobDescription);
        break;
      case 'LANGUAGES':
        formattedContent += formatLanguages(content);
        break;
      default:
        formattedContent += `${header}\n${content}\n\n`;
    }
  });

  return formattedContent.trim();
}

function formatPersonalInfo(content: string): string {
  const lines = content.split('\n');
  const info = lines.reduce((acc, line) => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      acc[key.toLowerCase()] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  return `PERSONAL INFORMATION
${info.name || 'Your Name'}
${info.email || 'your.email@example.com'} | ${info.phone || '(123) 456-7890'}
${info.location || 'City, State ZIP'}

`;
}

function formatSummary(content: string, jobDescription: string): string {
  // Extract key requirements from job description
  const requirements = jobDescription
    .split('\n')
    .filter(line => line.trim().startsWith('•'))
    .map(line => line.trim().substring(1).trim());

  // Create a more targeted summary
  const summary = content + '\n\n' + 
    requirements.slice(0, 3).map(req => 
      `• ${req}`
    ).join('\n');

  return `PROFESSIONAL SUMMARY
${summary}

`;
}

function formatExperience(content: string, jobDescription: string): string {
  const experiences = content.split('\n\n');
  return `PROFESSIONAL EXPERIENCE
${experiences.map(exp => {
  const lines = exp.split('\n');
  const [company, position, period] = lines.slice(0, 3);
  const description = lines.slice(3);
  
  // Enhance bullet points with relevant keywords
  const enhancedDescription = description.map(line => {
    const bullet = line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim();
    const keywords = extractKeywords(jobDescription);
    const relevantKeywords = keywords.filter(keyword => 
      !bullet.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 2);

    if (relevantKeywords.length > 0) {
      return `• ${bullet} utilizing ${relevantKeywords.join(' and ')}`;
    }
    return `• ${bullet}`;
  });
  
  return `${company}
${position} | ${period}
${enhancedDescription.join('\n')}
`;
}).join('\n')}

`;
}

function formatEducation(content: string): string {
  const educations = content.split('\n\n');
  return `EDUCATION
${educations.map(edu => {
  const lines = edu.split('\n');
  const [institution, degree, period] = lines.slice(0, 3);
  const description = lines.slice(3);
  
  return `${institution}
${degree} | ${period}
${description.map(line => `• ${line}`).join('\n')}
`;
}).join('\n')}

`;
}

function formatSkills(content: string, jobDescription: string): string {
  const lines = content.split('\n');
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const keywords = extractKeywords(jobDescription);

  // Extract existing skills
  lines.forEach(line => {
    if (line.toLowerCase().includes('technical')) {
      technicalSkills.push(...line.split(':')[1].split(',').map(s => s.trim()));
    } else if (line.toLowerCase().includes('soft')) {
      softSkills.push(...line.split(':')[1].split(',').map(s => s.trim()));
    }
  });

  // Add relevant keywords as skills if not already present
  keywords.forEach(keyword => {
    if (isTechnicalSkill(keyword) && !technicalSkills.includes(keyword)) {
      technicalSkills.push(keyword);
    } else if (isSoftSkill(keyword) && !softSkills.includes(keyword)) {
      softSkills.push(keyword);
    }
  });

  return `SKILLS
Technical Skills: ${technicalSkills.join(', ')}
Soft Skills: ${softSkills.join(', ')}

`;
}

function formatProjects(content: string, jobDescription: string): string {
  const projects = content.split('\n\n');
  return `PROJECTS
${projects.map(project => {
  const lines = project.split('\n');
  const [name, ...description] = lines;
  
  // Enhance project descriptions with relevant keywords
  const enhancedDescription = description.map(line => {
    const bullet = line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim();
    const keywords = extractKeywords(jobDescription);
    const relevantKeywords = keywords.filter(keyword => 
      !bullet.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 2);

    if (relevantKeywords.length > 0) {
      return `• ${bullet} using ${relevantKeywords.join(' and ')}`;
    }
    return `• ${bullet}`;
  });
  
  return `${name}
${enhancedDescription.join('\n')}
`;
}).join('\n')}

`;
}

function formatLanguages(content: string): string {
  const languages = content.split('\n');
  return `LANGUAGES
${languages.map(lang => {
  const [name, level] = lang.split(':').map(s => s.trim());
  return `${name} - ${level}`;
}).join('\n')}

`;
}

function extractKeywords(jobDescription: string): string[] {
  const words = jobDescription.toLowerCase().split(/\s+/);
  const phrases = jobDescription.toLowerCase().split(/[.,]/).map(p => p.trim());
  const keywords = new Set<string>();

  // Add individual words
  words.forEach(word => {
    if (word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'have', 'were', 'this', 'that', 'these', 'those', 'they', 'their', 'there'].includes(word)) {
      keywords.add(word);
    }
  });

  // Add phrases
  phrases.forEach(phrase => {
    if (phrase.length > 5 && !phrase.includes('and') && !phrase.includes('the')) {
      keywords.add(phrase);
    }
  });

  return Array.from(keywords);
}

function isTechnicalSkill(skill: string): boolean {
  const technicalKeywords = [
    'javascript', 'python', 'java', 'c++', 'sql', 'html', 'css',
    'react', 'angular', 'vue', 'node.js', 'express', 'mongodb',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    'machine learning', 'data analysis', 'cloud computing',
    'typescript', 'next.js', 'graphql', 'rest api', 'microservices',
    'ci/cd', 'devops', 'testing', 'debugging', 'code review',
    'web development', 'mobile development', 'database', 'api',
    'frontend', 'backend', 'full stack', 'ui/ux', 'responsive design'
  ];

  return technicalKeywords.some(keyword => 
    skill.toLowerCase().includes(keyword.toLowerCase())
  );
}

function isSoftSkill(skill: string): boolean {
  const softKeywords = [
    'leadership', 'communication', 'problem solving', 'team',
    'management', 'analytical', 'creative', 'organized',
    'detail-oriented', 'results-driven', 'innovative',
    'collaborative', 'strategic', 'efficient', 'proactive',
    'responsible', 'dedicated', 'motivated', 'self-starter',
    'team player', 'attention to detail', 'time management'
  ];

  return softKeywords.some(keyword => 
    skill.toLowerCase().includes(keyword.toLowerCase())
  );
} 
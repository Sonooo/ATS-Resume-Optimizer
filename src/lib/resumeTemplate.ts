interface ResumeData {
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    date: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    date: string;
    achievements: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
}

export function formatResumeContent(content: string, jobDescription: string): string {
  // Extract sections from content
  const sections = content.split('\n\n');
  const resumeData: Partial<ResumeData> = {
    name: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      linkedin: ''
    },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: {
      technical: [],
      soft: []
    }
  };

  // Process each section
  let currentSection = '';
  let currentExperience: any = null;
  let currentEducation: any = null;
  let currentProject: any = null;

  sections.forEach(section => {
    const lines = section.split('\n');
    const header = lines[0].trim().toUpperCase();
    
    switch (header) {
      case 'NAME':
        resumeData.name = lines[1]?.trim() || '';
        break;
      
      case 'CONTACT':
        lines.slice(1).forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            switch (key.toLowerCase()) {
              case 'email':
                resumeData.contact!.email = value;
                break;
              case 'phone':
                resumeData.contact!.phone = value;
                break;
              case 'location':
                resumeData.contact!.location = value;
                break;
              case 'linkedin':
                resumeData.contact!.linkedin = value;
                break;
            }
          }
        });
        break;
      
      case 'SUMMARY':
        resumeData.summary = lines.slice(1).join('\n').trim();
        break;
      
      case 'EDUCATION':
        currentSection = 'education';
        break;
      
      case 'EXPERIENCE':
        currentSection = 'experience';
        break;
      
      case 'PROJECTS':
        currentSection = 'projects';
        break;
      
      case 'SKILLS':
        currentSection = 'skills';
        break;
      
      default:
        if (currentSection === 'education' && lines[0].includes('University') || lines[0].includes('College')) {
          if (currentEducation) {
            resumeData.education!.push(currentEducation);
          }
          currentEducation = {
            institution: lines[0].trim(),
            degree: lines[1]?.trim() || '',
            date: lines[2]?.trim() || '',
            gpa: lines[3]?.trim() || ''
          };
        } else if (currentSection === 'experience' && lines[0].includes('Company')) {
          if (currentExperience) {
            resumeData.experience!.push(currentExperience);
          }
          currentExperience = {
            company: lines[0].trim(),
            role: lines[1]?.trim() || '',
            date: lines[2]?.trim() || '',
            achievements: []
          };
        } else if (currentSection === 'projects' && lines[0].includes('Project')) {
          if (currentProject) {
            resumeData.projects!.push(currentProject);
          }
          currentProject = {
            name: lines[0].trim(),
            description: lines[1]?.trim() || '',
            technologies: []
          };
        } else if (currentSection === 'skills') {
          if (lines[0].toLowerCase().includes('technical')) {
            resumeData.skills!.technical = lines[1]?.split(',').map(s => s.trim()) || [];
          } else if (lines[0].toLowerCase().includes('soft')) {
            resumeData.skills!.soft = lines[1]?.split(',').map(s => s.trim()) || [];
          }
        } else if (currentExperience && lines[0].startsWith('•')) {
          currentExperience.achievements.push(lines[0].trim());
        } else if (currentProject && lines[0].startsWith('•')) {
          currentProject.technologies.push(lines[0].trim().substring(1));
        }
    }
  });

  // Push the last items if they exist
  if (currentEducation) {
    resumeData.education!.push(currentEducation);
  }
  if (currentExperience) {
    resumeData.experience!.push(currentExperience);
  }
  if (currentProject) {
    resumeData.projects!.push(currentProject);
  }

  // Format the resume with enhanced styling and spacing
  const formattedResume = [
    // Header with decorative line
    `${resumeData.name}`,
    '='.repeat(50),
    '\n',
    
    // Contact Information in a clean layout
    'CONTACT INFORMATION',
    '-'.repeat(30),
    `📧 ${resumeData.contact?.email}`,
    `📱 ${resumeData.contact?.phone}`,
    `📍 ${resumeData.contact?.location}`,
    resumeData.contact?.linkedin ? `🔗 ${resumeData.contact.linkedin}` : '',
    '\n',
    
    // Professional Summary with emphasis
    'PROFESSIONAL SUMMARY',
    '-'.repeat(30),
    resumeData.summary,
    '\n',
    
    // Education with clear hierarchy
    'EDUCATION',
    '-'.repeat(30),
    ...resumeData.education!.map(edu => [
      `🏫 ${edu.institution}`,
      `📚 ${edu.degree}`,
      `📅 ${edu.date}`,
      edu.gpa ? `📊 GPA: ${edu.gpa}` : '',
      '\n'
    ].join('\n')),
    
    // Experience with bullet points and dates
    'PROFESSIONAL EXPERIENCE',
    '-'.repeat(30),
    ...resumeData.experience!.map(exp => [
      `🏢 ${exp.company}`,
      `👨‍💼 ${exp.role}`,
      `📅 ${exp.date}`,
      '',
      ...exp.achievements.map(achievement => `• ${achievement}`),
      '\n'
    ].join('\n')),
    
    // Projects with clear structure
    'PROJECTS',
    '-'.repeat(30),
    ...resumeData.projects!.map(proj => [
      `🚀 ${proj.name}`,
      proj.description,
      '',
      'Technologies Used:',
      ...proj.technologies.map(tech => `• ${tech}`),
      '\n'
    ].join('\n')),
    
    // Skills with visual separation
    'SKILLS',
    '-'.repeat(30),
    'Technical Skills:',
    ...resumeData.skills!.technical.map(skill => `• ${skill}`),
    '\n',
    'Soft Skills:',
    ...resumeData.skills!.soft.map(skill => `• ${skill}`),
  ].join('\n');

  // Clean up the formatting
  return formattedResume
    .replace(/\n{4,}/g, '\n\n\n') // Replace excessive line breaks with triple line breaks
    .replace(/([A-Z][A-Z\s]+)\n/g, '\n$1\n\n') // Add spacing around section headers
    .replace(/([A-Z][A-Z\s]+)\n/g, '\n$1\n\n') // Ensure consistent spacing
    .replace(/([A-Z][A-Z\s]+)\n/g, '\n$1\n\n') // Maintain visual hierarchy
    .replace(/\n{3,}/g, '\n\n') // Replace multiple line breaks with double line breaks
    .trim();
} 
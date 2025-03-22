export interface ResumeTemplate {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  professionalSummary: string;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

export function formatResumeContent(content: string, jobDescription: string): string {
  // Extract sections from the content
  const sections = content.split(/\n\s*\n/);
  
  // Create a structured resume
  const resume: ResumeTemplate = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    professionalSummary: '',
    workExperience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
    },
  };

  // Process each section
  sections.forEach(section => {
    const lines = section.split('\n');
    const firstLine = lines[0].toLowerCase();

    if (firstLine.includes('name') || firstLine.includes('contact')) {
      // Process personal info
      lines.forEach(line => {
        if (line.toLowerCase().includes('email')) {
          resume.personalInfo.email = line.split(':')[1]?.trim() || '';
        } else if (line.toLowerCase().includes('phone')) {
          resume.personalInfo.phone = line.split(':')[1]?.trim() || '';
        } else if (line.toLowerCase().includes('location')) {
          resume.personalInfo.location = line.split(':')[1]?.trim() || '';
        } else if (!line.toLowerCase().includes('name') && !line.toLowerCase().includes('contact')) {
          resume.personalInfo.name = line.trim();
        }
      });
    } else if (firstLine.includes('summary') || firstLine.includes('objective')) {
      // Process professional summary
      resume.professionalSummary = lines.slice(1).join(' ').trim();
    } else if (firstLine.includes('experience') || firstLine.includes('work')) {
      // Process work experience
      let currentExperience = {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        achievements: [] as string[],
      };

      lines.slice(1).forEach(line => {
        if (line.trim()) {
          if (!currentExperience.company) {
            currentExperience.company = line.trim();
          } else if (!currentExperience.position) {
            currentExperience.position = line.trim();
          } else if (!currentExperience.startDate) {
            const dates = line.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/g);
            if (dates) {
              currentExperience.startDate = dates[0];
              currentExperience.endDate = dates[1] || 'Present';
            }
          } else if (line.startsWith('-') || line.startsWith('•')) {
            currentExperience.achievements.push(line.trim().substring(1).trim());
          }
        }
      });

      if (currentExperience.company) {
        resume.workExperience.push(currentExperience);
      }
    } else if (firstLine.includes('education')) {
      // Process education
      let currentEducation = {
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: '',
      };

      lines.slice(1).forEach(line => {
        if (line.trim()) {
          if (!currentEducation.institution) {
            currentEducation.institution = line.trim();
          } else if (!currentEducation.degree) {
            currentEducation.degree = line.trim();
          } else if (!currentEducation.field) {
            currentEducation.field = line.trim();
          } else if (line.includes('GPA')) {
            currentEducation.gpa = line.split('GPA:')[1]?.trim() || '';
          } else if (line.match(/\d{4}/)) {
            currentEducation.graduationDate = line.trim();
          }
        }
      });

      if (currentEducation.institution) {
        resume.education.push(currentEducation);
      }
    } else if (firstLine.includes('skills')) {
      // Process skills
      lines.slice(1).forEach(line => {
        if (line.trim()) {
          if (line.toLowerCase().includes('technical')) {
            resume.skills.technical = line.split(':')[1]?.split(',').map(s => s.trim()) || [];
          } else if (line.toLowerCase().includes('soft')) {
            resume.skills.soft = line.split(':')[1]?.split(',').map(s => s.trim()) || [];
          }
        }
      });
    }
  });

  // Format the resume for output
  return formatResumeOutput(resume, jobDescription);
}

function formatResumeOutput(resume: ResumeTemplate, jobDescription: string): string {
  const output = [];

  // Header
  output.push(resume.personalInfo.name.toUpperCase());
  output.push(`${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}`);
  if (resume.personalInfo.linkedin) {
    output.push(`LinkedIn: ${resume.personalInfo.linkedin}`);
  }
  if (resume.personalInfo.portfolio) {
    output.push(`Portfolio: ${resume.personalInfo.portfolio}`);
  }
  output.push('');

  // Professional Summary
  output.push('PROFESSIONAL SUMMARY');
  output.push(resume.professionalSummary);
  output.push('');

  // Work Experience
  output.push('PROFESSIONAL EXPERIENCE');
  resume.workExperience.forEach(exp => {
    output.push(`${exp.position}`);
    output.push(`${exp.company} | ${exp.location} | ${exp.startDate} - ${exp.endDate}`);
    exp.achievements.forEach(achievement => {
      output.push(`• ${achievement}`);
    });
    output.push('');
  });

  // Education
  output.push('EDUCATION');
  resume.education.forEach(edu => {
    output.push(`${edu.degree} in ${edu.field}`);
    output.push(`${edu.institution}`);
    output.push(`Graduated: ${edu.graduationDate}`);
    if (edu.gpa) {
      output.push(`GPA: ${edu.gpa}`);
    }
    output.push('');
  });

  // Skills
  output.push('SKILLS');
  output.push('Technical Skills:');
  output.push(resume.skills.technical.join(', '));
  output.push('');
  output.push('Soft Skills:');
  output.push(resume.skills.soft.join(', '));
  if (resume.skills.certifications?.length) {
    output.push('');
    output.push('Certifications:');
    output.push(resume.skills.certifications.join(', '));
  }

  // Projects
  if (resume.projects?.length) {
    output.push('');
    output.push('PROJECTS');
    resume.projects.forEach(project => {
      output.push(`${project.name}`);
      output.push(project.description);
      output.push(`Technologies: ${project.technologies.join(', ')}`);
      if (project.link) {
        output.push(`Link: ${project.link}`);
      }
      output.push('');
    });
  }

  // Languages
  if (resume.languages?.length) {
    output.push('');
    output.push('LANGUAGES');
    resume.languages.forEach(lang => {
      output.push(`${lang.language}: ${lang.proficiency}`);
    });
  }

  return output.join('\n');
} 
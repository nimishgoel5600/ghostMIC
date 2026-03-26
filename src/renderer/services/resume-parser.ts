import type { ParsedResume } from '../../shared/types';

export async function parseResume(
  fileBuffer: Buffer | ArrayBuffer,
  filePath: string
): Promise<ParsedResume> {
  const buffer = fileBuffer instanceof ArrayBuffer ? Buffer.from(fileBuffer) : fileBuffer;
  let rawText = '';

  if (filePath.toLowerCase().endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    rawText = result.text;
  } else if (filePath.toLowerCase().endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  } else {
    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
  }

  if (!rawText.trim()) {
    throw new Error('Could not extract text from the file.');
  }

  return parseResumeText(rawText);
}

function parseResumeText(text: string): ParsedResume {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Heuristic parsing: extract sections by common headers
  const name = lines[0] || 'Unknown';
  const contactLine = lines.slice(0, 5).find((l) =>
    /@|phone|email|\d{3}[-.]?\d{3}[-.]?\d{4}/i.test(l)
  ) || '';

  const sections = extractSections(lines);

  return {
    name,
    contact: contactLine,
    summary: sections.summary || '',
    experience: parseExperience(sections.experience || ''),
    education: parseEducation(sections.education || ''),
    skills: parseSkills(sections.skills || ''),
    projects: parseProjects(sections.projects || ''),
    certifications: parseCertifications(sections.certifications || ''),
    raw: text,
  };
}

function extractSections(lines: string[]): Record<string, string> {
  const sectionHeaders: Record<string, RegExp> = {
    summary: /^(summary|objective|profile|about)/i,
    experience: /^(experience|work|employment|professional)/i,
    education: /^(education|academic)/i,
    skills: /^(skills|technical|technologies|competenc)/i,
    projects: /^(projects|portfolio)/i,
    certifications: /^(certif|licens|accreditation)/i,
  };

  const sections: Record<string, string> = {};
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    let foundSection = false;
    for (const [key, pattern] of Object.entries(sectionHeaders)) {
      if (pattern.test(line)) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = key;
        currentContent = [];
        foundSection = true;
        break;
      }
    }
    if (!foundSection && currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n');
  }

  return sections;
}

function parseExperience(text: string): ParsedResume['experience'] {
  if (!text) return [];
  const blocks = text.split(/\n(?=[A-Z])/);
  return blocks
    .filter((b) => b.trim())
    .map((block) => {
      const lines = block.split('\n').filter(Boolean);
      const firstLine = lines[0] || '';
      const bullets = lines.slice(1).map((l) => l.replace(/^[-•*]\s*/, ''));
      return {
        company: firstLine,
        role: lines[1]?.includes('|') ? lines[1].split('|')[0].trim() : '',
        dates: firstLine.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/i)?.[0] || '',
        bullets,
      };
    })
    .slice(0, 10);
}

function parseEducation(text: string): ParsedResume['education'] {
  if (!text) return [];
  const blocks = text.split(/\n(?=[A-Z])/);
  return blocks
    .filter((b) => b.trim())
    .map((block) => {
      const lines = block.split('\n').filter(Boolean);
      return {
        institution: lines[0] || '',
        degree: lines[1] || '',
        dates: block.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/i)?.[0] || '',
      };
    })
    .slice(0, 5);
}

function parseSkills(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[,\n•|]/)
    .map((s) => s.replace(/^[-*]\s*/, '').trim())
    .filter((s) => s.length > 1 && s.length < 50);
}

function parseProjects(text: string): ParsedResume['projects'] {
  if (!text) return [];
  const blocks = text.split(/\n(?=[A-Z])/);
  return blocks
    .filter((b) => b.trim())
    .map((block) => {
      const lines = block.split('\n').filter(Boolean);
      return {
        name: lines[0] || '',
        description: lines.slice(1).join(' '),
        technologies: [],
      };
    })
    .slice(0, 10);
}

function parseCertifications(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

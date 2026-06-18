export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface JobMetadata {
  description: string;
  guidelines: string;
  focusAreas: string;
  persona: string;
}

export const parseJobDescription = (fullText: string): JobMetadata => {
  if (!fullText) {
    return { description: '', guidelines: '', focusAreas: '', persona: 'Sarah' };
  }
  
  let description = fullText;
  let guidelines = '';
  let focusAreas = '';
  let persona = 'Sarah';

  const sections = fullText.split('--- INTERVIEW METADATA ---');
  if (sections.length > 1) {
    description = sections[0].trim();
    const metaText = sections[1];
    
    const guidelinesMatch = metaText.match(/\[GUIDELINES\]: ([\s\S]*?)(?=\[|$)/);
    const focusAreasMatch = metaText.match(/\[FOCUS_AREAS\]: ([\s\S]*?)(?=\[|$)/);
    const personaMatch = metaText.match(/\[PERSONA\]: ([\s\S]*?)(?=\[|$)/);

    if (guidelinesMatch) guidelines = guidelinesMatch[1].trim();
    if (focusAreasMatch) focusAreas = focusAreasMatch[1].trim();
    if (personaMatch) persona = personaMatch[1].trim();
  }

  return { description, guidelines, focusAreas, persona };
};

export const serializeJobDescription = (meta: JobMetadata): string => {
  return `${meta.description.trim()}

--- INTERVIEW METADATA ---
[GUIDELINES]: ${meta.guidelines.trim()}
[FOCUS_AREAS]: ${meta.focusAreas.trim()}
[PERSONA]: ${meta.persona.trim()}`;
};

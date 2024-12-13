export interface Candidate {
  name: string;
  score: number;
  file_name: string;
  file_path?: string;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

const generateCandidateHTML = (candidate: Candidate) => {
  const skillsList = candidate.evidence.skills
    .map(skill => `<span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${skill}</span>`)
    .join(' ');

  const certificationsList = candidate.evidence.certifications
    .map(cert => `<span style="display: inline-block; background-color: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${cert}</span>`)
    .join(' ');

  return `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${candidate.name}</h3>
        <span style="display: inline-block; background-color: ${
          candidate.score >= 80 ? '#D1FAE5' : 
          candidate.score >= 60 ? '#FEF3C7' : 
          '#FEE2E2'
        }; color: ${
          candidate.score >= 80 ? '#059669' : 
          candidate.score >= 60 ? '#D97706' : 
          '#DC2626'
        }; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-top: 8px;">
          ${Math.round(candidate.score)}% Match
        </span>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Skills</h4>
        <div>${skillsList}</div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Experience</h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${candidate.evidence.experience}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Education</h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${candidate.evidence.education}</p>
      </div>

      ${candidate.evidence.certifications.length ? `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Certifications</h4>
          <div>${certificationsList}</div>
        </div>
      ` : ''}
    </div>
  `;
};

export const generateEmailHTML = (jobTitle: string, candidates: Candidate[]) => {
  const candidatesHTML = candidates.map(candidate => generateCandidateHTML(candidate)).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 24px; margin: 0 0 8px 0;">Selected Candidates for ${jobTitle}</h1>
          <p style="color: #6B7280; margin: 0;">Here are the candidates selected for interview, along with their match analysis and CVs (attached).</p>
        </div>

        <div style="margin-bottom: 32px;">
          ${candidatesHTML}
        </div>

        <div style="color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <p style="margin: 0;">Please review their profiles and CVs (attached) to schedule interviews accordingly.</p>
        </div>
      </body>
    </html>
  `;
};
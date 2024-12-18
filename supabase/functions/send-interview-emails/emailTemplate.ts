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
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#D1FAE5', text: '#059669' };
    if (score >= 60) return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  const scoreColors = getScoreColor(candidate.score);

  const skillsList = candidate.evidence.skills
    .map(skill => `<span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${skill}</span>`)
    .join(' ');

  const experienceText = candidate.evidence.experience || 'No experience data available';
  const educationText = candidate.evidence.education || 'No education data available';

  const certificationsList = candidate.evidence.certifications
    .map(cert => `<span style="display: inline-block; background-color: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${cert}</span>`)
    .join(' ');

  return `
    <div style="margin-bottom: 24px; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: white;">
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${candidate.name}</h3>
        <span style="display: inline-block; background-color: ${scoreColors.bg}; color: ${scoreColors.text}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-top: 8px;">
          ${Math.round(candidate.score)}% Match
        </span>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; display: flex; align-items: center; gap: 6px;">
          <span style="color: #3B82F6;">⚡</span> Skills
        </h4>
        <div>${skillsList}</div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; display: flex; align-items: center; gap: 6px;">
          <span style="color: #8B5CF6;">💼</span> Experience
        </h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${experienceText}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; display: flex; align-items: center; gap: 6px;">
          <span style="color: #22C55E;">🎓</span> Education
        </h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${educationText}</p>
      </div>

      ${candidate.evidence.certifications.length ? `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span style="color: #F59E0B;">🏆</span> Certifications
          </h4>
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
      <body style="font-family: system-ui, -apple-system, sans-serif; padding: 24px; max-width: 800px; margin: 0 auto; background-color: #F9FAFB;">
        <div style="margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 24px; margin: 0 0 8px 0;">Selected Candidates for ${jobTitle}</h1>
          <p style="color: #6B7280; margin: 0;">Here are the candidates selected for interview, along with their match analysis. Their CVs are attached to this email for your review.</p>
        </div>

        <div style="margin-bottom: 32px;">
          ${candidatesHTML}
        </div>

        <div style="color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <p style="margin: 0;">Please review their profiles and the attached CVs to schedule interviews accordingly. The candidates are listed in order of their match score with the job requirements.</p>
          <p style="margin: 8px 0 0 0;">For any questions or assistance, please reply to this email.</p>
        </div>
      </body>
    </html>
  `;
};
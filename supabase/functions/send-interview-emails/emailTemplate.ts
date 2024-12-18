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

const parseMatchScore = (score: number): number => {
  return isNaN(score) ? 0 : Math.round(score);
};

const generateCandidateTableRows = (candidates: Candidate[]) => {
  return candidates
    .map((candidate, index) => {
      const score = parseMatchScore(candidate.score);
      const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: '#D1FAE5', text: '#059669' };
        if (score >= 60) return { bg: '#FEF3C7', text: '#D97706' };
        return { bg: '#FEE2E2', text: '#DC2626' };
      };

      const scoreColors = getScoreColor(score);
      const rank = index + 1;

      return `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 16px; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #F59E0B;">🏆</span>
              <span style="font-weight: 500;">#${rank}</span>
            </div>
          </td>
          <td style="padding: 16px; text-align: left;">
            ${candidate.name}
          </td>
          <td style="padding: 16px; text-align: right;">
            <span style="display: inline-block; background-color: ${scoreColors.bg}; color: ${scoreColors.text}; padding: 4px 12px; border-radius: 9999px; font-size: 14px;">
              ${score}% Match
            </span>
          </td>
        </tr>
      `;
    })
    .join('');
};

export const generateEmailHTML = (jobTitle: string, candidates: Candidate[]) => {
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
          <p style="color: #6B7280; margin: 0;">Here are the candidates selected for interview. Their CVs are attached to this email for your review.</p>
        </div>

        <div style="margin-bottom: 32px; background-color: white; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                <th style="padding: 12px 16px; text-align: left; color: #374151; font-weight: 600;">Rank</th>
                <th style="padding: 12px 16px; text-align: left; color: #374151; font-weight: 600;">Candidate</th>
                <th style="padding: 12px 16px; text-align: right; color: #374151; font-weight: 600;">Match Score</th>
              </tr>
            </thead>
            <tbody>
              ${generateCandidateTableRows(candidates)}
            </tbody>
          </table>
        </div>

        <div style="color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <p style="margin: 0;">Please review the attached CVs to schedule interviews accordingly. The candidates are listed in order of their match score with the job requirements.</p>
          <p style="margin: 8px 0 0 0;">For any questions or assistance, please reply to this email.</p>
        </div>
      </body>
    </html>
  `;
};
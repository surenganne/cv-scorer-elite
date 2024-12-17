interface RankedResume {
  id: string;
  file_name: string;
  file_path?: string;
  score: number;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

export const fetchRankedResumes = async (jobId: string, jobData: any): Promise<RankedResume[]> => {
  try {
    const response = await fetch('https://3ltge7zfy7j26bdyygdwlcrtse0rcixl.lambda-url.ap-south-1.on.aws/rank-resumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        ...jobData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ranked resumes');
    }

    const data = await response.json();
    return data.ranked_resumes || [];
  } catch (error) {
    console.error('Error fetching ranked resumes:', error);
    throw error;
  }
};
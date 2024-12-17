export const triggerBatchJob = async () => {
  try {
    const response = await fetch(
      'https://q6iagsh8w1.execute-api.ap-south-2.amazonaws.com/dev/triggerBatchJob',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          INGESTION_TYPE: "full"
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to trigger batch job');
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering batch job:', error);
    throw error;
  }
};
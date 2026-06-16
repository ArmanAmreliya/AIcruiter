async function createJob() {
  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation {
            createJob(
              title: "Senior Full Stack Engineer",
              description: "We are looking for a Senior Full Stack Engineer proficient in Next.js, React, Node.js, and WebRTC/Audio APIs. Responsibilities include designing low-latency communication features.",
              durationMinutes: 10,
              interviewType: ["Technical", "Communication"]
            ) {
              id
              title
              description
              durationMinutes
            }
          }
        `
      })
    });
    const data = await res.json();
    console.log('Created Job:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('GraphQL Mutation Error:', err);
  }
}

createJob();

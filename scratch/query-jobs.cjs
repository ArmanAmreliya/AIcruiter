async function query() {
  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            jobs {
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
    console.log('Jobs data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('GraphQL Query Error:', err);
  }
}

query();

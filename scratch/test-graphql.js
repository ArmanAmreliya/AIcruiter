async function test() {
  const query = `
    query GetDashboardData {
      me {
        id
        fullName
        companyName
        role
        email
      }
    }
  `;

  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("GraphQL Response (No Headers):");
    console.dir(json, { depth: null });
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();

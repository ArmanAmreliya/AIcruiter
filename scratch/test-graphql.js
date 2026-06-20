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

  // Use a completely new user ID to trigger the ensureUser creation logic
  const newUserId = 'user_' + Math.random().toString(36).substring(2, 15);
  console.log("Testing with new user ID:", newUserId);

  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': newUserId
      },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("GraphQL Response:");
    console.dir(json, { depth: null });
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();

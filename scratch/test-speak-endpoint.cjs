async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'This is a test of the backend speak endpoint'
      })
    });
    console.log('Status:', res.status, res.statusText);
    console.log('Content-Type:', res.headers.get('content-type'));
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      console.log('Success! Audio buffer size:', buffer.byteLength, 'bytes');
    } else {
      const errText = await res.text();
      console.error('Error Response:', errText);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();

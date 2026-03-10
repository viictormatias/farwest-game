const apiKey = 'AIzaSyDOoMk3Vd0rw5pKLAwzuIGLapr2h_ts8A0';
const model = 'gemini-2.0-flash-exp-image-generation';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function test() {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Generate a small red square image." }] }]
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);

const fs = require('fs');

async function test() {
  console.log("=== STARTING LOCAL RAG VERIFICATION ===");
  const startTime = Date.now();
  
  // 1. Check n8n is running
  try {
    const res = await fetch('http://localhost:5678/healthz');
    console.log("n8n Health Status:", res.status);
  } catch (e) {
    console.error("n8n is not running on localhost:5678:", e.message);
    process.exit(1);
  }

  // 2. Upload a test CSV file to the upload-pdf webhook
  console.log("Sending test.csv to upload-pdf webhook...");
  const fileContent = "id,content,metadata\n1,El color favorito de David Sango es el azul marino,{'source': 'test'}\n";
  fs.writeFileSync('/tmp/test.csv', fileContent);

  const formData = new FormData();
  const fileBlob = new Blob([fileContent], { type: 'text/csv' });
  formData.append('data', fileBlob, 'test.csv');

  try {
    const uploadRes = await fetch('http://localhost:5678/webhook/upload-pdf', {
      method: 'POST',
      body: formData
    });
    console.log("Upload HTTP Status:", uploadRes.status);
    const uploadResult = await uploadRes.text();
    console.log("Upload Response:", uploadResult);
    if (uploadRes.status !== 200 && uploadRes.status !== 201) {
      throw new Error(`Upload failed: ${uploadRes.status}`);
    }
  } catch (e) {
    console.error("Error uploading document:", e);
    process.exit(1);
  }

  // 3. Wait a moment for embeddings processing
  console.log("Waiting 4 seconds for embeddings processing...");
  await new Promise(r => setTimeout(r, 4000));

  // 4. Send a chat query about the file content
  console.log("Sending chat request: '¿Cuál es el color favorito de David?'");
  const chatStartTime = Date.now();
  try {
    const chatRes = await fetch('http://localhost:5678/webhook/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: "¿Cuál es el color favorito de David?" })
    });
    console.log("Chat HTTP Status:", chatRes.status);
    const chatData = await chatRes.json();
    console.log("Chat Response:", JSON.stringify(chatData, null, 2));
    console.log(`Chat duration: ${(Date.now() - chatStartTime) / 1000} seconds`);
    if (chatRes.status !== 200) {
      throw new Error(`Chat failed: ${chatRes.status}`);
    }
  } catch (e) {
    console.error("Error sending chat query:", e);
    process.exit(1);
  }

  console.log(`=== LOCAL RAG VERIFICATION COMPLETED SUCCESSFULLY IN ${(Date.now() - startTime) / 1000} SECONDS ===`);
}

test();

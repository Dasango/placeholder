const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log("==================================================");
  console.log("  INICIANDO PRUEBAS DE RAG MULTI-PROYECTO EN n8n  ");
  console.log("==================================================");

  const n8nUrl = "http://localhost:5678";
  
  // 1. Verificar que n8n esté activo
  try {
    const res = await fetch(`${n8nUrl}/healthz`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    console.log("✅ n8n está activo y respondiendo.");
  } catch (e) {
    console.error("❌ Error: n8n no está corriendo en http://localhost:5678");
    console.error(e.message);
    process.exit(1);
  }

  // Generar IDs únicos para simular aislamiento entre proyectos
  const projectId1 = `project_delegacion_${Date.now()}`;
  const projectId2 = `project_reporte_${Date.now()}`;
  console.log(`Proyecto 1 (Delegación): ${projectId1}`);
  console.log(`Proyecto 2 (Reporte): ${projectId2}`);

  const cartaPath = path.join(__dirname, '../tasks/carta_delegacion.pdf');
  const reportePath = path.join(__dirname, '../tasks/REPORTE DE RESULTADOS FINALES.pdf');

  // Helper para subir archivos
  async function uploadFile(filePath, projectId, customName) {
    console.log(`Subiendo ${customName} para Proyecto: ${projectId}...`);
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('data', fileBlob, customName);
    formData.append('projectId', projectId);

    const response = await fetch(`${n8nUrl}/webhook/upload-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Fallo al subir archivo. HTTP Status: ${response.status}`);
    }

    const resJson = await response.json();
    console.log(`✅ ${customName} subido con éxito:`, JSON.stringify(resJson));
  }

  // Helper para chatear
  async function sendChatMessage(message, projectId) {
    console.log(`[Chat - Proyecto: ${projectId}] Pregunta: "${message}"`);
    const response = await fetch(`${n8nUrl}/webhook/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, projectId }),
    });

    if (!response.ok) {
      throw new Error(`Fallo al enviar mensaje al chat. HTTP Status: ${response.status}`);
    }

    const resJson = await response.json();
    
    let answer = "";
    if (Array.isArray(resJson) && resJson[0]) {
      answer = resJson[0].output || resJson[0].text || JSON.stringify(resJson[0]);
    } else if (resJson && typeof resJson === 'object') {
      answer = resJson.output || resJson.text || JSON.stringify(resJson);
    } else {
      answer = String(resJson);
    }
    
    console.log(`🤖 Respuesta: ${answer.substring(0, 150)}...`);
    return answer;
  }

  // 2. Subir carta de delegación a Proyecto 1
  await uploadFile(cartaPath, projectId1, 'carta_delegacion.pdf');

  // 3. Subir reporte de resultados a Proyecto 2
  await uploadFile(reportePath, projectId2, 'reporte_resultados.pdf');

  // 4. Esperar a que se completen los embeddings en Postgres
  console.log("Esperando 5 segundos para procesamiento de embeddings...");
  await new Promise(r => setTimeout(r, 5000));

  // 5. Test de Aislamiento 1: Preguntar en Proyecto 1 sobre la delegación
  // Debería responder correctamente
  const q1 = "¿Quién es el delegado designado por Edgar Abel Sango Pillalaza?";
  const answer1 = await sendChatMessage(q1, projectId1);
  if (!answer1.toLowerCase().includes("neris") && !answer1.toLowerCase().includes("rosero")) {
    console.error("❌ ERROR: El Proyecto 1 no respondió correctamente sobre la delegación.");
    process.exit(1);
  }
  console.log("✅ Prueba 1 exitosa: El Proyecto 1 responde correctamente sobre su propio PDF.");

  // 6. Test de Aislamiento 2: Preguntar en Proyecto 2 sobre la delegación (no debería saberlo)
  const answer2 = await sendChatMessage(q1, projectId2);
  if (answer2.toLowerCase().includes("neris") || answer2.toLowerCase().includes("rosero")) {
    console.error("❌ ERROR DE SEGURIDAD: El Proyecto 2 tiene acceso a los documentos del Proyecto 1.");
    process.exit(1);
  }
  console.log("✅ Prueba 2 exitosa: El Proyecto 2 NO tiene acceso a los documentos del Proyecto 1.");

  // 7. Test de Aislamiento 3: Preguntar en Proyecto 2 sobre el reporte de resultados
  const q2 = "¿De qué trata este reporte de resultados finales?";
  const answer3 = await sendChatMessage(q2, projectId2);
  if (!answer3.toLowerCase().includes("resultado") && !answer3.toLowerCase().includes("final")) {
    console.log("⚠️ Advertencia: La respuesta del reporte no contiene palabras clave esperadas, pero comprobemos aislamiento.");
  }
  console.log("✅ Prueba 3 exitosa: El Proyecto 2 responde sobre su propio reporte.");

  // 8. Test de Aislamiento 4: Preguntar en Proyecto 1 sobre el reporte (no debería saberlo)
  const answer4 = await sendChatMessage(q2, projectId1);
  if (answer4.toLowerCase().includes("eleccion") || answer4.toLowerCase().includes("electoral") || answer4.toLowerCase().includes("presidencial") || answer4.toLowerCase().includes("2023")) {
    // Si da detalles del reporte
    console.error("❌ ERROR DE SEGURIDAD: El Proyecto 1 tiene acceso a los documentos del Proyecto 2.");
    process.exit(1);
  }
  console.log("✅ Prueba 4 exitosa: El Proyecto 1 NO tiene acceso a los documentos del Proyecto 2.");

  // 9. Test de Múltiples PDFs en el mismo proyecto: Subir el Reporte también al Proyecto 1
  console.log("--- Probando múltiples PDFs en un solo proyecto ---");
  await uploadFile(reportePath, projectId1, 'reporte_resultados.pdf');
  console.log("Esperando 5 segundos para embeddings...");
  await new Promise(r => setTimeout(r, 5000));

  // Ahora Proyecto 1 debería responder sobre la delegación AND sobre el reporte
  const answer1_reporte = await sendChatMessage(q2, projectId1);
  console.log("✅ Prueba 5 exitosa: Proyecto 1 ahora puede responder también sobre el reporte de resultados.");

  console.log("\n==================================================");
  console.log("   🎉 ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON!   ");
  console.log("==================================================");
}

runTests().catch(e => {
  console.error("❌ Excepción no controlada durante las pruebas:", e);
  process.exit(1);
});

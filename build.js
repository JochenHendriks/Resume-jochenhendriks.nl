const fs = require('fs');
const path = require('path');

function build() {
  console.log('🚀 Starten van statische CV build pipeline...');

  const resumePath = path.join(__dirname, 'resume.json');
  const templatePath = path.join(__dirname, 'template.html');
  const outputPath = path.join(__dirname, 'index.html');

  if (!fs.existsSync(resumePath)) {
    console.error('❌ Fout: resume.json niet gevonden op', resumePath);
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Fout: template.html niet gevonden op', templatePath);
    process.exit(1);
  }

  const rawResume = fs.readFileSync(resumePath, 'utf-8');
  let resumeObj;
  try {
    resumeObj = JSON.parse(rawResume);
  } catch (e) {
    console.error('❌ Fout bij parsen resume.json:', e.message);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const placeholder = '/* INJECT_JSON_HERE */';

  if (!template.includes(placeholder)) {
    console.error(`❌ Fout: Placeholder "${placeholder}" niet gevonden in template.html`);
    process.exit(1);
  }

  const jsonString = JSON.stringify(resumeObj, null, 2);
  const resultHtml = template.replace(placeholder, jsonString);

  fs.writeFileSync(outputPath, resultHtml, 'utf-8');
  console.log(`✅ Succes! Data uit resume.json geïnjecteerd in ${outputPath}`);
}

build();

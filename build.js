const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { validateResumeData } = require('./src/validate');
const {
  renderPrintHeader,
  renderHero,
  renderCoachHighlights,
  renderWork,
  renderProjects,
  renderSkills,
  renderCertificates,
  renderEducation,
  renderLanguages,
  renderPublications,
  renderInterests
} = require('./src/renderers');

function compileTailwindCss() {
  console.log('📦 Compileren van standalone Tailwind CSS productiebundle...');
  const inputCssPath = path.join(__dirname, 'src', 'input.css');
  const tailwindCliPath = path.join(__dirname, 'node_modules', 'tailwindcss', 'lib', 'cli.js');

  if (!fs.existsSync(inputCssPath)) {
    throw new Error(`input.css niet gevonden op: ${inputCssPath}`);
  }

  if (!fs.existsSync(tailwindCliPath)) {
    throw new Error(`Tailwind CLI niet gevonden in node_modules op: ${tailwindCliPath}. Voer 'npm install' uit.`);
  }

  // Voer rechtstreeks uit via process.execPath (Node) zonder onveilige OS subshell of trage npx lookup
  try {
    const compiledCss = execFileSync(
      process.execPath,
      [tailwindCliPath, '-i', inputCssPath, '--minify'],
      {
        encoding: 'utf-8',
        cwd: __dirname,
        maxBuffer: 10 * 1024 * 1024
      }
    );

    if (!compiledCss || compiledCss.trim().length === 0) {
      throw new Error('Gecompileerde Tailwind CSS is leeg.');
    }

    return compiledCss;
  } catch (err) {
    // Fail hard: voorkom dat een ongeopmaakte site naar productie gaat
    console.error('❌ Fatale fout tijdens Tailwind CSS compilatie:', err.message);
    if (err.stderr) {
      console.error(err.stderr.toString());
    }
    process.exit(1);
  }
}

async function build() {
  console.log('🚀 Starten van asynchrone statische Flipchart CV Pre-render build...');

  const resumePath = path.join(__dirname, 'resume.json');
  const uiConfigPath = path.join(__dirname, 'ui-config.json');
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

  try {
    const readUiPromise = fs.existsSync(uiConfigPath)
      ? fs.promises.readFile(uiConfigPath, 'utf-8')
      : Promise.resolve('{}');

    const [rawResume, rawUiConfig, templateHtml] = await Promise.all([
      fs.promises.readFile(resumePath, 'utf-8'),
      readUiPromise,
      fs.promises.readFile(templatePath, 'utf-8')
    ]);

    const resumeObj = JSON.parse(rawResume);
    const uiConfig = JSON.parse(rawUiConfig);

    // Valideer schema en types vóór renderen om build-time crashes te voorkomen
    validateResumeData(resumeObj, uiConfig);

    let html = templateHtml;

    // Gebruik altijd een replacer-functie () => content om speciale $ patterns te neutraliseren
    html = html.replace('<!-- SLOT_PRINT_HEADER -->', () => renderPrintHeader(resumeObj.basics || {}));
    html = html.replace('<!-- SLOT_HERO -->', () => renderHero(resumeObj.basics || {}, uiConfig));
    html = html.replace('<!-- SLOT_COACH_HIGHLIGHTS -->', () => renderCoachHighlights(uiConfig.coachHighlights || []));
    html = html.replace('<!-- SLOT_WORK -->', () => renderWork(resumeObj.work || []));
    html = html.replace('<!-- SLOT_PROJECTS -->', () => renderProjects(resumeObj.projects || []));
    html = html.replace('<!-- SLOT_SKILLS -->', () => renderSkills(resumeObj.skills || []));
    html = html.replace('<!-- SLOT_CERTIFICATES -->', () => renderCertificates(resumeObj.certificates || []));
    html = html.replace('<!-- SLOT_EDUCATION -->', () => renderEducation(resumeObj.education || []));
    html = html.replace('<!-- SLOT_LANGUAGES -->', () => renderLanguages(resumeObj.languages || []));
    html = html.replace('<!-- SLOT_PUBLICATIONS -->', () => renderPublications(resumeObj.publications || []));
    html = html.replace('<!-- SLOT_INTERESTS -->', () => renderInterests(resumeObj.interests || []));

    // Compileer productie Tailwind bundle
    const compiledCss = compileTailwindCss();
    html = html.replace('/* SLOT_TAILWIND_CSS */', () => compiledCss);

    await fs.promises.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Succes! Flipchart CV samengesteld en 100% statisch geschreven naar ${outputPath}`);
  } catch (err) {
    console.error('❌ Fout tijdens build proces:', err.message);
    process.exit(1);
  }
}

build();

const fs = require('fs');
const path = require('path');

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'heden' || dateStr.toLowerCase() === 'present') return 'Heden';
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${monthNames[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

function renderPrintHeader(basics) {
  const name = basics.name || 'Jochen Hendriks';
  const label = basics.label || '';
  const summary = basics.summary || '';
  const locStr = basics.location ? [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ') : '';
  const linkedinProfile = (basics.profiles || []).find(p => (p.network || '').toLowerCase().includes('linkedin'));
  const urlDisplay = basics.url ? basics.url.replace(/^https?:\/\//, '') : '';

  return `
    <div class="print-only mb-6 border-b-2 border-slate-800 pb-3">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-950 tracking-tight">${name}</h1>
          <p class="text-sm font-bold text-teal-800 mt-0.5">${label}</p>
          <p class="text-xs text-slate-600 mt-2 max-w-2xl">${summary}</p>
        </div>
        <div class="text-right text-xs space-y-1 text-slate-700 shrink-0 ml-4">
          ${locStr ? `<div><i class="fa-solid fa-location-dot mr-1.5 text-slate-400"></i>${locStr}</div>` : ''}
          ${linkedinProfile ? `<div><i class="fa-brands fa-linkedin mr-1.5 text-slate-400"></i>${linkedinProfile.url.replace(/^https?:\/\//, '')}</div>` : ''}
          ${urlDisplay ? `<div><i class="fa-solid fa-globe mr-1.5 text-slate-400"></i>${urlDisplay}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderMetrics(metricsList) {
  if (!metricsList || metricsList.length === 0) return '';

  const colorStyles = {
    amber: 'bg-paper-amber/80 text-slate-900 border-slate-700 shadow-[2px_3px_0px_#334155] -rotate-1',
    teal: 'bg-paper-teal/80 text-teal-900 border-slate-700 shadow-[2px_3px_0px_#334155] rotate-1',
    yellow: 'bg-paper-yellow/90 text-amber-950 border-slate-700 shadow-[2px_3px_0px_#334155] -rotate-1',
    rose: 'bg-paper-rose/80 text-rose-950 border-slate-700 shadow-[2px_3px_0px_#334155] rotate-1'
  };

  const cardsHtml = metricsList.map((m) => {
    const styleClass = colorStyles[m.color] || colorStyles.amber;
    return `
      <div class="${styleClass} p-3.5 border-2 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] flex flex-col justify-center items-center">
        <div class="text-xl sm:text-2xl font-extrabold font-sans">${m.value}</div>
        <div class="text-xs font-bold text-slate-700 leading-snug text-center mt-1">${m.label}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="no-print mt-8 pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
      ${cardsHtml}
    </div>
  `;
}

function renderHero(basics, uiConfig = {}) {
  const name = basics.name || 'Jochen Hendriks';
  const image = basics.image || 'profile.jpg';
  const label = basics.label || '';
  const summary = basics.summary || '';
  const locStr = basics.location ? [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ') : '';
  const linkedinProfile = (basics.profiles || []).find(p => (p.network || '').toLowerCase().includes('linkedin'));
  const linkedinUrl = linkedinProfile ? linkedinProfile.url : 'https://www.linkedin.com/in/jochenh/';

  const profilesHtml = (basics.profiles || []).map(p => {
    const net = (p.network || '').toLowerCase();
    let iconHtml = '<i class="fa-solid fa-globe text-teal-700"></i>';

    if (net.includes('linkedin')) {
      iconHtml = '<i class="fa-brands fa-linkedin text-[#0a66c2]"></i>';
    } else if (net.includes('github')) {
      iconHtml = '<i class="fa-brands fa-github text-slate-800"></i>';
    } else if (net.includes('meetup')) {
      iconHtml = '<i class="fa-brands fa-meetup text-[#f64060]"></i>';
    } else if (net.includes('twitch')) {
      iconHtml = '<i class="fa-brands fa-twitch text-[#9146ff]"></i>';
    } else if (net.includes('steam')) {
      iconHtml = '<i class="fa-brands fa-steam text-[#171a21]"></i>';
    } else if (net.includes('tweakers')) {
      iconHtml = '<span class="inline-flex items-center justify-center w-4 h-4 bg-[#4c9bd4] text-white text-[10px] font-black rounded-[2px] leading-none shadow-2xs">T</span>';
    } else if (net.includes('twitter') || net.includes('x')) {
      iconHtml = '<i class="fa-brands fa-x-twitter text-slate-900"></i>';
    } else if (net.includes('youtube')) {
      iconHtml = '<i class="fa-brands fa-youtube text-rose-600"></i>';
    }

    return `
      <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-slate-700 rounded-[255px_10px_225px_10px/10px_225px_10px_255px] shadow-[2px_2px_0px_#334155] hover:bg-teal-50 hover:text-teal-900 transition">
        ${iconHtml}<span>${p.network}</span>
      </a>
    `;
  }).join('');

  const quote = uiConfig.quote;
  const quoteHtml = quote && quote.text ? `
    <div class="no-print hidden xl:block absolute -right-8 -top-8 w-44 sticky-note bg-paper-yellow p-3 border-2 border-slate-700 rotate-6 shadow-md z-30">
      <div class="washi-tape"></div>
      <div class="font-hand font-bold text-slate-900 text-lg leading-tight">
        "${quote.text}"
      </div>
      ${quote.author ? `<span class="block text-right font-hand text-xs text-slate-600 mt-1">— ${quote.author}</span>` : ''}
    </div>
  ` : '';

  return `
    <section id="over-mij" class="relative sketch-card-static p-6 sm:p-8 lg:p-10 print-break-avoid">
      <div class="washi-tape-amber no-print"></div>

      ${quoteHtml}

      <div class="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-10">
        <div class="relative shrink-0 mx-auto md:mx-0">
          <div class="relative p-2 bg-white border-2 border-slate-800 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_5px_0px_#1e293b] rotate-[-2.5deg] hover:rotate-0 transition-transform duration-300">
            <div class="washi-tape no-print"></div>
            
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-[220px_20px_240px_25px/20px_240px_25px_220px] overflow-hidden bg-gradient-to-br from-amber-100 via-teal-50 to-slate-200 border border-slate-300 relative group">
              <img 
                src="${image}" 
                alt="${name}" 
                class="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition duration-300"
              />
              <div class="absolute inset-0 bg-teal-900/10 pointer-events-none"></div>
            </div>

            <div class="text-center pt-1.5 pb-0.5">
              <span class="font-hand font-bold text-slate-800 text-lg tracking-wide">Jochen ✌️</span>
            </div>
          </div>

          ${uiConfig.availableForWork ? `
            <div class="no-print absolute -bottom-6 -right-6 flex items-center text-teal-800 pointer-events-none">
              <svg class="w-10 h-8 text-teal-700 rotate-12" viewBox="0 0 50 40" fill="none">
                <path d="M8 30 C 20 35 35 25 42 10 M 34 8 L 43 10 L 41 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="font-hand text-base font-bold whitespace-nowrap bg-amber-200 border border-slate-700 px-2 py-0.5 rounded -rotate-6 shadow-xs">
                Beschikbaar voor opdrachten!
              </span>
            </div>
          ` : ''}
        </div>

        <div class="flex-grow space-y-3.5 text-center md:text-left">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              ${name}
            </h1>
          </div>

          <p class="text-base sm:text-lg font-bold text-teal-900">
            <span class="marker-yellow">${label}</span>
          </p>

          <p class="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            ${summary}
          </p>

          <div class="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 font-bold">
            ${locStr ? `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-slate-700 rounded-[255px_10px_225px_10px/10px_225px_10px_255px] shadow-[2px_2px_0px_#334155]">
                <i class="fa-solid fa-location-dot text-rose-500"></i>
                <span>${locStr}</span>
              </div>
            ` : ''}
            ${profilesHtml}
            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="sketch-card inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-300 hover:bg-amber-400 text-slate-950 transition" title="Neem contact op via LinkedIn">
              <i class="fa-brands fa-linkedin text-sm text-[#0a66c2]"></i>
              <span>Contact</span>
            </a>
            <button onclick="window.print()" class="sketch-card no-print inline-flex items-center gap-1.5 px-3.5 py-1 bg-slate-900 hover:bg-teal-800 text-white transition" title="Print of bewaar dit CV als PDF">
              <i class="fa-solid fa-print text-amber-400"></i>
              <span>Print CV</span>
            </button>
          </div>
        </div>
      </div>

      ${renderMetrics(uiConfig.metrics || [])}
    </section>
  `;
}

function renderCoachHighlights(highlights) {
  if (!highlights || highlights.length === 0) return '';

  const styles = [
    { bg: 'bg-[#fffbeb]', border: 'border-amber-500', tape: 'washi-tape-amber', iconBg: 'bg-amber-100 text-amber-800', badge: 'bg-amber-200 text-amber-950 border-amber-500', rot: '-rotate-1' },
    { bg: 'bg-[#f0fdf4]', border: 'border-emerald-500', tape: 'washi-tape', iconBg: 'bg-emerald-100 text-emerald-800', badge: 'bg-emerald-200 text-emerald-950 border-emerald-500', rot: 'rotate-1' },
    { bg: 'bg-[#eef2ff]', border: 'border-indigo-500', tape: 'washi-tape', iconBg: 'bg-indigo-100 text-indigo-800', badge: 'bg-indigo-200 text-indigo-950 border-indigo-500', rot: '-rotate-1.5' },
    { bg: 'bg-[#fff1f2]', border: 'border-rose-400', tape: 'washi-tape-amber', iconBg: 'bg-rose-100 text-rose-800', badge: 'bg-rose-200 text-rose-950 border-rose-500', rot: 'rotate-1' }
  ];

  const iconFa = {
    lego: 'fa-solid fa-cubes-stacked',
    sparkles: 'fa-solid fa-wand-magic-sparkles',
    users: 'fa-solid fa-people-arrows',
    dice: 'fa-solid fa-dice',
    palette: 'fa-solid fa-pen-nib'
  };

  const cardsHtml = highlights.map((item, idx) => {
    const style = styles[idx % styles.length];
    const faIcon = iconFa[item.icon] || 'fa-solid fa-lightbulb';
    return `
      <div class="sticky-note ${style.bg} border-2 ${style.border} p-5 ${style.rot} flex flex-col justify-between relative">
        <div class="${style.tape} no-print"></div>
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="w-10 h-10 rounded-lg ${style.iconBg} border border-slate-700/40 flex items-center justify-center text-lg shadow-xs">
              <i class="${faIcon}"></i>
            </div>
            <span class="font-hand font-bold text-sm px-2 py-0.5 border ${style.badge} rounded shadow-2xs">
              ${item.badge}
            </span>
          </div>
          <h3 class="font-bold text-slate-950 text-base mb-1.5">${item.title}</h3>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">${item.description}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section id="werkvormen" class="space-y-4 print-break-avoid relative">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-hand font-bold text-xl text-teal-900">#HandsOnAgileToolbox</span>
            <svg class="no-print w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 8.5L21 9.5L16 14.5L17.5 21L12 17.5L6.5 21L8 14.5L3 9.5L9.5 8.5L12 2Z"/>
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-cubes-stacked text-amber-600"></i>
            Facilitatie & Werkvormen
          </h2>
        </div>

        <div class="no-print font-hand font-bold text-lg sm:text-xl text-slate-700 rotate-[-2deg] bg-amber-100/90 border border-slate-700 px-3 py-1 rounded shadow-xs">
          💡 "100% betrokkenheid, 0% saaie vergaderingen!"
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
        ${cardsHtml}
      </div>
    </section>
  `;
}

function renderWork(workList) {
  if (!workList || workList.length === 0) return '';

  return workList.map(job => {
    const periodStr = `${formatDate(job.startDate)} – ${formatDate(job.endDate)}`;

    let assignmentsHtml = '';
    if (job.assignments && Array.isArray(job.assignments) && job.assignments.length > 0) {
      const itemsHtml = job.assignments.map(assignment => `
        <div class="sketch-card-subtle bg-slate-50/90 p-4 sm:p-5 transition shadow-xs print-break-avoid">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h5 class="font-bold text-slate-950 text-base sm:text-lg">${assignment.client || 'Klantopdracht'}</h5>
                <span class="font-hand font-bold text-sm px-2 py-0.5 rounded bg-amber-200 border border-slate-700 text-slate-950 shadow-2xs">
                  ${assignment.role || 'Consultant'}
                </span>
              </div>
            </div>
            <span class="text-xs text-slate-600 font-bold whitespace-nowrap bg-white px-2 py-0.5 border border-slate-300 rounded">
              <i class="fa-regular fa-calendar text-[11px] mr-1 text-slate-500"></i>${formatDate(assignment.startDate)} – ${formatDate(assignment.endDate)}
            </span>
          </div>

          ${assignment.summary ? `<p class="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-sans">${assignment.summary}</p>` : ''}

          ${assignment.highlights && assignment.highlights.length > 0 ? `
            <ul class="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-800">
              ${assignment.highlights.map(h => `
                <li class="flex items-start gap-2">
                  <span class="font-hand font-bold text-teal-800 text-base shrink-0 leading-none">✓</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}

          ${assignment.keywords && assignment.keywords.length > 0 ? `
            <div class="mt-3.5 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5">
              ${assignment.keywords.map(kw => `
                <span class="px-2 py-0.5 bg-white border border-slate-400 text-slate-700 rounded text-[11px] font-bold">
                  ${kw}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');

      assignmentsHtml = `
        <div class="mt-6 pt-5 border-t-2 border-dashed border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="font-hand font-bold text-lg text-teal-900">
                📌 Klantopdrachten & Detacheringen (${job.assignments.length})
              </span>
            </div>
          </div>

          <div class="space-y-4 pl-0 sm:pl-3 sm:border-l-2 sm:border-slate-300 assignments-group">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    return `
      <div class="sketch-card-static p-6 sm:p-7 print-break-avoid relative">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-lg sm:text-xl font-extrabold text-slate-950">${job.position || 'Functie'}</h3>
              ${job.url ? `<a href="${job.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-teal-800 hover:underline font-bold flex items-center gap-1"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> Website</a>` : ''}
            </div>
            <p class="text-sm font-bold text-teal-900 mt-0.5">${job.name || 'Werkgever'}</p>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-slate-700 rounded text-xs font-bold text-slate-900 whitespace-nowrap self-start shadow-2xs">
            <i class="fa-regular fa-calendar text-slate-600"></i>
            <span>${periodStr}</span>
          </div>
        </div>

        ${job.summary ? `<p class="text-sm text-slate-700 leading-relaxed mb-4">${job.summary}</p>` : ''}

        ${job.highlights && job.highlights.length > 0 ? `
          <div class="mb-4">
            <h5 class="font-hand font-bold text-base text-slate-600 mb-1.5">Kernresultaten & Impact:</h5>
            <ul class="space-y-1.5 text-xs sm:text-sm text-slate-800">
              ${job.highlights.map(h => `
                <li class="flex items-start gap-2">
                  <span class="font-hand font-bold text-emerald-700 text-base shrink-0 leading-none">➜</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${assignmentsHtml}
      </div>
    `;
  }).join('');
}

function renderSkills(skillsList) {
  if (!skillsList || skillsList.length === 0) return '';
  const iconList = ['fa-solid fa-compass-drafting', 'fa-solid fa-people-group', 'fa-solid fa-code-branch', 'fa-solid fa-chart-line'];

  return skillsList.map((skillGroup, idx) => {
    const icon = iconList[idx % iconList.length];
    const keywordsHtml = (skillGroup.keywords || []).map(kw => `
      <span class="px-2.5 py-1 bg-slate-50 border border-slate-400 rounded text-xs font-bold text-slate-800 hover:bg-amber-100 transition">
        ${kw}
      </span>
    `).join('');

    return `
      <div class="sketch-card-subtle bg-white p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded bg-teal-100 text-teal-900 border border-slate-700 flex items-center justify-center text-sm shadow-2xs">
                <i class="${icon}"></i>
              </div>
              <h3 class="font-bold text-slate-950 text-base">${skillGroup.name}</h3>
            </div>
            <span class="font-hand font-bold text-sm px-2 py-0.5 rounded bg-amber-100 border border-slate-700 text-slate-900">
              ${skillGroup.level || 'Expert'}
            </span>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            ${keywordsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCertificates(certs) {
  if (!certs || certs.length === 0) return '';

  return certs.map(cert => `
    <div class="sketch-card-subtle bg-white p-4 flex items-start gap-3">
      <div class="w-8 h-8 rounded bg-amber-100 text-amber-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-2xs">
        <i class="fa-solid fa-award"></i>
      </div>
      <div class="min-w-0">
        <h4 class="font-bold text-slate-950 text-xs sm:text-sm leading-snug">${cert.name}</h4>
        <div class="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
          <span class="font-bold text-teal-800">${cert.issuer || ''}</span>
          ${cert.date ? `<span>•</span><span class="font-bold">${cert.date}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderEducation(eduList) {
  if (!eduList || eduList.length === 0) return '';

  return eduList.map(edu => `
    <div class="sketch-card-subtle bg-white p-4">
      <div class="flex items-center justify-between">
        <h4 class="font-bold text-slate-950 text-xs sm:text-sm">${edu.studyType || ''} ${edu.area ? '– ' + edu.area : ''}</h4>
        <span class="text-xs text-slate-600 font-bold">${edu.startDate || ''} – ${edu.endDate || ''}</span>
      </div>
      <p class="text-xs font-bold text-teal-900 mt-1">${edu.institution || ''}</p>
      ${edu.courses && edu.courses.length > 0 ? `
        <div class="mt-2 text-[11px] text-slate-600 flex flex-wrap gap-1 font-medium">
          ${edu.courses.map(c => `<span class="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">${c}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderLanguages(langList) {
  if (!langList || langList.length === 0) return '';

  return langList.map(lang => `
    <div class="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-dashed border-slate-300 last:border-0">
      <span class="font-bold text-slate-900">${lang.language}</span>
      <span class="font-hand font-bold text-base text-teal-800">${lang.fluency}</span>
    </div>
  `).join('');
}

async function build() {
  console.log('🚀 Starten van asynchrone statische CV Pre-render build...');

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

    let html = templateHtml;

    // Pre-render pure static HTML into all slots combining resume data and UI config
    html = html.replace('<!-- SLOT_PRINT_HEADER -->', renderPrintHeader(resumeObj.basics || {}));
    html = html.replace('<!-- SLOT_HERO -->', renderHero(resumeObj.basics || {}, uiConfig));
    html = html.replace('<!-- SLOT_COACH_HIGHLIGHTS -->', renderCoachHighlights(uiConfig.coachHighlights || []));
    html = html.replace('<!-- SLOT_WORK -->', renderWork(resumeObj.work || []));
    html = html.replace('<!-- SLOT_SKILLS -->', renderSkills(resumeObj.skills || []));
    html = html.replace('<!-- SLOT_CERTIFICATES -->', renderCertificates(resumeObj.certificates || []));
    html = html.replace('<!-- SLOT_EDUCATION -->', renderEducation(resumeObj.education || []));
    html = html.replace('<!-- SLOT_LANGUAGES -->', renderLanguages(resumeObj.languages || []));

    await fs.promises.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Succes! Data uit resume.json + ui-config.json samengevoegd en 100% statisch geschreven naar ${outputPath}`);
  } catch (err) {
    console.error('❌ Fout tijdens build proces:', err.message);
    process.exit(1);
  }
}

build();

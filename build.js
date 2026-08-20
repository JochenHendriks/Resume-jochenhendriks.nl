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

  const colorStyles = [
    { bg: 'bg-[#fef3c7] text-amber-950 -rotate-1', border: 'border-amber-300' },
    { bg: 'bg-[#ccfbf1] text-teal-950 rotate-1', border: 'border-teal-300' },
    { bg: 'bg-[#fef08a] text-yellow-950 -rotate-1', border: 'border-yellow-300' },
    { bg: 'bg-[#ffe4e6] text-rose-950 rotate-1.5', border: 'border-rose-300' }
  ];

  const cardsHtml = metricsList.map((m, idx) => {
    const style = colorStyles[idx % colorStyles.length];
    const isFirst = idx === 0;

    const valueContent = isFirst ? `
      <div class="flex items-center justify-center gap-1.5">
        <span class="marker-circle-red font-extrabold">
          ${m.value}
          <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 25 C 10 10, 45 4, 85 12 C 95 15, 96 35, 75 42 C 45 48, 8 42, 6 24 C 5 15, 25 8, 48 7" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <!-- Hand-drawn Sprint / Iteration Cycle Doodle -->
        <svg class="w-6 h-6 text-blue-600 inline-block shrink-0 -rotate-12" viewBox="0 0 36 36" fill="none" title="Agile Sprint / Iteratie loop">
          <path d="M9 18 A 9 9 0 1 1 27 18 A 9 9 0 0 1 9 18 M 24 12 L 28 17 L 33 13 M 12 24 L 8 19 L 3 23" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    ` : m.value;

    return `
      <div class="${style.bg} border ${style.border} relative p-4 rounded-lg shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform">
        <div class="text-xl sm:text-2xl font-extrabold font-sans py-1">${valueContent}</div>
        <div class="text-xs font-bold text-slate-800 leading-snug text-center mt-1">${m.label}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="no-print mt-8 pt-6 border-t-2 border-dashed border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
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
      <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md shadow-xs hover:bg-teal-50 hover:text-teal-900 transition">
        ${iconHtml}<span>${p.network}</span>
      </a>
    `;
  }).join('');

  const quote = uiConfig.quote;
  const quoteHtml = quote && quote.text ? `
    <div class="no-print hidden xl:block absolute -right-6 -top-6 w-48 sticky-yellow-tl p-4 rotate-3 z-30">
      <div class="font-hand font-bold text-slate-900 text-lg leading-tight">
        "${quote.text}"
      </div>
      ${quote.author ? `<span class="block text-right font-hand text-xs text-slate-600 mt-1">— ${quote.author}</span>` : ''}
    </div>
  ` : '';

  return `
    <section id="over-mij" class="relative flipchart-sheet p-6 sm:p-8 lg:p-10 print-break-avoid">
      <div class="washi-tape-amber no-print"></div>

      ${quoteHtml}

      <div class="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-10">
        <div class="relative shrink-0 mx-auto md:mx-0">
          <div class="relative p-2.5 bg-white border border-slate-200 rounded-lg shadow-md rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
            <div class="washi-tape no-print"></div>
            
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-md overflow-hidden bg-gradient-to-br from-amber-50 via-teal-50 to-slate-100 border border-slate-200 relative group">
              <img 
                src="${image}" 
                alt="${name}" 
                class="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition duration-300"
              />
              <div class="absolute inset-0 bg-teal-900/5 pointer-events-none"></div>
            </div>

            <div class="text-center pt-2 pb-0.5">
              <span class="font-hand font-bold text-slate-800 text-lg tracking-wide">Jochen</span>
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
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md shadow-xs">
                <i class="fa-solid fa-location-dot text-rose-500"></i>
                <span>${locStr}</span>
              </div>
            ` : ''}
            ${profilesHtml}
            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-300 hover:bg-amber-400 text-slate-950 rounded-md shadow-xs transition" title="Neem contact op via LinkedIn">
              <i class="fa-brands fa-linkedin text-sm text-[#0a66c2]"></i>
              <span>Contact</span>
            </a>
            <button onclick="window.print()" class="no-print inline-flex items-center gap-1.5 px-3.5 py-1 bg-slate-900 hover:bg-teal-800 text-white rounded-md shadow-xs transition" title="Print of bewaar dit CV als PDF">
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
    { class: 'sticky-fold-br sticky-yellow -rotate-1', badge: 'bg-white/80 text-amber-950 border-amber-300' },
    { class: 'sticky-fold-br sticky-emerald rotate-1', badge: 'bg-white/80 text-emerald-950 border-emerald-300' },
    { class: 'sticky-fold-br sticky-indigo -rotate-1.5', badge: 'bg-white/80 text-indigo-950 border-indigo-300' },
    { class: 'sticky-fold-br sticky-rose rotate-1.5', badge: 'bg-white/80 text-rose-950 border-rose-300' }
  ];

  const cardsHtml = highlights.map((item, idx) => {
    const style = styles[idx % styles.length];
    const isLsp = idx === 0;

    const starDoodle = isLsp ? `
      <div class="no-print absolute -left-3.5 -top-3.5 text-amber-500 pointer-events-none -rotate-12 z-20" title="Star highlight">
        <svg class="w-7 h-7" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 L23 14 L33 15 L25 22 L27 32 L19 26 L11 31 L14 21 L7 14 L17 13 Z" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(251, 191, 36, 0.25)"/>
        </svg>
      </div>
    ` : '';

    return `
      <div class="${style.class} relative p-5 pb-8 flex flex-col justify-between rounded-sm min-h-[190px]">
        ${starDoodle}
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
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
      <!-- Elmo Doodle ("Enough, Let's Move On" / Supergrover) -->
      <div class="no-print hidden lg:block absolute -left-12 -bottom-6 pointer-events-none -rotate-6 z-20" title="ELMO: Enough, Let's Move On!">
        <svg class="w-14 h-14" viewBox="0 0 60 60" fill="none">
          <path d="M12 38 C8 24, 20 12, 32 12 C44 12, 54 22, 50 38 C46 50, 16 50, 12 38 Z" stroke="#dc2626" stroke-width="2.5" fill="rgba(239, 68, 68, 0.15)" stroke-linecap="round"/>
          <circle cx="24" cy="20" r="5.5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <circle cx="25" cy="20" r="2" fill="#1e293b"/>
          <circle cx="36" cy="20" r="5.5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <circle cx="35" cy="20" r="2" fill="#1e293b"/>
          <ellipse cx="30" cy="28" rx="4.5" ry="6.5" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
          <path d="M18 35 Q30 48 42 35 Z" fill="#1e293b" stroke="#1e293b" stroke-width="2"/>
        </svg>
      </div>

      <!-- Hand-drawn curved arrow pointing down to Werkervaring -->
      <div class="no-print hidden md:block absolute right-8 -bottom-10 pointer-events-none z-20">
        <svg class="w-16 h-12 text-teal-700" viewBox="0 0 60 45" fill="none">
          <path d="M10 6 C 35 4, 48 18, 42 36 M 34 30 L 42 37 L 48 28" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 class="text-2xl sm:text-3xl font-marker tracking-wide text-slate-900">
            Facilitatie & Werkvormen
          </h2>
        </div>

        <div class="no-print font-hand font-bold text-lg sm:text-xl text-slate-700 rotate-[-1.5deg] bg-amber-100 border border-amber-300 px-3 py-1 rounded shadow-xs">
          "100% betrokkenheid, 0% saaie vergaderingen!"
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

  return workList.map((job, jobIdx) => {
    const periodStr = `${formatDate(job.startDate)} – ${formatDate(job.endDate)}`;

    // 1. Roles Timeline View (Capgemini & Intergamma)
    let rolesTimelineHtml = '';
    if (job.roles && Array.isArray(job.roles) && job.roles.length > 0) {
      rolesTimelineHtml = `
        <div class="mt-3.5 mb-4 pl-3.5 border-l-2 border-teal-700/50 space-y-2.5">
          ${job.roles.map(r => `
            <div class="relative flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 text-xs sm:text-sm">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-700 -ml-[20px] ring-4 ring-[#faf7f2] shadow-2xs"></span>
                <span class="font-bold text-slate-900 text-sm sm:text-base">${r.title}</span>
              </div>
              <div class="date-highlight text-sm self-start sm:self-auto">
                <span>${formatDate(r.startDate)} – ${formatDate(r.endDate)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 2. Client Assignments (Detacheringen als geneste indexkaartjes)
    let assignmentsHtml = '';
    if (job.assignments && Array.isArray(job.assignments) && job.assignments.length > 0) {
      const cardStyles = [
        { bg: 'bg-[#fefce8]', border: 'border-amber-200', rot: 'rotate-[-1deg]', tape: 'washi-tape-amber' },
        { bg: 'bg-[#f0fdfa]', border: 'border-teal-200', rot: 'rotate-[1.2deg]', tape: 'washi-tape' },
        { bg: 'bg-[#f8fafc]', border: 'border-slate-300', rot: 'rotate-[-0.8deg]', tape: 'washi-tape' }
      ];

      const itemsHtml = job.assignments.map((assignment, aIdx) => {
        const cStyle = cardStyles[aIdx % cardStyles.length];
        return `
          <div class="relative ${cStyle.bg} border ${cStyle.border} ${cStyle.rot} p-5 pt-6 rounded-lg shadow-sm transition hover:rotate-0 hover:shadow-md print-break-avoid">
            <div class="${cStyle.tape} no-print"></div>
            
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h5 class="font-extrabold text-slate-950 text-base sm:text-lg">${assignment.client || 'Klantopdracht'}</h5>
                  <span class="font-hand font-bold text-sm px-2 py-0.5 rounded bg-amber-200/90 text-slate-950 shadow-2xs">
                    ${assignment.role || 'Consultant'}
                  </span>
                </div>
              </div>
              <div class="date-highlight text-xs self-start sm:self-auto">
                <span>${formatDate(assignment.startDate)} – ${formatDate(assignment.endDate)}</span>
              </div>
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
              <div class="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                ${assignment.keywords.map(kw => `
                  <span class="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-[11px] font-bold">
                    ${kw}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      assignmentsHtml = `
        <div class="mt-6 pt-5 border-t-2 border-dashed border-slate-300/80 relative">
          <!-- Gift Box Doodle (Delivering Business Value) -->
          <div class="no-print hidden sm:block absolute right-2 -top-4 pointer-events-none rotate-6" title="Delivering Value!">
            <svg class="w-8 h-8" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="16" width="24" height="18" rx="2" stroke="#0d9488" stroke-width="2" fill="rgba(13, 148, 136, 0.12)"/>
              <rect x="6" y="12" width="28" height="5" rx="1.5" stroke="#0d9488" stroke-width="2" fill="#ffffff"/>
              <line x1="20" y1="12" x2="20" y2="34" stroke="#dc2626" stroke-width="2"/>
              <line x1="8" y1="24" x2="32" y2="24" stroke="#dc2626" stroke-width="1.5"/>
              <path d="M15 12 C12 6, 17 6, 20 12 C23 6, 28 6, 25 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="font-hand font-bold text-lg text-teal-900">
                Klantopdrachten & Detacheringen (${job.assignments.length})
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    const singlePositionHtml = (!job.roles || job.roles.length === 0) && job.position ? `
      <p class="text-sm font-bold text-teal-900 mt-0.5">${job.position}</p>
    ` : '';

    const rocketDoodle = job.name === 'Capgemini' ? `
      <!-- Rocket Doodle (Acceleration & Agile Flow) -->
      <div class="no-print hidden sm:block absolute -right-3 -top-3 pointer-events-none rotate-12 z-20" title="Accelerating Flow & Continuous Delivery">
        <svg class="w-10 h-10" viewBox="0 0 50 50" fill="none">
          <path d="M25 6 C17 12, 16 26, 18 36 L32 36 C34 26, 33 12, 25 6 Z" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(37, 99, 235, 0.08)"/>
          <circle cx="25" cy="20" r="3.5" stroke="#2563eb" stroke-width="2" fill="#ffffff"/>
          <path d="M18 28 L10 35 L17 36 M32 28 L40 35 L33 36" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 37 Q25 46 25 48 Q26 46 29 37" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
    ` : '';

    return `
      <div class="relative pl-6 sm:pl-8 border-l-[3.5px] border-teal-700/60 pb-10 last:pb-2 ml-1 sm:ml-2 print-break-avoid">
        <!-- Organic Marker Timeline Dot -->
        <span class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-800 border-2 border-white shadow-xs"></span>
        
        ${rocketDoodle}

        <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
          <div>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">${job.name || 'Werkgever'}</h3>
            ${singlePositionHtml}
          </div>
          <div class="date-highlight text-base sm:text-lg self-start sm:self-auto">
            <span>${periodStr}</span>
          </div>
        </div>

        ${rolesTimelineHtml}

        ${job.summary ? `<p class="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 font-sans">${job.summary}</p>` : ''}

        ${job.highlights && job.highlights.length > 0 && (!job.roles || job.roles.length === 0) ? `
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

  return skillsList.map(skillGroup => {
    const keywordsHtml = (skillGroup.keywords || []).map(kw => `
      <span class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-800 hover:bg-amber-100 transition">
        ${kw}
      </span>
    `).join('');

    return `
      <div class="flipchart-sheet p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-slate-950 text-base">${skillGroup.name}</h3>
            <span class="font-hand font-bold text-sm px-2.5 py-0.5 rounded bg-amber-100 text-slate-900 border border-amber-200">
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
    <div class="flipchart-sheet p-4 flex items-start gap-3">
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
    <div class="flipchart-sheet p-4">
      <div class="flex items-center justify-between">
        <h4 class="font-bold text-slate-950 text-xs sm:text-sm">${edu.studyType || ''} ${edu.area ? '– ' + edu.area : ''}</h4>
        <span class="text-xs text-slate-600 font-bold">${edu.startDate || ''} – ${edu.endDate || ''}</span>
      </div>
      <p class="text-xs font-bold text-teal-900 mt-1">${edu.institution || ''}</p>
      ${edu.courses && edu.courses.length > 0 ? `
        <div class="mt-2 text-[11px] text-slate-600 flex flex-wrap gap-1 font-medium">
          ${edu.courses.map(c => `<span class="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">${c}</span>`).join('')}
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

function renderPublications(pubList) {
  if (!pubList || pubList.length === 0) return '';

  return pubList.map((pub, idx) => {
    const rot = idx % 2 === 0 ? 'rotate-[-1.5deg]' : 'rotate-[1deg]';
    return `
      <div class="relative bg-[#fffdfa] border-2 border-dashed border-slate-300 p-6 pt-7 rounded shadow-sm ${rot} transition hover:rotate-0 hover:shadow-md print-break-avoid">
        <div class="washi-tape-amber no-print"></div>

        <!-- Hand-drawn Reading Glasses Doodle -->
        <div class="no-print hidden sm:block absolute -right-3 -top-4 pointer-events-none rotate-12 z-20" title="Leestip!">
          <svg class="w-10 h-7" viewBox="0 0 50 30" fill="none">
            <circle cx="15" cy="15" r="9" stroke="#0d9488" stroke-width="2.2" fill="rgba(255,255,255,0.7)"/>
            <circle cx="35" cy="15" r="9" stroke="#0d9488" stroke-width="2.2" fill="rgba(255,255,255,0.7)"/>
            <path d="M24 13 Q25 9 26 13" stroke="#0d9488" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M6 14 L2 11" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
            <path d="M44 14 L48 11" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="font-mono text-xs uppercase tracking-wider font-bold text-teal-900 bg-teal-100/80 px-2 py-0.5 rounded">
            ${pub.publisher || 'Publicatie'}
          </span>
          ${pub.releaseDate ? `
            <div class="date-highlight text-xs">
              <span>${formatDate(pub.releaseDate)}</span>
            </div>
          ` : ''}
        </div>

        <h3 class="font-mono font-bold text-slate-950 text-base sm:text-lg leading-snug mb-2">
          ${pub.url ? `
            <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="hover:text-teal-800 transition underline decoration-teal-600/50">
              ${pub.name}
            </a>
          ` : pub.name}
        </h3>

        ${pub.summary ? `<p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">${pub.summary}</p>` : ''}
      </div>
    `;
  }).join('');
}

function renderInterests(interestsList) {
  if (!interestsList || interestsList.length === 0) return '';

  const itemsHtml = interestsList.map((item, idx) => {
    const angle = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
    
    const tagStyles = [
      'bg-[#fef08a] border border-amber-300 text-slate-900',
      'bg-[#d1fae5] border border-emerald-300 text-slate-900',
      'bg-[#e0e7ff] border border-indigo-300 text-slate-900',
      'bg-[#ffe4e6] border border-rose-300 text-slate-900'
    ];
    const rotations = ['rotate-[-2deg]', 'rotate-[2.5deg]', 'rotate-[-1.5deg]', 'rotate-[2deg]'];

    const tagsHtml = (item.keywords || []).map((kw, kIdx) => {
      const sStyle = tagStyles[kIdx % tagStyles.length];
      const sRot = rotations[kIdx % rotations.length];
      return `
        <span class="${sStyle} ${sRot} inline-block px-3 py-1 rounded text-xs font-bold shadow-2xs transition hover:scale-105 hover:rotate-0">
          ${kw}
        </span>
      `;
    }).join('');

    return `
      <div class="relative space-y-3 ${angle}">
        <div class="flex items-center gap-2">
          <h3 class="font-hand font-bold text-2xl text-slate-950">${item.name}</h3>
        </div>
        <div class="flex flex-wrap gap-2.5 pt-1">
          ${tagsHtml}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-5 sm:p-7 bg-amber-50/30 rounded-xl border-2 border-dashed border-amber-300/70">
      <!-- Star marker doodle -->
      <div class="no-print hidden sm:block absolute -right-3 -top-4 pointer-events-none rotate-12 z-20">
        <svg class="w-8 h-8 text-amber-500" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 L23 14 L33 15 L25 22 L27 32 L19 26 L11 31 L14 21 L7 14 L17 13 Z" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(251, 191, 36, 0.25)"/>
        </svg>
      </div>

      ${itemsHtml}
    </div>
  `;
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
    html = html.replace('<!-- SLOT_PUBLICATIONS -->', renderPublications(resumeObj.publications || []));
    html = html.replace('<!-- SLOT_INTERESTS -->', renderInterests(resumeObj.interests || []));

    await fs.promises.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Succes! Flipchart CV samengesteld en 100% statisch geschreven naar ${outputPath}`);
  } catch (err) {
    console.error('❌ Fout tijdens build proces:', err.message);
    process.exit(1);
  }
}

build();

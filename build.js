const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MONTH_NAMES = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

// Maand en Jaar (bijv. "Mei 2021", "Dec 2022") voor werkervaring en certificeringen
function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'heden' || dateStr.toLowerCase() === 'present') return 'Heden';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

// Alleen jaartallen (bijv. "2007", "2011") voor opleidingen
function formatYearOnly(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts[0] || dateStr;
}

// Volledige datum in dd/mm/jjjj (bijv. "30/07/2018")
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  if (parts.length === 2) {
    return formatMonthYear(dateStr);
  }
  return dateStr;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '#';
}

function renderPrintHeader(basics) {
  const name = escapeHtml(basics.name || 'Jochen Hendriks');
  const label = escapeHtml(basics.label || '');
  const summary = escapeHtml(basics.summary || '');
  const locStr = basics.location ? [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).map(escapeHtml).join(', ') : '';
  const linkedinProfile = (basics.profiles || []).find(p => (p.network || '').toLowerCase().includes('linkedin'));
  const urlDisplay = basics.url ? escapeHtml(basics.url.replace(/^https?:\/\//, '')) : '';

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
          ${linkedinProfile ? `<div><i class="fa-brands fa-linkedin mr-1.5 text-slate-400"></i>${escapeHtml((linkedinProfile.url || '').replace(/^https?:\/\//, ''))}</div>` : ''}
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
      <span class="marker-circle-red font-extrabold inline-block">
        ${escapeHtml(m.value)}
        <img src="marker-circle-red.svg" alt="" aria-hidden="true" class="select-none pointer-events-none" />
      </span>
    ` : escapeHtml(m.value);

    return `
      <div class="${style.bg} border ${style.border} relative p-4 rounded-lg shadow-sm flex flex-col justify-center items-center hover:scale-105 transition-transform">
        <div class="text-xl sm:text-2xl font-extrabold font-sans py-1">${valueContent}</div>
        <div class="text-xs font-bold text-slate-800 leading-snug text-center mt-1">${escapeHtml(m.label)}</div>
      </div>
    `;
  }).join('');

  const gridClass = metricsList.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  return `
    <div class="no-print mt-8 pt-6 border-t-2 border-dashed border-slate-200 grid ${gridClass} gap-4 text-center" aria-label="Kernstatistieken">
      ${cardsHtml}
    </div>
  `;
}

function renderHero(basics, uiConfig = {}) {
  const name = escapeHtml(basics.name || 'Jochen Hendriks');
  const image = sanitizeUrl(basics.image || 'profile.jpg');
  const label = escapeHtml(basics.label || '');
  const summary = escapeHtml(basics.summary || '');
  const locStr = basics.location ? [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).map(escapeHtml).join(', ') : '';
  const linkedinProfile = (basics.profiles || []).find(p => (p.network || '').toLowerCase().includes('linkedin'));
  const linkedinUrl = linkedinProfile ? sanitizeUrl(linkedinProfile.url) : 'https://www.linkedin.com/in/jochenh/';

  const profilesHtml = (basics.profiles || []).map(p => {
    const net = (p.network || '').toLowerCase();
    let iconHtml = '<i class="fa-solid fa-globe text-teal-700" aria-hidden="true"></i>';

    if (net.includes('linkedin')) {
      iconHtml = '<i class="fa-brands fa-linkedin text-[#0a66c2]" aria-hidden="true"></i>';
    } else if (net.includes('github')) {
      iconHtml = '<i class="fa-brands fa-github text-slate-800" aria-hidden="true"></i>';
    } else if (net.includes('meetup')) {
      iconHtml = '<i class="fa-brands fa-meetup text-[#f64060]" aria-hidden="true"></i>';
    } else if (net.includes('twitch')) {
      iconHtml = '<i class="fa-brands fa-twitch text-[#9146ff]" aria-hidden="true"></i>';
    } else if (net.includes('steam')) {
      iconHtml = '<i class="fa-brands fa-steam text-[#171a21]" aria-hidden="true"></i>';
    } else if (net.includes('tweakers')) {
      iconHtml = '<span class="inline-flex items-center justify-center w-4 h-4 bg-[#4c9bd4] text-white text-[10px] font-black rounded-[2px] leading-none shadow-2xs" aria-hidden="true">T</span>';
    } else if (net.includes('twitter') || net.includes('x')) {
      iconHtml = '<i class="fa-brands fa-x-twitter text-slate-900" aria-hidden="true"></i>';
    } else if (net.includes('youtube')) {
      iconHtml = '<i class="fa-brands fa-youtube text-rose-600" aria-hidden="true"></i>';
    }

    return `
      <a href="${sanitizeUrl(p.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md shadow-xs hover:bg-teal-50 hover:text-teal-900 transition" aria-label="${escapeHtml(p.network)} profiel (opent in nieuw venster)">
        ${iconHtml}<span>${escapeHtml(p.network)}</span>
      </a>
    `;
  }).join('');

  const quote = uiConfig.quote;
  const quoteHtml = quote && quote.text ? `
    <div class="no-print hidden xl:block absolute -right-6 -top-6 w-48 rotate-3 z-30" aria-hidden="true">
      <div class="sticky-container w-full sticky-yellow hover:rotate-0 hover:scale-105 transition-transform duration-200">
        <div class="sticky-outer">
          <div class="sticky-inner">
            <div class="sticky-content p-4 flex flex-col justify-center text-center">
              <div class="font-hand font-bold text-slate-900 text-base sm:text-lg leading-tight">
                "${escapeHtml(quote.text)}"
              </div>
              ${quote.author ? `<span class="block text-right font-hand text-xs text-slate-600 mt-1">— ${escapeHtml(quote.author)}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <section id="over-mij" class="relative flipchart-sheet p-6 sm:p-8 lg:p-10 print-break-avoid">
      <div class="washi-tape-amber no-print" aria-hidden="true"></div>

      ${quoteHtml}

      <div class="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-10">
        <div class="relative shrink-0 mx-auto md:mx-0">
          <div class="relative p-2.5 bg-white border border-slate-200 rounded-lg shadow-md rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
            <div class="washi-tape no-print" aria-hidden="true"></div>
            
            <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-md overflow-hidden bg-gradient-to-br from-amber-50 via-teal-50 to-slate-100 border border-slate-200 relative group">
              <img 
                src="${image}" 
                alt="Profielfoto van ${name}" 
                class="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition duration-300"
              />
              <div class="absolute inset-0 bg-teal-900/5 pointer-events-none" aria-hidden="true"></div>
            </div>

            <div class="text-center pt-2 pb-0.5">
              <span class="font-hand font-bold text-slate-800 text-lg tracking-wide">Jochen</span>
            </div>
          </div>

          ${uiConfig.availableForWork ? `
            <div class="no-print absolute -bottom-6 -right-6 flex items-center text-teal-800 pointer-events-none" aria-label="Status: Beschikbaar voor opdrachten">
              <svg class="w-10 h-8 text-teal-700 rotate-12" viewBox="0 0 50 40" fill="none" aria-hidden="true">
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

          <p class="text-base sm:text-lg font-bold text-teal-900 flex items-center justify-center md:justify-start gap-2">
            <i class="fa-solid fa-briefcase text-teal-700" aria-hidden="true"></i>
            <span>${label}</span>
          </p>

          <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-sans max-w-3xl">
            ${summary}
          </p>

          <div class="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 font-bold">
            ${locStr ? `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-md shadow-xs">
                <i class="fa-solid fa-location-dot text-rose-500" aria-hidden="true"></i>
                <span>${locStr}</span>
              </div>
            ` : ''}
            ${profilesHtml}
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
    { containerClass: 'sticky-yellow -rotate-1', badge: 'bg-amber-100/90 text-amber-950 border-amber-300' },
    { containerClass: 'sticky-emerald rotate-1', badge: 'bg-emerald-100/90 text-emerald-950 border-emerald-300' },
    { containerClass: 'sticky-blue -rotate-1.5', badge: 'bg-sky-100/90 text-sky-950 border-sky-300' },
    { containerClass: 'sticky-rose rotate-1.5', badge: 'bg-rose-100/90 text-rose-950 border-rose-300' }
  ];

  const cardsHtml = highlights.map((item, idx) => {
    const style = styles[idx % styles.length];
    const isLsp = idx === 0;

    const starDoodle = isLsp ? `
      <div class="no-print absolute -left-2 -top-2 text-amber-500 pointer-events-none -rotate-12 z-20" title="Star highlight">
        <svg class="w-7 h-7" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 L23 14 L33 15 L25 22 L27 32 L19 26 L11 31 L14 21 L7 14 L17 13 Z" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(251, 191, 36, 0.25)"/>
        </svg>
      </div>
    ` : '';

    return `
      <div class="sticky-container mx-auto w-full ${style.containerClass} hover:rotate-0 hover:scale-105 transition-transform duration-200">
        ${starDoodle}
        <div class="sticky-outer">
          <div class="sticky-inner">
            <div class="sticky-content p-4 sm:p-5 flex flex-col justify-start text-left box-border">
              <div>
                <h3 class="font-sans font-extrabold text-slate-950 text-base sm:text-lg leading-snug mb-1.5">${escapeHtml(item.title)}</h3>
                <p class="font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">${escapeHtml(item.description)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section id="werkvormen" class="space-y-4 print-break-avoid relative" aria-labelledby="werkvormen-heading">
      <!-- Elmo Doodle ("Enough, Let's Move On" / Supergrover) -->
      <div class="no-print hidden lg:block absolute -left-12 -bottom-6 pointer-events-none -rotate-6 z-20" aria-hidden="true" title="ELMO: Enough, Let's Move On!">
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
      <div class="no-print hidden md:block absolute right-8 -bottom-10 pointer-events-none z-20" aria-hidden="true">
        <svg class="w-16 h-12 text-teal-700" viewBox="0 0 60 45" fill="none">
          <path d="M10 6 C 35 4, 48 18, 42 36 M 34 30 L 42 37 L 48 28" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 id="werkvormen-heading" class="text-2xl sm:text-3xl font-marker tracking-wide text-slate-900">
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
    const isJobWip = !job.endDate || job.endDate.toLowerCase() === 'heden' || job.endDate.toLowerCase() === 'present';
    const periodStr = `${formatMonthYear(job.startDate)} – ${formatMonthYear(job.endDate) || 'Heden'}`;

    // 1. Roles Timeline View (Capgemini & Intergamma)
    let rolesTimelineHtml = '';
    if (job.roles && Array.isArray(job.roles) && job.roles.length > 0) {
      rolesTimelineHtml = `
        <div class="mt-3.5 mb-4 pl-4 border-l-2 border-dashed border-teal-700/50 space-y-3">
          ${job.roles.map(r => `
            <div class="relative flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 text-xs sm:text-sm">
              <div class="flex items-center gap-2.5">
                <!-- Hand-drawn checkbox bullet -->
                <svg class="w-4 h-4 text-teal-800 shrink-0 inline-block -ml-[23px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 3 Q16 2 17 4 Q18 16 16 17 Q3 18 3 16 Q2 4 4 3 Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(204,251,241,0.7)"/>
                  <path d="M6 10 L9 13 L15 6" stroke="#0d9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="font-bold text-slate-900 text-sm sm:text-base">${escapeHtml(r.title)}</span>
              </div>
              <time class="date-highlight text-sm self-start sm:self-auto">
                ${formatMonthYear(r.startDate)} – ${formatMonthYear(r.endDate) || 'Heden'}
              </time>
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
        const isAssignmentWip = !assignment.endDate || assignment.endDate.toLowerCase() === 'heden' || assignment.endDate.toLowerCase() === 'present';
        const assignmentStatusBadge = isAssignmentWip 
          ? '<span class="kanban-badge-wip font-marker">WIP</span>' 
          : '<span class="kanban-stamp-done font-marker">DONE</span>';

        return `
          <article class="relative ${cStyle.bg} border ${cStyle.border} ${cStyle.rot} p-5 pt-6 rounded-lg shadow-sm transition hover:rotate-0 hover:shadow-md print-break-avoid">
            <div class="${cStyle.tape} no-print" aria-hidden="true"></div>
            
            ${assignmentStatusBadge}

            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2 pr-14 sm:pr-16">
              <div>
                <h4 class="font-extrabold text-slate-950 text-base sm:text-lg leading-tight">
                  ${escapeHtml(assignment.client || 'Klantopdracht')}
                </h4>
                ${assignment.role ? `
                  <p class="text-xs sm:text-sm font-bold text-teal-900 mt-0.5 font-sans">
                    ${escapeHtml(assignment.role)}
                  </p>
                ` : ''}
              </div>
              <time class="date-highlight text-xs self-start sm:self-auto mt-1 sm:mt-0 shrink-0">
                ${formatMonthYear(assignment.startDate)} – ${formatMonthYear(assignment.endDate) || 'Heden'}
              </time>
            </div>

            ${assignment.summary ? `<p class="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-sans">${escapeHtml(assignment.summary)}</p>` : ''}

            ${assignment.highlights && assignment.highlights.length > 0 ? `
              <ul class="mt-3 space-y-2 text-xs sm:text-sm text-slate-800">
                ${assignment.highlights.map(h => `
                  <li class="flex items-start gap-2">
                    <!-- Bold Hand-drawn Marker Checkmark -->
                    <svg class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 12 L9 17 L20 6" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><mark class="marker-highlight bg-transparent text-slate-900">${escapeHtml(h)}</mark></span>
                  </li>
                `).join('')}
              </ul>
            ` : ''}

            ${assignment.keywords && assignment.keywords.length > 0 ? `
              <div class="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                ${assignment.keywords.map(kw => `
                  <span class="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-[11px] font-bold">
                    ${escapeHtml(kw)}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </article>
        `;
      }).join('');

      assignmentsHtml = `
        <div class="mt-6 pt-5 border-t-2 border-dashed border-slate-300/80 relative">
          <div class="flex items-center justify-between mb-4">
            <span class="font-hand font-bold text-lg text-teal-900">
              Klantopdrachten & Detacheringen (${job.assignments.length})
            </span>
          </div>

          <div class="grid grid-cols-1 gap-4">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    const singlePositionHtml = (!job.roles || job.roles.length === 0) && job.position ? `
      <p class="text-sm font-bold text-teal-900 mt-0.5">${escapeHtml(job.position)}</p>
    ` : '';

    return `
      <article class="timeline-article print-break-avoid">
        <!-- SVG Pushpin (Realistische Thumbtack uit randoogle_Thumbtack_Pushpin.svg) -->
        <img src="randoogle_Thumbtack_Pushpin.svg" class="pushpin-svg" alt="" aria-hidden="true" />
        
        ${jobIdx < workList.length - 1 ? `
          <!-- Organische Handgetekende Marker Tijdlijnlijn -->
          <svg class="absolute left-0 top-7 bottom-0 w-3 text-teal-700/60 overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 10 100" fill="none" aria-hidden="true" style="height: calc(100% - 1.5rem);">
            <path d="M5 0 Q 2 25, 6 50 T 4 100" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          </svg>
        ` : ''}

        <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">${escapeHtml(job.name || 'Werkgever')}</h3>
            ${singlePositionHtml}
          </div>
          <time class="date-highlight text-xs sm:text-sm self-start sm:self-auto">
            ${periodStr}
          </time>
        </div>

        ${rolesTimelineHtml}

        ${job.summary ? `<p class="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 font-sans">${escapeHtml(job.summary)}</p>` : ''}

        ${job.highlights && job.highlights.length > 0 && (!job.roles || job.roles.length === 0) ? `
          <div class="mb-4">
            <div class="mb-1.5"><span class="marker-badge text-base">Kernresultaten &amp; Impact:</span></div>
            <ul class="space-y-2 text-xs sm:text-sm text-slate-800">
              ${job.highlights.map(h => `
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 12 L9 17 L20 6" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span><mark class="marker-highlight bg-transparent text-slate-900">${escapeHtml(h)}</mark></span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${assignmentsHtml}
      </article>
    `;
  }).join('');
}

function renderProjects(projectsList) {
  if (!projectsList || !Array.isArray(projectsList) || projectsList.length === 0) return '';

  const cardsHtml = projectsList.map((project, idx) => {
    const rot = idx % 2 === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.8deg]';
    const tapeClass = idx % 2 === 0 ? 'washi-tape-amber' : 'washi-tape';
    const startStr = formatMonthYear(project.startDate);
    const endStr = formatMonthYear(project.endDate);
    let periodStr = '';
    if (startStr && endStr) {
      periodStr = (startStr === endStr) ? startStr : `${startStr} – ${endStr}`;
    } else if (startStr) {
      periodStr = `${startStr} – Heden`;
    } else if (endStr) {
      periodStr = endStr;
    }

    return `
      <article class="relative bg-[#fffdfa] border border-slate-300 p-6 pt-7 rounded-lg shadow-sm ${rot} hover:rotate-0 hover:shadow-md transition duration-200 print-break-avoid flex flex-col justify-between">
        <div class="${tapeClass} no-print" aria-hidden="true"></div>

        <div>
          <div class="flex items-start justify-between gap-3 mb-1">
            <h3 class="font-sans font-extrabold text-slate-950 text-lg sm:text-xl leading-snug">
              ${escapeHtml(project.name)}
            </h3>
            ${project.url ? `
              <a href="${sanitizeUrl(project.url)}" target="_blank" rel="noopener noreferrer" class="text-teal-700 hover:text-teal-900 p-1 shrink-0 transition" aria-label="${escapeHtml(project.name)} bekijken (opent in nieuw venster)">
                <i class="fa-solid fa-arrow-up-right-from-square text-sm" aria-hidden="true"></i>
              </a>
            ` : ''}
          </div>

          ${periodStr ? `
            <div class="mb-3">
              <time class="date-highlight text-xs inline-block">
                ${periodStr}
              </time>
            </div>
          ` : ''}

          ${project.description ? `
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 font-sans">
              ${escapeHtml(project.description)}
            </p>
          ` : ''}

          ${project.highlights && project.highlights.length > 0 ? `
            <div class="mb-3">
              <div class="mb-1.5"><span class="marker-badge text-base">Highlights:</span></div>
              <ul class="space-y-2 text-xs sm:text-sm text-slate-800">
                ${project.highlights.map(h => `
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 12 L9 17 L20 6" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span><mark class="marker-highlight bg-transparent text-slate-900">${escapeHtml(h)}</mark></span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');

  return `
    <section id="projecten" class="space-y-6 print-break-avoid relative" aria-labelledby="projecten-heading">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b-2 border-slate-300 relative">
        <div>
          <h2 id="projecten-heading" class="text-2xl sm:text-3xl font-marker tracking-wide text-slate-900">
            Projecten & Initiatieven
          </h2>
        </div>

        <div class="no-print font-hand font-bold text-lg sm:text-xl text-slate-700 rotate-[-1deg] bg-amber-100 border border-amber-300 px-3 py-1 rounded shadow-xs">
          "Van idee tot tastbare impact!"
        </div>
      </div>

      <div id="projects-container" class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        ${cardsHtml}
      </div>
    </section>
  `;
}

function renderSkills(skillsList) {
  if (!skillsList || skillsList.length === 0) return '';

  const dotColorSchemes = ['voting-dot-red', 'voting-dot-blue', 'voting-dot-green', 'voting-dot-yellow'];
  const washiColorSchemes = [
    'washi-keyword-yellow',
    'washi-keyword-teal',
    'washi-keyword-rose',
    'washi-keyword-amber',
    'washi-keyword-sky',
    'washi-keyword-emerald',
    'washi-keyword-purple'
  ];
  const rotations = ['rotate-[-1.5deg]', 'rotate-[1.8deg]', 'rotate-[-2deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[2.2deg]'];
  const dotOffsets = [
    'transform: translate(0px, 1px) rotate(-4deg);',
    'transform: translate(-1px, -2px) rotate(6deg);',
    'transform: translate(2px, 1px) rotate(-8deg);',
    'transform: translate(-1px, 2px) rotate(5deg);',
    'transform: translate(1px, -1px) rotate(-3deg);',
    'transform: translate(0px, -2px) rotate(7deg);'
  ];

  function getDotCount(level) {
    if (!level) return 4;
    const l = String(level).trim().toLowerCase();

    const LEVEL_MAP = {
      'novice': 1,
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'master': 5
    };

    if (LEVEL_MAP[l] !== undefined) {
      return LEVEL_MAP[l];
    }

    // Fallback voor synoniemen / vrije tekst
    if (l.includes('master') || l.includes('expert') || l === '5') return 5;
    if (l.includes('advanced') || l.includes('senior') || l === '4') return 4;
    if (l.includes('intermediate') || l.includes('medior') || l === '3') return 3;
    if (l.includes('beginner') || l.includes('junior') || l.includes('basis') || l === '2') return 2;
    if (l.includes('novice') || l.includes('starter') || l === '1') return 1;

    return 4;
  }

  return skillsList.map((skillGroup, sIdx) => {
    const dotCount = getDotCount(skillGroup.level);
    const dotColor = dotColorSchemes[sIdx % dotColorSchemes.length];

    const dotsHtml = Array.from({ length: dotCount }).map((_, dIdx) => {
      const offset = dotOffsets[(sIdx * 3 + dIdx) % dotOffsets.length];
      return `<span class="voting-dot ${dotColor} inline-block" style="${offset}" aria-hidden="true" title="Stem ${dIdx + 1}"></span>`;
    }).join('');

    const keywordsHtml = (skillGroup.keywords || []).map((kw, kIdx) => {
      const wColor = washiColorSchemes[(sIdx + kIdx) % washiColorSchemes.length];
      const rot = rotations[(sIdx * 2 + kIdx) % rotations.length];
      return `
        <span class="washi-keyword ${wColor} ${rot} font-hand font-bold text-base sm:text-lg text-slate-900 shadow-2xs -mr-1.5 mb-2.5">
          ${escapeHtml(kw)}
        </span>
      `;
    }).join('');

    return `
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-marker text-xl sm:text-2xl text-slate-950 tracking-wide">${escapeHtml(skillGroup.name)}</h3>
          
          <!-- Dot Voting Stickers Row -->
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5" aria-label="Niveau: ${escapeHtml(skillGroup.level || 'Master')} (${dotCount} stemmen)">
            ${dotsHtml}
            <span class="font-hand font-bold text-base text-slate-700 ml-1">
              (${escapeHtml(skillGroup.level || 'Master')})
            </span>
          </div>
        </div>

        <!-- Overlapping Washi Tape Keywords -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          ${keywordsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function renderCertificates(certs) {
  if (!certs || certs.length === 0) return '';

  const sortedCerts = [...certs].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return sortedCerts.map(cert => {
    const formattedDate = cert.date ? formatMonthYear(cert.date) : '';
    const titleHtml = cert.url ? `
      <a href="${sanitizeUrl(cert.url)}" target="_blank" rel="noopener noreferrer" class="group inline-flex items-center gap-1.5 font-bold text-slate-950 text-xs sm:text-sm leading-snug hover:text-teal-800 transition" aria-label="${escapeHtml(cert.name)} online verificatie (opent in nieuw venster)">
        <span>${escapeHtml(cert.name)}</span>
        <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-teal-700 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden="true"></i>
      </a>
    ` : `
      <h3 class="font-bold text-slate-950 text-xs sm:text-sm leading-snug">${escapeHtml(cert.name)}</h3>
    `;

    return `
      <article class="flipchart-sheet p-4 flex items-start justify-between gap-3 hover:shadow-md transition">
        <div class="min-w-0 flex-1">
          ${titleHtml}
          <div class="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium flex-wrap">
            <span class="font-bold text-teal-800">${escapeHtml(cert.issuer || '')}</span>
            ${formattedDate ? `<span>•</span><time class="font-bold text-slate-700">${formattedDate}</time>` : ''}
          </div>
        </div>
        ${cert.url ? `
          <a href="${sanitizeUrl(cert.url)}" target="_blank" rel="noopener noreferrer" class="no-print shrink-0 p-1 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded transition" aria-label="Bekijk badge op externe website (opent in nieuw venster)">
            <i class="fa-solid fa-award text-sm text-teal-700" aria-hidden="true"></i>
          </a>
        ` : ''}
      </article>
    `;
  }).join('');
}

function renderEducation(eduList) {
  if (!eduList || eduList.length === 0) return '';

  return eduList.map(edu => {
    const startY = formatYearOnly(edu.startDate);
    const endY = formatYearOnly(edu.endDate);
    const dateRangeStr = (startY && endY) ? `${startY} – ${endY}` : (startY || endY || '');

    return `
      <article class="flipchart-sheet p-4">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-bold text-slate-950 text-xs sm:text-sm">${escapeHtml(edu.studyType || '')} ${edu.area ? '– ' + escapeHtml(edu.area) : ''}</h3>
          ${dateRangeStr ? `<time class="text-xs text-slate-600 font-bold shrink-0">${dateRangeStr}</time>` : ''}
        </div>
        <p class="text-xs font-bold text-teal-900 mt-1">${escapeHtml(edu.institution || '')}</p>
        ${edu.courses && edu.courses.length > 0 ? `
          <div class="mt-2 text-[11px] text-slate-600 flex flex-wrap gap-1 font-medium">
            ${edu.courses.map(c => `<span class="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">${escapeHtml(c)}</span>`).join('')}
          </div>
        ` : ''}
      </article>
    `;
  }).join('');
}

function renderLanguages(langList) {
  if (!langList || langList.length === 0) return '';

  return langList.map(lang => `
    <div class="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-dashed border-slate-300 last:border-0">
      <span class="font-bold text-slate-900">${escapeHtml(lang.language)}</span>
      <span class="font-hand font-bold text-base text-teal-800">${escapeHtml(lang.fluency)}</span>
    </div>
  `).join('');
}

function renderPublications(pubList) {
  if (!pubList || pubList.length === 0) return '';

  return pubList.map((pub, idx) => {
    const rot = idx % 2 === 0 ? 'rotate-[-1.5deg]' : 'rotate-[1deg]';
    return `
      <article class="relative bg-[#fffdfa] border-2 border-dashed border-slate-300 p-6 pt-7 rounded shadow-sm ${rot} transition hover:rotate-0 hover:shadow-md print-break-avoid">
        <div class="washi-tape-amber no-print" aria-hidden="true"></div>

        <!-- Hand-drawn Reading Glasses Doodle -->
        <div class="no-print hidden sm:block absolute -right-3 -top-4 pointer-events-none rotate-12 z-20" aria-hidden="true" title="Leestip!">
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
            ${escapeHtml(pub.publisher || 'Publicatie')}
          </span>
          ${pub.releaseDate ? `
            <time class="date-highlight text-xs">
              ${formatFullDate(pub.releaseDate)}
            </time>
          ` : ''}
        </div>

        <h3 class="font-mono font-bold text-slate-950 text-base sm:text-lg leading-snug mb-2">
          ${pub.url ? `
            <a href="${sanitizeUrl(pub.url)}" target="_blank" rel="noopener noreferrer" class="hover:text-teal-800 transition underline decoration-teal-600/50" aria-label="${escapeHtml(pub.name)} (opent in nieuw venster)">
              ${escapeHtml(pub.name)}
            </a>
          ` : escapeHtml(pub.name)}
        </h3>

        ${pub.summary ? `<p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">${escapeHtml(pub.summary)}</p>` : ''}
      </article>
    `;
  }).join('');
}

function renderInterests(interestsList) {
  if (!interestsList || interestsList.length === 0) return '';

  const tagStyles = [
    'bg-amber-100/90 border-amber-300 text-slate-950',
    'bg-teal-100/90 border-teal-300 text-slate-950',
    'bg-sky-100/90 border-sky-300 text-slate-950',
    'bg-rose-100/90 border-rose-300 text-slate-950',
    'bg-emerald-100/90 border-emerald-300 text-slate-950'
  ];

  const itemsHtml = interestsList.map((item, idx) => {
    const rot = idx % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]';
    const tapeClass = idx % 2 === 0 ? 'washi-tape-amber' : 'washi-tape';
    const netLower = (item.name || '').toLowerCase();

    let iconHtml = '<i class="fa-solid fa-heart text-rose-500" aria-hidden="true"></i>';
    if (netLower.includes('game') || netLower.includes('gaming')) {
      iconHtml = '<i class="fa-solid fa-gamepad text-teal-700 text-lg" aria-hidden="true"></i>';
    } else if (netLower.includes('sport') || netLower.includes('sporten')) {
      iconHtml = '<i class="fa-solid fa-person-running text-teal-700 text-lg" aria-hidden="true"></i>';
    } else if (netLower.includes('muziek') || netLower.includes('music')) {
      iconHtml = '<i class="fa-solid fa-music text-teal-700 text-lg" aria-hidden="true"></i>';
    } else if (netLower.includes('reizen') || netLower.includes('travel')) {
      iconHtml = '<i class="fa-solid fa-plane text-teal-700 text-lg" aria-hidden="true"></i>';
    }

    const tagsHtml = (item.keywords || []).map((kw, kIdx) => {
      const sStyle = tagStyles[kIdx % tagStyles.length];
      return `
        <span class="${sStyle} border inline-block px-3 py-1 rounded-md text-xs font-bold shadow-2xs hover:scale-105 transition-transform">
          ${escapeHtml(kw)}
        </span>
      `;
    }).join('');

    return `
      <article class="relative flipchart-sheet p-5 pt-6 ${rot} transition hover:rotate-0 hover:shadow-md print-break-avoid">
        <div class="${tapeClass} no-print" aria-hidden="true"></div>
        <div class="flex items-center gap-2 mb-3">
          ${iconHtml}
          <h3 class="font-bold text-slate-950 text-base sm:text-lg">${escapeHtml(item.name)}</h3>
        </div>
        <div class="flex flex-wrap gap-2">
          ${tagsHtml}
        </div>
      </article>
    `;
  }).join('');

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
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
    html = html.replace('<!-- SLOT_PROJECTS -->', renderProjects(resumeObj.projects || []));
    html = html.replace('<!-- SLOT_SKILLS -->', renderSkills(resumeObj.skills || []));
    html = html.replace('<!-- SLOT_CERTIFICATES -->', renderCertificates(resumeObj.certificates || []));
    html = html.replace('<!-- SLOT_EDUCATION -->', renderEducation(resumeObj.education || []));
    html = html.replace('<!-- SLOT_LANGUAGES -->', renderLanguages(resumeObj.languages || []));
    html = html.replace('<!-- SLOT_PUBLICATIONS -->', renderPublications(resumeObj.publications || []));
    html = html.replace('<!-- SLOT_INTERESTS -->', renderInterests(resumeObj.interests || []));

    // Compile production-grade minified Tailwind CSS bundle and inject inline
    console.log('📦 Compileren van standalone Tailwind CSS productiebundle...');
    const inputCssPath = path.join(__dirname, 'src', 'input.css');
    let compiledCss = '';
    try {
      compiledCss = execSync(`npx tailwindcss -i "${inputCssPath}" --minify`, { encoding: 'utf-8', cwd: __dirname });
    } catch (e) {
      console.warn('⚠️ Tailwind compilatie fallback:', e.message);
    }

    html = html.replace('/* SLOT_TAILWIND_CSS */', compiledCss);

    await fs.promises.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Succes! Flipchart CV samengesteld en 100% statisch geschreven naar ${outputPath}`);
  } catch (err) {
    console.error('❌ Fout tijdens build proces:', err.message);
    process.exit(1);
  }
}

build();

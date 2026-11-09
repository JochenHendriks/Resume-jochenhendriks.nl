const MONTH_NAMES = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

// Maand en Jaar (bijv. "Mei 2021", "Dec 2022") voor werkervaring en certificeringen
function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const trimmed = String(dateStr).trim();
  if (trimmed.toLowerCase() === 'heden' || trimmed.toLowerCase() === 'present') return 'Heden';
  const parts = trimmed.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return trimmed;
}

// Alleen jaartallen (bijv. "2007", "2011") voor opleidingen
function formatYearOnly(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).trim().split('-');
  return parts[0] || dateStr;
}

// Volledige datum in dd/mm/jjjj (bijv. "30/07/2018")
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const trimmed = String(dateStr).trim();
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  if (parts.length === 2) {
    return formatMonthYear(trimmed);
  }
  return trimmed;
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
  if (/^(javascript|vbscript):/i.test(trimmed)) {
    return '#';
  }
  if (/^(https?:\/\/|mailto:|tel:|\/|#|\.\/)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '#';
}

function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return 'profile.jpg';
  const trimmed = url.trim();
  if (/^(javascript|vbscript):/i.test(trimmed)) {
    return 'profile.jpg';
  }
  if (/^(https?:\/\/|\/|\.\/|data:image\/|[a-zA-Z0-9_\-\.\/]+\.(jpe?g|png|gif|webp|svg|avif))/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return escapeHtml(trimmed);
}

module.exports = {
  MONTH_NAMES,
  formatMonthYear,
  formatYearOnly,
  formatFullDate,
  escapeHtml,
  sanitizeUrl,
  sanitizeImageUrl
};

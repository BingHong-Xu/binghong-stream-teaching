import fs from 'fs';
import path from 'path';

console.log('Building Google Sites Embed HTML...');

// 1. Load Data & Assets
const rawCssContent = fs.readFileSync('css/styles.css', 'utf8').replace(/^\uFEFF/, '');
const cssContent = rawCssContent
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([:;{}])\s*/g, '$1')
  .trim();

const portfolioData = JSON.parse(fs.readFileSync('data/portfolio_data.json', 'utf8').replace(/^\uFEFF/, ''));
const specialFeatures = JSON.parse(fs.readFileSync('data/special_features.json', 'utf8').replace(/^\uFEFF/, ''));
const threePillars = JSON.parse(fs.readFileSync('data/three_teaching_pillars.json', 'utf8').replace(/^\uFEFF/, ''));
const hd720pBase64 = JSON.parse(fs.readFileSync('data/base64_images_optimized_hd.json', 'utf8').replace(/^\uFEFF/, ''));

// Map local file paths to online URLs
const localToOnlineMap = new Map();
portfolioData.items.forEach(item => {
  if (item.localFile) {
    const norm = item.localFile.replace(/\\/g, '/');
    localToOnlineMap.set(norm, item.fileUrl || item.previewImage || '');
  }
});

// Avatar Base64 (720p HD)
const avatarBase64 = hd720pBase64['downloads/site_assets/avatar.jpg'] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%232563eb"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>';

// Process specialFeatures: preserve clean local paths for Base64 mapping
const processedFeatures = specialFeatures.map(feat => {
  const f = JSON.parse(JSON.stringify(feat));
  if (f.documents) {
    f.documents.forEach(d => {
      d.onlineUrl = d.path;
    });
  }
  return f;
});

// Process threePillars: preserve clean local paths for Base64 mapping
const processedPillars = threePillars.map(pillar => {
  return JSON.parse(JSON.stringify(pillar));
});

// Function to generate clean, high-contrast SVG cover for documents & text
function generateDocumentCoverSvg(title, categoryName, sectionTitle, isAward) {
  const safeTitle = (title || '教學成果檔案').replace(/[<>&"]/g, '');
  const safeSec = (sectionTitle || '教學實踐').replace(/[<>&"]/g, '');
  const ribbonText = isAward ? '🏆 榮譽獲獎' : '📄 完整成果檔案';
  
  const hash = Math.abs((safeTitle || '').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 1000;
  let line1 = safeTitle.slice(0, 18);
  let line2 = safeTitle.length > 18 ? safeTitle.slice(18, 36) + (safeTitle.length > 36 ? '...' : '') : '';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="g_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="45%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <pattern id="grid_${hash}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1280" height="720" fill="url(#g_${hash})"/>
    <rect width="1280" height="720" fill="url(#grid_${hash})"/>
    <rect x="36" y="36" width="1208" height="648" rx="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
    
    <!-- Badges -->
    <rect x="64" y="60" width="220" height="52" rx="26" fill="rgba(59,130,246,0.22)" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="174" y="93" fill="#93c5fd" font-size="22" font-weight="bold" font-family="'Noto Sans TC', sans-serif" text-anchor="middle">${safeSec}</text>
    
    <rect x="996" y="60" width="220" height="52" rx="26" fill="rgba(245,158,11,0.22)" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="1106" y="93" fill="#fde68a" font-size="22" font-weight="bold" font-family="'Noto Sans TC', sans-serif" text-anchor="middle">${ribbonText}</text>
    
    <!-- Central Icon -->
    <circle cx="640" cy="270" r="76" fill="rgba(59,130,246,0.15)" stroke="#60a5fa" stroke-width="3"/>
    <path d="M616 230 h36 l18 18 v52 h-54 z" fill="none" stroke="#60a5fa" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="652 230 652 248 670 248" fill="none" stroke="#60a5fa" stroke-width="4.5"/>
    <line x1="626" y1="268" x2="660" y2="268" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="626" y1="280" x2="660" y2="280" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round"/>
    
    <!-- Title Text -->
    <text x="640" y="425" fill="#ffffff" font-size="38" font-weight="bold" font-family="'Noto Sans TC', sans-serif" text-anchor="middle">${line1}</text>
    ${line2 ? `<text x="640" y="480" fill="#cbd5e1" font-size="30" font-family="'Noto Sans TC', sans-serif" text-anchor="middle">${line2}</text>` : ''}
    
    <!-- Footer Divider & Text -->
    <line x1="200" y1="535" x2="1080" y2="535" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <text x="640" y="585" fill="#94a3b8" font-size="22" font-family="'Noto Sans TC', sans-serif" text-anchor="middle">苗栗縣永貞國小 ‧ 高師大科環所博士班 ‧ 徐秉鴻 老師</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Filter out QR code item(s) as requested by user
const isQrItem = (item) => {
  if (item.id === 3934662103) return true;
  const s = ((item.headline || '') + ' ' + (item.subject || '') + ' ' + (item.fileName || '') + ' ' + (item.title || '') + ' ' + (item.body || '')).toLowerCase();
  return /qr[_\s-]?code|qr\s*碼|二維碼/i.test(s) && (s.includes('快速導引') || s.includes('qr_code') || item.id === 3934662103);
};

const filteredPortfolioItems = portfolioData.items.filter(item => !isQrItem(item));

// Process portfolioData items for Google Sites sandbox
const processedPortfolio = {
  categories: portfolioData.categories,
  sections: portfolioData.sections,
  items: filteredPortfolioItems.map(item => {
    let previewImage = '';
    const normLocal = (item.localFile || '').replace(/\\/g, '/');
    const normPreview = (item.previewImage || '').replace(/\\/g, '/');

    // 1. Direct match in Base64 720p dictionary
    if (hd720pBase64[normLocal]) {
      previewImage = normLocal;
    } else if (hd720pBase64[normPreview]) {
      previewImage = normPreview;
    } else {
      const idMatch = (normLocal + ' ' + normPreview).match(/(\d{10})/);
      if (idMatch) {
        const key = Object.keys(hd720pBase64).find(k => k.includes(idMatch[1]));
        if (key) previewImage = key;
      }
    }

    // 2. YouTube videos: use high-res YouTube thumbnail
    if (!previewImage && item.mediaType === 'video') {
      const ytidMatch = (item.externalUrl || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const ytid = ytidMatch ? ytidMatch[1] : '';
      if (ytid) {
        const maxResIds = ['4sjZ2LJjiaU', '-V-xJzRQ0Eg', 'T066-_Oiey4'];
        previewImage = maxResIds.includes(ytid)
          ? `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`
          : `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
      }
    }

    // 3. Public non-Padlet image URLs
    if (!previewImage && item.previewImage && item.previewImage.startsWith('http') && !item.previewImage.includes('padletusercontent')) {
      previewImage = item.previewImage;
    }

    return {
      id: item.id,
      headline: item.headline || '',
      body: item.body || '',
      sectionId: item.sectionId,
      sectionTitle: item.sectionTitle || '',
      categoryId: item.categoryId || '',
      categoryName: item.categoryName || '',
      mediaType: item.mediaType || 'document',
      fileUrl: item.fileUrl || '',
      previewImage: previewImage,
      externalUrl: item.externalUrl || '',
      extension: item.extension || '',
      fileSize: item.fileSize || 0,
      createdAt: item.createdAt || '',
      isPinned: !!item.isPinned,
      fileName: item.fileName || ''
    };
  })
};

// Custom Google Sites specific CSS enhancements
const googleSitesExtraCss = `
/* ==========================================================================
   Google Sites Embed Specific Responsive Enhancements
   ========================================================================== */
html, body {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box;
  margin: 0 !important;
  padding: 0 !important;
  -webkit-text-size-adjust: 100%;
}

/* Ensure sticky site-header remains clean */
.site-header {
  top: 0;
  position: sticky;
  z-index: 1000;
  width: 100%;
}

.header-container {
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap !important;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .site-header .hide-on-mobile {
    display: none !important;
  }
  .site-header .show-on-mobile {
    display: inline-flex !important;
  }
}

/* Hide all QR codes */
.qrcode-container, .qr-container, .qrcode-img, .qr-code, [data-is-qr="true"], [class*="qrcode"], [id*="qrcode"], [class*="qr-code"], [id*="qr-code"] {
  display: none !important;
}

/* Mobile & Tablet Smooth Touch & Clean Scrollbars */
.category-tabs-container,
.subsections-list,
.quick-search-chips,
.pillar-modal-tabs {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  -webkit-overflow-scrolling: touch !important;
}

.category-tabs-container::-webkit-scrollbar,
.subsections-list::-webkit-scrollbar,
.quick-search-chips::-webkit-scrollbar,
.pillar-modal-tabs::-webkit-scrollbar {
  display: none !important;
}

/* Modals Safe Area and Touch Scrolling */
.modal-backdrop {
  -webkit-overflow-scrolling: touch;
}

.modal-dialog,
.spotlight-dialog,
.pillar-modal-dialog {
  touch-action: pan-y;
}

/* Embed instructions modal */
.embed-modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 600px;
  width: 92%;
  box-shadow: var(--shadow-xl);
}

.code-box {
  background: #0f172a;
  color: #f8fafc;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  border: 1px solid #334155;
  user-select: all;
  white-space: pre-wrap;
  word-break: break-all;
}
`;

// Build the HTML
const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
  <meta name="referrer" content="no-referrer">
  <title>徐秉鴻老師－教學成果與專業資歷數位典藏網 | Google Sites 嵌入版</title>
  <meta name="description" content="苗栗縣頭份市永貞國民小學專任教師、國立高雄師範大學科學教育博士班研究生徐秉鴻老師之教學成果、得獎教案、TSSCI學術論文、專業證照與競賽指導數位典藏庫。">
  
  <style>
${cssContent}

${googleSitesExtraCss}
  </style>
</head>
<body>

  <!-- Navigation Header -->
  <header class="site-header">
    <div class="header-container">
      <a href="#" class="brand-wrapper">
        <div class="brand-avatar-container">
          <img src="${avatarBase64}" alt="徐秉鴻老師" class="brand-avatar">
          <span class="brand-status-dot" title="已認證專業良師"></span>
        </div>
        <div class="brand-info">
          <span class="brand-name">徐秉鴻 老師 <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">🧑‍🏫</span></span>
          <span class="brand-role">苗栗縣永貞國小 · 高師大科環所博士班</span>
        </div>
      </a>

      <div class="header-actions">
        <a href="#teaching-three-pillars" class="btn-outline hide-on-mobile" title="查看三大特色專區：小教實習、跨域美感、閱讀推動">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          三大核心專區
        </a>
        <a href="#teaching-spotlights" class="btn-outline hide-on-mobile" title="查看 5 大深度教學專題">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          特色專題
        </a>
        <a href="#portfolio-catalog" class="btn-outline hide-on-mobile" title="檢索成果檔案庫">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          成果典藏 (${processedPortfolio.items.length})
        </a>
        <a href="#curriculum-vitae" class="btn-outline hide-on-mobile" title="查看學術履歷">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          學術履歷
        </a>
        
        <button id="themeToggleBtn" class="btn-icon" title="切換深淺模式">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <!-- 行動端導覽選單按鈕 (Mobile Nav Menu Toggle) -->
        <button id="mobileMenuBtn" class="btn-icon show-on-mobile" aria-label="展開行動端導覽選單" title="專題與章節選單">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- 行動端下拉抽屜選單 (Mobile Navigation Drawer) -->
  <nav id="mobileNavMenu" class="mobile-nav-menu" style="display: none;" aria-label="行動端選單">
    <div class="mobile-nav-inner">
      <div class="mobile-nav-section-title">網站專題與資料庫捷徑</div>
      <a href="#teaching-three-pillars" class="mobile-nav-link" onclick="window.closeMobileNav()">
        <span>🏆 教學成果核心三大專區</span>
        <span>&rarr;</span>
      </a>
      <a href="#teaching-spotlights" class="mobile-nav-link" onclick="window.closeMobileNav()">
        <span>🌟 5 大旗艦教學專題 (STREAM 策展)</span>
        <span>&rarr;</span>
      </a>
      <a href="#portfolio-catalog" class="mobile-nav-link" onclick="window.closeMobileNav()">
        <span>🗂️ 檢索 ${processedPortfolio.items.length} 筆成果檔案庫</span>
        <span>&rarr;</span>
      </a>
      <a href="#curriculum-vitae" class="mobile-nav-link" onclick="window.closeMobileNav()">
        <span>📜 學術履歷與代表性殊榮</span>
        <span>&rarr;</span>
      </a>
      <button onclick="window.openEmbedGuide(); window.closeMobileNav();" class="mobile-nav-link" style="width: 100%; text-align: left; background: none; border: none; font-family: inherit; font-size: inherit; cursor: pointer;">
        <span>📋 Google Sites 嵌入程式碼指南</span>
        <span>&rarr;</span>
      </button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-bg-overlay"></div>
    <div class="hero-container">
      <div class="hero-avatar-wrapper">
        <img src="${avatarBase64}" alt="徐秉鴻老師" class="hero-avatar">
      </div>

      <div class="hero-content">
        <!-- 四大核心教育實踐榮譽徽章列 -->
        <div class="hero-identity-bar">
          <span class="identity-badge sustainability">🌍 2026 台灣傑出永續教育人物 · 環境教育認證</span>
          <span class="identity-divider" style="color: var(--text-subtle);">✕</span>
          <span class="identity-badge practicum">🎓 高師大師培 × 四維國小</span>
          <span class="identity-divider" style="color: var(--text-subtle);">✕</span>
          <span class="identity-badge aesthetic">🎨 教育部標竿學校 · 苗栗縣教案首獎</span>
          <span class="identity-divider" style="color: var(--text-subtle);">✕</span>
          <span class="identity-badge reading">📖 永貞國小閱推專任 · 聊書典範教師</span>
        </div>

        <h1>徐秉鴻 老師 <span class="hero-title-accent">教學成果與學術典藏</span></h1>
        
        <p class="hero-subtitle">
          苗栗縣頭份市永貞國民小學專任教師、圖書館閱讀推動教師、兼任文書組長｜苗栗縣國際教育中心專員｜國立高雄師範大學科學教育暨環境教育研究所博士生。致力於 <strong>STEAM 跨域探究</strong>、<strong>深耕閱讀素養</strong>、<strong>環境美感教育</strong> 與 <strong>科技創新適性教學</strong>。
        </p>

        <!-- 五大標竿成就橫幅 -->
        <div class="hero-pillars-row hero-pillars-five">
          <div class="pillar-card pillar-sustainability">
            <span class="pillar-icon">🌱</span>
            <div class="pillar-info">
              <span class="pillar-title">2026 台灣傑出永續教育人物</span>
              <span class="pillar-desc">五大構面 99 項佐證 · 93 場 SDGs 紀實</span>
            </div>
          </div>
          <div class="pillar-card pillar-science">
            <span class="pillar-icon">🏆</span>
            <div class="pillar-info">
              <span class="pillar-title">雙料全國第一名（金獎）</span>
              <span class="pillar-desc">全國科學探究競賽 2022 &amp; 2025 金獎指導</span>
            </div>
          </div>
          <div class="pillar-card pillar-academic">
            <span class="pillar-icon">📚</span>
            <div class="pillar-info">
              <span class="pillar-title">TSSCI 核心期刊第一作者</span>
              <span class="pillar-desc">《科學教育學刊》正式論文發表 (2025)</span>
            </div>
          </div>
          <div class="pillar-card pillar-aesthetic">
            <span class="pillar-icon">🎨</span>
            <div class="pillar-info">
              <span class="pillar-title">跨領域美感卓越領航</span>
              <span class="pillar-desc">教育部 115 標竿學校與縣級教案首獎</span>
            </div>
          </div>
          <div class="pillar-card pillar-reading">
            <span class="pillar-icon">📖</span>
            <div class="pillar-info">
              <span class="pillar-title">2026 明日閱讀典範學校</span>
              <span class="pillar-desc">MSSR 身教晨讀 · PAIR 論文發表</span>
            </div>
          </div>
        </div>

        <!-- 典藏數據儀表板 (十二色點分級色彩) -->
        <div class="hero-stats-row">
          <div class="stat-card" data-stat="items">
            <div class="stat-header-row">
              <span class="stat-number">${processedPortfolio.items.length}</span>
              <span class="stat-dot" title="十二色點・藍（4.1-4.5 四上）">🔵</span>
            </div>
            <span class="stat-label">筆成果典藏</span>
          </div>
          <div class="stat-card" data-stat="sections">
            <div class="stat-header-row">
              <span class="stat-number">43</span>
              <span class="stat-dot" title="十二色點・紫（5.1-5.5 五上）">🟣</span>
            </div>
            <span class="stat-label">項專業向度</span>
          </div>
          <div class="stat-card" data-stat="spotlights">
            <div class="stat-header-row">
              <span class="stat-number">4+6</span>
              <span class="stat-dot" title="十二色點・橙（2.6-3.0 二下）">🟠</span>
            </div>
            <span class="stat-label">大專區與策展</span>
          </div>
          <div class="stat-card" data-stat="albums">
            <div class="stat-header-row">
              <span class="stat-number">93</span>
              <span class="stat-dot" title="十二色點・綠（3.6-4.0 三下）">🟢</span>
            </div>
            <span class="stat-label">場永續SDGs相簿</span>
          </div>
          <div class="stat-card" data-stat="awards">
            <div class="stat-header-row">
              <span class="stat-number">17</span>
              <span class="stat-dot" title="十二色點・金（6.6+ 六下）">🟡</span>
            </div>
            <span class="stat-label">項永續代表大獎</span>
          </div>
          <div class="stat-card" data-stat="offline">
            <div class="stat-header-row">
              <span class="stat-number">100%</span>
              <span class="stat-dot" title="十二色點・銅（5.6-6.0 五下）">🟤</span>
            </div>
            <span class="stat-label">自包含離線預覽</span>
          </div>
        </div>

        <!-- 國教署與高師大「識字金銀島」十二色點指標體系導覽列 -->
        <div class="hero-dot-legend">
          <span class="dot-legend-title">🎨 欄位色彩取材自國教署與高師大閱讀評量與教學研究中心研發之「識字金銀島」十二色點指標體系：</span>
          <div class="dot-legend-dots">
            <span class="color-dot-tag tag-white" title="白：1.0-1.5 一年級上學期"><span class="cd-circle">⚪</span> 白</span>
            <span class="color-dot-tag tag-black" title="黑：1.6-2.0 一年級下學期"><span class="cd-circle">⚫</span> 黑</span>
            <span class="color-dot-tag tag-red" title="紅：2.1-2.5 二年級上學期"><span class="cd-circle">🔴</span> 紅</span>
            <span class="color-dot-tag tag-orange" title="橙：2.6-3.0 二年級下學期"><span class="cd-circle">🟠</span> 橙</span>
            <span class="color-dot-tag tag-yellow" title="黃：3.1-3.5 三年級上學期"><span class="cd-circle">🟡</span> 黃</span>
            <span class="color-dot-tag tag-green" title="綠：3.6-4.0 三年級下學期"><span class="cd-circle">🟢</span> 綠</span>
            <span class="color-dot-tag tag-blue" title="藍：4.1-4.5 四年級上學期"><span class="cd-circle">🔵</span> 藍</span>
            <span class="color-dot-tag tag-indigo" title="靛：4.6-5.0 四年級下學期"><span class="cd-circle">🟣</span> 靛</span>
            <span class="color-dot-tag tag-purple" title="紫：5.1-5.5 五年級上學期"><span class="cd-circle">🟣</span> 紫</span>
            <span class="color-dot-tag tag-bronze" title="銅：5.6-6.0 五年級下學期"><span class="cd-circle">🟤</span> 銅</span>
            <span class="color-dot-tag tag-silver" title="銀：6.1-6.5 六年級上學期"><span class="cd-circle">⚪</span> 銀</span>
            <span class="color-dot-tag tag-gold" title="金：6.6以上 六年級下學期"><span class="cd-circle">🟡</span> 金</span>
          </div>
        </div>

        <!-- 快捷行動組 -->
        <div class="hero-cta-group">
          <a href="#teaching-three-pillars" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            🏆 教學成果三大專區
          </a>
          <a href="#teaching-spotlights" class="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            🌟 5 大旗艦專題
          </a>
          <a href="#portfolio-catalog" class="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            檢索 ${processedPortfolio.items.length} 筆成果檔案
          </a>
          <a href="#curriculum-vitae" class="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            學術履歷與殊榮
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Four Signature Teaching Pillars (四大核心成果專區：永續教育、小教實習、跨域美感、閱讀推動) -->
  <section id="teaching-three-pillars" class="teaching-three-pillars-section">
    <div class="pillars-header">
      <div class="pillars-badge-pill">
        <span class="pulse-dot"></span>
        <span>✨ 旗艦教育實踐 · 四大核心專區 · 永續領航 × 標竿美感 × 閱讀典範 × 師培傳承</span>
      </div>
      <h2>
        <span>🏆 教學成果四大核心專區</span>
      </h2>
      <p>
        深耕教育現場，全方位展現<strong>「永續教育」</strong>（🌍 2026 台灣傑出永續教育人物 · 環境教育認證）、<strong>「師培傳承」</strong>（🎓 高師大師培 × 四維國小）、<strong>「跨域美感」</strong>（🎨 教育部標竿學校 · 苗栗縣教案首獎）及<strong>「閱讀推動」</strong>（📖 永貞國小閱推專任 · 聊書典範教師）四大指標性教育實踐歷程。
      </p>
    </div>

    <!-- Pillars Cards Grid (4 Columns on desktop) -->
    <div id="teachingPillarsGrid" class="pillars-grid pillars-grid-four"></div>
  </section>

  <!-- Featured Teaching Spotlights (STREAM 旗艦專題策展) -->
  <section id="teaching-spotlights" class="spotlight-section">
    <div class="spotlight-header">
      <div class="spotlight-title-group">
        <div class="bento-badge-pill">
          <span class="pulse-dot"></span>
          <span>🔬 STREAM 跨域與教育創新 · 5 大旗艦策展</span>
        </div>
        <h2>
          <span>🌟 教學紀錄精粹：STREAM（STEM+A+R）教育策展</span>
        </h2>
        <p>依據徐秉鴻老師研發之校本教案、教育部標竿計畫、閱讀行動研究與全國探究競賽金獎紀實提煉</p>
      </div>
      <div>
        <span class="hero-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700; border-radius: var(--radius-full); padding: 0.4rem 0.95rem; font-size: 0.82rem; border: 1px solid rgba(var(--primary-rgb), 0.25);">
          ✨ 5 大色彩識別 · SDGs 永續對應 · 現場紀實相簿
        </span>
      </div>
    </div>

    <!-- Spotlight Cards Grid (Bento Grid) -->
    <div id="spotlightCardsGrid" class="spotlight-grid bento-grid"></div>
  </section>

  <!-- Main Content Area -->
  <main class="main-container" id="portfolio-catalog">
    <div class="controls-wrapper">
      <!-- 7 Top Level Category Tabs -->
      <nav class="category-tabs-container" id="categoryTabs" aria-label="成果分類"></nav>

      <!-- Sub-section Pills (Dynamic based on selected category) -->
      <div class="subsections-container" id="subsectionsWrapper" style="display: none;">
        <div class="subsections-header">
          <span class="subsections-header-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            專業向度細項：
          </span>
          <button id="subsectionsToggleBtn" class="subsections-toggle-btn" type="button" aria-expanded="false" title="展開或收合向度標籤">
            <span class="toggle-text">展開全部向度 (27)</span>
            <svg class="toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <div class="subsections-scroll-track">
          <div id="subsectionsList" class="subsections-list"></div>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="search-filter-bar">
        <div class="search-box-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="searchInput" class="search-input" placeholder="即時搜尋：例如「科學探究」、「TSSCI」、「教案」、「美感」、「閱讀」...">
          <button id="searchClearBtn" class="search-clear-btn" title="清除搜尋">&times;</button>
        </div>

        <div class="filter-actions">
          <select id="mediaFilter" class="select-filter" aria-label="附件格式篩選">
            <option value="all">📁 全部附件格式</option>
            <option value="award">🏆 競賽得獎殊榮</option>
            <option value="image">🖼️ 證書與活動照片</option>
            <option value="pdf">📄 PDF 論文與完整教案</option>
            <option value="video">🎬 影音報導與專訪</option>
            <option value="link">🌐 外部專題報導</option>
          </select>

          <select id="sortSelect" class="select-filter" aria-label="排序方式">
            <option value="default">📌 預設向度排序</option>
            <option value="newest">📅 最新發布優先</option>
            <option value="oldest">📅 早期紀錄優先</option>
            <option value="title">🔤 標題名稱排序</option>
          </select>

          <div class="view-toggle" role="group" aria-label="檢視模式切換">
            <button id="viewGridBtn" class="view-btn active" title="網格卡片檢視">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              卡片
            </button>
            <button id="viewTimelineBtn" class="view-btn" title="履歷清單檢視">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              清單
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Search Chips -->
      <div class="quick-search-chips">
        <span class="quick-search-label">💡 熱門標籤：</span>
        <button class="quick-chip" data-search="全國第一">🏆 全國第一金獎</button>
        <button class="quick-chip" data-search="TSSCI">📚 TSSCI 核心期刊</button>
        <button class="quick-chip" data-search="火鍋">🥘 火鍋防溢探究</button>
        <button class="quick-chip" data-search="多肉">🌱 多肉植癒 SEL</button>
        <button class="quick-chip" data-search="美數">🎨 美數跨領域幾何</button>
        <button class="quick-chip" data-search="閱讀">📖 身教晨讀 MSSR</button>
        <button class="quick-chip" data-search="香蕉">🍌 香蕉假莖仿生</button>
        <button class="quick-chip" data-search="蘆竹湳">🏡 蘆竹湳雙語古厝</button>
        <button class="quick-chip" data-search="教案">💡 獲獎教案</button>
      </div>

      <!-- Results Count Info -->
      <div class="results-meta">
        <div id="resultsCount" class="results-count">載入中...</div>
        <div>
          <button class="btn-outline" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="window.clearAllFilters()">重設篩選</button>
        </div>
      </div>
    </div>

    <!-- Items Grid / List Container -->
    <div id="itemsContainer" class="cards-grid"></div>

    <!-- Curriculum Vitae / Profile Summary Section -->
    <section id="curriculum-vitae" class="cv-section">
      <div class="cv-header">
        <h3 class="cv-title">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          徐秉鴻老師 學術履歷與代表性殊榮一覽
        </h3>
        <span style="font-size: 0.85rem; color: var(--text-muted);">
          苗栗縣永貞國小 專任教師 · 高師大科教博士生
        </span>
      </div>

      <div class="cv-grid">
        <div class="cv-block cv-block-service">
          <h4>🏫 現職與永續教育專業服務</h4>
          <ul class="cv-list">
            <li><a href="https://yes.mlc.edu.tw/Home/Index.php" target="_blank" rel="noopener"><strong>苗栗縣頭份市永貞國民小學</strong></a>：專任教師（2024迄今）、高年級導師（2024-2026）</li>
            <li><a href="https://yes.mlc.edu.tw/Home/Index.php" target="_blank" rel="noopener"><strong>苗栗縣頭份市永貞國民小學</strong></a>：兼任<a href="https://cirn.k12ea.gov.tw/web1186/dl_page.aspx?fid=12429" target="_blank" rel="noopener">圖書館閱讀推動教師</a>（2025迄今）、兼任文書組長（2026迄今）</li>
            <li><a href="https://iern.mlc.edu.tw/tw/about/index.php?num=26" target="_blank" rel="noopener"><strong>苗栗縣國際教育中心</strong></a>：專業工作人員（2025迄今）</li>
            <li><strong>環境部認證環境教育人員</strong>：學校及社會環境教育領域（字號：(112)環署訓證字第EP106004號）</li>
            <li><strong>國立高雄師範大學師培處</strong>：國民小學教學實習總召</li>
            <li><strong>財團法人永齡教育基金會</strong>：希望小學高師大分校優良課輔教師（2020-2024）</li>
          </ul>
        </div>

        <div class="cv-block cv-block-edu">
          <h4>🎓 學歷與多元師資認證</h4>
          <ul class="cv-list">
            <li><strong>國立高雄師範大學</strong>：科學教育暨環境教育研究所 科學教育博士班、閱讀教學微學分學程（2026迄今在讀中）</li>
            <li><strong>國立高雄師範大學</strong>：科學教育暨環境教育研究所 碩士班 113級（國民小學教育學程）</li>
            <li><strong>國立高雄師範大學</strong>：數學系應用數學組 大學部 109級（國中、高中教育學程數學領域）</li>
            <li><strong>教育部合格教師證書</strong>：國民小學教師證書（108課綱）、中等學校數學科教師證書（99課綱）</li>
            <li><strong>多元教育專業認證</strong>：客語能力初級認證、教育部學習扶助（國小國語／國小數學／國中數學）、臺師大數學活動師（第四、五期）</li>
          </ul>
        </div>

        <div class="cv-block cv-block-awards">
          <h4>🏆 代表性永續與科學教育榮譽（17項精選）</h4>
          <ul class="cv-list">
            <li class="highlight-award"><strong>社團法人中華明日閱讀協會（2026）</strong>：引領永貞國小榮獲「明日閱讀典範學校」全國最高榮譽</li>
            <li class="highlight-award"><strong>教育部跨領域美感教育卓越領航計畫</strong>：引領永貞國小榮獲 115 學年度「標竿學校」、114 學年度「種子學校」</li>
            <li class="highlight-award"><strong>國教署全國科學探究競賽（2025 &amp; 2022）</strong>：指導「火鍋防溢探究」、「香蕉假莖探究」雙獲全國第一名（金獎）</li>
            <li class="highlight-award-bronze"><strong>國教署全國科學探究競賽（2026 &amp; 2024）</strong>：教師組「多肉校本探究」、大專社會組「視覺立體影像」雙獲全國第三名（銅獎）</li>
            <li class="highlight-award"><strong>苗栗縣精進計畫素養導向教案競賽</strong>：跨領域素養導向課程教案設計組全縣首獎（第一名）</li>
            <li><strong>教育部全國性教案與實習殊榮</strong>：114年品德教育徵稿全國甲組入選、112年度人權教育教案全國佳作、110年度教育部實習績優獎</li>
            <li><strong>苗栗縣縣長盃樂樂棒球錦標賽（115年度）</strong>：指導六年級團隊榮獲全縣雙亞軍（第二名）</li>
          </ul>
        </div>

        <div class="cv-block cv-block-papers">
          <h4>📚 代表性學術期刊與研討會論文</h4>
          <ul class="cv-list">
            <li class="highlight-award"><strong>TSSCI 第一級核心期刊論文（接受刊登）</strong>：蔡執仲*、徐秉鴻(in press)。STEM專題導向探究教學情境中教師專業成長轉化歷程之研究。《科學教育學刊》。【TSSCI I】</li>
            <li class="highlight-award"><strong>TSSCI 第一級核心期刊論文（第一作者）</strong>：徐秉鴻、蔡執仲*(2025)。探討結合STEM議題的5E探究教學模式在設計國中探究與實作課程之研究。《科學教育學刊》，33(1)，39-78。【TSSCI I】</li>
            <li><strong>碩士學位論文</strong>：徐秉鴻(2024)。發展STEM議題融入科學探究專題課程之教學實踐研究。國立高雄師範大學。</li>
            <li><strong>國內外研討會發表</strong>：2026 PAIR 第16屆閱讀評量與教學研討會、2025 TALP 自主學習節研討會、2024 國際素養研討會、2023 ICTE 第11屆師資培育國際研討會、2022 ASET 第38屆科學教育國際研討會。</li>
          </ul>
        </div>

        <div class="cv-block cv-block-research" style="grid-column: 1 / -1;">
          <h4>🔬 教育部、國科會與高師大研究計畫執行經歷</h4>
          <ul class="cv-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0.65rem;">
            <li><strong>國科會專題研究計畫</strong>：培養師資生閱讀理解素養的課程規劃與教學模組之實踐研究（高師大 方金雅教授主持）</li>
            <li><strong>教育部精進師培計畫</strong>：持續融入學習評量與實地學習的師培課程「閱讀理解策略」之教學與實踐（高師大 方金雅教授主持）</li>
            <li><strong>國教署委託研發計畫</strong>：國民中小學學生識字能力評估第四、五、六、七期計畫（高師大 方金雅教授主持）</li>
            <li><strong>教育部跨域美感計畫</strong>：跨領域美感教育卓越領航計畫 115學年度標竿學校、114學年度種子學校（團隊聯絡人：徐秉鴻教師）</li>
            <li><strong>教育部高教深耕計畫</strong>：高師大理學院「里山與里海的生態對話」＆ PBL 創新教學「環境教育課程設計研究」（蔡執仲教授主持）</li>
            <li><strong>國科會科普推廣活動</strong>：2025 臺灣科普環島列車</li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <!-- Modal Lightbox / Viewer -->
  <div id="modalBackdrop" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title-group">
          <span id="modalSectionBadge" class="modal-section-badge">向度類別</span>
          <h2 id="modalTitle" class="modal-title">成果標題</h2>
        </div>
        <button id="modalCloseBtn" class="modal-close-btn" aria-label="關閉視窗">&times;</button>
      </div>

      <div class="modal-body">
        <div id="modalViewerContainer" class="modal-viewer-container"></div>
        <div class="modal-details">
          <div id="modalBodyText" class="modal-body-text"></div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-nav-btns">
          <button id="modalPrevBtn" class="btn-outline" title="上一筆成果 (&larr;)">
            &larr; 上一筆
          </button>
          <button id="modalNextBtn" class="btn-outline" title="下一筆成果 (&rarr;)">
            下一筆 &rarr;
          </button>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted);" id="modalMetaDate"></div>

        <div class="modal-download-actions">
          <a id="modalExternalLink" href="#" target="_blank" rel="noopener noreferrer" class="btn-outline">
            🌐 開啟外部專題
          </a>
          <a id="modalDownloadLink" href="#" target="_blank" rel="noopener noreferrer" class="btn-primary">
            ☁️ 開啟雲端原檔
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Deep Spotlight Thematic Modal -->
  <div id="spotlightModalBackdrop" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal-dialog spotlight-dialog">
      <div class="spotlight-modal-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
          <div>
            <div id="spModalCategory" class="hero-tag highlight" style="font-size: 0.78rem; margin-bottom: 0.5rem;">專題類別</div>
            <h2 id="spModalTitle" class="spotlight-modal-title">專題標題</h2>
            <p id="spModalSubtitle" style="color: var(--primary); font-weight: 600; font-size: 0.95rem; margin-top: 0.3rem;">專題副標題</p>
          </div>
          <button id="spModalCloseBtn" class="modal-close-btn" aria-label="關閉專題視窗">&times;</button>
        </div>
      </div>

      <div class="modal-body spotlight-modal-body">
        <!-- Meta summary -->
        <div class="spotlight-meta-grid">
          <div class="spotlight-meta-item">
            <span class="spotlight-meta-label">殊榮競賽與認證</span>
            <span id="spModalAward" class="spotlight-meta-val" style="color: var(--gold);">獲獎資訊</span>
          </div>
          <div class="spotlight-meta-item">
            <span class="spotlight-meta-label">課程實施對象</span>
            <span id="spModalTarget" class="spotlight-meta-val">實施對象</span>
          </div>
          <div class="spotlight-meta-item">
            <span class="spotlight-meta-label">總實施節數 / 期程</span>
            <span id="spModalDuration" class="spotlight-meta-val">節數資訊</span>
          </div>
        </div>

        <!-- 外部旗艦網站介接展示區 (如 2026 跨領域美感成果網站) -->
        <div id="spModalExternalSiteWrapper" style="display: none; margin-bottom: 1.5rem;"></div>

        <!-- Overview -->
        <div>
          <h4 class="spotlight-section-title">
            <span>📖 課程設計緣起與核心理念</span>
          </h4>
          <p id="spModalOverview" style="font-size: 0.96rem; line-height: 1.8; color: var(--text-main);"></p>
        </div>

        <!-- SDGs / Core Competencies -->
        <div>
          <h4 class="spotlight-section-title">
            <span>🌍 核心素養與聯合國永續指標 (SDGs) 對應</span>
          </h4>
          <div id="spModalSdgs" class="sdg-grid"></div>
        </div>

        <!-- 4-Module Structure -->
        <div>
          <h4 class="spotlight-section-title">
            <span>🧩 四大核心模組與教學活動規劃</span>
          </h4>
          <div id="spModalModules" class="modules-list"></div>
        </div>

        <!-- Authentic Photo Gallery -->
        <div>
          <h4 class="spotlight-section-title">
            <span>📸 教學現場紀實與成果照片</span>
          </h4>
          <div id="spModalGallery" class="spotlight-gallery"></div>
        </div>

        <!-- Documents & Awards -->
        <div id="spModalDocsWrapper">
          <h4 class="spotlight-section-title">
            <span>📑 相關獲獎證明與教案原件</span>
          </h4>
          <div id="spModalDocs" style="display: flex; flex-direction: column; gap: 0.75rem;"></div>
        </div>
      </div>

      <div class="modal-footer">
        <span style="font-size: 0.85rem; color: var(--text-muted);">永貞國小校本教學成果 · 國立高雄師範大學博士班實踐研究</span>
        <button id="spModalBottomCloseBtn" class="btn-primary">關閉專題視窗</button>
      </div>
    </div>
  </div>

  <!-- Three Teaching Pillars Detail Modal -->
  <div id="pillarModalBackdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pillarModalTitle">
    <div class="modal-dialog pillar-modal-dialog">
      <div class="spotlight-modal-header" style="background: var(--bg-surface); padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; width: 100%;">
          <div>
            <span id="pillarModalThemeBadge" class="pillars-badge-pill" style="font-size: 0.78rem; margin-bottom: 0.5rem; display: inline-block;">專區標籤</span>
            <h2 id="pillarModalTitle" class="spotlight-modal-title" style="margin: 0; font-size: 1.35rem; color: var(--text-main);">專區名稱</h2>
          </div>
          <button id="closePillarModalBtn" class="modal-close-btn" aria-label="關閉視窗" onclick="window.closePillarModal()">&times;</button>
        </div>
      </div>

      <div class="pillar-modal-tabs">
        <button class="pillar-tab-btn active" data-tab="overview">📌 核心特色與歷程</button>
        <button class="pillar-tab-btn" data-tab="trials">📐 試教演示與教案</button>
        <button class="pillar-tab-btn" data-tab="gallery">🖼️ 成果寫真藝廊</button>
        <button class="pillar-tab-btn" data-tab="meta">📜 實習指導與認證</button>
      </div>

      <div class="modal-body" style="padding: 0; flex: 1; overflow-y: auto;">
        <div id="pillarTabOverview" class="pillar-tab-panel active"></div>
        <div id="pillarTabTrials" class="pillar-tab-panel"></div>
        <div id="pillarTabGallery" class="pillar-tab-panel"></div>
        <div id="pillarTabMeta" class="pillar-tab-panel"></div>
      </div>

      <div class="modal-footer" style="padding: 0.85rem 1.25rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
        <span id="pillarModalSchool" style="font-size: 0.82rem; color: var(--text-muted);">學校資訊</span>
        <div style="display: flex; gap: 0.5rem;">
          <button id="pillarModalFilterCatalogBtn" class="btn-primary" style="padding: 0.45rem 0.85rem; font-size: 0.82rem;">🗂️ 檢索對應成果檔案庫 &rarr;</button>
          <button class="btn-outline" style="padding: 0.45rem 0.85rem; font-size: 0.82rem;" onclick="window.closePillarModal()">關閉</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Google Sites 嵌入指南彈出視窗 (Embed Guide Modal) -->
  <div id="embedGuideModal" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal-dialog" style="max-width: 650px;">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-section-badge">整合設定</span>
          <h2 class="modal-title">📋 Google Sites (Google 協作平台) 嵌入教學</h2>
        </div>
        <button onclick="window.closeEmbedGuide()" class="modal-close-btn" aria-label="關閉">&times;</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem; line-height: 1.7; font-size: 0.95rem;">
        <h4 style="margin-top: 0; color: var(--primary);">方式一：Google Sites「嵌入程式碼 (HTML)」直接貼上</h4>
        <p>此 <code>google-sites-embed.html</code> 檔案為<strong>100% 自包含單一 HTML 檔案</strong>，包含所有 CSS、JavaScript、${processedPortfolio.items.length} 筆成果資料與壓縮高畫質照片 Base64：</p>
        <ol style="margin-left: 1.25rem; margin-bottom: 1rem;">
          <li>用純文字編輯器（如記事本、VS Code）開啟 <code>google-sites-embed.html</code>。</li>
          <li>按 <kbd>Ctrl + A</kbd> 全選，按 <kbd>Ctrl + C</kbd> 複製全部程式碼。</li>
          <li>進入 Google Sites 編輯器，右側面板點選<strong>「嵌入」</strong> &rarr; 切換至<strong>「嵌入程式碼」</strong>標籤。</li>
          <li>貼上剛才複製的程式碼，點選「下一步」後點選「插入」。</li>
          <li>以滑鼠拖曳調整 Google Sites 上的區塊寬度與高度（建議高度設為 850px 以上），即可完美呈現！</li>
        </ol>

        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">

        <h4 style="color: var(--primary);">方式二：Google Sites「依網址 (iframe)」嵌入代碼</h4>
        <p>若您已將成果網站部署於 GitHub Pages、Vercel 或學校伺服器，可在 Google Sites「嵌入程式碼」貼上自適應 iframe：</p>
        <div class="code-box" id="iframeSnippetCode">&lt;iframe src="YOUR_DEPLOYED_URL/google-sites-embed.html" width="100%" height="900" style="border:none; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;" allowfullscreen loading="lazy"&gt;&lt;/iframe&gt;</div>
        <button class="btn-primary" style="margin-top: 0.5rem; font-size: 0.85rem;" onclick="window.copyIframeCode()">📋 一鍵複製 iframe 程式碼</button>
      </div>
      <div class="modal-footer">
        <span style="font-size: 0.85rem; color: var(--text-muted);">已全面通過手機、平板與桌機 RWD 測試驗證</span>
        <button onclick="window.closeEmbedGuide()" class="btn-outline">關閉說明</button>
      </div>
    </div>
  </div>

  <!-- Site Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-meta">
        <strong style="color: var(--text-main);">徐秉鴻老師 教學成果與專業資歷數位典藏庫</strong>
        <span>苗栗縣頭份市永貞國民小學｜國立高雄師範大學 科學教育暨環境教育研究所博士班</span>
        <span style="font-size: 0.8rem;">雲端 Padlet 資料即時同步｜收錄 ${processedPortfolio.items.length} 筆教育成果紀錄｜27 大向度全面索引</span>
      </div>

      <div class="footer-links">
        <a href="https://padlet.com/binghong0124/padlet-kt3wry5jju07blei" target="_blank" rel="noopener noreferrer">
          🔗 原始 Padlet 看板
        </a>
        <a href="javascript:void(0)" onclick="window.openEmbedGuide()">
          📋 嵌入 Google Sites 說明
        </a>
      </div>
    </div>
  </footer>

  <!-- Back to Top Button -->
  <button id="backToTopBtn" class="back-to-top" title="回到頂部">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
  </button>

  <!-- Inlined App Script -->
  <script>
  window.COMPACT_IMAGES = ${JSON.stringify(hd720pBase64)};
  window.PORTFOLIO_DATA = ${JSON.stringify(processedPortfolio)};
  window.SPECIAL_FEATURES = ${JSON.stringify(processedFeatures)};
  window.THREE_PILLARS = ${JSON.stringify(processedPillars)};

  window.resolveAsset = function(urlOrPath) {
    if (!urlOrPath) return '';
    if (urlOrPath.startsWith('data:')) return urlOrPath;
    const norm = urlOrPath.split('\\\\').join('/');
    if (window.COMPACT_IMAGES && window.COMPACT_IMAGES[norm]) {
      return window.COMPACT_IMAGES[norm];
    }
    const idMatch = norm.match(/\\d{10}/);
    if (idMatch && window.COMPACT_IMAGES) {
      const k = Object.keys(window.COMPACT_IMAGES).find(key => key.includes(idMatch[0]));
      if (k) return window.COMPACT_IMAGES[k];
    }
    if ((urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) && !urlOrPath.includes('padletusercontent')) {
      return urlOrPath;
    }
    return urlOrPath;
  };

  // ==========================================
  // Interactive Application Logic
  // ==========================================
  (function () {
    'use strict';

    const state = {
      data: window.PORTFOLIO_DATA,
      currentCategory: 'all',
      currentSection: 'all',
      currentMediaType: 'all',
      searchQuery: '',
      sortBy: 'default',
      viewMode: 'grid',
      currentModalIndex: -1,
      filteredItems: [],
      imageZoom: 1,
      imageRotation: 0
    };

    const el = {
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      categoryTabs: document.getElementById('categoryTabs'),
      subsectionsWrapper: document.getElementById('subsectionsWrapper'),
      subsectionsList: document.getElementById('subsectionsList'),
      searchInput: document.getElementById('searchInput'),
      searchClearBtn: document.getElementById('searchClearBtn'),
      mediaFilter: document.getElementById('mediaFilter'),
      sortSelect: document.getElementById('sortSelect'),
      viewGridBtn: document.getElementById('viewGridBtn'),
      viewTimelineBtn: document.getElementById('viewTimelineBtn'),
      itemsContainer: document.getElementById('itemsContainer'),
      resultsCount: document.getElementById('resultsCount'),
      modalBackdrop: document.getElementById('modalBackdrop'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalSectionBadge: document.getElementById('modalSectionBadge'),
      modalTitle: document.getElementById('modalTitle'),
      modalViewerContainer: document.getElementById('modalViewerContainer'),
      modalBodyText: document.getElementById('modalBodyText'),
      modalMetaDate: document.getElementById('modalMetaDate'),
      modalDownloadLink: document.getElementById('modalDownloadLink'),
      modalExternalLink: document.getElementById('modalExternalLink'),
      modalPrevBtn: document.getElementById('modalPrevBtn'),
      modalNextBtn: document.getElementById('modalNextBtn'),
      backToTopBtn: document.getElementById('backToTopBtn'),
      spotlightCardsGrid: document.getElementById('spotlightCardsGrid'),
      spotlightModalBackdrop: document.getElementById('spotlightModalBackdrop'),
      spModalCloseBtn: document.getElementById('spModalCloseBtn'),
      spModalBottomCloseBtn: document.getElementById('spModalBottomCloseBtn'),
      spModalCategory: document.getElementById('spModalCategory'),
      spModalTitle: document.getElementById('spModalTitle'),
      spModalSubtitle: document.getElementById('spModalSubtitle'),
      spModalAward: document.getElementById('spModalAward'),
      spModalTarget: document.getElementById('spModalTarget'),
      spModalDuration: document.getElementById('spModalDuration'),
      spModalExternalSiteWrapper: document.getElementById('spModalExternalSiteWrapper'),
      spModalOverview: document.getElementById('spModalOverview'),
      spModalSdgs: document.getElementById('spModalSdgs'),
      spModalModules: document.getElementById('spModalModules'),
      spModalGallery: document.getElementById('spModalGallery'),
      spModalDocs: document.getElementById('spModalDocs'),
      spModalDocsWrapper: document.getElementById('spModalDocsWrapper'),
      embedGuideModal: document.getElementById('embedGuideModal'),
      teachingPillarsGrid: document.getElementById('teachingPillarsGrid'),
      pillarModalBackdrop: document.getElementById('pillarModalBackdrop')
    };

    function init() {
      initTheme();
      setupEventListeners();
      renderTeachingPillars();
      renderSpotlights();
      renderCategoryTabs();
      applyFilters();
    }

    // Render Three Signature Teaching Pillars
    function renderTeachingPillars() {
      if (!el.teachingPillarsGrid) return;
      const pillars = window.THREE_PILLARS || [];
      if (pillars.length === 0) return;

      const themeIcons = {
        sustainability: '🌱',
        practicum: '🎓',
        aesthetic: '🎨',
        reading: '📖'
      };

      el.teachingPillarsGrid.innerHTML = pillars.map(p => {
        const icon = themeIcons[p.id] || '🌟';
        const statsHtml = (p.stats || []).map(s => \`
          <div class="pillar-stat-box">
            <span class="pillar-stat-val">\${escapeHtml(s.value)}</span>
            <span class="pillar-stat-lbl">\${escapeHtml(s.label)}</span>
          </div>
        \`).join('');

        const highlightsHtml = (p.highlights || []).slice(0, 4).map(h => \`
          <li class="pillar-highlight-item">
            <span class="pillar-highlight-icon-box">\${h.icon}</span>
            <div><strong>\${escapeHtml(h.title)}：</strong>\${escapeHtml(h.desc.slice(0, 55))}...</div>
          </li>
        \`).join('');

        return \`
          <article class="pillar-card" data-pillar="\${p.id}">
            <div class="pillar-top-accent"></div>
            <div class="pillar-banner">
              <img src="\${window.resolveAsset(p.heroImage)}" alt="\${escapeHtml(p.title)}" class="pillar-img" referrerpolicy="no-referrer">
              <div class="pillar-banner-gradient-mask"></div>
              <div class="pillar-badge-overlay">\${icon} \${escapeHtml(p.badge)}</div>
              <div class="pillar-tag-overlay">\${escapeHtml(p.period)}</div>
            </div>
            <div class="pillar-body">
              <div class="pillar-title-row">
                <span class="pillar-title-icon">\${icon}</span>
                <h3 class="pillar-title">\${escapeHtml(p.title)}</h3>
              </div>
              <p class="pillar-subtitle">\${escapeHtml(p.subtitle)}</p>
              
              <div class="pillar-stats-grid">
                \${statsHtml}
              </div>

              <ul class="pillar-highlights-list">
                \${highlightsHtml}
              </ul>

              <div class="pillar-footer">
                <button class="pillar-btn pillar-btn-primary" onclick="window.openPillarModal('\${p.id}')">深入專區實錄 🔍</button>
                <button class="pillar-btn pillar-btn-outline" onclick="window.filterByPillarKeyword('\${p.id}')">定位佐證檔案 🗂️</button>
              </div>
            </div>
          </article>
        \`;
      }).join('');
    }

    window.openPillarModal = function(pillarId) {
      const p = (window.THREE_PILLARS || []).find(item => item.id === pillarId);
      if (!p || !el.pillarModalBackdrop) return;

      const accentMap = { practicum: '#2563eb', aesthetic: '#7c3aed', reading: '#059669' };
      const accentColor = accentMap[p.id] || 'var(--primary)';
      el.pillarModalBackdrop.style.setProperty('--modal-accent', accentColor);

      document.getElementById('pillarModalTitle').textContent = p.fullTitle;
      document.getElementById('pillarModalThemeBadge').textContent = p.badge;
      document.getElementById('pillarModalSchool').textContent = p.school;

      const filterBtn = document.getElementById('pillarModalFilterCatalogBtn');
      if (filterBtn) {
        filterBtn.onclick = () => {
          window.closePillarModal();
          window.filterByPillarKeyword(p.id);
        };
      }

      // Populate Tab 1: Overview
      const tabOverview = document.getElementById('pillarTabOverview');
      tabOverview.innerHTML = \`
        <div style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 0.5rem;">🌟 \${escapeHtml(p.subtitle)}</h3>
          <p style="font-size: 0.92rem; color: var(--text-main); line-height: 1.6;"><strong>職責：</strong>\${escapeHtml(p.role)}<br><strong>指導陣容：</strong>\${escapeHtml(p.mentors)}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
          \${p.highlights.map(h => \`
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem;">
                <span style="font-size: 1.15rem;">\${h.icon}</span>
                <strong style="font-size: 0.92rem; color: var(--text-main);">\${escapeHtml(h.title)}</strong>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin: 0;">\${escapeHtml(h.desc)}</p>
            </div>
          \`).join('')}
        </div>
      \`;

      // Populate Tab 2: Trials / Plans / Papers
      const tabTrials = document.getElementById('pillarTabTrials');
      if (p.trials) {
        tabTrials.innerHTML = \`
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📐 國小數學領域公開觀課試教演示</h4>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                \${p.trials.math.map(m => \`<li style="background: var(--bg-surface); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.88rem;">\${escapeHtml(m)}</li>\`).join('')}
              </ul>
            </div>
            <div>
              <h4 style="font-size: 1.05rem; color: #10b981; margin-bottom: 0.75rem;">📚 國語文領域公開觀課試教演示</h4>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                \${p.trials.mandarin.map(m => \`<li style="background: var(--bg-surface); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border-left: 3px solid #10b981; font-size: 0.88rem;">\${escapeHtml(m)}</li>\`).join('')}
              </ul>
            </div>
          </div>
        \`;
      } else if (p.papers) {
        tabTrials.innerHTML = \`
          <div>
            <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📚 閱讀推動與適性教學研討會論文發表</h4>
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem;">
              \${p.papers.map(pp => \`<li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.9rem;">\${escapeHtml(pp)}</li>\`).join('')}
            </ul>
          </div>
        \`;
      } else {
        tabTrials.innerHTML = \`
          <div>
            <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">🎨 跨領域美感四大核心展廳規劃</h4>
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem;">
              <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #6366f1; font-size: 0.9rem;"><strong>PART 1 星際自畫像：</strong>幾何比例 × 五官對稱 × 空間心理投射</li>
              <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #38bdf8; font-size: 0.9rem;"><strong>PART 2 星際導航格點：</strong>直角坐標幾何 × 向量構圖 × 口語表達發表</li>
              <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #f59e0b; font-size: 0.9rem;"><strong>PART 3 幾何對稱與形變：</strong>埃舍爾鑲嵌藝術（Tessellation）× 數學平移與旋轉</li>
              <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #10b981; font-size: 0.9rem;"><strong>PART 4 母星印象與空間構築：</strong>正四面體風箏幾何、點線面立體摺紙與建築美學</li>
            </ul>
          </div>
        \`;
      }

      // Populate Tab 3: Gallery
      const tabGallery = document.getElementById('pillarTabGallery');
      tabGallery.innerHTML = \`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
          \${(p.gallery || []).map(g => \`
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;">
              <img src="\${window.resolveAsset(g.url)}" alt="\${escapeHtml(g.caption)}" style="width: 100%; height: 160px; object-fit: cover;" referrerpolicy="no-referrer">
              <div style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: var(--text-muted);">\${escapeHtml(g.caption)}</div>
            </div>
          \`).join('')}
        </div>
      \`;

      // Populate Tab 4: Meta
      const tabMeta = document.getElementById('pillarTabMeta');
      tabMeta.innerHTML = \`
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📋 專區專業資歷與指導認證</h4>
          <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>實習／任教機構：</strong>\${escapeHtml(p.school)}</p>
          <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>擔任職責：</strong>\${escapeHtml(p.role)}</p>
          <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>指導師長／主持團隊：</strong>\${escapeHtml(p.mentors)}</p>
          <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>推動期程：</strong>\${escapeHtml(p.period)}</p>
        </div>
      \`;

      // Reset tabs
      el.pillarModalBackdrop.querySelectorAll('.pillar-tab-btn').forEach(btn => btn.classList.remove('active'));
      el.pillarModalBackdrop.querySelectorAll('.pillar-tab-panel').forEach(pan => pan.classList.remove('active'));
      el.pillarModalBackdrop.querySelector('.pillar-tab-btn[data-tab="overview"]').classList.add('active');
      document.getElementById('pillarTabOverview').classList.add('active');

      el.pillarModalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    window.closePillarModal = function() {
      if (!el.pillarModalBackdrop) return;
      el.pillarModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    };

    window.filterByPillarKeyword = function(pillarId) {
      if (pillarId === 'aesthetic') {
        state.currentCategory = 'aesthetic_art';
        state.currentSection = 'all';
        state.searchQuery = '';
        if (el.searchInput) el.searchInput.value = '';
        if (el.categoryTabs) {
          el.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === 'aesthetic_art');
          });
        }
        renderSubsections();
        applyFilters();
        const target = document.getElementById('portfolio-catalog');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
      const kwMap = {
        practicum: '實習',
        reading: '閱讀'
      };
      const kw = kwMap[pillarId] || '';
      if (el.searchInput && kw) {
        el.searchInput.value = kw;
        state.searchQuery = kw;
        applyFilters();
      }
      const target = document.getElementById('portfolio-catalog');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    function initTheme() {
      let savedTheme = 'light';
      try {
        savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } catch (e) {}
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

      el.themeToggleBtn?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        updateThemeIcon(next);
      });
    }

    function updateThemeIcon(theme) {
      if (!el.themeToggleBtn) return;
      el.themeToggleBtn.innerHTML = theme === 'dark'
        ? \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>\`
        : \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>\`;
    }

    // Render 5 Key Teaching Spotlights (STEAM Bento)
    function renderSpotlights() {
      if (!el.spotlightCardsGrid) return;
      const features = window.SPECIAL_FEATURES || [];
      if (features.length === 0) return;

      const priorityOrder = ['science', 'succulent', 'aesthetic', 'reading', 'international'];
      const sorted = [...features].sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      const emojis = { science: '🔬', succulent: '🌵', aesthetic: '📐', reading: '📖', international: '🏮' };

      el.spotlightCardsGrid.innerHTML = sorted.map(feat => {
        const isWide = feat.id === 'science';
        const emoji = emojis[feat.id] || '✨';
        const primaryAward = feat.award.includes('·') ? feat.award.split('·')[0].trim() : feat.award;

        const sdgsHtml = (feat.sdgs || []).slice(0, 3).map(s => {
          let c = 'sdg-chip';
          if (s.code.includes('3')) c += ' sdg-3';
          else if (s.code.includes('4')) c += ' sdg-4';
          else if (s.code.includes('11')) c += ' sdg-11';
          else if (s.code.includes('12')) c += ' sdg-12';
          else if (s.code.includes('15')) c += ' sdg-15';
          else if (s.code.includes('17')) c += ' sdg-17';
          return \`<span class="\${c}" title="\${escapeHtml(s.desc || s.title)}">🎯 \${escapeHtml(s.code)}: \${escapeHtml(s.title)}</span>\`;
        }).join('');

        const dur = feat.duration ? feat.duration.split('（')[0].replace('課程', '') : '特色課程';
        const tgt = feat.target ? feat.target.split('（')[0] : '國小學童';
        const count = (feat.photos ? feat.photos.length : 0) + (feat.documents ? feat.documents.length : 0);

        return \`
          <article class="spotlight-card \${isWide ? 'bento-wide' : ''}" data-spotlight="\${feat.id}" data-theme="\${feat.id}">
            <div class="spotlight-banner">
              <img src="\${window.resolveAsset(feat.heroImage)}" alt="\${escapeHtml(feat.title)}" class="spotlight-img" referrerpolicy="no-referrer">
              <div class="spotlight-award-tag" title="\${escapeHtml(feat.award)}">\${escapeHtml(primaryAward)}</div>
              <div class="bento-theme-badge" title="\${escapeHtml(feat.category)}">\${emoji}</div>
              <div class="spotlight-category-tag">\${escapeHtml(feat.category)}</div>
            </div>
            <div class="spotlight-content">
              <div class="spotlight-subtitle">\${escapeHtml(feat.subtitle)}</div>
              <h3>\${escapeHtml(feat.title)}</h3>
              <p class="spotlight-overview">\${escapeHtml(feat.overview)}</p>
              \${sdgsHtml ? \`<div class="bento-sdgs">\${sdgsHtml}</div>\` : ''}
              <div class="spotlight-tags-row">
                \${feat.tags.slice(0, 4).map(t => \`<span class="spotlight-pill"># \${escapeHtml(t)}</span>\`).join('')}
              </div>
              <div class="spotlight-footer">
                <div class="bento-metrics">
                  <span>⏱️ \${escapeHtml(dur)}</span>
                  <span>👥 \${escapeHtml(tgt)}</span>
                  <span>📁 \${count} 項歷程佐證</span>
                </div>
                <div class="spotlight-btn-group">
                  <span class="spotlight-btn">深入專題 🔍</span>
                </div>
              </div>
            </div>
          </article>
        \`;
      }).join('');

      el.spotlightCardsGrid.querySelectorAll('[data-spotlight]').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-spotlight');
          openSpotlightModal(id);
        });
      });
    }

    function openSpotlightModal(featureId) {
      const features = window.SPECIAL_FEATURES || [];
      const feat = features.find(f => f.id === featureId);
      if (!feat || !el.spotlightModalBackdrop) return;

      if (el.spModalCategory) el.spModalCategory.textContent = feat.category;
      if (el.spModalTitle) el.spModalTitle.textContent = feat.title;
      if (el.spModalSubtitle) el.spModalSubtitle.textContent = feat.subtitle;
      if (el.spModalAward) el.spModalAward.textContent = feat.award;
      if (el.spModalTarget) el.spModalTarget.textContent = feat.target;
      if (el.spModalDuration) el.spModalDuration.textContent = feat.duration;
      if (el.spModalOverview) el.spModalOverview.textContent = feat.overview;

      // External Site Gateway (2026 跨領域美感成果展)
      if (el.spModalExternalSiteWrapper) {
        if (feat.externalSite) {
          const ext = feat.externalSite;
          const targetUrl = window.location.protocol === 'file:' ? (ext.localUrl || ext.url) : (ext.serverUrl || ext.url || 'https://binghong-xu.github.io/yongzhen-stem-art/');
          el.spModalExternalSiteWrapper.style.display = 'block';
          el.spModalExternalSiteWrapper.innerHTML = \`
            <div style="background: linear-gradient(135deg, #090e24 0%, #151b3d 60%, #2e1065 100%); border: 1px solid rgba(168, 85, 247, 0.5); border-radius: var(--radius-lg); padding: 1.35rem; color: #f8fafc; box-shadow: 0 8px 24px -6px rgba(124, 58, 237, 0.35); margin-bottom: 0.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
                <span style="font-size: 0.78rem; font-weight: 800; color: #e9d5ff; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.45); padding: 0.25rem 0.75rem; border-radius: var(--radius-full);">✨ 2026 跨領域美感成果展網站已完整介接</span>
                <span style="font-size: 0.82rem; color: #94a3b8;">永貞國小六年甲班 × 徐秉鴻老師</span>
              </div>
              <h5 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">\${escapeHtml(ext.title)}</h5>
              <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem;">完整收錄 327+ 件學生原創藝術品（蒙德里安小夜燈、星際自畫像、老屋顏壓花玻璃）、217+ 課堂紀實照片、63+ 部專題影音、18 步實踐歷程與 3 大美感互動實驗室！</p>
              <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
                <a href="\${targetUrl}" target="_blank" class="btn-primary" style="background: linear-gradient(135deg, #6366f1, #9333ea); border: none; font-size: 0.85rem; padding: 0.45rem 1.1rem; color: #fff; text-decoration: none; border-radius: var(--radius-md); font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
                  🚀 開啟 2026 跨領域美感網站全貌 ↗
                </a>
                <a href="\${targetUrl}#labs" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                  🧪 互動實驗室 ↗
                </a>
                <a href="\${targetUrl}#gallerySection" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                  🖼️ 320+ 作品藝廊 ↗
                </a>
                <a href="special-aesthetic.html" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                  🎨 查看標竿專題頁 ↗
                </a>
              </div>
            </div>
          \`;
        } else {
          el.spModalExternalSiteWrapper.style.display = 'none';
          el.spModalExternalSiteWrapper.innerHTML = '';
        }
      }

      if (el.spModalSdgs) {
        el.spModalSdgs.innerHTML = (feat.sdgs || []).map(sdg => \`
          <div class="sdg-box">
            <span class="sdg-code">\${escapeHtml(sdg.code)}</span>
            <h5>\${escapeHtml(sdg.title)}</h5>
            <p>\${escapeHtml(sdg.desc)}</p>
          </div>
        \`).join('');
      }

      if (el.spModalModules) {
        el.spModalModules.innerHTML = (feat.modules || []).map(m => \`
          <div class="module-box">
            <h4>\${escapeHtml(m.name)}</h4>
            <div class="module-focus">\${escapeHtml(m.focus)}</div>
            <p>\${escapeHtml(m.content)}</p>
          </div>
        \`).join('');
      }

      if (el.spModalGallery) {
        el.spModalGallery.innerHTML = (feat.photos || []).map(p => \`
          <div class="spotlight-gallery-item">
            <img src="\${window.resolveAsset(p.url)}" alt="\${escapeHtml(p.caption)}" class="spotlight-gallery-img" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'240\\' viewBox=\\'0 0 400 240\\'><rect width=\\'400\\' height=\\'240\\' fill=\\'%231e293b\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%2394a3b8\\' font-size=\\'16\\'>📷 專題紀實相片</text></svg>';">
            <div class="spotlight-gallery-caption">\${escapeHtml(p.caption)}</div>
          </div>
        \`).join('');
      }

      if (el.spModalDocs) {
        if (feat.documents && feat.documents.length > 0) {
          el.spModalDocsWrapper.style.display = 'block';
          el.spModalDocs.innerHTML = feat.documents.map(d => {
            const isPdf = d.type === 'pdf' || (d.path || '').toLowerCase().endsWith('.pdf') || (d.onlineUrl || '').toLowerCase().includes('.pdf');
            const docIcon = isPdf ? '📄' : (d.title.includes('第一名') || d.title.includes('首獎') || d.title.includes('金獎') || d.title.includes('第三') ? '🏆' : '📜');
            const typeBadge = isPdf 
              ? '<span style="font-size: 0.75rem; background: rgba(59,130,246,0.15); color: #3b82f6; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">📄 教案全文 PDF</span>'
              : '<span style="font-size: 0.75rem; background: rgba(245,158,11,0.15); color: #f59e0b; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">📜 官方獲獎證書/佐證</span>';
            const previewTarget = isPdf ? (d.onlineUrl || d.path) : (d.onlineUrl && d.onlineUrl.startsWith('http') ? d.onlineUrl : (d.path || d.base64));
            const btnLabel = isPdf ? '📄 預覽教案全文 &rarr;' : '🖼️ 檢視高清證書 &rarr;';
            const downloadHref = (d.onlineUrl && d.onlineUrl.startsWith('http')) ? d.onlineUrl : (d.path || d.base64);

            return \`
            <div class="spotlight-doc-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); gap: 0.75rem; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 240px; flex: 1;">
                <span style="font-size: 1.4rem;">\${docIcon}</span>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                  <span style="font-weight: 700; color: var(--text-main); font-size: 0.92rem; line-height: 1.4;">\${escapeHtml(d.title)}</span>
                  <div>\${typeBadge}</div>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn-primary" style="padding: 0.45rem 0.95rem; font-size: 0.82rem; cursor: pointer; white-space: nowrap;" onclick="window.previewSpotlightDoc('\${escapeHtml(d.title)}', '\${previewTarget}', '\${d.onlineUrl || ''}', '\${isPdf ? 'pdf' : 'image'}')">
                  \${btnLabel}
                </button>
                <a href="\${downloadHref}" download="\${escapeHtml(d.title)}" target="_blank" rel="noopener noreferrer" class="btn-outline" style="padding: 0.45rem 0.75rem; font-size: 0.82rem; white-space: nowrap;" title="下載佐證原件">
                  💾 下載
                </a>
              </div>
            </div>
            \`;
          }).join('');
        } else {
          el.spModalDocsWrapper.style.display = 'none';
        }
      }

      el.spotlightModalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSpotlightModal() {
      if (!el.spotlightModalBackdrop) return;
      el.spotlightModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Category Tabs & Subsections
    function renderCategoryTabs() {
      if (!el.categoryTabs || !state.data) return;

      const totalCount = state.data.items.length;
      let tabsHtml = \`
        <button class="tab-btn \${state.currentCategory === 'all' ? 'active' : ''}" data-category="all">
          <span>🌟 全部成果</span>
          <span class="tab-badge">\${totalCount}</span>
        </button>
      \`;

      for (const cat of state.data.categories) {
        const count = state.data.items.filter(i => i.categoryId === cat.id).length;
        const icon = getCategoryIcon(cat.id);
        tabsHtml += \`
          <button class="tab-btn \${state.currentCategory === cat.id ? 'active' : ''}" data-category="\${cat.id}">
            <span>\${icon} \${cat.name}</span>
            <span class="tab-badge">\${count}</span>
          </button>
        \`;
      }

      el.categoryTabs.innerHTML = tabsHtml;

      el.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-category');
          state.currentCategory = catId;
          state.currentSection = 'all';
          el.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderSubsections();
          applyFilters();
        });
      });

      renderSubsections();
    }

    function getItemTitle(item) {
      if (!item) return '教學成果典藏';
      const headline = (item.headline || '').trim();
      if (!headline || headline.toLowerCase() === 'empty' || headline === '無標題') {
        return \`\${item.sectionTitle || '教學成果'} · \${item.mediaType === 'image' ? '實體佐證相片' : item.mediaType === 'pdf' ? '成果文件檔案' : '典藏成果'}\`;
      }
      return headline;
    }

    function renderSubsections() {
      if (!el.subsectionsList || !state.data) return;

      let available = state.data.sections;
      if (state.currentCategory !== 'all') {
        available = state.data.sections.filter(s => s.categoryId === state.currentCategory);
      }

      if (available.length <= 1) {
        el.subsectionsWrapper.style.display = 'none';
        return;
      }

      el.subsectionsWrapper.style.display = 'block';

      let countTotal = state.currentCategory === 'all' ? state.data.items.length : state.data.items.filter(i => i.categoryId === state.currentCategory).length;
      let pillsHtml = \`
        <button class="sub-pill \${state.currentSection === 'all' ? 'active' : ''}" data-section="all">全部向度 (\${countTotal})</button>
      \`;

      for (const s of available) {
        const count = state.data.items.filter(i => i.sectionId == s.id).length;
        pillsHtml += \`
          <button class="sub-pill \${state.currentSection == s.id ? 'active' : ''}" data-section="\${s.id}">
            \${s.title} (\${count})
          </button>
        \`;
      }

      el.subsectionsList.innerHTML = pillsHtml;

      const toggleBtn = document.getElementById('subsectionsToggleBtn');
      if (toggleBtn) {
        const isExpanded = el.subsectionsList.classList.contains('is-expanded');
        toggleBtn.querySelector('.toggle-text').textContent = isExpanded ? '收合為單行' : \`展開全部向度 (\${available.length})\`;
        toggleBtn.classList.toggle('is-active', isExpanded);
      }

      el.subsectionsList.querySelectorAll('.sub-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const secId = pill.getAttribute('data-section');
          state.currentSection = secId;
          el.subsectionsList.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          applyFilters();
        });
      });
    }

    // Filters
    function applyFilters() {
      if (!state.data) return;
      let items = [...state.data.items];

      if (state.currentCategory !== 'all') {
        items = items.filter(i => i.categoryId === state.currentCategory);
      }
      if (state.currentSection !== 'all') {
        items = items.filter(i => i.sectionId == state.currentSection);
      }

      if (state.currentMediaType !== 'all') {
        if (state.currentMediaType === 'image') items = items.filter(i => i.mediaType === 'image');
        else if (state.currentMediaType === 'pdf') items = items.filter(i => i.mediaType === 'pdf');
        else if (state.currentMediaType === 'video') items = items.filter(i => i.mediaType === 'video');
        else if (state.currentMediaType === 'award') items = items.filter(i => isAwardItem(i));
        else if (state.currentMediaType === 'link') items = items.filter(i => i.externalUrl);
      }

      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim();
        items = items.filter(i => {
          const t = (i.headline || '').toLowerCase();
          const b = (i.body || '').toLowerCase();
          const s = (i.sectionTitle || '').toLowerCase();
          const c = (i.categoryName || '').toLowerCase();
          return t.includes(q) || b.includes(q) || s.includes(q) || c.includes(q);
        });
      }

      if (state.sortBy === 'newest') {
        items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (state.sortBy === 'oldest') {
        items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      } else if (state.sortBy === 'title') {
        items.sort((a, b) => (a.headline || '').localeCompare(b.headline || '', 'zh-Hant'));
      }

      state.filteredItems = items;
      renderResults();
    }

    function isAwardItem(item) {
      const text = (item.headline + ' ' + item.sectionTitle + ' ' + item.body).toLowerCase();
      return text.includes('第一') || text.includes('第三') || text.includes('金獎') || text.includes('首獎') || text.includes('特優') || text.includes('優等') || text.includes('佳作') || text.includes('殊榮') || text.includes('獲獎') || text.includes('錦標賽');
    }

    function renderResults() {
      if (!el.itemsContainer) return;

      if (el.resultsCount) {
        el.resultsCount.innerHTML = \`共找到 <b>\${state.filteredItems.length}</b> 筆典藏成果\`;
      }

      if (state.filteredItems.length === 0) {
        el.itemsContainer.innerHTML = \`
          <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main);">未找到相符的成果內容</h3>
            <p>請嘗試更換關鍵字、清除篩選條件或切換分類大項。</p>
            <button class="btn-outline" style="margin-top: 1.5rem;" onclick="window.clearAllFilters()">重設所有條件</button>
          </div>
        \`;
        return;
      }

      if (state.viewMode === 'grid') {
        el.itemsContainer.className = 'cards-grid';
        el.itemsContainer.innerHTML = state.filteredItems.map((item, index) => renderCard(item, index)).join('');
      } else {
        el.itemsContainer.className = 'cards-timeline';
        el.itemsContainer.innerHTML = state.filteredItems.map((item, index) => renderTimelineItem(item, index)).join('');
      }

      initLazyImages();

      el.itemsContainer.querySelectorAll('[data-index]').forEach(elem => {
        elem.addEventListener('click', (e) => {
          if (e.target.closest('.no-modal')) return;
          const idx = parseInt(elem.getAttribute('data-index'), 10);
          openModal(idx);
        });
      });
    }

    // Dynamic SVG Card Fallback Generator (720p HD)
    function getSvgFallback(catId, title) {
      const icon = getCategoryIcon(catId);
      const cleanTitle = (title || '教學成果').slice(0, 18).replace(/[<>&"']/g, '');
      const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="1280" height="720" fill="url(%23g)"/><circle cx="640" cy="290" r="95" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="4"/><text x="50%" y="315" dominant-baseline="middle" text-anchor="middle" font-size="88">\${icon}</text><text x="50%" y="475" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Noto Sans TC, sans-serif" font-size="38" font-weight="bold">\${cleanTitle}</text><text x="50%" y="555" dominant-baseline="middle" text-anchor="middle" fill="%23bfdbfe" font-family="Noto Sans TC, sans-serif" font-size="24">苗栗縣永貞國小 ‧ 徐秉鴻 老師 教學成果典藏</text></svg>\`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    // Global Safe Image Error Handler
    window.handleCardImgError = function(img, catId, title) {
      img.onerror = null;
      img.removeAttribute('data-src');
      img.src = getSvgFallback(catId, title);
    };

    // Lightweight SVG Placeholder for Memory-Safe Base64 Lazy Loading
    const cardPlaceholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9' width='16' height='9' fill='%231e293b'></svg>";

    // IntersectionObserver to prevent OOM browser tab crashes by decoding images on demand
    function initLazyImages() {
      if (!el.itemsContainer) return;
      const lazyImages = el.itemsContainer.querySelectorAll('img[data-src]');
      if (!lazyImages || lazyImages.length === 0) return;

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy-card-img');
              }
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '350px 0px' });

        lazyImages.forEach(img => observer.observe(img));
      } else {
        lazyImages.forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      }
    }

    // High-Definition YouTube Thumbnail Resolver (1080p Full HD / 720p HD)
    function getYouTubeThumbnail(ytid) {
      const maxResIds = ['4sjZ2LJjiaU', '-V-xJzRQ0Eg', 'T066-_Oiey4'];
      if (maxResIds.includes(ytid)) {
        return \`https://img.youtube.com/vi/\${ytid}/maxresdefault.jpg\`;
      }
      return \`https://img.youtube.com/vi/\${ytid}/hqdefault.jpg\`;
    }

    function renderCard(item, index) {
      const itemTitle = getItemTitle(item);
      const title = highlightKeyword(itemTitle);
      const snippet = highlightKeyword(cleanSnippet(item.body || ''));
      const isPinned = item.isPinned;
      const mediaBadge = getMediaBadge(item);
      const dateFormatted = formatDate(item.createdAt);
      const isAward = isAwardItem(item);
      const isTssci = (itemTitle + ' ' + (item.body || '')).includes('TSSCI');
      const ribbonHtml = isTssci
        ? '<div class="award-ribbon">📚 TSSCI 核心期刊</div>'
        : (isAward ? '<div class="award-ribbon">🏆 榮譽殊榮</div>' : '');

      let mediaHtml = '';
      const rawSrc = item.previewImage || item.fileUrl;
      const imgSrc = window.resolveAsset(rawSrc);
      const svgFallback = getSvgFallback(item.categoryId, item.sectionTitle);
      const safeSecTitle = escapeHtml(item.sectionTitle || item.categoryName);

      const makeCardImg = (src, alt) => {
        if (!src) return '';
        if (src.startsWith('data:image/svg+xml')) {
          return \`<img src="\${src}" alt="\${escapeHtml(alt)}" class="card-img" loading="lazy" referrerpolicy="no-referrer">\`;
        }
        return \`<img src="\${cardPlaceholderSvg}" data-src="\${src}" alt="\${escapeHtml(alt)}" class="card-img lazy-card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '\${item.categoryId}', '\${safeSecTitle}');">\`;
      };

      if (item.mediaType === 'image' && imgSrc) {
        mediaHtml = \`
          <div class="card-media">
            \${makeCardImg(imgSrc, itemTitle)}
            \${mediaBadge}
            \${ribbonHtml}
            \${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
          </div>
        \`;
      } else if (item.mediaType === 'pdf') {
        const rawCover = item.previewImage;
        const isImg = rawCover && !rawCover.toLowerCase().includes('.pdf');
        const coverSrc = isImg ? window.resolveAsset(rawCover) : '';
        mediaHtml = \`
          <div class="card-media">
            \${coverSrc ? makeCardImg(coverSrc, itemTitle) : makeCardImg(svgFallback, itemTitle)}
            \${mediaBadge}
            \${ribbonHtml}
            \${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
          </div>
        \`;
      } else if (item.mediaType === 'video') {
        const ytid = getYouTubeId(item.externalUrl);
        const resolvedThumb = window.resolveAsset(item.previewImage);
        const thumbUrl = (ytid ? getYouTubeThumbnail(ytid) : null) || resolvedThumb;
        mediaHtml = \`
          <div class="card-media">
            \${thumbUrl ? \`
              \${makeCardImg(thumbUrl, item.headline)}
              <div class="video-play-overlay">
                <div class="video-play-circle" title="點擊播放高畫質影音報導">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            \` : \`
              <div class="card-media-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                <span>影音受訪紀實</span>
              </div>
            \`}
            \${mediaBadge}
            \${ribbonHtml}
            \${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
          </div>
        \`;
      } else if (imgSrc) {
        mediaHtml = \`
          <div class="card-media">
            \${makeCardImg(imgSrc, itemTitle)}
            \${mediaBadge}
            \${ribbonHtml}
            \${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
          </div>
        \`;
      } else {
        mediaHtml = \`
          <div class="card-media">
            \${makeCardImg(svgFallback, itemTitle)}
            \${mediaBadge}
            \${ribbonHtml}
          </div>
        \`;
      }

      return \`
        <article class="portfolio-card \${isAward || isTssci ? 'is-award-winner' : ''}" data-index="\${index}" data-category="\${item.categoryId || ''}">
          \${mediaHtml}
          <div class="card-body">
            <div class="card-section-tag">\${escapeHtml(item.sectionTitle)}</div>
            <h3 class="card-title">\${title}</h3>
            \${snippet ? \`<p class="card-snippet">\${snippet}</p>\` : ''}
            <div class="card-footer">
              <span class="card-footer-meta">
                <span>📅 \${dateFormatted}</span>
                \${item.fileUrl ? '<span class="card-badge-local" title="已雲端同步">☁️ 雲端原件</span>' : ''}
              </span>
              <span class="card-action-btn">\${item.mediaType === 'pdf' ? '📄 預覽 PDF 文件 &rarr;' : '📄 預覽成果檔案 &rarr;'}</span>
            </div>
          </div>
        </article>
      \`;
    }

    function renderTimelineItem(item, index) {
      const itemTitle = getItemTitle(item);
      const rawThumb = item.previewImage || item.fileUrl;
      const thumbSrc = window.resolveAsset(rawThumb) || (item.mediaType === 'video' && getYouTubeId(item.externalUrl) ? getYouTubeThumbnail(getYouTubeId(item.externalUrl)) : getSvgFallback(item.categoryId, item.sectionTitle));
      const dateFormatted = formatDate(item.createdAt);

      const timelineImg = thumbSrc.startsWith('data:image/svg+xml')
        ? \`<img src="\${thumbSrc}" alt="" class="timeline-thumb" loading="lazy" referrerpolicy="no-referrer">\`
        : \`<img src="\${cardPlaceholderSvg}" data-src="\${thumbSrc}" alt="" class="timeline-thumb lazy-card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '\${item.categoryId}', '\${escapeHtml(item.sectionTitle || item.categoryName)}');">\`;

      return \`
        <div class="timeline-item" data-index="\${index}">
          \${timelineImg}
          <div class="timeline-content">
            <div class="timeline-meta">
              <span style="color: var(--primary); font-weight: 600;">[\${escapeHtml(item.sectionTitle)}]</span>
              <span>📅 \${dateFormatted}</span>
              <span>📂 \${escapeHtml(item.categoryName)}</span>
            </div>
            <h3 class="timeline-title">\${title}</h3>
          </div>
          <div>
            <button class="btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">\${item.mediaType === 'pdf' ? '📄 預覽 PDF' : '查看'}</button>
          </div>
        </div>
      \`;
    }

    // Modal Lightbox
    function openModal(index) {
      if (index < 0 || index >= state.filteredItems.length) return;
      state.currentModalIndex = index;
      state.imageZoom = 1;
      state.imageRotation = 0;

      const item = state.filteredItems[index];
      const itemTitle = getItemTitle(item);

      el.modalSectionBadge.textContent = \`\${item.categoryName} · \${item.sectionTitle}\`;
      el.modalTitle.textContent = itemTitle;

      let viewerContent = '';
      const isPdf = item.mediaType === 'pdf' || (item.fileName || '').toLowerCase().endsWith('.pdf') || (item.fileUrl || '').toLowerCase().includes('.pdf');

      if (isPdf) {
        const pdfSrc = item.fileUrl || '';
        viewerContent = \`
          <div class="pdf-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>📄 PDF 成果檔案預覽器</span>
              </div>
              <div class="pdf-toolbar-actions">
                \${pdfSrc ? \`<button class="pdf-toolbar-btn" onclick="window.togglePdfEngine('\${escapeHtml(pdfSrc)}', '\${escapeHtml(pdfSrc)}')" title="切換 Google 雲端預覽 / 原生預覽">🔄 切換預覽引擎</button>\` : ''}
                <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()" title="全螢幕閱讀">⛶ 全螢幕</button>
                <a href="\${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn">↗ 新分頁</a>
                <a href="\${pdfSrc}" download="\${item.fileName || 'document.pdf'}" class="pdf-toolbar-btn btn-accent">💾 下載 PDF</a>
              </div>
            </div>
            <iframe id="activePdfIframe" src="\${pdfSrc ? \`https://docs.google.com/viewer?url=\${encodeURIComponent(pdfSrc)}&embedded=true\` : ''}" class="modal-viewer-pdf" title="\${escapeHtml(item.headline)}" allowfullscreen></iframe>
          </div>
        \`;
      } else if (item.mediaType === 'image') {
        const rawSrc = item.previewImage || item.fileUrl;
        const imgSrc = window.resolveAsset(rawSrc);
        const svgFallback = getSvgFallback(item.categoryId, item.sectionTitle);
        viewerContent = \`
          <div class="photo-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title" style="color: #60a5fa;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>🖼️ 原版成果照片與官方佐證 · 檢視器</span>
              </div>
              <div class="pdf-toolbar-actions">
                <button class="pdf-toolbar-btn" onclick="window.printDocumentAsPdf()" title="格式化另存/列印為 A4 PDF 文件">🖨️ 另存/列印為 PDF</button>
                <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()" title="切換全螢幕檢視">⛶ 全螢幕</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)" title="放大">+</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)" title="縮小">-</button>
                <button class="pdf-toolbar-btn" onclick="window.setModalImgZoom(2.0)" title="以 200% 超高清晰度檢視文字細節">🔍 200%</button>
                <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()" title="旋轉">↻</button>
                <button class="pdf-toolbar-btn" onclick="window.resetModalImg()" title="還原">⟲</button>
                <a href="\${imgSrc}" download="\${item.fileName || 'image.jpg'}" class="pdf-toolbar-btn btn-accent" title="下載原圖">💾 下載原圖</a>
              </div>
            </div>
            <div class="photo-viewer-stage">
              <img src="\${imgSrc || svgFallback}" alt="\${escapeHtml(itemTitle)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '\${item.categoryId}', '\${escapeHtml(item.sectionTitle || item.categoryName)}');">
            </div>
          </div>
        \`;
      } else if (item.mediaType === 'video' && item.externalUrl) {
        const ytid = getYouTubeId(item.externalUrl);
        if (ytid) {
          viewerContent = \`
            <div class="video-viewer-wrapper">
              <div class="pdf-viewer-toolbar">
                <div class="pdf-toolbar-title" style="color: #f87171;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span>🎬 影音新聞與訪談報導 · 線上播放器</span>
                </div>
                <div class="pdf-toolbar-actions">
                  <a href="\${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn btn-accent" style="background: #dc2626; border-color: #dc2626;">
                    ↗ 在 YouTube 開啟
                  </a>
                </div>
              </div>
              <div class="video-aspect-box">
                <iframe class="video-iframe" src="https://www.youtube.com/embed/\${ytid}?rel=0&modestbranding=1&vq=hd1080&hd=1&playsinline=1" title="\${escapeHtml(itemTitle)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="origin-when-cross-origin"></iframe>
              </div>
              <div class="video-viewer-actions">
                <div style="font-size: 0.85rem; color: #94a3b8;">
                  📺 媒體報導專題 · 永貞國小教學紀實
                </div>
                <a href="\${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-youtube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  在 YouTube 觀看原頻道高畫質影片 ↗
                </a>
              </div>
            </div>
          \`;
        } else {
          viewerContent = \`
            <div class="card-media-placeholder" style="height: 380px;">
              <p>外部影音連結</p>
              <a href="\${item.externalUrl}" target="_blank" class="btn-primary" style="margin-top: 1rem;">前往觀看影音 &rarr;</a>
            </div>
          \`;
        }
      } else if (item.previewImage || item.fileUrl) {
        const rawSrc = item.previewImage || item.fileUrl;
        const imgSrc = window.resolveAsset(rawSrc);
        const svgFallback = getSvgFallback(item.categoryId, item.sectionTitle);
        viewerContent = \`
          <div class="photo-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title" style="color: #38bdf8;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>🌐 線上報導與專題成果 · 完整圖文原件</span>
              </div>
              <div class="pdf-toolbar-actions">
                \${item.externalUrl ? \`<a href="\${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn btn-accent" style="background: #0284c7; border-color: #0284c7;">↗ 前往原始報導網頁</a>\` : ''}
                <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)">+</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)">-</button>
                <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()">↻</button>
                <button class="pdf-toolbar-btn" onclick="window.resetModalImg()">⟲</button>
                <a href="\${imgSrc}" download="\${item.fileName || 'media_doc.jpg'}" class="pdf-toolbar-btn">💾 下載原圖</a>
              </div>
            </div>
            <div class="photo-viewer-stage">
              <img src="\${imgSrc || svgFallback}" alt="\${escapeHtml(itemTitle)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '\${item.categoryId}', '\${escapeHtml(item.sectionTitle || item.categoryName)}');">
            </div>
          </div>
        \`;
      } else {
        viewerContent = \`
          <div class="card-media-placeholder" style="height: 240px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; opacity: 0.4;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span style="margin-top: 0.5rem; font-weight: 500;">專案內容與文字紀實</span>
          </div>
        \`;
      }
      el.modalViewerContainer.innerHTML = viewerContent;
      if (item.mediaType === 'video') {
        let cleaned = (item.body || '').replace(/<p[^>]*>(?:(?!<\\/p>)[\\s\\S])*?(?:youtube\\.com|youtu\\.be)(?:(?!<\\/p>)[\\s\\S])*?<\\/p>/gi, '').trim();
        cleaned = cleaned.replace(/<p[^>]*>\\s*影片連結[：:]?\\s*<\\/p>/gi, '').trim();
        const textOnly = cleaned.replace(/<[^>]+>/g, '').trim();
        if (textOnly.length > 5) {
          el.modalBodyText.innerHTML = formatBodyHtml(cleaned);
          el.modalBodyText.parentElement.style.display = 'block';
        } else {
          el.modalBodyText.parentElement.style.display = 'none';
        }
      } else if (item.body && item.body.trim()) {
        el.modalBodyText.innerHTML = formatBodyHtml(item.body);
        el.modalBodyText.parentElement.style.display = 'block';
      } else {
        el.modalBodyText.parentElement.style.display = 'none';
      }

      el.modalMetaDate.textContent = \`發布時間：\${formatDate(item.createdAt)} · 所屬向度：\${item.sectionTitle}\`;

      if (item.fileUrl) {
        el.modalDownloadLink.style.display = 'inline-flex';
        el.modalDownloadLink.href = window.resolveAsset(item.fileUrl || item.previewImage);
        el.modalDownloadLink.innerHTML = \`☁️ 開啟雲端原件 (\${formatSize(item.fileSize)})\`;
      } else {
        el.modalDownloadLink.style.display = 'none';
      }

      if (item.externalUrl) {
        el.modalExternalLink.style.display = 'inline-flex';
        el.modalExternalLink.href = item.externalUrl;
      } else {
        el.modalExternalLink.style.display = 'none';
      }

      el.modalPrevBtn.disabled = index <= 0;
      el.modalNextBtn.disabled = index >= state.filteredItems.length - 1;

      el.modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      el.modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!el.modalBackdrop.classList.contains('open')) {
          el.modalViewerContainer.innerHTML = '';
        }
      }, 300);
    }

    window.openModal = openModal;
    window.closeModal = closeModal;

    function setupEventListeners() {
      // Search
      let debounceTimer;
      el.searchInput?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        state.searchQuery = e.target.value;
        if (el.searchClearBtn) el.searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
        debounceTimer = setTimeout(applyFilters, 200);
      });

      el.searchClearBtn?.addEventListener('click', () => {
        el.searchInput.value = '';
        state.searchQuery = '';
        el.searchClearBtn.style.display = 'none';
        applyFilters();
      });

      document.querySelectorAll('.quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-search');
          if (el.searchInput && q) {
            el.searchInput.value = q;
            state.searchQuery = q;
            if (el.searchClearBtn) el.searchClearBtn.style.display = 'block';
            applyFilters();
            document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Mobile drawer
      const mobileBtn = document.getElementById('mobileMenuBtn');
      const mobileNav = document.getElementById('mobileNavMenu');
      if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const shown = mobileNav.style.display === 'block';
          mobileNav.style.display = shown ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
          if (!mobileNav.contains(e.target) && e.target !== mobileBtn) {
            mobileNav.style.display = 'none';
          }
        });
      }
      window.closeMobileNav = () => { if (mobileNav) mobileNav.style.display = 'none'; };

      const toggleBtn = document.getElementById('subsectionsToggleBtn');
      if (toggleBtn && el.subsectionsList) {
        toggleBtn.addEventListener('click', () => {
          const isExpanded = el.subsectionsList.classList.toggle('is-expanded');
          toggleBtn.classList.toggle('is-active', isExpanded);
          toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
          const count = Math.max(1, el.subsectionsList.querySelectorAll('.sub-pill').length - 1);
          toggleBtn.querySelector('.toggle-text').textContent = isExpanded ? '收合為單行' : \`展開全部向度 (\${count})\`;
        });
      }

      el.mediaFilter?.addEventListener('change', (e) => {
        state.currentMediaType = e.target.value;
        applyFilters();
      });

      el.sortSelect?.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
      });

      el.viewGridBtn?.addEventListener('click', () => {
        state.viewMode = 'grid';
        el.viewGridBtn.classList.add('active');
        el.viewTimelineBtn.classList.remove('active');
        renderResults();
      });

      el.viewTimelineBtn?.addEventListener('click', () => {
        state.viewMode = 'timeline';
        el.viewTimelineBtn.classList.add('active');
        el.viewGridBtn.classList.remove('active');
        renderResults();
      });

      el.modalCloseBtn?.addEventListener('click', closeModal);
      el.modalBackdrop?.addEventListener('click', (e) => {
        if (e.target === el.modalBackdrop) closeModal();
      });

      el.modalPrevBtn?.addEventListener('click', () => {
        if (state.currentModalIndex > 0) openModal(state.currentModalIndex - 1);
      });

      el.modalNextBtn?.addEventListener('click', () => {
        if (state.currentModalIndex < state.filteredItems.length - 1) openModal(state.currentModalIndex + 1);
      });

      // Spotlight Modal handlers
      el.spModalCloseBtn?.addEventListener('click', closeSpotlightModal);
      el.spModalBottomCloseBtn?.addEventListener('click', closeSpotlightModal);
      el.spotlightModalBackdrop?.addEventListener('click', (e) => {
        if (e.target === el.spotlightModalBackdrop) closeSpotlightModal();
      });

      // Pillar Modal handlers & tabs
      el.pillarModalBackdrop?.querySelectorAll('.pillar-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.getAttribute('data-tab');
          el.pillarModalBackdrop.querySelectorAll('.pillar-tab-btn').forEach(b => b.classList.remove('active'));
          el.pillarModalBackdrop.querySelectorAll('.pillar-tab-panel').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const panel = document.getElementById('pillarTab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
          if (panel) panel.classList.add('active');
        });
      });
      el.pillarModalBackdrop?.addEventListener('click', (e) => {
        if (e.target === el.pillarModalBackdrop) window.closePillarModal();
      });

      // Keyboard
      window.addEventListener('keydown', (e) => {
        if (el.pillarModalBackdrop?.classList.contains('open')) {
          if (e.key === 'Escape') window.closePillarModal();
          return;
        }
        if (el.spotlightModalBackdrop?.classList.contains('open')) {
          if (e.key === 'Escape') closeSpotlightModal();
          return;
        }
        if (el.embedGuideModal?.classList.contains('open')) {
          if (e.key === 'Escape') window.closeEmbedGuide();
          return;
        }
        if (!el.modalBackdrop.classList.contains('open')) return;
        if (e.key === 'Escape') closeModal();
        else if (e.key === 'ArrowLeft') {
          if (state.currentModalIndex > 0) openModal(state.currentModalIndex - 1);
        } else if (e.key === 'ArrowRight') {
          if (state.currentModalIndex < state.filteredItems.length - 1) openModal(state.currentModalIndex + 1);
        }
      });

      // Back to top
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) el.backToTopBtn?.classList.add('visible');
        else el.backToTopBtn?.classList.remove('visible');
      });
      el.backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Mobile Touch gestures for modal
      let touchStartX = 0, touchStartY = 0;
      el.modalBackdrop?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      el.modalBackdrop?.addEventListener('touchend', (e) => {
        if (!el.modalBackdrop.classList.contains('open')) return;
        const diffX = e.changedTouches[0].screenX - touchStartX;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (diffY > 90 && Math.abs(diffY) > Math.abs(diffX) && touchStartY < 300) {
          closeModal();
          return;
        }
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0 && state.currentModalIndex > 0) openModal(state.currentModalIndex - 1);
          else if (diffX < 0 && state.currentModalIndex < state.filteredItems.length - 1) openModal(state.currentModalIndex + 1);
        }
      }, { passive: true });

      el.spotlightModalBackdrop?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      el.spotlightModalBackdrop?.addEventListener('touchend', (e) => {
        if (!el.spotlightModalBackdrop.classList.contains('open')) return;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (diffY > 100 && touchStartY < 250) closeSpotlightModal();
      }, { passive: true });
    }

    // Helper functions
    function getCategoryIcon(catId) {
      const icons = { profile: '👤', certifications: '📜', honors: '🏆', research: '🔬', engagement: '🌿', media: '🎙️', mentorship: '🎓', aesthetic_art: '🎨' };
      return icons[catId] || '📁';
    }

    function getMediaBadge(item) {
      const isPdf = item.mediaType === 'pdf' || (item.fileName || '').toLowerCase().endsWith('.pdf');
      if (isPdf) return '<span class="media-type-badge" style="background: #dc2626; color: white;">📄 PDF 成果檔案</span>';
      if (item.mediaType === 'image') return '<span class="media-type-badge" style="background: #2563eb; color: white;">🖼️ 成果相片／證書原件</span>';
      if (item.mediaType === 'video') return '<span class="media-type-badge" style="background: rgba(234, 88, 12, 0.9);">🎬 影音報導</span>';
      if (item.externalUrl) return '<span class="media-type-badge" style="background: rgba(14, 165, 233, 0.9);">🌐 外部專題</span>';
      return '<span class="media-type-badge">📝 文字記錄</span>';
    }

    function formatDate(isoStr) {
      if (!isoStr) return '';
      try {
        const d = new Date(isoStr);
        return \`\${d.getFullYear()}/\${String(d.getMonth() + 1).padStart(2, '0')}/\${String(d.getDate()).padStart(2, '0')}\`;
      } catch {
        return '';
      }
    }

    function formatSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    function cleanSnippet(htmlOrText) {
      if (!htmlOrText) return '';
      let text = htmlOrText;
      if (text.includes('<')) {
        const tmp = document.createElement('div');
        tmp.innerHTML = text;
        text = tmp.textContent || tmp.innerText || '';
      }
      try {
        if (text.includes('%')) {
          text = decodeURIComponent(text);
        }
      } catch (_) {}
      text = text.trim();
      if ((text.startsWith('http://') || text.startsWith('https://')) && text.length > 40) {
        return '官方競賽與教學成果報導佐證連結（點擊卡片開啟詳情）';
      }
      return text;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function highlightKeyword(text) {
      if (!state.searchQuery.trim()) return escapeHtml(text);
      const escaped = escapeHtml(text);
      const q = escapeRegExp(escapeHtml(state.searchQuery.trim()));
      const regex = new RegExp(\`(\${q})\`, 'gi');
      return escaped.replace(regex, '<mark class="highlight">$1</mark>');
    }

    function escapeRegExp(s) {
      return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
    }

    function formatBodyHtml(body) {
      let html = body.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      return html;
    }

    function getYouTubeId(url) {
      if (!url) return null;
      const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
      return match ? match[1] : null;
    }

    // Global APIs
    window.clearAllFilters = function () {
      state.currentCategory = 'all';
      state.currentSection = 'all';
      state.currentMediaType = 'all';
      state.searchQuery = '';
      if (el.searchInput) el.searchInput.value = '';
      if (el.mediaFilter) el.mediaFilter.value = 'all';
      renderCategoryTabs();
      applyFilters();
    };

    window.zoomModalImg = function (delta) {
      state.imageZoom = Math.max(0.5, Math.min(3, state.imageZoom + delta));
      applyImgTransform();
    };

    window.rotateModalImg = function () {
      state.imageRotation = (state.imageRotation + 90) % 360;
      applyImgTransform();
    };

    window.resetModalImg = function () {
      state.imageZoom = 1;
      state.imageRotation = 0;
      applyImgTransform();
    };

    function applyImgTransform() {
      const img = document.getElementById('modalActiveImg');
      if (img) img.style.transform = \`scale(\${state.imageZoom}) rotate(\${state.imageRotation}deg)\`;
    }

    // ==========================================
    // PDF Preview & Print Engine Helpers
    // ==========================================
    let currentPdfEngine = 'google';

    window.togglePdfEngine = function (pdfSrc, onlinePdfUrl) {
      const iframe = document.getElementById('activePdfIframe');
      if (!iframe) return;
      
      if (currentPdfEngine === 'google') {
        currentPdfEngine = 'native';
        iframe.src = (pdfSrc || '') + '#toolbar=1&navpanes=0';
      } else {
        currentPdfEngine = 'google';
        const targetUrl = onlinePdfUrl || pdfSrc || '';
        if (targetUrl) {
          iframe.src = \`https://docs.google.com/viewer?url=\${encodeURIComponent(targetUrl)}&embedded=true\`;
        }
      }
    };

    window.toggleModalFullscreen = function () {
      const dialog = document.querySelector('#modalBackdrop .modal-dialog');
      if (dialog) {
        dialog.classList.toggle('is-fullscreen');
      }
    };

    window.printDocumentAsPdf = function () {
      const item = state.filteredItems[state.currentModalIndex];
      if (!item) return;
      const title = item.headline || '教學成果檔案';
      const imgSrc = item.previewImage || item.fileUrl;
      window.printDirectAsPdf(title, imgSrc, item.categoryName, item.sectionTitle);
    };

    window.printDirectAsPdf = function (title, imgSrc, catName = '教學成果', secTitle = '專題佐證') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }
      printWindow.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>\${escapeHtml(title)} - 徐秉鴻老師教學成果檔案</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; margin: 0; padding: 15px; color: #0f172a; background: #fff; }
            .print-header { border-bottom: 2.5px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
            .print-title { font-size: 16pt; font-weight: 800; color: #1e3a8a; line-height: 1.2; }
            .print-sub { font-size: 9.5pt; color: #64748b; margin-top: 4px; font-weight: 600; }
            .print-meta-badge { font-size: 9pt; background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 700; }
            .print-item-title { font-size: 12pt; font-weight: 700; margin: 12px 0; color: #0f172a; }
            .print-img-box { text-align: center; margin: 12px 0; min-height: 180mm; display: flex; align-items: center; justify-content: center; }
            .print-img-box img { max-width: 100%; max-height: 215mm; object-fit: contain; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
            .print-footer { border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 12px; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div>
              <div class="print-title">苗栗縣頭份市永貞國民小學 · 教學成果與專業資歷典藏</div>
              <div class="print-sub">專任教師／閱讀推動教師：徐秉鴻 · 國立高雄師範大學科學教育博士班研究生</div>
            </div>
            <span class="print-meta-badge">\${escapeHtml(catName)} · \${escapeHtml(secTitle)}</span>
          </div>
          <div class="print-item-title">📄 成果文件：\${escapeHtml(title)}</div>
          <div class="print-img-box">
            <img src="\${imgSrc}" alt="\${escapeHtml(title)}" onload="setTimeout(() => window.print(), 350);">
          </div>
          <div class="print-footer">
            <span>本機原件數位封存 · 國立高雄師範大學博士班實踐研究成果</span>
            <span>列印/另存日期：\${new Date().toLocaleDateString('zh-TW')} · 永貞國小校本課程</span>
          </div>
        </body>
        </html>
      \`);
      printWindow.document.close();
    };

    window.previewSpotlightDoc = function (title, path, onlineUrl, explicitType) {
      const isPdf = explicitType === 'pdf' || (path || '').toLowerCase().endsWith('.pdf') || (onlineUrl || '').toLowerCase().includes('.pdf');
      
      el.modalSectionBadge.textContent = '🌟 5 大旗艦教學專題 · 相關佐證原件';
      el.modalTitle.textContent = title;
      
      let viewerContent = '';
      
      if (isPdf) {
        const isOnline = onlineUrl && (onlineUrl.startsWith('http://') || onlineUrl.startsWith('https://'));
        const pdfSrc = isOnline ? onlineUrl : path;
        const initialIframeSrc = isOnline 
          ? 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfSrc) + '&embedded=true' 
          : (pdfSrc + '#toolbar=1&navpanes=0');

        viewerContent = \`
          <div class="pdf-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>📄 PDF 成果檔案預覽器</span>
              </div>
              <div class="pdf-toolbar-actions">
                \${isOnline ? \`<button class="pdf-toolbar-btn" onclick="window.togglePdfEngine('\${escapeHtml(pdfSrc)}', '\${escapeHtml(pdfSrc)}')" title="切換 Google 雲端預覽 / 原生預覽">🔄 切換預覽引擎</button>\` : ''}
                <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
                <a href="\${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn">↗ 新分頁</a>
                <a href="\${pdfSrc}" download="\${escapeHtml(title)}.pdf" class="pdf-toolbar-btn btn-accent">💾 下載 PDF</a>
              </div>
            </div>
            <iframe id="activePdfIframe" src="\${initialIframeSrc}" class="modal-viewer-pdf" title="\${escapeHtml(title)}" allowfullscreen></iframe>
          </div>
        \`;
      } else {
        const imgSrc = (path && path.startsWith('data:')) ? path : window.resolveAsset(onlineUrl || path);
        viewerContent = \`
          <div class="photo-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title" style="color: #60a5fa;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>🖼️ 成果佐證公文／得獎證照 · 高畫質檢視</span>
              </div>
              <div class="pdf-toolbar-actions">
                <button class="pdf-toolbar-btn" onclick="window.printDirectAsPdf('\${escapeHtml(title)}', '\${imgSrc}', '5大旗艦專題', '教學紀錄')">🖨️ 另存/列印為 PDF</button>
                <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)">+</button>
                <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)">-</button>
                <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()">↻</button>
                <button class="pdf-toolbar-btn" onclick="window.resetModalImg()">⟲</button>
                <a href="\${imgSrc}" download="\${escapeHtml(title)}.jpg" class="pdf-toolbar-btn btn-accent">💾 下載佐證原件</a>
              </div>
            </div>
            <div class="photo-viewer-stage">
              <img src="\${imgSrc}" alt="\${escapeHtml(title)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer">
            </div>
          </div>
        \`;
      }
      
      el.modalViewerContainer.innerHTML = viewerContent;
      el.modalBodyText.parentElement.style.display = 'none';
      el.modalMetaDate.textContent = \`專題佐證文件：\${title}\`;
      el.modalDownloadLink.style.display = 'inline-flex';
      el.modalDownloadLink.href = (path && path.startsWith('data:')) ? path : window.resolveAsset(onlineUrl || path);
      el.modalDownloadLink.setAttribute('download', title);
      el.modalDownloadLink.innerHTML = \`💾 下載佐證原件\`;
      el.modalExternalLink.style.display = 'none';
      el.modalPrevBtn.disabled = true;
      el.modalNextBtn.disabled = true;
      
      el.modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    // Embed Guide Modal
    window.openEmbedGuide = function () {
      if (el.embedGuideModal) el.embedGuideModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    window.closeEmbedGuide = function () {
      if (el.embedGuideModal) el.embedGuideModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    window.copyIframeCode = function () {
      const code = document.getElementById('iframeSnippetCode')?.textContent;
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          alert('✅ 已成功複製 iframe 嵌入程式碼至剪貼簿！');
        }).catch(() => {
          alert('請直接手動選取文字並按 Ctrl+C 複製');
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  </script>
</body>
</html>
`;

fs.writeFileSync('google-sites-embed.html', htmlContent, 'utf8');
const stat = fs.statSync('google-sites-embed.html');
console.log(`Generated google-sites-embed.html successfully!`);
console.log(`File size: ${(stat.size / 1024).toFixed(1)} KB (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);

/**
 * 徐秉鴻老師 教學成果與「2026 台灣傑出永續教育人物」數位典藏網 - 互動應用程式邏輯
 * Four Teaching Pillars, Sustainability Award Interactive Showcase (5 Dimensions + 99 Evidences + 93 SDGs Albums),
 * 6 Flagship STREAM Spotlights (Bento 2.0), 1,140-Item Multi-filter Catalog, Lightbox Modal with Filmstrip & PDF Reader
 */

(function () {
  'use strict';

  // State Management
  const state = {
    data: null,
    currentCategory: 'all',
    currentSection: 'all',
    currentMediaType: 'all',
    searchQuery: '',
    sortBy: 'default',
    viewMode: 'grid', // 'grid' | 'timeline'
    currentModalIndex: -1,
    filteredItems: [],
    renderLimit: 48,
    imageZoom: 1,
    imageRotation: 0
  };

  // Sustainability Showcase Interactive State
  const saState = {
    data: null,
    mode: 'dimensions', // 'dimensions' | 'albums' | 'report' | 'documents'
    activeDim: 1,       // 1..5 or 0 for all
    activeTheme: 'all', // 'all' | 'theme-01'..'theme-05'
    activeSdg: 'all',   // 'all' | 'SDG 4' etc.
    albumSearch: '',
    albumLimit: 24,
    activePortraitIdx: 0
  };

  // DOM Elements cache
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
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    resultsCount: document.getElementById('resultsCount'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalSectionBadge: document.getElementById('modalSectionBadge'),
    modalTitle: document.getElementById('modalTitle'),
    modalViewerContainer: document.getElementById('modalViewerContainer'),
    modalBodyText: document.getElementById('modalBodyText'),
    modalFilmstrip: document.getElementById('modalFilmstrip'),
    modalMetaDate: document.getElementById('modalMetaDate'),
    modalDownloadLink: document.getElementById('modalDownloadLink'),
    modalExternalLink: document.getElementById('modalExternalLink'),
    modalPrevBtn: document.getElementById('modalPrevBtn'),
    modalNextBtn: document.getElementById('modalNextBtn'),
    backToTopBtn: document.getElementById('backToTopBtn'),
    printBtn: document.getElementById('printBtn'),
    // Spotlight Elements
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
    spModalOverview: document.getElementById('spModalOverview'),
    spModalSdgs: document.getElementById('spModalSdgs'),
    spModalModules: document.getElementById('spModalModules'),
    spModalGallery: document.getElementById('spModalGallery'),
    spModalDocs: document.getElementById('spModalDocs'),
    spModalDocsWrapper: document.getElementById('spModalDocsWrapper'),
    spModalExternalSiteWrapper: document.getElementById('spModalExternalSiteWrapper'),
    // Four Pillars Elements
    teachingPillarsGrid: document.getElementById('teachingPillarsGrid'),
    pillarModalBackdrop: document.getElementById('pillarModalBackdrop'),
    // Sustainability Showcase Elements
    saExecutiveBanner: document.getElementById('saExecutiveBanner'),
    saSdgFilterBar: document.getElementById('saSdgFilterBar'),
    saResetSdgBtn: document.getElementById('saResetSdgBtn'),
    saModeTabs: document.getElementById('saModeTabs'),
    saPanelsContainer: document.getElementById('saPanelsContainer')
  };

  // 1. Initialize
  async function init() {
    initTheme();
    setupEventListeners();

    if (window.SUSTAINABILITY_AWARD) {
      saState.data = window.SUSTAINABILITY_AWARD;
    } else {
      try {
        const resSa = await fetch('data/sustainability_award.json');
        if (resSa.ok) saState.data = await resSa.json();
      } catch (_) {}
    }

    if (window.PORTFOLIO_DATA) {
      state.data = window.PORTFOLIO_DATA;
      renderApp();
    } else {
      try {
        const res = await fetch('data/portfolio_data.json');
        if (res.ok) {
          state.data = await res.json();
          renderApp();
        } else {
          showError('無法載入成果資料庫，請檢查 data/portfolio_data.json。');
        }
      } catch (err) {
        showError('載入失敗：' + err.message);
      }
    }
  }

  // 2. Theme handling (Safe for Google Sites sandboxed iframes)
  function safeGetStorage(key) {
    try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch (_) { return null; }
  }
  function safeSetStorage(key, val) {
    try { if (window.localStorage) window.localStorage.setItem(key, val); } catch (_) {}
  }

  function initTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = safeGetStorage('theme') || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    el.themeToggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      safeSetStorage('theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!el.themeToggleBtn) return;
    el.themeToggleBtn.innerHTML = theme === 'dark'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // 3. Render Application UI
  function renderApp() {
    renderTeachingPillars();
    renderSustainabilityShowcase();
    renderSpotlights();
    renderCategoryTabs();
    applyFilters();
  }

  // ==========================================================================
  // 3A. Render Four Signature Teaching Pillars (永續教育、跨域美感、閱讀推動、小教實習)
  // ==========================================================================
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
      const statsHtml = (p.stats || []).slice(0, 3).map(s => `
        <div class="pillar-stat-box">
          <span class="pillar-stat-val">${escapeHtml(s.value)}</span>
          <span class="pillar-stat-lbl">${escapeHtml(s.label)}</span>
        </div>
      `).join('');

      const highlightsHtml = (p.highlights || []).slice(0, 4).map(h => `
        <li class="pillar-highlight-item">
          <span class="pillar-highlight-icon-box">${h.icon}</span>
          <div><strong>${escapeHtml(h.title)}：</strong>${escapeHtml(h.desc.slice(0, 52))}...</div>
        </li>
      `).join('');

      return `
        <article class="pillar-card" data-pillar="${p.id}">
          <div class="pillar-top-accent" style="${p.id === 'sustainability' ? 'background: linear-gradient(90deg, #059669, #10b981, #d97706);' : ''}"></div>
          <div class="pillar-banner">
            <img src="${p.heroImage}" alt="${escapeHtml(p.title)}" class="pillar-img" referrerpolicy="no-referrer" onerror="this.src='downloads/site_assets/avatar.jpg'">
            <div class="pillar-banner-gradient-mask"></div>
            <div class="pillar-badge-overlay">${icon} ${escapeHtml(p.badge)}</div>
            <div class="pillar-tag-overlay">${escapeHtml(p.period)}</div>
          </div>
          <div class="pillar-body">
            <div class="pillar-title-row">
              <span class="pillar-title-icon">${icon}</span>
              <h3 class="pillar-title">${escapeHtml(p.title)}</h3>
            </div>
            <p class="pillar-subtitle">${escapeHtml(p.subtitle)}</p>
            
            <div class="pillar-stats-grid">
              ${statsHtml}
            </div>

            <ul class="pillar-highlights-list">
              ${highlightsHtml}
            </ul>

            <div class="pillar-footer">
              <button class="pillar-btn pillar-btn-primary" onclick="window.openPillarModal('${p.id}')">深入專區實錄 🔍</button>
              <button class="pillar-btn pillar-btn-outline" onclick="window.filterByPillarKeyword('${p.id}')">定位佐證檔案 🗂️</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  window.openPillarModal = function(pillarId) {
    const p = (window.THREE_PILLARS || []).find(item => item.id === pillarId);
    if (!p || !el.pillarModalBackdrop) return;

    const accentMap = { sustainability: '#059669', practicum: '#2563eb', aesthetic: '#7c3aed', reading: '#059669' };
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
    tabOverview.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 0.5rem;">🌟 ${escapeHtml(p.subtitle)}</h3>
        <p style="font-size: 0.92rem; color: var(--text-main); line-height: 1.65;"><strong>職責：</strong>${escapeHtml(p.role)}<br><strong>指導／合作陣容：</strong>${escapeHtml(p.mentors)}</p>
        ${p.summary ? `<p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 10px; border-left: 4px solid ${accentColor}; margin-top: 0.75rem;">${escapeHtml(p.summary)}</p>` : ''}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
        ${(p.highlights || []).map(h => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem;">
              <span style="font-size: 1.15rem;">${h.icon}</span>
              <strong style="font-size: 0.92rem; color: var(--text-main);">${escapeHtml(h.title)}</strong>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.55; margin: 0;">${escapeHtml(h.desc)}</p>
          </div>
        `).join('')}
      </div>
    `;

    // Populate Tab 2: Trials / Dimensions / Papers
    const tabTrials = document.getElementById('pillarTabTrials');
    if (p.dimensions) {
      tabTrials.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h4 style="font-size: 1.05rem; color: #059669; margin: 0;">🌍 2026 台灣傑出永續教育人物獎・五大評選構面（共 99 項佐證）</h4>
          ${p.dimensions.map(d => `
            <div style="background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 10px; border-left: 4px solid #059669;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.35rem;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">${escapeHtml(d.name)}</strong>
                <span style="font-size: 0.76rem; font-weight: 700; color: #059669; background: rgba(5,150,105,0.12); padding: 0.15rem 0.55rem; border-radius: 999px;">${escapeHtml(d.focus)}</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin: 0;">${escapeHtml(d.desc)}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (p.trials) {
      tabTrials.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📐 國小數學領域公開觀課試教演示</h4>
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
              ${p.trials.math.map(m => `<li style="background: var(--bg-surface); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.88rem;">${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h4 style="font-size: 1.05rem; color: #10b981; margin-bottom: 0.75rem;">📚 國語文領域公開觀課試教演示</h4>
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
              ${p.trials.mandarin.map(m => `<li style="background: var(--bg-surface); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border-left: 3px solid #10b981; font-size: 0.88rem;">${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    } else if (p.papers) {
      tabTrials.innerHTML = `
        <div>
          <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📚 閱讀推動與適性教學研討會論文發表</h4>
          <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem;">
            ${p.papers.map(pp => `<li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.9rem;">${escapeHtml(pp)}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      tabTrials.innerHTML = `
        <div>
          <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">🎨 跨領域美感四大核心展廳規劃</h4>
          <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem;">
            <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #6366f1; font-size: 0.9rem;"><strong>PART 1 星際自畫像：</strong>幾何比例 × 五官對稱 × 空間心理投射</li>
            <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #38bdf8; font-size: 0.9rem;"><strong>PART 2 星際導航格點：</strong>直角坐標幾何 × 向量構圖 × 口語表達發表</li>
            <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #f59e0b; font-size: 0.9rem;"><strong>PART 3 幾何對稱與形變：</strong>埃舍爾鑲嵌藝術（Tessellation）× 數學平移與旋轉</li>
            <li style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid #10b981; font-size: 0.9rem;"><strong>PART 4 母星印象與空間構築：</strong>正四面體風箏幾何、點線面立體摺紙與建築美學</li>
          </ul>
        </div>
      `;
    }

    // Populate Tab 3: Gallery
    const tabGallery = document.getElementById('pillarTabGallery');
    tabGallery.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0.85rem;">
        ${(p.gallery || []).map(g => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; cursor: pointer;" onclick="window.previewSpotlightDoc('${escapeHtml(g.caption)}', '${g.url}', '${g.url}', 'image')">
            <img src="${g.url}" alt="${escapeHtml(g.caption)}" style="width: 100%; height: 160px; object-fit: cover;" referrerpolicy="no-referrer">
            <div style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(g.caption)}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Populate Tab 4: Meta & Official Documents
    const tabMeta = document.getElementById('pillarTabMeta');
    const docsHtml = (p.documents || []).length > 0 ? `
      <div style="margin-top: 1.15rem;">
        <h4 style="font-size: 1rem; color: #059669; margin-bottom: 0.65rem;">📑 官方送審表單與百項佐證專冊 PDF</h4>
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${p.documents.map(d => `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">📄 ${escapeHtml(d.title)}</span>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-primary" style="padding: 0.35rem 0.8rem; font-size: 0.78rem;" onclick="window.previewSpotlightDoc('${escapeHtml(d.title)}', '${d.path}', '', 'pdf')">線上預覽</button>
                <a href="${d.path}" download class="btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.78rem;">下載 PDF</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    tabMeta.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
        <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 0.75rem;">📋 專區專業資歷與指導認證</h4>
        <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>實習／任教機構：</strong>${escapeHtml(p.school)}</p>
        <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>擔任職責：</strong>${escapeHtml(p.role)}</p>
        <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>指導師長／推薦人：</strong>${escapeHtml(p.mentors)}</p>
        <p style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;"><strong>推動期程：</strong>${escapeHtml(p.period)}</p>
        ${docsHtml}
      </div>
    `;

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
    if (pillarId === 'sustainability') {
      state.currentCategory = 'sustainability_sdgs';
      state.currentSection = 'all';
      state.searchQuery = '';
      if (el.searchInput) el.searchInput.value = '';
      renderCategoryTabs();
      applyFilters();
      document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (pillarId === 'aesthetic') {
      state.currentCategory = 'aesthetic_art';
      state.currentSection = 'all';
      state.searchQuery = '';
      if (el.searchInput) el.searchInput.value = '';
      renderCategoryTabs();
      applyFilters();
      document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const kwMap = {
      practicum: '實習',
      reading: '閱讀'
    };
    const kw = kwMap[pillarId] || '';
    if (el.searchInput && kw) {
      state.currentCategory = 'all';
      state.currentSection = 'all';
      el.searchInput.value = kw;
      state.searchQuery = kw;
      renderCategoryTabs();
      applyFilters();
    }
    document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ==========================================================================
  // 3B. Render 2026 Taiwan Outstanding Sustainability Educator Award Showcase
  // ==========================================================================
  function renderSustainabilityShowcase() {
    const sa = saState.data;
    if (!sa || !el.saPanelsContainer) return;

    renderSaExecutiveBanner(sa);
    renderSaSdgMatrix(sa);
    renderSaActivePanel(sa);

    // Mode tab switching
    if (el.saModeTabs && !el.saModeTabs.dataset.bound) {
      el.saModeTabs.dataset.bound = 'true';
      el.saModeTabs.querySelectorAll('.sa-mode-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-sa-mode');
          saState.mode = mode;
          el.saModeTabs.querySelectorAll('.sa-mode-tab').forEach(b => {
            const active = b.getAttribute('data-sa-mode') === mode;
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
          });
          renderSaActivePanel(saState.data);
        });
      });
    }
  }

  function renderSaExecutiveBanner(sa) {
    if (!el.saExecutiveBanner) return;
    const info = sa.awardInfo || {};
    const pObj = info.portraits || {};
    const portraits = [
      { path: pObj.suit || 'downloads/sustainability_award/portrait_suit.jpg', title: '徐秉鴻老師｜STEM 科學探究與跨域教育實踐現場（個人封面形象照）' },
      { path: pObj.teaching || 'downloads/sustainability_award/portrait_teaching.jpg', title: '候選人教學實況照（帶領學童進行 STREAM 跨域實作）' },
      { path: pObj.award || 'downloads/sustainability_award/portrait_award.jpg', title: '候選人獲獎榮耀照（全國科學探究競賽金獎頒獎典禮）' },
      { path: pObj.id || 'downloads/sustainability_award/portrait_id.jpg', title: '候選人科普走讀照（帶領學童參與國科會臺灣科普環島列車）' }
    ];
    const activePhoto = portraits[saState.activePortraitIdx] || portraits[0];

    el.saExecutiveBanner.innerHTML = `
      <div class="sa-exec-portrait-col">
        <img src="${activePhoto.path}" alt="${escapeHtml(activePhoto.title)}" class="sa-exec-main-photo" id="saExecMainPhoto" onclick="window.previewSpotlightDoc('${escapeHtml(activePhoto.title)}', '${activePhoto.path}', '', 'image')" title="點擊放大檢視高畫質教學與獲獎紀實照">
        <div class="sa-exec-thumbs">
          ${portraits.map((pt, idx) => `
            <img src="${pt.path}" alt="${escapeHtml(pt.title)}" class="sa-exec-thumb ${idx === saState.activePortraitIdx ? 'active' : ''}" onclick="window.switchSaPortrait(${idx})" title="${escapeHtml(pt.title)}">
          `).join('')}
        </div>
      </div>

      <div class="sa-exec-info-col">
        <div>
          <div class="sa-exec-badge-row" style="margin-bottom: 0.75rem;">
            <span class="sa-exec-pill">🏆 ${escapeHtml(info.title || '2026 台灣傑出永續教育人物獎')}（${escapeHtml(info.category || '國民小學組')}）</span>
            <span class="sa-exec-pill gold">📜 環境教育人員認證：(112)環署訓證字第EP106004號</span>
            <span class="sa-exec-pill">📊 五大構面 99 項佐證 × 93 場活動相簿 (823 檔)</span>
          </div>

          <div class="sa-exec-quote-box" style="margin-bottom: 0.85rem;">
            <div class="sa-exec-quote-title">
              <span>🌱 永續教育理念及自我期許（附件三 300 字核心自述）</span>
            </div>
            <p class="sa-exec-quote-text">${escapeHtml(info.philosophySummary || '')}</p>
          </div>

          <div class="sa-exec-principal-box">
            <strong>🏫 推薦單位（${escapeHtml(info.recommender || '苗栗縣頭份市永貞國民小學・鍾瑞蓉 校長推薦')}）推薦理由摘錄：</strong><br>
            「${escapeHtml(info.recommendationReason || '')}」
          </div>
        </div>

        <div class="sa-exec-actions">
          <a href="special-sustainability.html" class="btn-primary" style="background: linear-gradient(135deg, #059669, #0d9488); border: none; font-size: 0.85rem; padding: 0.55rem 1.1rem;">
            🏅 開啟傑出永續教育人物獨立專頁 ↗
          </a>
          <button class="btn-outline" style="font-size: 0.84rem; padding: 0.5rem 0.95rem; border-color: rgba(5,150,105,0.45); color: var(--sust-emerald); font-weight: 700;" onclick="window.previewSpotlightDoc('附件三：永續教育成果報告（微調契合版）', 'downloads/sustainability_award/03_附件三_永續教育成果報告_徐秉鴻_微調契合版.pdf', '', 'pdf')">
            📕 預覽附件三：5,000字成果報告 PDF
          </button>
          <button class="btn-outline" style="font-size: 0.84rem; padding: 0.5rem 0.95rem; border-color: rgba(217,119,6,0.45); color: var(--sust-gold); font-weight: 700;" onclick="window.previewSpotlightDoc('附件四：推薦報名佐證資料（百項佐證專冊）', 'downloads/sustainability_award/04_推薦報名_佐證資料_徐秉鴻_百項佐證專冊.pdf', '', 'pdf')">
            📗 預覽附件四：99項佐證專冊 PDF
          </button>
          <button class="btn-outline" style="font-size: 0.84rem; padding: 0.5rem 0.95rem;" onclick="window.filterByPillarKeyword('sustainability')">
            🗂️ 檢索典藏庫 927 筆永續檔案 &rarr;
          </button>
        </div>
      </div>
    `;
  }

  window.switchSaPortrait = function(idx) {
    saState.activePortraitIdx = idx;
    if (saState.data) renderSaExecutiveBanner(saState.data);
  };

  function renderSaSdgMatrix(sa) {
    if (!el.saSdgFilterBar) return;
    const sdgs = (sa.sdgsList || []).filter(s => s.totalCount > 0);
    const allEvidences = (sa.dimensions || []).flatMap(d => d.evidenceItems || []);
    const allAlbums = sa.sdgsAlbums || [];

    if (el.saResetSdgBtn) {
      el.saResetSdgBtn.style.display = saState.activeSdg === 'all' ? 'none' : 'inline-flex';
    }

    let html = `
      <button class="sa-sdg-chip ${saState.activeSdg === 'all' ? 'active' : ''}" style="--sdg-color: #059669;" onclick="window.setSustainabilitySdgFilter('all')">
        <span class="sdg-dot"></span>
        <span>🌍 全部永續指標</span>
        <span class="sdg-count">${allEvidences.length}佐證 / ${allAlbums.length}相簿</span>
      </button>
    `;

    for (const sdg of sdgs) {
      const isActive = saState.activeSdg === sdg.code;
      html += `
        <button class="sa-sdg-chip ${isActive ? 'active' : ''}" style="--sdg-color: ${sdg.color};" onclick="window.setSustainabilitySdgFilter('${sdg.code}')" title="${escapeHtml(sdg.desc || '')}">
          <span class="sdg-dot"></span>
          <span>${escapeHtml(sdg.code)} ${escapeHtml(sdg.title)}</span>
          <span class="sdg-count">${sdg.totalCount}</span>
        </button>
      `;
    }

    el.saSdgFilterBar.innerHTML = html;
  }

  window.setSustainabilitySdgFilter = function(sdgCode) {
    saState.activeSdg = sdgCode;
    saState.albumLimit = 24;
    if (saState.data) {
      renderSaSdgMatrix(saState.data);
      renderSaActivePanel(saState.data);
    }
  };

  // Convert 【佐證 1-01】 or paragraph object { heading, text, refs } into clickable buttons
  function linkifyEvidenceCodes(item) {
    if (!item) return '';
    if (typeof item === 'object') {
      const headingHtml = item.heading ? `<strong style="color: var(--text-main);">${escapeHtml(item.heading)}：</strong>` : '';
      const textHtml = escapeHtml(item.text || '');
      const refsHtml = Array.isArray(item.refs) && item.refs.length > 0
        ? ' ' + item.refs.map(code => `<button type="button" class="sa-evidence-pill" onclick="window.openEvidenceByCode('${escapeHtml(code)}')" title="點擊開啟燈箱檢視【佐證 ${escapeHtml(code)}】高畫質原圖">📌 佐證 ${escapeHtml(code)}</button>`).join(' ')
        : '';
      return headingHtml + textHtml + refsHtml;
    }
    const escaped = escapeHtml(item);
    return escaped.replace(/【佐證\s*([^】]+)】/g, (fullMatch, inner) => {
      const codes = inner.match(/\d+-\d+/g) || [];
      if (codes.length === 0) return fullMatch;
      const firstCode = codes[0];
      return `<button type="button" class="sa-evidence-pill" onclick="window.openEvidenceByCode('${firstCode}')" title="點擊開啟燈箱檢視【佐證 ${inner.trim()}】高畫質原圖">📌 佐證 ${inner.trim()}</button>`;
    });
  }

  function renderSaActivePanel(sa) {
    if (!el.saPanelsContainer || !sa) return;

    if (saState.mode === 'dimensions') {
      renderSaDimensionsPanel(sa);
    } else if (saState.mode === 'albums') {
      renderSaAlbumsPanel(sa);
    } else if (saState.mode === 'report') {
      renderSaReportPanel(sa);
    } else if (saState.mode === 'documents') {
      renderSaDocumentsPanel(sa);
    }
  }

  // Mode 1: 5 Evaluation Dimensions & 99 Official Evidences
  function renderSaDimensionsPanel(sa) {
    const dims = sa.dimensions || [];
    const activeDimObj = dims.find((_, idx) => (idx + 1) === saState.activeDim) || null;

    let evidences = activeDimObj
      ? [...(activeDimObj.evidenceItems || [])]
      : dims.flatMap(d => d.evidenceItems || []);

    if (saState.activeSdg !== 'all') {
      evidences = evidences.filter(e => (e.sdgs || []).includes(saState.activeSdg));
    }

    const subtabsHtml = `
      <div class="sa-dim-subtabs">
        ${dims.map((d, idx) => {
          const dimNum = idx + 1;
          const cnt = saState.activeSdg === 'all'
            ? d.evidenceCount
            : (d.evidenceItems || []).filter(e => (e.sdgs || []).includes(saState.activeSdg)).length;
          return `
            <button class="sa-dim-subtab ${saState.activeDim === dimNum ? 'active' : ''}" style="--dim-color: ${d.color};" onclick="window.selectSaDimension(${dimNum})">
              <span>${d.icon} ${escapeHtml(d.num)}：${escapeHtml(d.shortTitle)}</span>
              <span style="font-size: 0.75rem; opacity: 0.9;">(${cnt}項)</span>
            </button>
          `;
        }).join('')}
        <button class="sa-dim-subtab ${saState.activeDim === 0 ? 'active' : ''}" style="--dim-color: #0f766e;" onclick="window.selectSaDimension(0)">
          <span>🌟 全部五構面佐證總覽</span>
          <span style="font-size: 0.75rem; opacity: 0.9;">(${dims.reduce((acc, d) => acc + (saState.activeSdg === 'all' ? d.evidenceCount : (d.evidenceItems || []).filter(e => (e.sdgs || []).includes(saState.activeSdg)).length), 0)}項)</span>
        </button>
      </div>
    `;

    const activeDimSdgs = activeDimObj
      ? [...new Set((activeDimObj.evidenceItems || []).flatMap(e => e.sdgs || []))]
      : [];

    const summaryHtml = activeDimObj ? `
      <div class="sa-dim-summary-card" style="--dim-color: ${activeDimObj.color};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 800; color: ${activeDimObj.color}; margin-bottom: 0.25rem;">
              ${activeDimObj.icon} 2026 台灣傑出永續教育人物獎 · ${escapeHtml(activeDimObj.num)}（共 ${activeDimObj.evidenceCount} 項官方佐證）
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 900; color: var(--text-main); margin: 0;">
              ${escapeHtml(activeDimObj.title)} — <span style="color: ${activeDimObj.color};">${escapeHtml(activeDimObj.subtitle)}</span>
            </h3>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            ${activeDimSdgs.map(code => `
              <span class="sa-exec-pill" style="cursor: pointer;" onclick="window.setSustainabilitySdgFilter('${code}')">🎯 ${escapeHtml(code)}</span>
            `).join('')}
          </div>
        </div>
      </div>
    ` : `
      <div class="sa-dim-summary-card" style="--dim-color: #059669;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.35rem;">
          🌟 五大評選構面 99 項官方送審佐證全集（佐證 1-01 ～ 佐證 5-25）
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">
          以下完整呈現《04. 推薦報名-佐證資料-徐秉鴻》專冊內嵌之 99 項高解析度佐證圖檔與說明。點擊任一卡片即可開啟燈箱放大檢視並左右連播。
        </p>
      </div>
    `;

    const gridHtml = evidences.length > 0 ? `
      <div class="sa-evidence-grid">
        ${evidences.map(ev => `
          <article class="sa-evidence-card" onclick="window.openEvidenceByCode('${ev.code}')">
            <div class="sa-ev-img-wrap">
              <img src="${ev.localFile}" alt="【佐證 ${escapeHtml(ev.code)}】${escapeHtml(ev.title)}" loading="lazy" onerror="this.src='downloads/site_assets/avatar.jpg'">
              <span class="sa-ev-code-badge">📌 佐證 ${escapeHtml(ev.code)}</span>
            </div>
            <div class="sa-ev-body">
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                ${(ev.sdgs || []).map(s => `<span style="font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 4px; background: rgba(5,150,105,0.1); color: var(--sust-emerald);">${escapeHtml(s)}</span>`).join('')}
              </div>
              <div class="sa-ev-title">${escapeHtml(ev.title)}</div>
              <div class="sa-ev-desc">${escapeHtml(ev.description)}</div>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border-radius: 16px;">
        此構面目前無符合 <b>${escapeHtml(saState.activeSdg)}</b> 的佐證項目，請切換其他構面或點選「全部永續指標」。
      </div>
    `;

    el.saPanelsContainer.innerHTML = subtabsHtml + summaryHtml + gridHtml;
  }

  window.selectSaDimension = function(dimNum) {
    saState.activeDim = dimNum;
    if (saState.data) renderSaDimensionsPanel(saState.data);
  };

  window.openEvidenceByCode = function(code) {
    if (!state.data) return;
    const allEvItems = state.data.items.filter(i => i.evidenceCode);
    const idxInEv = allEvItems.findIndex(i => i.evidenceCode === code);
    if (idxInEv !== -1) {
      state.filteredItems = allEvItems;
      openModal(idxInEv);
      return;
    }
    const idxAll = state.data.items.findIndex(i => (i.headline || '').includes(code));
    if (idxAll !== -1) {
      state.filteredItems = state.data.items;
      openModal(idxAll);
    }
  };

  // Mode 2: 93 SDGs Event Albums (823 Photos & FB Screenshots)
  function renderSaAlbumsPanel(sa) {
    const themes = sa.themeGroups || [];
    const allAlbums = sa.sdgsAlbums || [];
    let albums = [...allAlbums];

    const themeIcons = {
      '01': '🌿',
      '02': '🔬',
      '03': '📖',
      '04': '🎓',
      '05': '⚾'
    };

    if (saState.activeTheme !== 'all') {
      albums = albums.filter(a => a.themeCode === saState.activeTheme);
    }
    if (saState.activeSdg !== 'all') {
      albums = albums.filter(a => (a.sdgs || []).includes(saState.activeSdg));
    }
    if (saState.albumSearch.trim()) {
      const q = saState.albumSearch.toLowerCase().trim();
      albums = albums.filter(a =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.dateLabel || '').toLowerCase().includes(q) ||
        (a.themeName || '').toLowerCase().includes(q)
      );
    }

    const visibleAlbums = albums.slice(0, saState.albumLimit);

    const filterBarHtml = `
      <div class="sa-theme-filter-bar">
        <div class="sa-theme-btns">
          <button class="sa-theme-btn ${saState.activeTheme === 'all' ? 'active' : ''}" onclick="window.selectSaAlbumTheme('all')">
            🌟 全部主題 (${allAlbums.length}場 / 823檔)
          </button>
          ${themes.map(t => {
            const tAlbums = allAlbums.filter(a => a.themeCode === t.code);
            const tFiles = tAlbums.reduce((acc, a) => acc + a.totalCount, 0);
            const tIcon = themeIcons[t.code] || '📁';
            return `
              <button class="sa-theme-btn ${saState.activeTheme === t.code ? 'active' : ''}" onclick="window.selectSaAlbumTheme('${t.code}')">
                ${tIcon} ${escapeHtml(t.code)} ${escapeHtml(t.name)} (${tAlbums.length}場 / ${tFiles}檔)
              </button>
            `;
          }).join('')}
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; min-width: min(100%, 240px); flex: 1;">
          <input type="text" id="saAlbumSearchInput" value="${escapeHtml(saState.albumSearch)}" placeholder="搜尋 93 場活動名稱或日期..." class="search-input" style="padding: 0.48rem 0.85rem; font-size: 0.84rem; border-radius: 999px; width: 100%;" oninput="window.onSaAlbumSearch(this.value)">
        </div>
      </div>
    `;

    const albumsGridHtml = visibleAlbums.length > 0 ? `
      <div class="sa-albums-grid">
        ${visibleAlbums.map(alb => {
          const tIcon = themeIcons[alb.themeCode] || '📸';
          return `
          <article class="sa-album-card">
            <div class="sa-album-cover" onclick="window.openSdgAlbumLightbox('${alb.id}')" title="點擊開啟相簿燈箱連播（共 ${alb.totalCount} 檔）">
              <img src="${alb.coverImage}" alt="${escapeHtml(alb.title)}" loading="lazy" onerror="this.src='downloads/site_assets/avatar.jpg'">
              <span class="sa-album-date-pill">📅 ${escapeHtml(alb.dateLabel)}</span>
              <span class="sa-album-count-pill">📸 ${alb.photoCount} 照 · 📱 ${alb.screenshotCount} 截圖（共 ${alb.totalCount} 檔）</span>
            </div>
            <div class="sa-album-body">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <span style="font-size: 0.74rem; font-weight: 700; color: var(--sust-emerald);">${tIcon} ${escapeHtml(alb.themeName)}</span>
                <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                  ${(alb.sdgs || []).map(s => `<span style="font-size: 0.68rem; font-weight: 700; padding: 0.08rem 0.4rem; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border);">${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
              <div class="sa-album-title">${escapeHtml(alb.title)}</div>
              <div class="sa-album-actions">
                <button class="btn-primary" style="padding: 0.45rem 0.65rem; font-size: 0.78rem; background: linear-gradient(135deg, #059669, #0d9488); border: none; justify-content: center;" onclick="window.openSdgAlbumLightbox('${alb.id}')">
                  🖼️ 相簿連播 (${alb.totalCount})
                </button>
                <button class="btn-outline" style="padding: 0.45rem 0.65rem; font-size: 0.78rem; justify-content: center;" onclick="window.filterCatalogByAlbum('${alb.id}', '${escapeHtml(alb.title)}')">
                  🗂️ 典藏庫檢視
                </button>
              </div>
            </div>
          </article>
          `;
        }).join('')}
      </div>
      ${albums.length > visibleAlbums.length ? `
        <div class="load-more-container" style="margin-top: 1.5rem;">
          <div style="font-size: 0.88rem; color: var(--text-muted);">目前顯示 <b>${visibleAlbums.length}</b> / <b>${albums.length}</b> 場永續 SDGs 活動相簿</div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn-primary" style="background: var(--sust-emerald); border: none; font-size: 0.85rem;" onclick="window.loadMoreSaAlbums(24)">➕ 顯示更多相簿 (+24 場)</button>
            <button class="btn-outline" style="font-size: 0.85rem;" onclick="window.loadMoreSaAlbums(999)">⚡ 展開全部 (${albums.length} 場)</button>
          </div>
        </div>
      ` : ''}
    ` : `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border-radius: 16px;">
        未找到符合篩選條件的活動相簿，請嘗試重設主題或關鍵字。
      </div>
    `;

    el.saPanelsContainer.innerHTML = filterBarHtml + albumsGridHtml;
  }

  window.selectSaAlbumTheme = function(themeId) {
    saState.activeTheme = themeId;
    saState.albumLimit = 24;
    if (saState.data) renderSaAlbumsPanel(saState.data);
  };

  window.onSaAlbumSearch = function(val) {
    saState.albumSearch = val;
    saState.albumLimit = 24;
    if (saState.data) {
      renderSaAlbumsPanel(saState.data);
      const input = document.getElementById('saAlbumSearchInput');
      if (input) {
        input.focus();
        input.setSelectionRange(val.length, val.length);
      }
    }
  };

  window.loadMoreSaAlbums = function(addCount) {
    saState.albumLimit += addCount;
    if (saState.data) renderSaAlbumsPanel(saState.data);
  };

  window.openSdgAlbumLightbox = function(albumId) {
    if (!state.data) return;
    const albumItems = state.data.items.filter(i => i.albumId === albumId);
    if (albumItems.length > 0) {
      state.filteredItems = albumItems;
      openModal(0);
    }
  };

  window.filterCatalogByAlbum = function(albumId, albumTitle) {
    state.currentCategory = 'sustainability_sdgs';
    state.currentSection = 'all';
    state.searchQuery = albumTitle;
    state.renderLimit = 48;
    if (el.searchInput) el.searchInput.value = albumTitle;
    if (el.searchClearBtn) el.searchClearBtn.style.display = 'block';
    renderCategoryTabs();
    applyFilters();
    document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mode 3: Full 5,000-word Report Reader & 17 Representative Sustainability Awards Table
  function renderSaReportPanel(sa) {
    const dims = sa.dimensions || [];
    const awards = sa.awards17 || [];

    el.saPanelsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; background: var(--bg-surface); padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
          <div>
            <strong style="font-size: 1rem; color: var(--text-main);">📘 《附件三：永續教育成果報告（微調契合版）》互動全文檢視器</strong>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">內嵌全部 99 項可點擊之 <code>📌 佐證 X-XX</code> 互動標籤，點擊即可直接彈出高解析度佐證相片或公文</div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-primary" style="background: var(--sust-emerald); border: none; font-size: 0.82rem; padding: 0.45rem 0.95rem;" onclick="window.previewSpotlightDoc('附件三：永續教育成果報告（微調契合版）', 'downloads/sustainability_award/03_附件三_永續教育成果報告_徐秉鴻_微調契合版.pdf', '', 'pdf')">
              📄 開啟原版排版 PDF 預覽
            </button>
            <a href="downloads/sustainability_award/03_附件三_永續教育成果報告_徐秉鴻_微調契合版.pdf" download class="btn-outline" style="font-size: 0.82rem; padding: 0.45rem 0.95rem;">
              💾 下載報告 PDF
            </a>
          </div>
        </div>

        <div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem;">
            🏆 候選人歷年代表性永續與科學教育獲獎紀錄總表（17 項精選殊榮）
          </h3>
          <div class="sa-awards-table-wrapper">
            <table class="sa-awards-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>核定年度</th>
                  <th>獲獎級別與殊榮名稱</th>
                  <th>頒發／主辦機關</th>
                  <th>對應官方佐證</th>
                </tr>
              </thead>
              <tbody>
                ${awards.map((aw, i) => `
                  <tr>
                    <td style="font-weight: 800; color: var(--sust-emerald);">${aw.no || (i + 1)}</td>
                    <td style="white-space: nowrap; font-weight: 700;">${escapeHtml(aw.date)}</td>
                    <td style="font-weight: 800; color: var(--text-main);">${escapeHtml(aw.name)}</td>
                    <td style="color: var(--text-muted);">${escapeHtml(aw.org)}</td>
                    <td style="white-space: nowrap;">
                      <button type="button" class="sa-evidence-pill" onclick="window.openEvidenceByCode('${aw.code}')">📌 佐證 ${escapeHtml(aw.code)}</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        ${dims.map(d => `
          <div class="sa-dim-summary-card" style="--dim-color: ${d.color}; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
              <h4 style="font-size: 1.15rem; font-weight: 900; color: var(--text-main); margin: 0;">
                ${d.icon} ${escapeHtml(d.num)}：${escapeHtml(d.title)}（${escapeHtml(d.subtitle)}）
              </h4>
              <span style="font-size: 0.78rem; font-weight: 700; color: ${d.color};">收錄 ${d.evidenceCount} 項佐證</span>
            </div>
            <div class="sa-dim-narrative-list">
              ${(d.paragraphs || []).map(p => `
                <div class="sa-dim-narrative-item">${linkifyEvidenceCodes(p)}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Mode 4: Official Submission PDFs Preview & Download Grid
  function renderSaDocumentsPanel(sa) {
    const docs = (sa.awardInfo && sa.awardInfo.officialDocs) || [];
    el.saPanelsContainer.innerHTML = `
      <div class="sa-docs-grid">
        ${docs.map(doc => `
          <article class="sa-doc-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
                <span class="sa-exec-pill">${escapeHtml(doc.badge || '官方文件')}</span>
                <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">PDF 數位原件</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); line-height: 1.4; margin-bottom: 0.5rem;">
                📄 ${escapeHtml(doc.title)}
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.65; margin: 0;">
                ${escapeHtml(doc.desc || '')}
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid var(--border);">
              <button class="btn-primary" style="flex: 1; justify-content: center; background: var(--sust-emerald); border: none; font-size: 0.82rem; padding: 0.5rem 0.85rem;" onclick="window.previewSpotlightDoc('${escapeHtml(doc.title)}', '${doc.localFile}', '', 'pdf')">
                🔍 線上預覽 PDF
              </button>
              <a href="${doc.localFile}" target="_blank" rel="noopener noreferrer" class="btn-outline" style="font-size: 0.82rem; padding: 0.5rem 0.75rem;">
                ↗ 新分頁
              </a>
              <a href="${doc.localFile}" download class="btn-outline" style="font-size: 0.82rem; padding: 0.5rem 0.75rem;">
                💾 下載
              </a>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  // ==========================================================================
  // 3C. Render 6 Key Teaching Spotlights (STREAM × SDGs Bento Grid 2.0)
  // ==========================================================================
  function renderSpotlights() {
    if (!el.spotlightCardsGrid) return;
    const rawFeatures = window.SPECIAL_FEATURES || [];
    if (rawFeatures.length === 0) {
      document.getElementById('teaching-spotlights')?.remove();
      return;
    }

    // Bento 2.0: sustainability & science serve as the Dual Hero 6-column wide flagship cards on Row 1,
    // followed by learning_map as the 12-column full-width interactive showcase on Row 2,
    // and succulent, aesthetic, reading, international on Row 3
    const priorityOrder = ['sustainability', 'science', 'learning_map', 'succulent', 'aesthetic', 'reading', 'international'];
    const features = [...rawFeatures].sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.id);
      const idxB = priorityOrder.indexOf(b.id);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const themeEmojis = {
      sustainability: '🌍',
      science: '🔬',
      learning_map: '🗺️',
      succulent: '🌵',
      aesthetic: '📐',
      reading: '📖',
      international: '🏮'
    };

    el.spotlightCardsGrid.innerHTML = features.map(feat => {
      const isFull = feat.id === 'learning_map';
      const isWide = feat.id === 'sustainability' || feat.id === 'science';
      const emoji = themeEmojis[feat.id] || '✨';

      const primaryAward = feat.award.includes('·') ? feat.award.split('·')[0].trim() : feat.award;

      const sdgChipsHtml = (feat.sdgs || []).slice(0, 3).map(s => {
        let chipClass = 'sdg-chip';
        if (s.code.includes('3')) chipClass += ' sdg-3';
        else if (s.code.includes('4')) chipClass += ' sdg-4';
        else if (s.code.includes('11')) chipClass += ' sdg-11';
        else if (s.code.includes('12')) chipClass += ' sdg-12';
        else if (s.code.includes('15')) chipClass += ' sdg-15';
        else if (s.code.includes('17')) chipClass += ' sdg-17';
        return `<span class="${chipClass}" title="${escapeHtml(s.desc || s.title)}">🎯 ${escapeHtml(s.code)}: ${escapeHtml(s.title)}</span>`;
      }).join('');

      const durationLabel = feat.duration ? feat.duration.split('（')[0].replace('課程', '') : '專題課程';
      const targetLabel = feat.target ? feat.target.split('（')[0] : '國小學童';
      const evidenceCount = feat.id === 'sustainability'
        ? 927
        : (feat.photos ? feat.photos.length : 0) + (feat.documents ? feat.documents.length : 0);

      return `
        <article class="spotlight-card ${isFull ? 'bento-full' : (isWide ? 'bento-wide' : '')}" data-spotlight="${feat.id}" data-theme="${feat.id}">
          <div class="spotlight-banner">
            <img src="${feat.heroImage}" alt="${escapeHtml(feat.title)}" class="spotlight-img" referrerpolicy="no-referrer" onerror="this.src='downloads/site_assets/avatar.jpg';">
            <div class="spotlight-award-tag" title="${escapeHtml(feat.award)}">${escapeHtml(primaryAward)}</div>
            <div class="bento-theme-badge" title="${escapeHtml(feat.category)}">${emoji}</div>
            <div class="spotlight-category-tag">${escapeHtml(feat.category)}</div>
          </div>
          <div class="spotlight-content">
            <div class="spotlight-subtitle">${escapeHtml(feat.subtitle)}</div>
            <h3>${escapeHtml(feat.title)}</h3>
            <p class="spotlight-overview">${escapeHtml(feat.overview)}</p>
            ${sdgChipsHtml ? `<div class="bento-sdgs">${sdgChipsHtml}</div>` : ''}
            <div class="spotlight-tags-row">
              ${(feat.tags || []).slice(0, 4).map(t => `<span class="spotlight-pill"># ${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="spotlight-footer">
              <div class="bento-metrics">
                <span>⏱️ ${escapeHtml(durationLabel)}</span>
                <span>👥 ${escapeHtml(targetLabel)}</span>
                <span>📁 ${evidenceCount} 項歷程佐證</span>
              </div>
              <div class="spotlight-btn-group">
                <span class="spotlight-btn">深入專題 🔍</span>
                ${feat.externalSite ? `<a href="${window.location.protocol === 'file:' ? feat.externalSite.url : feat.externalSite.serverUrl}" target="_blank" class="spotlight-link-direct no-modal" style="background: linear-gradient(135deg, #6366f1, #9333ea); color: #fff; border-color: transparent;" title="開啟 2026 跨領域美感成果展網站全貌">🎨 2026美感展 ↗</a>` : ''}
                <a href="special-${feat.id}.html" class="spotlight-link-direct no-modal" title="開啟獨立完整專頁">獨立專頁 ↗</a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events
    el.spotlightCardsGrid.querySelectorAll('[data-spotlight]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.no-modal')) return;
        const id = card.getAttribute('data-spotlight');
        openSpotlightModal(id);
      });
    });

    // Modal Close handlers
    el.spModalCloseBtn?.addEventListener('click', closeSpotlightModal);
    el.spModalBottomCloseBtn?.addEventListener('click', closeSpotlightModal);
    el.spotlightModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === el.spotlightModalBackdrop) closeSpotlightModal();
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

    // External Site Gateway
    if (el.spModalExternalSiteWrapper) {
      if (feat.externalSite) {
        const ext = feat.externalSite;
        const targetUrl = window.location.protocol === 'file:' ? (ext.localUrl || ext.url) : (ext.serverUrl || ext.url || 'https://binghong-xu.github.io/yongzhen-stem-art/');
        el.spModalExternalSiteWrapper.style.display = 'block';
        el.spModalExternalSiteWrapper.innerHTML = `
          <div style="background: linear-gradient(135deg, #090e24 0%, #151b3d 60%, #2e1065 100%); border: 1px solid rgba(168, 85, 247, 0.5); border-radius: var(--radius-lg); padding: 1.35rem; color: #f8fafc; box-shadow: 0 8px 24px -6px rgba(124, 58, 237, 0.35); margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
              <span style="font-size: 0.78rem; font-weight: 800; color: #e9d5ff; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.45); padding: 0.25rem 0.75rem; border-radius: var(--radius-full);">✨ 2026 跨領域美感成果展網站已完整介接</span>
              <span style="font-size: 0.82rem; color: #94a3b8;">永貞國小六年甲班 × 徐秉鴻老師</span>
            </div>
            <h5 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">${escapeHtml(ext.title)}</h5>
            <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem;">完整收錄 327+ 件學生原創藝術品（蒙德里安小夜燈、星際自畫像、老屋顏壓花玻璃）、217+ 課堂紀實照片、63+ 部專題影音、18 步實踐歷程與 3 大美感互動實驗室！</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
              <a href="${targetUrl}" target="_blank" class="btn-primary" style="background: linear-gradient(135deg, #6366f1, #9333ea); border: none; font-size: 0.85rem; padding: 0.45rem 1.1rem; color: #fff; text-decoration: none; border-radius: var(--radius-md); font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
                🚀 開啟 2026 跨領域美感網站全貌 ↗
              </a>
              <a href="${targetUrl}#labs" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                🧪 互動實驗室 ↗
              </a>
              <a href="${targetUrl}#gallerySection" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                🖼️ 320+ 作品藝廊 ↗
              </a>
              <a href="special-aesthetic.html" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.3); font-size: 0.85rem; padding: 0.45rem 0.85rem; text-decoration: none; border-radius: var(--radius-md); font-weight: 600;">
                🎨 查看標竿專題頁 ↗
              </a>
            </div>
          </div>
        `;
      } else {
        el.spModalExternalSiteWrapper.style.display = 'none';
        el.spModalExternalSiteWrapper.innerHTML = '';
      }
    }

    // SDGs
    if (el.spModalSdgs) {
      el.spModalSdgs.innerHTML = (feat.sdgs || []).map(sdg => `
        <div class="sdg-box">
          <span class="sdg-code">${escapeHtml(sdg.code)}</span>
          <h5>${escapeHtml(sdg.title)}</h5>
          <p>${escapeHtml(sdg.desc)}</p>
        </div>
      `).join('');
    }

    // Modules
    if (el.spModalModules) {
      el.spModalModules.innerHTML = (feat.modules || []).map(m => `
        <div class="module-box">
          <h4>${escapeHtml(m.name)}</h4>
          <div class="module-focus">${escapeHtml(m.focus)}</div>
          <p>${escapeHtml(m.content)}</p>
        </div>
      `).join('');
    }

    // Gallery
    if (el.spModalGallery) {
      el.spModalGallery.innerHTML = (feat.photos || []).map(p => `
        <div class="spotlight-gallery-item" onclick="window.previewSpotlightDoc('${escapeHtml(p.caption)}', '${p.url}', '${p.url}')" title="點擊以高畫質檢視原圖">
          <img src="${p.url}" alt="${escapeHtml(p.caption)}" class="spotlight-gallery-img" referrerpolicy="no-referrer" onerror="this.src='downloads/site_assets/avatar.jpg';">
          <div class="spotlight-gallery-caption">🔍 ${escapeHtml(p.caption)}</div>
        </div>
      `).join('');
    }

    // Documents
    if (el.spModalDocs) {
      if (feat.documents && feat.documents.length > 0) {
        el.spModalDocsWrapper.style.display = 'block';
        el.spModalDocs.innerHTML = feat.documents.map(d => {
          const isPdf = d.type === 'pdf' || (d.path || '').toLowerCase().endsWith('.pdf') || (d.onlineUrl || '').toLowerCase().includes('.pdf');
          const docIcon = isPdf ? '📄' : (d.title.includes('第一名') || d.title.includes('首獎') || d.title.includes('金獎') || d.title.includes('第三') ? '🏆' : '📜');
          const typeBadge = isPdf 
            ? `<span style="font-size: 0.75rem; background: rgba(59,130,246,0.15); color: #3b82f6; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">📄 官方文件／教案 PDF</span>`
            : `<span style="font-size: 0.75rem; background: rgba(245,158,11,0.15); color: #f59e0b; padding: 0.2rem 0.55rem; border-radius: 4px; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">📜 官方獲獎證書/佐證</span>`;
          const btnLabel = isPdf ? '📄 預覽文件全文 &rarr;' : '🖼️ 檢視高清證書 &rarr;';
          const downloadHref = d.path || d.onlineUrl;

          return `
          <div class="spotlight-doc-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.75rem; min-width: min(100%, 220px); flex: 1;">
              <span style="font-size: 1.4rem;">${docIcon}</span>
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                <span style="font-weight: 700; color: var(--text-main); font-size: 0.92rem; line-height: 1.4;">${escapeHtml(d.title)}</span>
                <div>${typeBadge}</div>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <button class="btn-primary" style="padding: 0.45rem 0.95rem; font-size: 0.82rem; cursor: pointer; white-space: nowrap;" onclick="window.previewSpotlightDoc('${escapeHtml(d.title)}', '${d.path}', '${d.onlineUrl || ''}', '${isPdf ? 'pdf' : 'image'}')">
                ${btnLabel}
              </button>
              <a href="${downloadHref}" download="${escapeHtml(d.title)}" target="_blank" rel="noopener noreferrer" class="btn-outline" style="padding: 0.45rem 0.75rem; font-size: 0.82rem; white-space: nowrap;" title="下載佐證原件">
                💾 下載
              </a>
            </div>
          </div>
          `;
        }).join('');
      } else {
        el.spModalDocsWrapper.style.display = 'none';
      }
    }

    const spModalStandaloneLink = document.getElementById('spModalStandaloneLink');
    if (spModalStandaloneLink) {
      spModalStandaloneLink.href = `special-${feat.id}.html`;
    }

    el.spotlightModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSpotlightModal() {
    if (!el.spotlightModalBackdrop) return;
    el.spotlightModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // 3D. Render Catalog Top Tabs & Subsections
  // ==========================================================================
  function renderCategoryTabs() {
    if (!el.categoryTabs || !state.data) return;

    const totalCount = state.data.items.length;
    let tabsHtml = `
      <button class="tab-btn ${state.currentCategory === 'all' ? 'active' : ''}" data-category="all">
        <span>🌟 全部成果</span>
        <span class="tab-badge">${totalCount}</span>
      </button>
    `;

    for (const cat of state.data.categories) {
      const count = state.data.items.filter(i => i.categoryId === cat.id).length;
      const icon = getCategoryIcon(cat.id);
      tabsHtml += `
        <button class="tab-btn ${state.currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
          <span>${icon} ${cat.name}</span>
          <span class="tab-badge">${count}</span>
        </button>
      `;
    }

    el.categoryTabs.innerHTML = tabsHtml;

    el.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        state.currentCategory = catId;
        state.currentSection = 'all';
        state.renderLimit = 48;

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
      return `${item.sectionTitle || '教學成果'} · ${item.mediaType === 'image' ? '實體佐證相片' : item.mediaType === 'pdf' ? '成果文件檔案' : '典藏成果'}`;
    }
    return headline;
  }

  function renderSubsections() {
    if (!el.subsectionsList || !state.data) return;

    let availableSections = state.data.sections;
    if (state.currentCategory !== 'all') {
      availableSections = state.data.sections.filter(s => s.categoryId === state.currentCategory);
    }

    if (availableSections.length <= 1) {
      el.subsectionsWrapper.style.display = 'none';
      return;
    }

    el.subsectionsWrapper.style.display = 'block';

    let pillsHtml = `
      <button class="sub-pill ${state.currentSection === 'all' ? 'active' : ''}" data-section="all">全部向度 (${state.currentCategory === 'all' ? state.data.items.length : state.data.items.filter(i => i.categoryId === state.currentCategory).length})</button>
    `;

    for (const s of availableSections) {
      const count = state.data.items.filter(i => i.sectionId == s.id).length;
      pillsHtml += `
        <button class="sub-pill ${state.currentSection == s.id ? 'active' : ''}" data-section="${s.id}">
          ${s.title} (${count})
        </button>
      `;
    }

    el.subsectionsList.innerHTML = pillsHtml;

    const toggleBtn = document.getElementById('subsectionsToggleBtn');
    if (toggleBtn) {
      const isExpanded = el.subsectionsList.classList.contains('is-expanded');
      toggleBtn.querySelector('.toggle-text').textContent = isExpanded ? '收合為單行' : `展開全部向度 (${availableSections.length})`;
      toggleBtn.classList.toggle('is-active', isExpanded);
    }

    el.subsectionsList.querySelectorAll('.sub-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const secId = pill.getAttribute('data-section');
        state.currentSection = secId;
        state.renderLimit = 48;

        el.subsectionsList.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

        applyFilters();
      });
    });
  }

  // 4. Filtering and Sorting logic
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
        const title = (i.headline || '').toLowerCase();
        const body = (i.body || '').toLowerCase();
        const sec = (i.sectionTitle || '').toLowerCase();
        const cat = (i.categoryName || '').toLowerCase();
        const sdgs = (i.sdgs || []).join(' ').toLowerCase();
        return title.includes(q) || body.includes(q) || sec.includes(q) || cat.includes(q) || sdgs.includes(q);
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
    if (item.evidenceCode) return true;
    if (item.categoryId === 'honors' || item.categoryId === 'mentorship') return true;
    const secTitle = item.sectionTitle || '';
    if (secTitle.includes('殊榮') || secTitle.includes('獲獎') || secTitle.includes('競賽') || secTitle.includes('指導學生獲獎')) return true;
    if (item.categoryId === 'research' || item.categoryId === 'certifications') return false;
    const headline = item.headline || '';
    const awardWords = ['第一名', '第二名', '第三名', '第四名', '第五名', '第六名', '第七名', '第八名', '全國第一', '全縣第一', '金獎', '銀獎', '銅獎', '首獎', '特優', '優等', '佳作', '秀才', '狀元', '冠軍', '亞軍', '季軍', '殿軍', '殊榮', '獲獎', '錦標賽', '典範學校', '標竿學校', '得獎', '表揚', '頒獎', '榮譽', '稱冠', '奪冠', '獲冠'];
    return awardWords.some(w => headline.includes(w));
  }

  // 5. Render results to grid or timeline (with smooth batch pagination)
  function renderResults() {
    if (!el.itemsContainer) return;

    const totalMatching = state.filteredItems.length;
    const visibleItems = state.filteredItems.slice(0, state.renderLimit);

    if (el.resultsCount) {
      el.resultsCount.innerHTML = totalMatching > visibleItems.length
        ? `共找到 <b>${totalMatching}</b> 筆典藏成果（目前顯示前 <b>${visibleItems.length}</b> 筆）`
        : `共找到 <b>${totalMatching}</b> 筆典藏成果`;
    }

    if (totalMatching === 0) {
      el.itemsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main);">未找到相符的成果內容</h3>
          <p>請嘗試更換關鍵字、清除篩選條件或切換分類大項。</p>
          <button class="btn-outline" style="margin-top: 1.5rem;" onclick="window.clearAllFilters()">重設所有條件</button>
        </div>
      `;
      if (el.loadMoreContainer) el.loadMoreContainer.style.display = 'none';
      return;
    }

    if (state.viewMode === 'grid') {
      el.itemsContainer.className = 'cards-grid';
      el.itemsContainer.innerHTML = visibleItems.map((item, index) => renderCard(item, index)).join('');
    } else {
      el.itemsContainer.className = 'cards-timeline';
      el.itemsContainer.innerHTML = visibleItems.map((item, index) => renderTimelineItem(item, index)).join('');
    }

    // Update Load More bar
    if (el.loadMoreContainer) {
      if (totalMatching > visibleItems.length) {
        const remaining = totalMatching - visibleItems.length;
        el.loadMoreContainer.style.display = 'flex';
        el.loadMoreContainer.innerHTML = `
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            已載入 <b>${visibleItems.length}</b> / <b>${totalMatching}</b> 筆成果（尚有 <b>${remaining}</b> 筆可展開）
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn-primary" style="padding: 0.55rem 1.25rem; font-size: 0.88rem;" onclick="window.loadMoreCatalogItems(48)">
              ➕ 顯示更多成果 (+${Math.min(48, remaining)} 筆)
            </button>
            <button class="btn-outline" style="padding: 0.55rem 1.15rem; font-size: 0.88rem;" onclick="window.loadMoreCatalogItems(9999)">
              ⚡ 一次展開全部 (${totalMatching} 筆)
            </button>
          </div>
        `;
      } else {
        el.loadMoreContainer.style.display = 'none';
      }
    }

    // Attach click events
    el.itemsContainer.querySelectorAll('[data-index]').forEach(element => {
      element.addEventListener('click', (e) => {
        if (e.target.closest('.no-modal')) return;
        const idx = parseInt(element.getAttribute('data-index'), 10);
        openModal(idx);
      });
    });
  }

  window.loadMoreCatalogItems = function(count) {
    state.renderLimit += count;
    renderResults();
  };

  function getSvgFallback(catId, title) {
    const icon = getCategoryIcon(catId);
    const cleanTitle = (title || '教學成果').slice(0, 18).replace(/[<>&"']/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%23065f46"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><circle cx="640" cy="290" r="95" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="4"/><text x="50%" y="315" dominant-baseline="middle" text-anchor="middle" font-size="88">${icon}</text><text x="50%" y="475" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Noto Sans TC, sans-serif" font-size="38" font-weight="bold">${cleanTitle}</text><text x="50%" y="555" dominant-baseline="middle" text-anchor="middle" fill="%23bfdbfe" font-family="Noto Sans TC, sans-serif" font-size="24">苗栗縣永貞國小 ‧ 徐秉鴻 老師 教學成果典藏</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  window.handleCardImgError = function(img, catId, title) {
    img.onerror = null;
    img.src = getSvgFallback(catId, title);
  };

  function getYouTubeThumbnail(ytid) {
    const maxResIds = ['4sjZ2LJjiaU', '-V-xJzRQ0Eg', 'T066-_Oiey4'];
    if (maxResIds.includes(ytid)) {
      return `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
    }
    return `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
  }

  // Render Single Grid Card
  function renderCard(item, index) {
    const itemTitle = getItemTitle(item);
    const title = highlightKeyword(itemTitle);
    const snippet = highlightKeyword(cleanSnippet(item.body || ''));
    const isPinned = item.isPinned;
    const mediaBadge = getMediaBadge(item);
    const dateFormatted = formatDate(item.createdAt);
    const isAward = isAwardItem(item);
    const isTssci = (itemTitle + ' ' + (item.body || '')).includes('TSSCI');
    const ribbonHtml = item.evidenceCode
      ? `<div class="award-ribbon" style="background: linear-gradient(135deg, #059669, #0d9488);">📌 佐證 ${escapeHtml(item.evidenceCode)}</div>`
      : (isTssci
        ? '<div class="award-ribbon">📚 TSSCI 核心期刊</div>'
        : (isAward ? '<div class="award-ribbon">🏆 榮譽殊榮</div>' : ''));

    let mediaHtml = '';
    const svgFallback = getSvgFallback(item.categoryId, item.sectionTitle);
    const safeSecTitle = escapeHtml(item.sectionTitle || item.categoryName);

    if (item.mediaType === 'image') {
      const imgSrc = item.previewImage || item.localFile || item.fileUrl;
      mediaHtml = `
        <div class="card-media">
          <img src="${imgSrc}" alt="${escapeHtml(itemTitle)}" class="card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${safeSecTitle}');">
          ${mediaBadge}
          ${ribbonHtml}
          ${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
        </div>
      `;
    } else if (item.mediaType === 'pdf') {
      const rawCover = item.previewImage;
      const isImg = rawCover && !rawCover.toLowerCase().includes('.pdf');
      const coverSrc = isImg ? rawCover : '';
      mediaHtml = `
        <div class="card-media">
          ${coverSrc ? `
            <img src="${coverSrc}" alt="${escapeHtml(itemTitle)}" class="card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${safeSecTitle}');">
          ` : `
            <img src="${svgFallback}" alt="${escapeHtml(itemTitle)}" class="card-img" loading="lazy" referrerpolicy="no-referrer">
          `}
          ${mediaBadge}
          ${ribbonHtml}
          ${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
        </div>
      `;
    } else if (item.mediaType === 'video') {
      const ytid = getYouTubeId(item.externalUrl);
      const thumbUrl = (ytid ? getYouTubeThumbnail(ytid) : null) || item.previewImage || item.localFile;
      mediaHtml = `
        <div class="card-media">
          ${thumbUrl ? `
            <img src="${thumbUrl}" alt="${escapeHtml(item.headline)}" class="card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${safeSecTitle}');">
            <div class="video-play-overlay">
              <div class="video-play-circle" title="點擊播放 1080p 高畫質影音">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          ` : `
            <div class="card-media-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <span>影音受訪紀實</span>
            </div>
          `}
          ${mediaBadge}
          ${ribbonHtml}
          ${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
        </div>
      `;
    } else if (item.localFile || item.previewImage || item.fileUrl) {
      const linkImg = item.previewImage || item.localFile || item.fileUrl;
      mediaHtml = `
        <div class="card-media">
          <img src="${linkImg}" alt="${escapeHtml(itemTitle)}" class="card-img" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${safeSecTitle}');">
          ${mediaBadge}
          ${ribbonHtml}
          ${isPinned ? '<span class="pinned-badge">📌 置頂</span>' : ''}
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="card-media">
          <div class="card-media-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">${item.externalUrl ? '🌐 線上媒體報導' : '📄 專題紀實'}</span>
          </div>
          ${mediaBadge}
          ${ribbonHtml}
        </div>
      `;
    }

    const actionBtnText = item.mediaType === 'pdf'
      ? (isTssci ? '📄 預覽論文全文 &rarr;' : '📄 預覽 PDF 文件 &rarr;')
      : (item.mediaType === 'video'
        ? '🎬 觀看影音報導 &rarr;'
        : (item.mediaType === 'link' || item.externalUrl
          ? '🌐 檢視專題報導 &rarr;'
          : (item.evidenceCode ? '📌 檢視官方佐證 &rarr;' : (isAward && item.categoryId === 'honors' ? '🏆 檢視得獎證書 &rarr;' : '🖼️ 檢視成果照片 &rarr;'))));

    return `
      <article class="portfolio-card ${isAward || isTssci ? 'is-award-winner' : ''}" data-index="${index}" data-category="${item.categoryId || ''}">
        ${mediaHtml}
        <div class="card-body">
          <div class="card-section-tag">${escapeHtml(item.sectionTitle)}</div>
          <h3 class="card-title">${title}</h3>
          ${snippet ? `<p class="card-snippet">${snippet}</p>` : ''}
          <div class="card-footer">
            <span class="card-footer-meta">
              ${dateFormatted ? `<span>📅 ${dateFormatted}</span>` : ''}
              ${item.localFile ? '<span class="card-badge-local" title="已離線保存原件">💾 本機原件</span>' : ''}
            </span>
            <span class="card-action-btn">${actionBtnText}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderTimelineItem(item, index) {
    const itemTitle = getItemTitle(item);
    const title = highlightKeyword(itemTitle);
    const ytid = item.mediaType === 'video' ? getYouTubeId(item.externalUrl) : null;
    const thumbSrc = (ytid ? getYouTubeThumbnail(ytid) : null) || item.previewImage || item.fileUrl || item.localFile || 'downloads/site_assets/avatar.jpg';
    const dateFormatted = formatDate(item.createdAt);

    return `
      <div class="timeline-item" data-index="${index}">
        <img src="${thumbSrc}" alt="" class="timeline-thumb" loading="lazy" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${escapeHtml(item.sectionTitle || item.categoryName)}');">
        <div class="timeline-content">
          <div class="timeline-meta">
            <span style="color: var(--primary); font-weight: 600;">[${escapeHtml(item.sectionTitle)}]</span>
            ${dateFormatted ? `<span>📅 ${dateFormatted}</span>` : ''}
            <span>📂 ${escapeHtml(item.categoryName)}</span>
          </div>
          <h3 class="timeline-title">${title}</h3>
        </div>
        <div>
          <button class="btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">查看</button>
        </div>
      </div>
    `;
  }

  // 6. Modal Lightbox & Viewer (with Album / Evidence Filmstrip!)
  function openModal(index) {
    if (index < 0 || index >= state.filteredItems.length) return;
    state.currentModalIndex = index;
    state.imageZoom = 1;
    state.imageRotation = 0;

    const item = state.filteredItems[index];
    const itemTitle = getItemTitle(item);

    el.modalSectionBadge.textContent = `${item.categoryName} · ${item.sectionTitle}`;
    el.modalTitle.textContent = itemTitle;

    let viewerContent = '';
    const isPdf = item.mediaType === 'pdf' || (item.fileName || '').toLowerCase().endsWith('.pdf') || (item.fileUrl || '').toLowerCase().includes('.pdf');

    if (isPdf) {
      const pdfSrc = item.localFile || item.fileUrl;
      const onlinePdfUrl = item.fileUrl || '';
      viewerContent = `
        <div class="pdf-viewer-wrapper">
          <div class="pdf-viewer-toolbar">
            <div class="pdf-toolbar-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>📄 PDF 成果檔案預覽器</span>
            </div>
            <div class="pdf-toolbar-actions">
              ${onlinePdfUrl ? `<button class="pdf-toolbar-btn" onclick="window.togglePdfEngine('${escapeHtml(pdfSrc)}', '${escapeHtml(onlinePdfUrl)}')" title="若無法載入，點此切換 Google 雲端預覽器">🔄 切換預覽引擎</button>` : ''}
              <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()" title="切換全螢幕沉浸閱讀模式">⛶ 全螢幕</button>
              <a href="${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn" title="在新分頁開啟完整 PDF">↗ 新分頁</a>
              <a href="${pdfSrc}" download="${item.fileName || 'document.pdf'}" class="pdf-toolbar-btn btn-accent" title="下載 PDF 原始檔">💾 下載 PDF</a>
            </div>
          </div>
          <div class="pdf-mobile-fallback-bar">
            <span>📱 若行動裝置或 Google Sites 內嵌視窗無法直接捲動多頁 PDF：</span>
            <a href="${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-mobile-open-btn">↗ 點此於新分頁開啟高畫質完整 PDF</a>
          </div>
          <iframe id="activePdfIframe" src="${pdfSrc}#toolbar=1&navpanes=0" class="modal-viewer-pdf" title="${escapeHtml(item.headline)}" allowfullscreen></iframe>
        </div>
      `;
    } else if (item.mediaType === 'image') {
      const imgSrc = item.previewImage && item.localFile && item.localFile.toLowerCase().endsWith('.dng')
        ? item.previewImage
        : (item.localFile || item.previewImage || item.fileUrl);
      viewerContent = `
        <div class="photo-viewer-wrapper">
          <div class="pdf-viewer-toolbar">
            <div class="pdf-toolbar-title" style="color: #60a5fa;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>🖼️ 原版成果相片與官方佐證 · 高畫質檢視器（第 ${index + 1} / ${state.filteredItems.length} 筆）</span>
            </div>
            <div class="pdf-toolbar-actions">
              <button class="pdf-toolbar-btn" onclick="window.printDocumentAsPdf()" title="格式化另存/列印為 A4 PDF 文件">🖨️ 另存/列印為 PDF</button>
              <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()" title="切換全螢幕檢視">⛶ 全螢幕</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)" title="放大">+</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)" title="縮小">-</button>
              <button class="pdf-toolbar-btn" onclick="window.setModalImgZoom(2.0)" title="以 200% 超高清晰度檢視文字細節">🔍 200%</button>
              <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()" title="旋轉">↻</button>
              <button class="pdf-toolbar-btn" onclick="window.resetModalImg()" title="還原">⟲</button>
              <a href="${item.localFile || imgSrc}" download="${item.fileName || 'image.jpg'}" class="pdf-toolbar-btn btn-accent" title="下載原圖">💾 下載原圖</a>
            </div>
          </div>
          <div class="photo-viewer-stage">
            <img src="${imgSrc}" alt="${escapeHtml(item.headline)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${escapeHtml(item.sectionTitle || item.categoryName)}');">
          </div>
        </div>
      `;
    } else if (item.mediaType === 'video' && item.externalUrl) {
      const ytid = getYouTubeId(item.externalUrl);
      if (ytid) {
        viewerContent = `
          <div class="video-viewer-wrapper">
            <div class="pdf-viewer-toolbar">
              <div class="pdf-toolbar-title" style="color: #f87171;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>🎬 影音新聞與訪談報導 · 線上播放器</span>
              </div>
              <div class="pdf-toolbar-actions">
                <a href="${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn btn-accent" style="background: #dc2626; border-color: #dc2626;">
                  ↗ 在 YouTube 開啟
                </a>
              </div>
            </div>
            <div class="video-aspect-box">
              <iframe class="video-iframe" src="https://www.youtube.com/embed/${ytid}?rel=0&modestbranding=1&vq=hd1080&hd=1&playsinline=1" title="${escapeHtml(item.headline)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="origin-when-cross-origin"></iframe>
            </div>
            <div class="video-viewer-actions">
              <div style="font-size: 0.85rem; color: #94a3b8;">
                📺 媒體報導專題 · 永貞國小教學紀實
              </div>
              <a href="${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-youtube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                在 YouTube 觀看原頻道高畫質影片 ↗
              </a>
            </div>
          </div>
        `;
      } else {
        viewerContent = `
          <div class="card-media-placeholder" style="height: 380px;">
            <p>外部影音連結</p>
            <a href="${item.externalUrl}" target="_blank" class="btn-primary" style="margin-top: 1rem;">前往觀看影音 &rarr;</a>
          </div>
        `;
      }
    } else if (item.localFile || item.previewImage || item.fileUrl) {
      const imgSrc = item.previewImage || item.localFile || item.fileUrl;
      viewerContent = `
        <div class="photo-viewer-wrapper">
          <div class="pdf-viewer-toolbar">
            <div class="pdf-toolbar-title" style="color: #38bdf8;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>🌐 線上報導與專題成果 · 完整圖文原件</span>
            </div>
            <div class="pdf-toolbar-actions">
              ${item.externalUrl ? `<a href="${item.externalUrl}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn btn-accent" style="background: #0284c7; border-color: #0284c7;">↗ 前往原始報導網頁</a>` : ''}
              <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)">+</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)">-</button>
              <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()">↻</button>
              <button class="pdf-toolbar-btn" onclick="window.resetModalImg()">⟲</button>
              <a href="${imgSrc}" download="${item.fileName || 'media_doc.jpg'}" class="pdf-toolbar-btn">💾 下載原圖</a>
            </div>
          </div>
          <div class="photo-viewer-stage">
            <img src="${imgSrc}" alt="${escapeHtml(itemTitle)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer" onerror="window.handleCardImgError(this, '${item.categoryId}', '${escapeHtml(item.sectionTitle || item.categoryName)}');">
          </div>
        </div>
      `;
    } else {
      viewerContent = `
        <div class="card-media-placeholder" style="height: 240px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; opacity: 0.4;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="margin-top: 0.5rem; font-weight: 500;">專案內容與文字紀實</span>
        </div>
      `;
    }

    el.modalViewerContainer.innerHTML = viewerContent;

    // Body content
    if (item.mediaType === 'video') {
      let cleaned = (item.body || '').replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?(?:youtube\.com|youtu\.be)(?:(?!<\/p>)[\s\S])*?<\/p>/gi, '').trim();
      cleaned = cleaned.replace(/<p[^>]*>\s*影片連結[：:]?\s*<\/p>/gi, '').trim();
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

    // Filmstrip for Album or Dimension Evidence items
    if (el.modalFilmstrip) {
      let groupItems = [];
      let groupLabel = '';
      if (item.albumId) {
        groupItems = state.filteredItems.filter(x => x.albumId === item.albumId);
        if (groupItems.length <= 1 && state.data) {
          groupItems = state.data.items.filter(x => x.albumId === item.albumId);
        }
        groupLabel = `📸 同場活動相簿 (${groupItems.length} 檔)：`;
      } else if (item.dimId) {
        groupItems = state.filteredItems.filter(x => x.dimId === item.dimId);
        if (groupItems.length <= 1 && state.data) {
          groupItems = state.data.items.filter(x => x.dimId === item.dimId);
        }
        groupLabel = `📌 同構面官方佐證 (${groupItems.length} 項)：`;
      }

      if (groupItems.length > 1) {
        el.modalFilmstrip.style.display = 'flex';
        el.modalFilmstrip.innerHTML = `
          <span class="modal-filmstrip-label">${groupLabel}</span>
          ${groupItems.map(gi => {
            const thumb = gi.previewImage || gi.localFile || 'downloads/site_assets/avatar.jpg';
            const isCurrent = gi.id === item.id;
            return `<img src="${thumb}" alt="${escapeHtml(gi.headline || '')}" class="modal-filmstrip-thumb ${isCurrent ? 'active' : ''}" onclick="window.openModalByItemId('${gi.id}')" title="${escapeHtml(gi.headline || '')}">`;
          }).join('')}
        `;
        setTimeout(() => {
          const activeThumb = el.modalFilmstrip.querySelector('.modal-filmstrip-thumb.active');
          if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 60);
      } else {
        el.modalFilmstrip.style.display = 'none';
        el.modalFilmstrip.innerHTML = '';
      }
    }

    // Metadata
    const modalDateStr = formatDate(item.createdAt);
    el.modalMetaDate.textContent = `${modalDateStr ? `發布時間：${modalDateStr} · ` : ''}所屬章節：${item.sectionTitle}`;

    // Download action
    if (item.localFile) {
      el.modalDownloadLink.style.display = 'inline-flex';
      el.modalDownloadLink.href = item.localFile;
      el.modalDownloadLink.setAttribute('download', item.fileName || 'file');
      el.modalDownloadLink.innerHTML = `💾 下載本機原件${item.fileSize ? ` (${formatSize(item.fileSize)})` : ''}`;
    } else {
      el.modalDownloadLink.style.display = 'none';
    }

    // External link
    if (item.externalUrl) {
      el.modalExternalLink.style.display = 'inline-flex';
      el.modalExternalLink.href = item.externalUrl;
    } else {
      el.modalExternalLink.style.display = 'none';
    }

    // Prev / Next button state
    el.modalPrevBtn.disabled = index <= 0;
    el.modalNextBtn.disabled = index >= state.filteredItems.length - 1;

    el.modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.openModalByItemId = function(itemId) {
    let idx = state.filteredItems.findIndex(x => String(x.id) === String(itemId));
    if (idx !== -1) {
      openModal(idx);
      return;
    }
    if (state.data) {
      const target = state.data.items.find(x => String(x.id) === String(itemId));
      if (target) {
        if (target.albumId) {
          state.filteredItems = state.data.items.filter(x => x.albumId === target.albumId);
        } else if (target.dimId) {
          state.filteredItems = state.data.items.filter(x => x.dimId === target.dimId);
        } else {
          state.filteredItems = state.data.items;
        }
        idx = state.filteredItems.findIndex(x => String(x.id) === String(itemId));
        if (idx !== -1) openModal(idx);
      }
    }
  };

  function closeModal() {
    el.modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!el.modalBackdrop.classList.contains('open')) {
        el.modalViewerContainer.innerHTML = '';
      }
    }, 300);
  }

  // 7. Event Listeners
  function setupEventListeners() {
    let debounceTimer;
    el.searchInput?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      state.searchQuery = e.target.value;
      state.renderLimit = 48;
      if (el.searchClearBtn) {
        el.searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
      }
      debounceTimer = setTimeout(() => {
        applyFilters();
      }, 200);
    });

    el.searchClearBtn?.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      state.renderLimit = 48;
      el.searchClearBtn.style.display = 'none';
      applyFilters();
    });

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-search');
        if (el.searchInput && query) {
          state.currentCategory = 'all';
          state.currentSection = 'all';
          state.renderLimit = 48;
          el.searchInput.value = query;
          state.searchQuery = query;
          if (el.searchClearBtn) el.searchClearBtn.style.display = 'block';
          renderCategoryTabs();
          applyFilters();
          document.getElementById('portfolio-catalog')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const styleBtn = document.getElementById('styleSwitcherBtn');
    const styleMenu = document.getElementById('styleSwitcherMenu');
    if (styleBtn && styleMenu) {
      styleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = styleMenu.classList.toggle('show');
        styleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if (!styleMenu.contains(e.target) && !styleBtn.contains(e.target)) {
          styleMenu.classList.remove('show');
          styleBtn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && styleMenu.classList.contains('show')) {
          styleMenu.classList.remove('show');
          styleBtn.setAttribute('aria-expanded', 'false');
          styleBtn.focus();
        }
      });
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    if (mobileMenuBtn && mobileNavMenu) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShown = mobileNavMenu.style.display === 'block';
        mobileNavMenu.style.display = isShown ? 'none' : 'block';
      });
      document.addEventListener('click', (e) => {
        if (!mobileNavMenu.contains(e.target) && e.target !== mobileMenuBtn) {
          mobileNavMenu.style.display = 'none';
        }
      });
    }
    window.closeMobileNav = () => {
      if (mobileNavMenu) mobileNavMenu.style.display = 'none';
    };

    const toggleBtn = document.getElementById('subsectionsToggleBtn');
    if (toggleBtn && el.subsectionsList) {
      toggleBtn.addEventListener('click', () => {
        const isExpanded = el.subsectionsList.classList.toggle('is-expanded');
        toggleBtn.classList.toggle('is-active', isExpanded);
        toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        const count = Math.max(1, el.subsectionsList.querySelectorAll('.sub-pill').length - 1);
        toggleBtn.querySelector('.toggle-text').textContent = isExpanded ? '收合為單行' : `展開全部向度 (${count})`;
      });
    }

    el.mediaFilter?.addEventListener('change', (e) => {
      state.currentMediaType = e.target.value;
      state.renderLimit = 48;
      applyFilters();
    });

    el.sortSelect?.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      state.renderLimit = 48;
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
      if (state.currentModalIndex > 0) {
        openModal(state.currentModalIndex - 1);
      }
    });

    el.modalNextBtn?.addEventListener('click', () => {
      if (state.currentModalIndex < state.filteredItems.length - 1) {
        openModal(state.currentModalIndex + 1);
      }
    });

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

    window.addEventListener('keydown', (e) => {
      if (el.pillarModalBackdrop?.classList.contains('open')) {
        if (e.key === 'Escape') window.closePillarModal();
        return;
      }
      if (el.spotlightModalBackdrop?.classList.contains('open')) {
        if (e.key === 'Escape') closeSpotlightModal();
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

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        el.backToTopBtn?.classList.add('visible');
      } else {
        el.backToTopBtn?.classList.remove('visible');
      }
    });

    el.backToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let touchStartX = 0;
    let touchStartY = 0;
    el.modalBackdrop?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    el.modalBackdrop?.addEventListener('touchend', (e) => {
      if (!el.modalBackdrop.classList.contains('open')) return;
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (diffY > 90 && Math.abs(diffY) > Math.abs(diffX) && touchStartY < 300) {
        closeModal();
        return;
      }

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && state.currentModalIndex > 0) {
          openModal(state.currentModalIndex - 1);
        } else if (diffX < 0 && state.currentModalIndex < state.filteredItems.length - 1) {
          openModal(state.currentModalIndex + 1);
        }
      }
    }, { passive: true });

    el.spotlightModalBackdrop?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    el.spotlightModalBackdrop?.addEventListener('touchend', (e) => {
      if (!el.spotlightModalBackdrop.classList.contains('open')) return;
      const touchEndY = e.changedTouches[0].screenY;
      const diffY = touchEndY - touchStartY;
      if (diffY > 100 && touchStartY < 250) {
        closeSpotlightModal();
      }
    }, { passive: true });

    el.printBtn?.addEventListener('click', () => {
      window.print();
    });
  }

  // Helpers
  function getCategoryIcon(catId) {
    const icons = {
      sustainability_sdgs: '🌍',
      profile: '👤',
      certifications: '📜',
      honors: '🏆',
      research: '🔬',
      engagement: '🌿',
      media: '🎙️',
      mentorship: '🎓',
      aesthetic_art: '🎨'
    };
    return icons[catId] || '📁';
  }

  function getMediaBadge(item) {
    const isPdf = item.mediaType === 'pdf' || (item.fileName || '').toLowerCase().endsWith('.pdf') || (item.localFile || '').toLowerCase().endsWith('.pdf') || (item.fileUrl || '').toLowerCase().includes('.pdf');
    if (isPdf) return '<span class="media-type-badge" style="background: #dc2626; color: white;">📄 PDF 成果檔案</span>';
    if (item.evidenceCode) return `<span class="media-type-badge" style="background: #059669; color: white;">🏅 永續評選佐證</span>`;
    if (item.albumId) return `<span class="media-type-badge" style="background: #0d9488; color: white;">📸 永續SDGs相簿</span>`;
    if (item.mediaType === 'image') return '<span class="media-type-badge" style="background: #2563eb; color: white;">🖼️ 成果相片／證書原件</span>';
    if (item.mediaType === 'video') return '<span class="media-type-badge" style="background: rgba(234, 88, 12, 0.9);">🎬 影音報導</span>';
    if (item.externalUrl) return '<span class="media-type-badge" style="background: rgba(14, 165, 233, 0.9);">🌐 外部專題</span>';
    return '<span class="media-type-badge">📝 文字記錄</span>';
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
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
    if (!str || typeof str === 'object') return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightKeyword(text) {
    if (!state.searchQuery.trim()) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const q = escapeRegExp(escapeHtml(state.searchQuery.trim()));
    const regex = new RegExp(`(${q})`, 'gi');
    return escapedText.replace(regex, '<mark class="highlight">$1</mark>');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function formatBodyHtml(body) {
    let html = body;
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    return html;
  }

  function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }

  function showError(msg) {
    if (el.itemsContainer) {
      el.itemsContainer.innerHTML = `<div style="padding: 2rem; color: #ef4444; text-align: center;">${msg}</div>`;
    }
  }

  window.clearAllFilters = function () {
    state.currentCategory = 'all';
    state.currentSection = 'all';
    state.currentMediaType = 'all';
    state.searchQuery = '';
    state.renderLimit = 48;
    if (el.searchInput) el.searchInput.value = '';
    if (el.searchClearBtn) el.searchClearBtn.style.display = 'none';
    if (el.mediaFilter) el.mediaFilter.value = 'all';
    renderCategoryTabs();
    applyFilters();
  };

  window.zoomModalImg = function (delta) {
    state.imageZoom = Math.max(0.5, Math.min(3, state.imageZoom + delta));
    applyImgTransform();
  };

  window.setModalImgZoom = function (val) {
    state.imageZoom = val;
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
    if (img) {
      img.style.transform = `scale(${state.imageZoom}) rotate(${state.imageRotation}deg)`;
    }
  }

  let currentPdfEngine = 'native';

  window.togglePdfEngine = function (pdfSrc, onlinePdfUrl) {
    const iframe = document.getElementById('activePdfIframe');
    if (!iframe) return;
    
    if (currentPdfEngine === 'native') {
      currentPdfEngine = 'google';
      const targetUrl = onlinePdfUrl || '';
      if (targetUrl) {
        iframe.src = `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=true`;
      } else {
        alert('此檔案僅支援本機原生 PDF 預覽');
      }
    } else {
      currentPdfEngine = 'native';
      iframe.src = (pdfSrc || '') + '#toolbar=1&navpanes=0';
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
    const imgSrc = item.localFile || item.previewImage || item.fileUrl;
    window.printDirectAsPdf(title, imgSrc, item.categoryName, item.sectionTitle);
  };

  window.printDirectAsPdf = function (title, imgSrc, catName = '教學成果', secTitle = '專題佐證') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(title)} - 徐秉鴻老師教學成果檔案</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; margin: 0; padding: 15px; color: #0f172a; background: #fff; }
          .print-header { border-bottom: 2.5px solid #059669; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
          .print-title { font-size: 16pt; font-weight: 800; color: #065f46; line-height: 1.2; }
          .print-sub { font-size: 9.5pt; color: #64748b; margin-top: 4px; font-weight: 600; }
          .print-meta-badge { font-size: 9pt; background: #ecfdf5; color: #059669; padding: 3px 8px; border-radius: 4px; border: 1px solid #a7f3d0; font-weight: 700; }
          .print-item-title { font-size: 12pt; font-weight: 700; margin: 12px 0; color: #0f172a; }
          .print-img-box { text-align: center; margin: 12px 0; min-height: 180mm; display: flex; align-items: center; justify-content: center; }
          .print-img-box img { max-width: 100%; max-height: 215mm; object-fit: contain; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
          .print-footer { border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 12px; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-title">苗栗縣頭份市永貞國民小學 · 教學成果與永續教育典藏</div>
            <div class="print-sub">專任教師／閱讀推動教師：徐秉鴻 · 高師大科學教育暨環境教育博士班 · 環境教育人員</div>
          </div>
          <span class="print-meta-badge">${escapeHtml(catName)} · ${escapeHtml(secTitle)}</span>
        </div>
        <div class="print-item-title">📄 成果文件：${escapeHtml(title)}</div>
        <div class="print-img-box">
          <img src="${imgSrc}" alt="${escapeHtml(title)}" onload="setTimeout(() => window.print(), 350);">
        </div>
        <div class="print-footer">
          <span>本機原件數位封存 · 2026 台灣傑出永續教育人物參選典範</span>
          <span>列印/另存日期：${new Date().toLocaleDateString('zh-TW')} · 永貞國小校本課程</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  window.previewSpotlightDoc = function (title, path, onlineUrl, explicitType) {
    const isPdf = explicitType === 'pdf' || (path || '').toLowerCase().endsWith('.pdf') || (onlineUrl || '').toLowerCase().includes('.pdf');
    
    el.modalSectionBadge.textContent = '🌟 旗艦教學與永續教育專題 · 官方原件預覽';
    el.modalTitle.textContent = title;
    
    let viewerContent = '';
    
    if (isPdf) {
      const pdfSrc = path || onlineUrl;
      viewerContent = `
        <div class="pdf-viewer-wrapper">
          <div class="pdf-viewer-toolbar">
            <div class="pdf-toolbar-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>📄 PDF 成果檔案預覽器</span>
            </div>
            <div class="pdf-toolbar-actions">
              ${onlineUrl ? `<button class="pdf-toolbar-btn" onclick="window.togglePdfEngine('${escapeHtml(pdfSrc)}', '${escapeHtml(onlineUrl)}')">🔄 切換預覽引擎</button>` : ''}
              <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
              <a href="${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-toolbar-btn">↗ 新分頁</a>
              <a href="${pdfSrc}" download="${escapeHtml(title)}.pdf" class="pdf-toolbar-btn btn-accent">💾 下載 PDF</a>
            </div>
          </div>
          <div class="pdf-mobile-fallback-bar">
            <span>📱 若行動裝置或 Google Sites 內嵌視窗無法直接捲動多頁 PDF：</span>
            <a href="${pdfSrc}" target="_blank" rel="noopener noreferrer" class="pdf-mobile-open-btn">↗ 點此於新分頁開啟高畫質完整 PDF</a>
          </div>
          <iframe id="activePdfIframe" src="${pdfSrc}#toolbar=1&navpanes=0" class="modal-viewer-pdf" title="${escapeHtml(title)}" allowfullscreen></iframe>
        </div>
      `;
    } else {
      const imgSrc = path || onlineUrl;
      viewerContent = `
        <div class="photo-viewer-wrapper">
          <div class="pdf-viewer-toolbar">
            <div class="pdf-toolbar-title" style="color: #60a5fa;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>🖼️ 成果佐證公文／得獎證照 · 高畫質檢視</span>
            </div>
            <div class="pdf-toolbar-actions">
              <button class="pdf-toolbar-btn" onclick="window.printDirectAsPdf('${escapeHtml(title)}', '${imgSrc}', '旗艦專題', '教學紀錄')">🖨️ 另存/列印為 PDF</button>
              <button class="pdf-toolbar-btn" onclick="window.toggleModalFullscreen()">⛶ 全螢幕</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(0.2)">+</button>
              <button class="pdf-toolbar-btn" onclick="window.zoomModalImg(-0.2)">-</button>
              <button class="pdf-toolbar-btn" onclick="window.rotateModalImg()">↻</button>
              <button class="pdf-toolbar-btn" onclick="window.resetModalImg()">⟲</button>
              <a href="${imgSrc}" download="${escapeHtml(title)}.jpg" class="pdf-toolbar-btn btn-accent">💾 下載佐證原件</a>
            </div>
          </div>
          <div class="photo-viewer-stage">
            <img src="${imgSrc}" alt="${escapeHtml(title)}" class="photo-viewer-img" id="modalActiveImg" referrerpolicy="no-referrer">
          </div>
        </div>
      `;
    }
    
    el.modalViewerContainer.innerHTML = viewerContent;
    el.modalBodyText.parentElement.style.display = 'none';
    if (el.modalFilmstrip) el.modalFilmstrip.style.display = 'none';
    el.modalMetaDate.textContent = `專題佐證文件：${title}`;
    el.modalDownloadLink.style.display = 'inline-flex';
    el.modalDownloadLink.href = path || onlineUrl;
    el.modalDownloadLink.setAttribute('download', title);
    el.modalDownloadLink.innerHTML = `💾 下載佐證原件`;
    el.modalExternalLink.style.display = 'none';
    el.modalPrevBtn.disabled = true;
    el.modalNextBtn.disabled = true;
    
    el.modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.openModal = openModal;
  window.closeModal = closeModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

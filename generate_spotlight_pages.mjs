import fs from 'fs';

const features = JSON.parse(fs.readFileSync('data/special_features.json', 'utf-8'));
const sustainabilityData = JSON.parse(fs.readFileSync('data/sustainability_award.json', 'utf-8'));

function escapeHtml(str) {
  if (!str || typeof str === 'object') return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function linkifyEvidencesStatic(item) {
  if (!item) return '';
  if (typeof item === 'object') {
    const headingHtml = item.heading ? `<strong>${escapeHtml(item.heading)}：</strong>` : '';
    const textHtml = escapeHtml(item.text || '');
    const refsHtml = Array.isArray(item.refs) && item.refs.length > 0
      ? ' ' + item.refs.map(code => `<button type="button" class="sa-evidence-pill" onclick="window.openSpecialEvidence('${escapeHtml(code)}')">📌 佐證 ${escapeHtml(code)}</button>`).join(' ')
      : '';
    return headingHtml + textHtml + refsHtml;
  }
  const escaped = escapeHtml(item);
  return escaped.replace(/【佐證\s*([^】]+)】/g, (full, inner) => {
    const codes = inner.match(/\d+-\d+/g) || [];
    if (!codes.length) return full;
    return `<button type="button" class="sa-evidence-pill" onclick="window.openSpecialEvidence('${codes[0]}')">📌 佐證 ${inner.trim()}</button>`;
  });
}

function buildSustainabilityExtraSections(sa) {
  const info = sa.awardInfo || {};
  const pObj = info.portraits || {};
  const portraits = [
    { path: pObj.suit || 'downloads/sustainability_award/portrait_suit.jpg', title: '徐秉鴻老師｜STEM 科學探究與跨域教育實踐現場（個人封面形象照）', desc: '秉持「教學維持動能、輔導點燃希望、行政懷抱熱忱」之教育初心，於全國科學教育與 STEM 展覽現場實踐跨域探究教學' },
    { path: pObj.teaching || 'downloads/sustainability_award/portrait_teaching.jpg', title: '候選人教學實況照（帶領學童進行 STREAM 跨域實作）', desc: '於永貞國小教室帶領學童進行 STREAM 跨域實作與班級說書歷程' },
    { path: pObj.award || 'downloads/sustainability_award/portrait_award.jpg', title: '候選人獲獎榮耀照（全國科學探究競賽金獎頒獎典禮）', desc: '指導學生榮獲全國科學探究競賽第一名（金獎）完整頒獎典禮合照' },
    { path: pObj.id || 'downloads/sustainability_award/portrait_id.jpg', title: '候選人科普走讀照（國科會臺灣科普環島列車師生合影）', desc: '帶領全班身穿 SDGs 班服參與國科會臺灣科普環島列車跨域走讀' }
  ];
  const dims = sa.dimensions || [];
  const awards = sa.awards17 || [];
  const themes = sa.themeGroups || [];
  const albums = sa.sdgsAlbums || [];
  const themeIcons = { '01': '🌿', '02': '🔬', '03': '📖', '04': '🎓', '05': '⚾' };

  return `
    <!-- Principal Recommendation & 4 Candidate Teaching/Award Scenes -->
    <section class="article-section" style="border-top: 4px solid #059669;">
      <h2><span>🏫 教學與獲獎實踐紀實、校長推薦評語與 300 字永續教育理念</span></h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        ${portraits.map(pt => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; cursor: pointer;" onclick="window.openSpecialLightbox('${escapeHtml(pt.title)}', '${pt.path}', 'image', '${escapeHtml(pt.desc)}')">
            <img src="${pt.path}" alt="${escapeHtml(pt.title)}" style="width: 100%; height: 220px; object-fit: cover; object-position: center 25%;">
            <div style="padding: 0.65rem 0.85rem;">
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-main);">${escapeHtml(pt.title)}</div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem;">${escapeHtml(pt.desc)}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="sa-exec-quote-box" style="margin-bottom: 1rem;">
        <div class="sa-exec-quote-title">🌱 永續教育理念及自我期許（附件三 300 字核心自述）</div>
        <p class="sa-exec-quote-text">${escapeHtml(info.philosophySummary || '')}</p>
      </div>

      <div class="sa-exec-principal-box">
        <strong>🏫 推薦單位（${escapeHtml(info.recommender || '苗栗縣頭份市永貞國民小學・鍾瑞蓉 校長推薦')}）推薦意見摘錄：</strong><br>
        「${escapeHtml(info.recommendationReason || '')}」
      </div>
    </section>

    <!-- Official Submission 5 PDFs -->
    <section class="article-section">
      <h2><span>📑 官方送審四件套與簡章 PDF 原件預覽與下載</span></h2>
      <div class="sa-docs-grid">
        ${(info.officialDocs || []).map(doc => `
          <article class="sa-doc-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="sa-exec-pill">${escapeHtml(doc.badge)}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">PDF 數位原件</span>
              </div>
              <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.45rem;">📄 ${escapeHtml(doc.title)}</h3>
              <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin: 0;">${escapeHtml(doc.desc)}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.65rem; border-top: 1px solid var(--border);">
              <button class="btn-primary" style="background: #059669; border: none; font-size: 0.82rem; padding: 0.45rem 0.9rem;" onclick="window.openSpecialLightbox('${escapeHtml(doc.title)}', '${doc.localFile}', 'pdf', '${escapeHtml(doc.desc)}')">
                🔍 線上預覽 PDF
              </button>
              <a href="${doc.localFile}" target="_blank" class="btn-outline" style="font-size: 0.82rem; padding: 0.45rem 0.8rem;">↗ 新分頁</a>
              <a href="${doc.localFile}" download class="btn-outline" style="font-size: 0.82rem; padding: 0.45rem 0.8rem;">💾 下載</a>
            </div>
          </article>
        `).join('')}
      </div>
    </section>

    <!-- 17 Representative Sustainability Awards Table -->
    <section class="article-section">
      <h2><span>🏆 候選人歷年代表性永續與科學教育獲獎紀錄總表（17 項精選殊榮）</span></h2>
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
                <td style="font-weight: 800; color: #059669;">${aw.no || (i + 1)}</td>
                <td style="white-space: nowrap; font-weight: 700;">${escapeHtml(aw.date)}</td>
                <td style="font-weight: 800; color: var(--text-main);">${escapeHtml(aw.name)}</td>
                <td style="color: var(--text-muted);">${escapeHtml(aw.org)}</td>
                <td style="white-space: nowrap;">
                  <button type="button" class="sa-evidence-pill" onclick="window.openSpecialEvidence('${aw.code}')">📌 佐證 ${escapeHtml(aw.code)}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- 5 Evaluation Dimensions & All 99 Official Evidences -->
    ${dims.map((d, idx) => `
      <section class="article-section" id="dim-section-${idx + 1}" style="border-top: 4px solid ${d.color};">
        <h2>
          <span>${d.icon} ${escapeHtml(d.num)}：${escapeHtml(d.title)}（${escapeHtml(d.subtitle)} · ${d.evidenceCount} 項佐證）</span>
        </h2>
        <div class="sa-evidence-grid">
          ${(d.evidenceItems || []).map(ev => `
            <article class="sa-evidence-card" id="ev-card-${ev.code}" onclick="window.openSpecialLightbox('【佐證 ${escapeHtml(ev.code)}】${escapeHtml(ev.title)}', '${ev.localFile}', 'image', '${escapeHtml(ev.description)}')">
              <div class="sa-ev-img-wrap">
                <img src="${ev.localFile}" alt="【佐證 ${escapeHtml(ev.code)}】${escapeHtml(ev.title)}" loading="lazy">
                <span class="sa-ev-code-badge">📌 佐證 ${escapeHtml(ev.code)}</span>
              </div>
              <div class="sa-ev-body">
                <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                  ${(ev.sdgs || []).map(s => `<span style="font-size: 0.7rem; font-weight: 700; padding: 0.08rem 0.42rem; border-radius: 4px; background: rgba(5,150,105,0.1); color: #059669;">${escapeHtml(s)}</span>`).join('')}
                </div>
                <div class="sa-ev-title">${escapeHtml(ev.title)}</div>
                <div class="sa-ev-desc">${escapeHtml(ev.description)}</div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('')}

    <!-- 93 SDGs Event Albums Summary & Grid -->
    <section class="article-section" id="sdgs-93-albums">
      <h2><span>📸 雲端硬碟「永續SDGs」五大主題 93 場活動相簿全集（共 823 檔）</span></h2>
      <p style="font-size: 0.94rem; color: var(--text-muted); margin-bottom: 1.25rem;">
        以下收錄雲端硬碟「永續SDGs」資料夾內 5 大主題分類、93 個活動場次資料夾（共 570 張活動現場相片與 253 張社群教學紀實截圖）。點擊任一相簿封面可檢視代表照片，或前往主網站典藏庫連播該場次全部照片。
      </p>
      ${themes.map(t => {
        const themeAlbums = albums.filter(a => a.themeCode === t.code);
        const tFiles = themeAlbums.reduce((acc, a) => acc + a.totalCount, 0);
        const tIcon = themeIcons[t.code] || '📸';
        return `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #059669; margin-bottom: 0.85rem; padding-bottom: 0.45rem; border-bottom: 1px solid var(--border);">
              ${tIcon} ${escapeHtml(t.code)} ${escapeHtml(t.name)}（${themeAlbums.length} 場活動相簿 · ${tFiles} 個影像檔）
            </h3>
            <div class="sa-albums-grid">
              ${themeAlbums.map(alb => `
                <article class="sa-album-card">
                  <div class="sa-album-cover" onclick="window.openSpecialLightbox('${escapeHtml(alb.title)}（共 ${alb.totalCount} 檔）', '${alb.coverImage}', 'image', '活動日期：${escapeHtml(alb.dateLabel)}｜收錄 ${alb.photoCount} 張活動照片與 ${alb.screenshotCount} 張社群截圖')">
                    <img src="${alb.coverImage}" alt="${escapeHtml(alb.title)}" loading="lazy">
                    <span class="sa-album-date-pill">📅 ${escapeHtml(alb.dateLabel)}</span>
                    <span class="sa-album-count-pill">📸 ${alb.photoCount} 照 · 📱 ${alb.screenshotCount} 截圖</span>
                  </div>
                  <div class="sa-album-body">
                    <div class="sa-album-title">${escapeHtml(alb.title)}</div>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                      ${(alb.sdgs || []).map(s => `<span style="font-size: 0.7rem; font-weight: 700; padding: 0.08rem 0.4rem; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border);">${escapeHtml(s)}</span>`).join('')}
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </section>
  `;
}

function buildLearningMapSections(feat) {
  const intelligences = [
    {
      id: 'linguistic',
      name: '語文智能',
      eng: 'Verbal-Linguistic Intelligence',
      icon: '📖',
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.08)',
      border: 'rgba(37, 99, 235, 0.3)',
      desc: '善於表達與理解語言',
      focus: '推動學習島嶼、識字測驗、閱讀與寫作',
      sdgs: ['SDG 4 優質教育', 'SDG 10 減少不平等'],
      honors: [
        '<strong>恩慈</strong>：苗栗縣114翰墨鳴華·文狀元「秀才」',
        '<strong>姿涵</strong>：夢花文學獎小夢花兒童詩「優選」',
        '<strong>恩慈、羽菲、姿涵、雅閑</strong>：「品德小故事」苗栗縣佳作',
        '<strong>柏語、彥彤、柏冠、千香</strong>：「識字英雄榜」全國前20名',
        '<strong>雅閑、靖芸、羽菲</strong>：入選「明日說書人博覽會」',
        '<strong>恩慈、庭翊、靖芸</strong>：入選「校內國語文競賽」前三名',
        '<strong>姍君、祈恩、靖芸、羽菲、庭翊、建翔、雅閑</strong>：作品屢登《國語日報》刊登'
      ]
    },
    {
      id: 'logical',
      name: '數理智能',
      eng: 'Logical-Mathematical Intelligence',
      icon: '🔢',
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
      border: 'rgba(5, 150, 105, 0.3)',
      desc: '擅長推理與數字運算',
      focus: '執行數位素養、專題研究課程',
      sdgs: ['SDG 4 優質教育', 'SDG 14 水下生命'],
      honors: [
        '<strong>校長盃「紅火蟻專題研究」海報比賽</strong>：',
        '• 第一名：<strong>恩慈、靖芸、羽菲、祈恩</strong>',
        '• 第三名：<strong>丞諺、彥彤、千香、烽廷</strong>',
        '<strong>PaGamO 中文閱讀素養電競賽</strong>：班級積分突破 5,000 分大關'
      ]
    },
    {
      id: 'spatial',
      name: '視覺空間智能',
      eng: 'Visual-Spatial Intelligence',
      icon: '🎨',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
      border: 'rgba(217, 119, 6, 0.3)',
      desc: '能在腦中建構空間影像',
      focus: '開發【美數·數美】跨領域美感教育課程',
      sdgs: ['SDG 9 產業創新', 'SDG 11 永續城鄉'],
      honors: [
        '教育部跨領域美感卓越領航計畫「標竿學校」核心實踐方案',
        '全班原創創作 <strong>327+ 件</strong> 藝術品（蒙德里安小夜燈、星際自畫像、老屋顏壓花玻璃、幾何四面體風箏）',
        '六甲學童親自擔任成果展美感說課導覽小尖兵，向全校師生及清大羅仕龍教授解說'
      ]
    },
    {
      id: 'kinesthetic',
      name: '肢體動覺智能',
      eng: 'Bodily-Kinesthetic Intelligence',
      icon: '🏃',
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.08)',
      border: 'rgba(220, 38, 38, 0.3)',
      desc: '善於運用身體表達與操控物品',
      focus: '開展班級樂樂棒球、體能活動',
      sdgs: ['SDG 3 良好健康福祉', 'SDG 5 性別平權'],
      honors: [
        '<strong>全校校慶運動會</strong>：拔河競賽、趣味競賽「冠軍」雙冠王',
        '<strong>全校校慶運動會</strong>：大隊接力、班際躲避球「亞軍」',
        '<strong>丞諺、柏語、柏冠、彥彤、千香、烽廷、奕安、恩慈、佩蓉、姿涵、靖芸、羽菲、建翔、姍君</strong>：身穿 SDGs 戰袍榮獲苗栗縣長盃樂樂棒球錦標賽「亞軍、季軍」、理事長盃「亞軍、季軍」',
        '<strong>靖芸、羽菲、祈恩</strong>：出戰全國小學籃球錦標賽女子乙組勇奪「全國亞軍」',
        '<strong>祈恩</strong>：榮膺全國小學籃球錦標賽「最佳球員」'
      ]
    },
    {
      id: 'interpersonal',
      name: '人際智能',
      eng: 'Interpersonal Intelligence',
      icon: '🤝',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
      border: 'rgba(2, 132, 199, 0.3)',
      desc: '能理解與他人互動',
      focus: '踐行公民素養、校本特色子竹嚐肉課程',
      sdgs: ['SDG 1 消除貧困', 'SDG 8 尊嚴就業', 'SDG 12 責任消費', 'SDG 16 和平正義'],
      honors: [
        '<strong>羽菲、恩慈</strong>：當選114學年度「全校模範生（縣長獎）」',
        '<strong>羽菲、恩慈</strong>：當選113-114學年度「班級模範生」',
        '<strong>芷翔、丞諺、恩慈、姿涵</strong>：廣達游於藝「導覽小尖兵」',
        '<strong>丞諺、奕安、姿涵、柏冠</strong>：參與「耶誕多肉盆栽愛心義賣」捐助弱勢',
        '<strong>庭翊、羽菲、丞諺、千香</strong>：接受「客家電視台」新聞專題深度採訪報導'
      ]
    },
    {
      id: 'musical',
      name: '音樂智能',
      eng: 'Musical Intelligence',
      icon: '🎵',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      border: 'rgba(124, 58, 237, 0.3)',
      desc: '對節奏、音調與音色敏感',
      focus: '投入國際交流、雙語、藝術深耕課程',
      sdgs: ['SDG 5 性別平權', 'SDG 17 多元夥伴關係'],
      honors: [
        '英語歌曲、英語簡報、舞蹈多元展能競賽榮獲「優等」',
        '國際交流視訊體驗展演（APT、直笛、校本特色課程）',
        '<strong>恩慈、娉珺</strong>：參與全國音樂比賽陶笛重奏榮獲「優等」',
        '114學年度全班參與「烏克麗麗、雙語」沉浸式深耕體驗'
      ]
    },
    {
      id: 'intrapersonal',
      name: '內省智能',
      eng: 'Intrapersonal Intelligence',
      icon: '🧘',
      color: '#4338ca',
      bg: 'rgba(67, 56, 202, 0.08)',
      border: 'rgba(67, 56, 202, 0.3)',
      desc: '善於自我反省與理解自身',
      focus: '體驗SEL生命課程、落實自主學習知能',
      sdgs: ['SDG 11 永續城鄉', 'SDG 17 多元夥伴關係'],
      honors: [
        '中華民國心理衛生協會「SEL 心理韌性桌布」深度探索',
        '114年度苗栗縣生命教育課程教案徵選榮獲「雙篇優等」',
        '113-114學年度識字金銀島學習島嶼榮獲「自主學習獎」',
        '<strong>恩慈</strong>：獲 Cool English 自主學習簡報比賽「佳作」獎勵',
        '<strong>羽菲</strong>：獲 Cool English 自主學習簡報比賽「獎品」獎勵',
        '<strong>靖芸、丞諺、雅閑、奕安、庭翊、芷翔</strong>：入選自主簡報發表'
      ]
    },
    {
      id: 'naturalist',
      name: '自然智能',
      eng: 'Naturalist Intelligence',
      icon: '🌿',
      color: '#15803d',
      bg: 'rgba(21, 128, 61, 0.08)',
      border: 'rgba(21, 128, 61, 0.3)',
      desc: '善於觀察與分類自然界的事物',
      focus: '參與科普列車、科學探究競賽',
      sdgs: ['SDG 12 責任消費', 'SDG 13 氣候行動', 'SDG 15 陸域生態'],
      honors: [
        '國家科學及技術委員會「2025臺灣科普環島列車」苗栗站擔任科學關主',
        '<strong>娉珺</strong>：入圍環境知識競賽苗栗山城「環保大使選拔」',
        '<strong>靖芸、羽菲</strong>：本土昆蟲探究《竹節蟲黃二的生命奇蹟》入選「全國科學探究競賽」'
      ]
    }
  ];

  const highlights = [
    { icon: '🎵', title: '英語歌曲簡報展能競賽', grade: '全縣優等', desc: '全班投入雙語與英語歌曲展能，展現自信口語與肢體表達' },
    { icon: '🏆', title: '運動會拔河、趣味競賽', grade: '全校冠軍', desc: '班級高度向心力，大隊接力與班際躲避球亦獲全校雙亞軍' },
    { icon: '📚', title: '高年級書籍借閱冊數', grade: '三連霸', desc: '深耕身教式晨讀 MSSR 與自主閱讀，借閱量居全校高年級之冠' },
    { icon: '🏝️', title: '識字金銀島適性學習平台', grade: '自主學習獎', desc: '高師大與國教署適性評估平台，全班自主線上識字學習成效卓越' },
    { icon: '🎨', title: '教育部跨領域美感計畫', grade: '標竿學校', desc: '研發【美數·數美】課程，學生親自導覽向大師說課' }
  ];

  const axes = [
    {
      icon: '🚀',
      title: '創新思維與智慧領航',
      color: '#2563eb',
      tags: ['語文智能', '數理智能', '視覺空間智能'],
      desc: '融合閱讀寫作、文狀元秀才、紅火蟻專題研究與【美數·數美】幾何美感探究，啟發學童獨立思辨與數位素養。'
    },
    {
      icon: '🏃',
      title: '熱血競技與團隊協行',
      color: '#dc2626',
      tags: ['肢體動覺智能', '人際智能'],
      desc: '拔河趣味競賽雙冠、縣長盃/理事長盃樂樂棒雙亞軍、全國小學女籃亞軍與最佳球員，落實多肉公益義賣與全校模範生典範。'
    },
    {
      icon: '🌿',
      title: '內在涵養與永續共榮',
      color: '#059669',
      tags: ['音樂智能', '內省智能', '自然智能'],
      desc: '陶笛重奏優等、國際雙語視訊展演、SEL心理韌性生命教育、科普環島列車關主與全國科學探究競賽入選。'
    }
  ];

  const studentStars = [
    { name: '饒恩慈', honors: '文狀元秀才 · 紅火蟻第一名 · 品德小故事佳作 · 陶笛重奏優等 · 全校模範生縣長獎 · Cool English佳作' },
    { name: '鍾姿涵', honors: '夢花文學獎兒童詩優選 · 品德小故事佳作 · 廣達導覽小尖兵 · 樂樂棒全縣雙亞軍 · 多肉愛心義賣' },
    { name: '陳羽菲', honors: '全校模範生縣長獎 · 紅火蟻第一名 · 女籃全國亞軍 · 國語日報刊登 · 品德小故事佳作 · 客家電視台專訪' },
    { name: '陳祈恩', honors: '全國小學籃球錦標賽最佳球員 · 女籃全國亞軍 · 紅火蟻第一名 · 國語日報刊登' },
    { name: '高靖芸', honors: '女籃全國亞軍 · 紅火蟻第一名 · 竹節蟲全國科探入選 · 明日說書人 · 國語日報刊登 · 樂樂棒雙亞軍' },
    { name: '鍾柏語', honors: '識字英雄榜全國前20名 · 樂樂棒全縣雙亞軍' },
    { name: '林彥彤', honors: '識字英雄榜全國前20名 · 紅火蟻第三名 · 樂樂棒全縣雙亞軍' },
    { name: '徐柏冠', honors: '識字英雄榜全國前20名 · 樂樂棒全縣雙亞軍 · 多肉愛心義賣' },
    { name: '劉千香', honors: '識字英雄榜全國前20名 · 紅火蟻第三名 · 樂樂棒全縣雙亞軍 · 客家電視台專訪' },
    { name: '黃雅閑', honors: '品德小故事佳作 · 明日說書人 · 國語日報刊登 · 自主簡報' },
    { name: '曾庭翊', honors: '國語日報刊登 · 校內語文競賽前三名 · 客家電視台專訪 · 自主簡報' },
    { name: '張姍君', honors: '國語日報刊登 · 樂樂棒全縣雙亞軍' },
    { name: '邱建翔', honors: '國語日報刊登 · 樂樂棒全縣雙亞軍' },
    { name: '羅丞諺', honors: '紅火蟻第三名 · 樂樂棒雙亞軍 · 廣達導覽小尖兵 · 多肉義賣 · 客家電視台專訪' },
    { name: '江烽廷', honors: '紅火蟻第三名 · 樂樂棒全縣雙亞軍' },
    { name: '林奕安', honors: '樂樂棒全縣雙亞軍 · 多肉愛心義賣 · 自主簡報' },
    { name: '鍾佩蓉', honors: '樂樂棒全縣雙亞軍' },
    { name: '曾芷翔', honors: '廣達導覽小尖兵 · 自主學習簡報' },
    { name: '劉娉珺', honors: '全國音樂比賽陶笛重奏優等 · 環保大使選拔入選' }
  ];

  return `
    <!-- Section 1: Brochure Dual-Sided Interactive Showcase -->
    <section class="article-section" id="brochure-viewer">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div>
          <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.75rem; border-radius: 999px; background: rgba(16, 185, 129, 0.12); color: #059669; font-weight: 700; font-size: 0.8rem; border: 1px solid rgba(16, 185, 129, 0.3);">
            ✨ 實體官方摺頁數位典藏 · 100% 原始畫質
          </span>
          <h2 style="margin: 0.5rem 0 0.25rem;"><span>🗺️ 永貞六甲多元智能×SDGs永續學習地圖摺頁展廳</span></h2>
          <p style="font-size: 0.92rem; color: var(--text-muted); margin: 0;">點擊切換折頁「內頁全景（八大智能成果地圖）」或「外頁全景（封面、五大亮點與導師簡歷）」，點擊圖片即可開啟高解析燈箱放大檢視。</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="btnBrochureInner" class="btn-primary" style="font-size: 0.85rem; padding: 0.45rem 1rem;" onclick="switchBrochureSide('inner')">
            🗺️ 檢視折頁內頁（成果地圖）
          </button>
          <button id="btnBrochureOuter" class="btn-outline" style="font-size: 0.85rem; padding: 0.45rem 1rem;" onclick="switchBrochureSide('outer')">
            📘 檢視折頁外頁（封面與導覽）
          </button>
        </div>
      </div>

      <div style="background: var(--bg-surface); border: 2px solid var(--border); border-radius: 18px; padding: 1.25rem; box-shadow: var(--shadow-sm); text-align: center;">
        <div id="brochureStage" style="position: relative; overflow: hidden; border-radius: 12px; cursor: pointer;" onclick="openActiveBrochureLightbox()">
          <img id="brochureImg" src="downloads/feature_photos/sdgs_learning_map_inner.jpg" alt="永貞六甲多元智能×SDGs永續學習地圖折頁（內頁全景）" style="width: 100%; max-height: 720px; object-fit: contain; border-radius: 12px; transition: transform 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.12);">
          <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.8rem; border-radius: 999px; backdrop-filter: blur(6px); display: flex; align-items: center; gap: 0.35rem;">
            🔍 點擊開啟超高清放大檢視
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
          <span id="brochureLabel" style="font-weight: 800; color: var(--text-main); font-size: 0.95rem;">
            🗺️ 折頁內頁全景：創新思維與智慧領航 · 熱血競技與團隊協行 · 內在涵養與永續共榮（八大多元智能完整實踐）
          </span>
          <div style="display: flex; gap: 0.5rem;">
            <a id="brochureDownloadBtn" href="downloads/feature_photos/sdgs_learning_map_inner.jpg" download class="btn-outline" style="font-size: 0.82rem; padding: 0.35rem 0.85rem;">
              💾 下載目前高清原檔
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Educational Vision & Class Highlights -->
    <section class="article-section">
      <h2><span>🌟 班級願景、教育心聲與班級五大亮點</span></h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08)); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 1.5rem;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #059669; margin-bottom: 0.4rem;">🌈 築夢踏實 · 夢想起飛</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.65rem;">教育心聲</h3>
          <p style="font-size: 0.98rem; line-height: 1.75; color: var(--text-main); margin: 0;">
            「攜手共同養育每種可能，讓孩子自信地多元展能，以成為改變世界的量能。」
          </p>
          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(16, 185, 129, 0.2); font-size: 0.88rem; color: var(--text-muted);">
            <strong>班級共榮里程碑：</strong>1位導師、17位孩子，共創里程碑！讓每一位孩子在自己擅長的軌道上綻放閃耀光芒。
          </div>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem;">
          <div style="font-size: 0.82rem; font-weight: 800; color: var(--primary); margin-bottom: 0.4rem;">👨‍🏫 導師簡歷與服務理念</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.65rem;">徐秉鴻 老師</h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.88rem; color: var(--text-main);">
            <li>🏫 <strong>專任導師兼圖書館閱讀推動教師</strong>（苗栗縣永貞國小）</li>
            <li>🌍 <strong>苗栗縣國際教育中心</strong> 專業人員（2025迄今）</li>
            <li>🎓 <strong>高師大 科學教育暨環境教育研究所</strong> 博士生、理學碩士</li>
            <li>📐 <strong>高師大 數學系應用數學組</strong> 學士、小教集中實習總召</li>
          </ul>
        </div>
      </div>

      <div class="lm-highlights-grid">
        ${highlights.map(h => `
          <div class="lm-hl-card">
            <div class="lm-hl-icon">${h.icon}</div>
            <div class="lm-hl-title">${escapeHtml(h.title)}</div>
            <div class="lm-hl-grade">${escapeHtml(h.grade)}</div>
            <div class="lm-hl-desc">${escapeHtml(h.desc)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 3: Three Strategic Navigation Axes -->
    <section class="article-section">
      <h2><span>🧭 三大跨域導覽軸線</span></h2>
      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.25rem;">
        將 Howard Gardner 八大智能整合成三大動態實踐軸線，深度鏈結聯合國永續發展指標（SDGs）：
      </p>
      <div class="lm-axes-grid">
        ${axes.map(a => `
          <div class="lm-axis-card" style="border-top-color: ${a.color};">
            <h4>${a.icon} ${escapeHtml(a.title)}</h4>
            <div class="lm-axis-tags">
              ${a.tags.map(t => `<span class="lm-axis-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <p class="lm-axis-desc">${escapeHtml(a.desc)}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 4: Eight Multiple Intelligences Full Interactive Grid -->
    <section class="article-section">
      <h2><span>🧠 八大多元智能 × SDGs 深度實踐矩陣</span></h2>
      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.25rem;">
        每一種智能均對應聯合國永續指標（UN SDGs），詳實記錄全班學童在各領域的卓越表現與獲獎榮耀：
      </p>
      <div class="lm-intelligences-grid">
        ${intelligences.map(intel => `
          <article class="lm-card" style="border-top: 4px solid ${intel.color};">
            <div class="lm-card-header">
              <div class="lm-card-title-group">
                <span class="lm-card-icon" style="background: ${intel.bg}; color: ${intel.color};">${intel.icon}</span>
                <div>
                  <div class="lm-card-title">${escapeHtml(intel.name)}</div>
                  <div class="lm-card-eng">${escapeHtml(intel.eng)}</div>
                </div>
              </div>
              <div class="lm-card-sdgs">
                ${intel.sdgs.map(s => `<span class="lm-sdg-tag" style="color: ${intel.color}; border-color: ${intel.border};">🎯 ${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
            <div class="lm-card-desc">💡 智能核心定義：${escapeHtml(intel.desc)}</div>
            <div class="lm-card-focus" style="background: ${intel.bg}; color: ${intel.color};">
              🚩 班級推動主軸：${escapeHtml(intel.focus)}
            </div>
            <ul class="lm-card-honors">
              ${intel.honors.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </article>
        `).join('')}
      </div>
    </section>

    <!-- Section 5: Student Stars Roster (永貞六甲 17 位學童全人展能星光名冊) -->
    <section class="article-section">
      <h2><span>⭐ 永貞六甲 17 位學童全人展能星光名冊</span></h2>
      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1rem;">
        不遺漏任何一人（Leave No One Behind），每一位孩子都在自己擅長的跑道上創下耀眼的個人與團隊成就：
      </p>
      <div class="lm-student-stars-wrap">
        ${studentStars.map(s => `
          <div class="lm-student-star-pill">
            <span class="lm-student-name">✨ ${escapeHtml(s.name)}</span>
            <span class="lm-student-honors">（${escapeHtml(s.honors)}）</span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 6: Authentic Gallery -->
    <section class="article-section">
      <h2><span>📸 永貞六甲現場探究與榮耀紀實</span></h2>
      <div class="spotlight-gallery">
        ${(feat.photos || []).map(p => `
          <div class="spotlight-gallery-item" style="cursor: pointer;" onclick="window.openSpecialLightbox('${escapeHtml(p.caption)}', '${p.url}', 'image', '')">
            <img src="${p.url}" alt="${escapeHtml(p.caption)}" class="spotlight-gallery-img" loading="lazy">
            <div class="spotlight-gallery-caption">🔍 ${escapeHtml(p.caption)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 7: Documents & Brochure Downloads -->
    <section class="article-section">
      <h2><span>📑 折頁官方高畫質原檔典藏下載</span></h2>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${(feat.documents || []).map(d => `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding: 0.85rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
            <span style="font-weight: 700; color: var(--text-main);">📑 ${escapeHtml(d.title)}</span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-primary" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;" onclick="window.openSpecialLightbox('${escapeHtml(d.title)}', '${d.path}', 'image', '')">
                🔍 高畫質預覽
              </button>
              <a href="${d.path}" target="_blank" download class="btn-outline" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
                💾 下載原檔 &rarr;
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function createPageHtml(feat) {
  const themeMap = {
    'sustainability': { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
    'succulent': { color: 'var(--theme-succulent)', bg: 'var(--theme-succulent-bg)' },
    'aesthetic': { color: 'var(--theme-aesthetic)', bg: 'var(--theme-aesthetic-bg)' },
    'reading': { color: 'var(--theme-reading)', bg: 'var(--theme-reading-bg)' },
    'international': { color: 'var(--theme-international)', bg: 'var(--theme-international-bg)' },
    'science': { color: 'var(--theme-science)', bg: 'var(--theme-science-bg)' },
    'learning_map': { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' }
  };
  const theme = themeMap[feat.id] || { color: 'var(--primary)', bg: 'var(--primary-light)' };

  const navPillsHtml = features.map(f => {
    const active = f.id === feat.id;
    const shortLabels = {
      sustainability: '🌍 傑出永續教育人物',
      science: '🔬 科學探究雙金',
      learning_map: '🗺️ 六甲多元智能學習地圖',
      succulent: '🌵 多肉植癒 SEL',
      aesthetic: '🎨 跨域美感標竿',
      reading: '📖 明日閱讀典範',
      international: '🏮 蘆竹湳雙語古厝'
    };
    return `<a href="special-${f.id}.html" class="btn-outline" style="font-size: 0.8rem; padding: 0.38rem 0.85rem; ${active ? 'background: #059669; color: #fff; border-color: #059669;' : ''}">${shortLabels[f.id] || f.title}</a>`;
  }).join('');

  const allEvidencesJson = feat.id === 'sustainability'
    ? JSON.stringify((sustainabilityData.dimensions || []).flatMap(d => d.evidenceItems || []))
    : '[]';

  return `<!DOCTYPE html>
<html lang="zh-TW" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHtml(feat.title)} - 徐秉鴻老師旗艦教學與永續教育專題</title>
  <meta name="description" content="${escapeHtml(feat.subtitle)}。苗栗縣頭份市永貞國小徐秉鴻老師教學成果專題。">
  <link rel="icon" href="downloads/site_assets/avatar.jpg" type="image/jpeg">
  <link rel="stylesheet" href="css/styles.css">
  <script>
    (function() {
      var savedTheme = 'light';
      try {
        savedTheme = (window.localStorage && window.localStorage.getItem('theme')) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } catch (_) {}
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();
  </script>
  <style>
    .article-container {
      max-width: 1180px;
      margin: 2rem auto 4.5rem;
      padding: 0 1.75rem;
    }
    .back-nav-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .back-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: var(--primary);
      font-size: 0.92rem;
    }
    .article-hero {
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-bottom: 2.25rem;
      position: relative;
      background: #0f172a;
      box-shadow: var(--shadow-lg);
    }
    .article-hero img {
      width: 100%;
      height: 440px;
      object-fit: cover;
      object-position: center 25%;
      opacity: 0.94;
      display: block;
    }
    .article-hero-badge {
      position: absolute;
      bottom: 24px;
      left: 24px;
      background: var(--gold-gradient);
      padding: 0.55rem 1.25rem;
      border-radius: var(--radius-full);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.95rem;
      border: 1px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }
    .article-header {
      margin-bottom: 2rem;
    }
    .article-header-tag {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 700;
      background: ${theme.bg};
      color: ${theme.color};
      margin-bottom: 0.75rem;
      border: 1px solid rgba(var(--primary-rgb), 0.2);
    }
    .article-header h1 {
      font-size: clamp(1.45rem, 4.5vw, 2.4rem);
      font-weight: 800;
      line-height: 1.28;
      color: var(--text-main);
      margin-bottom: 0.65rem;
      letter-spacing: -0.02em;
    }
    .article-header p.sub {
      font-size: clamp(0.95rem, 2.5vw, 1.15rem);
      color: ${theme.color};
      font-weight: 700;
      line-height: 1.5;
    }
    .article-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 2.25rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      position: relative;
    }
    .article-section h2 {
      font-size: clamp(1.15rem, 3vw, 1.45rem);
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 1.35rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.85rem;
      letter-spacing: -0.01em;
    }
    @media (max-width: 768px) {
      .article-container {
        margin: 1rem auto 2.5rem;
        padding: 0 0.85rem;
      }
      .article-hero img {
        height: 220px;
      }
      .article-hero-badge {
        position: static;
        border-radius: 0;
        font-size: 0.8rem;
        padding: 0.5rem 0.85rem;
        width: 100%;
        justify-content: center;
      }
      .article-section {
        padding: 1.25rem 1rem;
      }
    }
  </style>
</head>
<body>

  <!-- Site Header -->
  <header class="site-header">
    <div class="header-container">
      <a href="index.html" class="brand-wrapper">
        <div class="brand-avatar-container">
          <img src="downloads/site_assets/avatar.jpg" alt="徐秉鴻老師｜STEM 科學探究與跨域教育實踐現場" class="brand-avatar">
          <span class="brand-status-dot"></span>
        </div>
        <div class="brand-info">
          <span class="brand-name">徐秉鴻 老師 <span class="brand-sust-pill">🌱 傑出永續教育人物</span></span>
          <span class="brand-role">苗栗縣永貞國小 · 高師大科環所博士班 · 環境教育人員</span>
        </div>
      </a>
      <div class="header-actions">
        <a href="index.html" class="btn-primary" style="font-size: 0.85rem; padding: 0.48rem 0.95rem;">
          &larr; 返回成果首頁
        </a>

        <!-- 三大風格切換選單 (Global Skill 3-Archetypes) -->
        <div class="relative-dropdown" id="styleSwitcherWrapper">
          <button id="styleSwitcherBtn" class="btn-outline style-switcher-btn" title="切換成果網站三大經典風格" aria-haspopup="true" aria-expanded="false">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"/></svg>
            <span>風格 (3)</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="styleSwitcherMenu" class="style-dropdown-menu">
            <a href="index.html" class="style-menu-item">
              <span class="style-item-icon">🌍</span>
              <div class="style-item-text">
                <span class="style-item-title">1. 永續教育 × STREAM 旗艦版</span>
                <span class="style-item-desc">傑出永續教育人物策展與 1,143 筆檢索庫</span>
              </div>
            </a>
            <a href="academic.html" class="style-menu-item">
              <span class="style-item-icon">🏛️</span>
              <div class="style-item-text">
                <span class="style-item-title">2. 學院卓越智庫版</span>
                <span class="style-item-desc">TSSCI 論文發表與學術研究專用</span>
              </div>
            </a>
            <a href="literary.html" class="style-menu-item">
              <span class="style-item-icon">🌿</span>
              <div class="style-item-text">
                <span class="style-item-title">3. 自然走讀與書香人文版</span>
                <span class="style-item-desc">環境教育、走讀古厝與晨讀推廣</span>
              </div>
            </a>
          </div>
        </div>

        <button id="themeToggleBtn" class="btn-icon" title="切換深淺模式">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button onclick="window.print()" class="btn-icon" title="列印此專題">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Article Container -->
  <main class="article-container">
    <div class="back-nav-row">
      <a href="index.html" class="back-nav">&larr; 返回成果首頁（1,143 筆典藏庫）</a>
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
        ${navPillsHtml}
      </div>
    </div>

    <div class="article-hero">
      <img src="${feat.heroImage}" alt="${escapeHtml(feat.title)}">
      <div class="article-hero-badge">🏆 ${escapeHtml(feat.award)}</div>
    </div>

    <div class="article-header">
      <span class="article-header-tag">${escapeHtml(feat.category)}</span>
      <h1>${escapeHtml(feat.title)}</h1>
      <p class="sub">${escapeHtml(feat.subtitle)}</p>
    </div>

    ${feat.id === 'aesthetic' ? `
    <!-- 2026 跨領域美感成果展官方旗艦入口導覽卡 -->
    <div style="background: linear-gradient(135deg, #090e24 0%, #151b3d 60%, #2e1065 100%); border: 1px solid rgba(168, 85, 247, 0.5); border-radius: 16px; padding: 1.5rem; color: #f8fafc; box-shadow: 0 10px 28px -6px rgba(124, 58, 237, 0.4); margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
        <span style="font-size: 0.8rem; font-weight: 800; color: #e9d5ff; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.45); padding: 0.25rem 0.75rem; border-radius: 9999px;">✨ 2026 跨領域美感成果展網站已完整介接</span>
        <span style="font-size: 0.85rem; color: #94a3b8;">永貞國小六年甲班 × 徐秉鴻老師</span>
      </div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">永貞國小六年甲班 2026跨領域美感教學成果網站</h3>
      <p style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.65; margin-bottom: 1.2rem;">完整收錄 327+ 件學生原創藝術品（蒙德里安小夜燈、星際自畫像、老屋顏壓花玻璃）、217+ 課堂紀實照片、63+ 部專題影音、18 步實踐歷程與 3 大美感互動實驗室！</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
        <a href="https://binghong-xu.github.io/yongzhen-stem-art/" target="_blank" class="btn-primary" style="background: linear-gradient(135deg, #6366f1, #9333ea); border: none; font-size: 0.9rem; padding: 0.55rem 1.25rem; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
          🚀 開啟 2026 跨領域美感網站全貌 ↗
        </a>
        <a href="https://binghong-xu.github.io/yongzhen-stem-art/#labs" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.35); font-size: 0.9rem; padding: 0.55rem 1rem; text-decoration: none; border-radius: 10px; font-weight: 600;">
          🧪 互動實驗室 ↗
        </a>
        <a href="https://binghong-xu.github.io/yongzhen-stem-art/#gallerySection" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.35); font-size: 0.9rem; padding: 0.55rem 1rem; text-decoration: none; border-radius: 10px; font-weight: 600;">
          🖼️ 320+ 作品藝廊 ↗
        </a>
        <a href="https://padlet.com/binghong0124/padlet-yeyaoboypt7yix4w" target="_blank" class="btn-outline" style="color: #e2e8f0; border-color: rgba(255, 255, 255, 0.35); font-size: 0.9rem; padding: 0.55rem 1rem; text-decoration: none; border-radius: 10px; font-weight: 600;">
          📌 Padlet 官方看板 ↗
        </a>
      </div>
    </div>` : ''}

    <!-- Meta Card -->
    <div class="spotlight-meta-grid" style="margin-bottom: 2rem;">
      <div class="spotlight-meta-item">
        <span class="spotlight-meta-label">殊榮競賽與認證</span>
        <span class="spotlight-meta-val" style="color: var(--gold);">${escapeHtml(feat.award)}</span>
      </div>
      <div class="spotlight-meta-item">
        <span class="spotlight-meta-label">課程實施對象</span>
        <span class="spotlight-meta-val">${escapeHtml(feat.target)}</span>
      </div>
      <div class="spotlight-meta-item">
        <span class="spotlight-meta-label">實施節數 / 期程</span>
        <span class="spotlight-meta-val">${escapeHtml(feat.duration)}</span>
      </div>
    </div>

    <!-- Section 1: Overview -->
    <section class="article-section">
      <h2><span>📖 專題設計緣起與核心精神</span></h2>
      <p style="font-size: 1.02rem; line-height: 1.85; color: var(--text-main); margin-bottom: 1.5rem;">
        ${escapeHtml(feat.overview)}
      </p>
      <div class="spotlight-tags-row">
        ${(feat.tags || []).map(t => `<span class="spotlight-pill"># ${escapeHtml(t)}</span>`).join('')}
      </div>
    </section>

    <!-- Section 2: SDGs Alignment -->
    <section class="article-section">
      <h2><span>🌍 核心素養與聯合國永續指標 (SDGs) 對應</span></h2>
      <div class="sdg-grid">
        ${(feat.sdgs || []).map(s => `
          <div class="sdg-box">
            <span class="sdg-code">${escapeHtml(s.code)}</span>
            <h5>${escapeHtml(s.title)}</h5>
            <p>${escapeHtml(s.desc)}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 3: Core Modules -->
    <section class="article-section">
      <h2><span>🧩 核心模組與教學實踐架構</span></h2>
      <div class="modules-list">
        ${(feat.modules || []).map(m => `
          <div class="module-box">
            <h4>${escapeHtml(m.name)}</h4>
            <div class="module-focus">${escapeHtml(m.focus)}</div>
            <p>${escapeHtml(m.content)}</p>
          </div>
        `).join('')}
      </div>
    </section>

    ${feat.id === 'sustainability'
      ? buildSustainabilityExtraSections(sustainabilityData)
      : (feat.id === 'learning_map'
          ? buildLearningMapSections(feat)
          : `
      <!-- Section 4: Authentic Gallery -->
      <section class="article-section">
        <h2><span>📸 教學現場紀實與成果照片（點擊放大檢視）</span></h2>
        <div class="spotlight-gallery">
          ${(feat.photos || []).map(p => `
            <div class="spotlight-gallery-item" style="cursor: pointer;" onclick="window.openSpecialLightbox('${escapeHtml(p.caption)}', '${p.url}', 'image', '')">
              <img src="${p.url}" alt="${escapeHtml(p.caption)}" class="spotlight-gallery-img" loading="lazy">
              <div class="spotlight-gallery-caption">🔍 ${escapeHtml(p.caption)}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section 5: Documents -->
      ${feat.documents && feat.documents.length > 0 ? `
        <section class="article-section">
          <h2><span>📑 相關獲獎證明與教案原件</span></h2>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${feat.documents.map(d => {
              const isPdf = d.type === 'pdf' || (d.path || '').toLowerCase().endsWith('.pdf');
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding: 0.85rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
                  <span style="font-weight: 700; color: var(--text-main);">📑 ${escapeHtml(d.title)}</span>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;" onclick="window.openSpecialLightbox('${escapeHtml(d.title)}', '${d.path}', '${isPdf ? 'pdf' : 'image'}', '')">
                      🔍 線上預覽
                    </button>
                    <a href="${d.path}" target="_blank" download class="btn-outline" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
                      💾 下載原件 &rarr;
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}
    `)}

    <div style="text-align: center; margin-top: 3.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
      <a href="index.html" class="btn-primary" style="padding: 0.75rem 2.25rem; font-size: 1rem;">
        &larr; 返回徐秉鴻老師 教學成果主網站
      </a>
      <a href="index.html#portfolio-catalog" class="btn-outline" style="padding: 0.75rem 1.75rem; font-size: 1rem;">
        🗂️ 檢索 1,143 筆成果典藏庫
      </a>
    </div>
  </main>

  <!-- Built-in Lightbox Modal for Standalone Page -->
  <div id="specialLightbox" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-section-badge">${escapeHtml(feat.category)}</span>
          <h2 id="slTitle" class="modal-title">預覽</h2>
        </div>
        <button class="modal-close-btn" onclick="window.closeSpecialLightbox()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="slViewer" class="modal-viewer-container"></div>
        <div id="slDescWrap" class="modal-details" style="display: none;">
          <div id="slDesc" class="modal-body-text"></div>
        </div>
      </div>
      <div class="modal-footer">
        <span style="font-size: 0.82rem; color: var(--text-muted);">徐秉鴻老師教學成果與永續教育數位典藏</span>
        <div style="display: flex; gap: 0.5rem;">
          <a id="slDownload" href="#" download class="btn-primary">💾 下載原件</a>
          <button class="btn-outline" onclick="window.closeSpecialLightbox()">關閉視窗</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Site Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-meta">
        <strong>徐秉鴻老師 教學成果與「2026 台灣傑出永續教育人物」數位典藏庫</strong>
        <span>苗栗縣頭份市永貞國民小學｜國立高雄師範大學 科學教育暨環境教育研究所博士班｜環境部認證環境教育人員</span>
      </div>
      <div class="footer-links">
        <a href="index.html">成果首頁</a>
        <a href="special-sustainability.html">🌍 傑出永續教育人物專頁</a>
        <a href="徐秉鴻老師_教學成果檔案清單.md">Markdown 檔案目錄</a>
      </div>
    </div>
  </footer>

  <script>
    const ALL_EVIDENCES = ${allEvidencesJson};

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const nxt = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nxt);
        try { if (window.localStorage) window.localStorage.setItem('theme', nxt); } catch (_) {}
      });
    }

    window.openSpecialLightbox = function(title, src, type, desc) {
      const lb = document.getElementById('specialLightbox');
      document.getElementById('slTitle').textContent = title;
      const viewer = document.getElementById('slViewer');
      if (type === 'pdf' || (src || '').toLowerCase().endsWith('.pdf')) {
        viewer.innerHTML = '<div class="pdf-viewer-wrapper">' +
          '<div class="pdf-mobile-fallback-bar">' +
            '<span>📱 若行動裝置或 Google Sites 內嵌視窗無法直接捲動多頁 PDF：</span>' +
            '<a href="' + src + '" target="_blank" rel="noopener noreferrer" class="pdf-mobile-open-btn">↗ 點此於新分頁開啟高畫質完整 PDF</a>' +
          '</div>' +
          '<iframe src="' + src + '#toolbar=1" class="modal-viewer-pdf" style="width:100%;height:70vh;border:none;"></iframe>' +
        '</div>';
      } else {
        viewer.innerHTML = '<div class="photo-viewer-wrapper"><div class="photo-viewer-stage"><img src="' + src + '" alt="' + title + '" class="photo-viewer-img"></div></div>';
      }
      const descWrap = document.getElementById('slDescWrap');
      const descEl = document.getElementById('slDesc');
      if (desc) {
        descEl.textContent = desc;
        descWrap.style.display = 'block';
      } else {
        descWrap.style.display = 'none';
      }
      const dl = document.getElementById('slDownload');
      dl.href = src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    window.openSpecialEvidence = function(code) {
      const ev = ALL_EVIDENCES.find(x => x.code === code);
      if (ev) {
        window.openSpecialLightbox('【佐證 ' + ev.code + '】' + (ev.headline || ev.title), ev.localFile, 'image', ev.description);
      } else {
        const elCard = document.getElementById('ev-card-' + code);
        if (elCard) elCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    let currentBrochureSide = 'inner';
    window.switchBrochureSide = function(side) {
      currentBrochureSide = side;
      const img = document.getElementById('brochureImg');
      const label = document.getElementById('brochureLabel');
      const dl = document.getElementById('brochureDownloadBtn');
      const btnInner = document.getElementById('btnBrochureInner');
      const btnOuter = document.getElementById('btnBrochureOuter');
      if (!img) return;
      if (side === 'inner') {
        img.src = 'downloads/feature_photos/sdgs_learning_map_inner.jpg';
        img.alt = '永貞六甲多元智能×SDGs永續學習地圖折頁（內頁全景）';
        if (label) label.textContent = '🗺️ 折頁內頁全景：創新思維與智慧領航 · 熱血競技與團隊協行 · 內在涵養與永續共榮（八大多元智能完整實踐）';
        if (dl) dl.href = 'downloads/feature_photos/sdgs_learning_map_inner.jpg';
        if (btnInner) btnInner.className = 'btn-primary';
        if (btnOuter) btnOuter.className = 'btn-outline';
      } else {
        img.src = 'downloads/feature_photos/sdgs_learning_map_outer.jpg';
        img.alt = '永貞六甲多元智能×SDGs永續學習地圖折頁（外頁全景）';
        if (label) label.textContent = '📘 折頁外頁全景：築夢踏實封面 · 班級五大亮點 · 導師簡歷 · 八大智能導覽清單與班級共榮';
        if (dl) dl.href = 'downloads/feature_photos/sdgs_learning_map_outer.jpg';
        if (btnInner) btnInner.className = 'btn-outline';
        if (btnOuter) btnOuter.className = 'btn-primary';
      }
    };

    window.openActiveBrochureLightbox = function() {
      const src = currentBrochureSide === 'inner' ? 'downloads/feature_photos/sdgs_learning_map_inner.jpg' : 'downloads/feature_photos/sdgs_learning_map_outer.jpg';
      const title = currentBrochureSide === 'inner' ? '永貞六甲多元智能×SDGs永續學習地圖折頁（內頁全景）' : '永貞六甲多元智能×SDGs永續學習地圖折頁（外頁全景）';
      window.openSpecialLightbox(title, src, 'image', '苗栗縣頭份市永貞國小六年甲班（YES 601）徐秉鴻導師帶領 17 位學童共創之多元智能與 SDGs 永續成果手冊');
    };

    window.closeSpecialLightbox = function() {
      const lb = document.getElementById('specialLightbox');
      lb.classList.remove('open');
      document.body.style.overflow = '';
    };

    document.getElementById('specialLightbox')?.addEventListener('click', (e) => {
      if (e.target.id === 'specialLightbox') window.closeSpecialLightbox();
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
  </script>

</body>
</html>
`;
}

for (const feat of features) {
  const fileName = `special-${feat.id}.html`;
  fs.writeFileSync(fileName, createPageHtml(feat), 'utf-8');
  console.log(`✅ Generated ${fileName}`);
}

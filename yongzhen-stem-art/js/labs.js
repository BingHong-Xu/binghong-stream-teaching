/**
 * Aesthetic Labs - Interactive STEM + Art Experiential Modules (High-DPI Retina & Touch Optimized)
 * 1. Mondrian & Fibonacci Generator (Touch & Resize Responsive)
 * 2. Emotion Color Wheel & Explorer
 * 3. Stained Glass & Old House Tile Light Simulator (Touch + Mouse Support)
 */

const AestheticLabs = {
  init() {
    this.initMondrianLab();
    this.initEmotionLab();
    this.initStainedGlassLab();
    this.initStarsBackground();
  },

  // --- Background Starfield (Retina Crisp) ---
  initStarsBackground() {
    const canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      stars = [];
      const numStars = Math.floor((width * height) / 11000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.25 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          color: ['#ffffff', '#a5b4fc', '#67e8f9', '#fbcfe8'][Math.floor(Math.random() * 4)]
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let s of stars) {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        s.opacity += Math.sin(Date.now() * s.pulseSpeed) * 0.01;
        s.opacity = Math.max(0.1, Math.min(0.9, s.opacity));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  },

  // --- Lab 1: Mondrian Generator ---
  initMondrianLab() {
    const canvas = document.getElementById('mondrianCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const depthSlider = document.getElementById('mondrianDepth');
    const themeSelect = document.getElementById('mondrianTheme');
    const randomBtn = document.getElementById('mondrianRandom');
    const exportBtn = document.getElementById('mondrianExport');

    const themes = {
      classic: {
        bg: '#f8fafc',
        lines: '#0f172a',
        colors: ['#ef4444', '#3b82f6', '#eab308', '#ffffff', '#ffffff', '#ffffff']
      },
      yongzhen: {
        bg: '#0f172a',
        lines: '#e2e8f0',
        colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#1e293b', '#334155']
      },
      cyber: {
        bg: '#050811',
        lines: '#38bdf8',
        colors: ['#06b6d4', '#f43f5e', '#a855f7', '#10b981', '#0b1329']
      },
      stained: {
        bg: '#18181b',
        lines: '#d4d4d8',
        colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
      }
    };

    function drawMondrian() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parentW = canvas.parentElement.clientWidth || 320;
      const w = parentW;
      const h = window.innerWidth < 640 ? 260 : 320;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      ctx.save();
      ctx.scale(dpr, dpr);

      const depth = parseInt(depthSlider?.value || 4);
      const themeKey = themeSelect?.value || 'classic';
      const currentTheme = themes[themeKey] || themes.classic;

      ctx.fillStyle = currentTheme.bg;
      ctx.fillRect(0, 0, w, h);

      const rects = [];
      
      function split(x, y, rw, rh, currentDepth) {
        if (currentDepth <= 0 || rw < 28 || rh < 28 || (Math.random() > 0.85 && currentDepth < depth - 1)) {
          rects.push({ x, y, w: rw, h: rh });
          return;
        }

        const splitHoriz = rw > rh ? (Math.random() > 0.3) : (Math.random() > 0.7);
        const ratioOptions = [0.382, 0.5, 0.618];
        const ratio = ratioOptions[Math.floor(Math.random() * ratioOptions.length)];

        if (splitHoriz) {
          const w1 = rw * ratio;
          split(x, y, w1, rh, currentDepth - 1);
          split(x + w1, y, rw - w1, rh, currentDepth - 1);
        } else {
          const h1 = rh * ratio;
          split(x, y, rw, h1, currentDepth - 1);
          split(x + y, rw, rh - h1, currentDepth - 1);
        }
      }

      split(0, 0, w, h, depth);

      rects.forEach(r => {
        const col = currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)];
        ctx.fillStyle = col;
        ctx.fillRect(r.x, r.y, r.w, r.h);

        ctx.strokeStyle = currentTheme.lines;
        ctx.lineWidth = themeKey === 'cyber' ? 2 : (window.innerWidth < 640 ? 3 : 4);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });

      ctx.restore();
    }

    if (depthSlider) depthSlider.addEventListener('input', drawMondrian);
    if (themeSelect) themeSelect.addEventListener('change', drawMondrian);
    if (randomBtn) randomBtn.addEventListener('click', drawMondrian);
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = '永貞國小-美數蒙德里安幾何創作.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.getElementById('mondrianCanvas')) drawMondrian();
      }, 150);
    });

    drawMondrian();
  },

  // --- Lab 2: Emotion Color Explorer ---
  initEmotionLab() {
    const emotionData = {
      sour: {
        name: '酸 (Sour)',
        colorName: '檸檬嫩綠 × 亮鵝黃',
        hex: '#bef264',
        bg: 'from-lime-400 to-yellow-300',
        desc: '刺激、清新、活潑又帶點青澀的酸感。學生以亮黃與草綠相互穿插，表現微酸的味覺轉化。',
        filterTag: '酸'
      },
      sweet: {
        name: '甜 (Sweet)',
        colorName: '蜜桃粉紅 × 奶霜白',
        hex: '#f472b6',
        bg: 'from-pink-400 to-rose-300',
        desc: '溫馨、甜蜜、幸福與童趣。使用柔和暖粉與淺橘粉彩，呈現糖果般的甜美共鳴。',
        filterTag: '甜'
      },
      bitter: {
        name: '苦 (Bitter)',
        colorName: '深沉橄欖 × 焦褐綠',
        hex: '#4d7c0f',
        bg: 'from-emerald-900 to-stone-700',
        desc: '內斂、深邃、歷練後的沉穩。運用低明度黃綠與暗灰調，體會苦味中的深層回甘。',
        filterTag: '苦'
      },
      spicy: {
        name: '辣 (Spicy)',
        colorName: '烈焰朱紅 × 焦陽橘',
        hex: '#ef4444',
        bg: 'from-red-500 to-orange-500',
        desc: '熱情、衝擊、爆發力十足的能量。以飽和鮮紅與暖橘撞色，象徵熾熱奔放的情緒。',
        filterTag: '辣'
      },
      joy: {
        name: '喜 (Joy)',
        colorName: '金燦日光 × 琥珀金',
        hex: '#f59e0b',
        bg: 'from-amber-400 to-yellow-500',
        desc: '明亮歡愉、雀躍希望。像破曉的朝陽穿透幾何窗花，散發無限喜悅與蓬勃朝氣。',
        filterTag: '喜'
      },
      anger: {
        name: '怒 (Anger)',
        colorName: '暴風黑褐 × 刺目赤紅',
        hex: '#991b1b',
        bg: 'from-red-700 to-slate-900',
        desc: '強烈張力、衝突對抗。使用銳利線條與暗黑赤紅交織，呈現火山噴發般的情緒張力。',
        filterTag: '怒'
      },
      sorrow: {
        name: '哀 (Sorrow)',
        colorName: '深海靛藍 × 淚光冰藍',
        hex: '#3b82f6',
        bg: 'from-blue-600 to-indigo-900',
        desc: '沉靜、思念、悠遠微憂。層層冷色調水彩渲染，宛如夜空與深海中的心靈沉思。',
        filterTag: '哀'
      },
      cheer: {
        name: '樂 (Cheer)',
        colorName: '青空蔚藍 × 翡翠綠',
        hex: '#06b6d4',
        bg: 'from-cyan-400 to-emerald-400',
        desc: '自由自在、青春無拘。在藍綠自然色階中流暢躍動，象徵六甲畢業生的快樂啟程。',
        filterTag: '樂'
      }
    };

    const container = document.getElementById('emotionButtonsContainer');
    const displayBox = document.getElementById('emotionDisplay');
    if (!container || !displayBox) return;

    container.innerHTML = Object.entries(emotionData).map(([key, item]) => `
      <button data-emotion="${key}" class="emotion-btn px-3 sm:px-4 py-2.5 rounded-xl border border-slate-700 hover:border-indigo-400 transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 group touch-target">
        <span class="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0" style="background-color: ${item.hex}"></span>
        <span class="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white truncate">${item.name}</span>
      </button>
    `).join('');

    function setEmotion(key) {
      const item = emotionData[key];
      if (!item) return;

      document.querySelectorAll('.emotion-btn').forEach(btn => {
        if (btn.dataset.emotion === key) {
          btn.classList.add('border-indigo-400', 'bg-indigo-950/70', 'ring-2', 'ring-indigo-500/30');
        } else {
          btn.classList.remove('border-indigo-400', 'bg-indigo-950/70', 'ring-2', 'ring-indigo-500/30');
        }
      });

      displayBox.innerHTML = `
        <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-br ${item.bg} bg-opacity-20 border border-white/10 relative overflow-hidden transition-all duration-300">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full shadow-md border-2 border-white/40 flex-shrink-0" style="background-color: ${item.hex}"></span>
              <h4 class="text-sm sm:text-lg font-bold text-white drop-shadow">${item.name} 色彩心理解碼</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/40 text-white backdrop-blur border border-white/20">${item.colorName}</span>
          </div>
          <p class="text-slate-100 text-xs sm:text-sm leading-relaxed mb-4 drop-shadow-sm">${item.desc}</p>
          <button onclick="App.filterByCategory('emotion', '${item.filterTag}')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black/50 hover:bg-black/70 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all touch-target">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
            在藝廊中查看「${item.filterTag}」學生作品
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.emotion-btn');
      if (btn) setEmotion(btn.dataset.emotion);
    });

    setEmotion('sweet');
  },

  // --- Lab 3: Stained Glass & Old House Tile Simulator ---
  initStainedGlassLab() {
    const canvas = document.getElementById('stainedGlassCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const patternSelect = document.getElementById('glassPattern');
    const opacitySlider = document.getElementById('glassOpacity');
    const lightModeToggle = document.getElementById('glassLightMode');

    let lightX = 180, lightY = 140;
    let isNight = false;

    function drawStainedGlass() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parentW = canvas.parentElement.clientWidth || 320;
      const w = parentW;
      const h = window.innerWidth < 640 ? 260 : 320;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const pattern = patternSelect?.value || 'oldhouse';
      const opacity = parseFloat(opacitySlider?.value || 0.85);

      // Background ambient
      ctx.fillStyle = isNight ? '#030712' : '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Light beam radial gradient
      const lightGrad = ctx.createRadialGradient(lightX, lightY, 10, lightX, lightY, w * 0.7);
      if (isNight) {
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        lightGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.4)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        lightGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.5)');
        lightGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw Glass Pattern
      ctx.save();
      ctx.globalAlpha = opacity;

      if (pattern === 'oldhouse') {
        const step = window.innerWidth < 640 ? 46 : 56;
        for (let x = 0; x < w; x += step) {
          for (let y = 0; y < h; y += step) {
            const colors = ['#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];
            ctx.fillStyle = colors[(Math.floor(x/step) + Math.floor(y/step)) % colors.length];
            ctx.fillRect(x + 2, y + 2, step - 4, step - 4);

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + step/2, y + step/2, step/4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      } else if (pattern === 'rose') {
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.45;
        const rings = 4;
        const sectors = 12;

        for (let r = 0; r < rings; r++) {
          const r1 = (r / rings) * maxR;
          const r2 = ((r + 1) / rings) * maxR;
          for (let s = 0; s < sectors; s++) {
            const a1 = (s / sectors) * Math.PI * 2;
            const a2 = ((s + 1) / sectors) * Math.PI * 2;

            ctx.fillStyle = `hsl(${(s * 30 + r * 45) % 360}, 85%, ${isNight ? 55 : 65}%)`;
            ctx.beginPath();
            ctx.arc(cx, cy, r2, a1, a2);
            ctx.arc(cx, cy, r1, a2, a1, true);
            ctx.closePath();
            ctx.fill();
          }
        }
      } else if (pattern === 'triangle') {
        const size = window.innerWidth < 640 ? 38 : 48;
        for (let x = 0; x < w + size; x += size) {
          for (let y = 0; y < h + size; y += size) {
            const col1 = `hsl(${(x + y) % 360}, 75%, 60%)`;
            const col2 = `hsl(${(x - y + 360) % 360}, 75%, 50%)`;

            ctx.fillStyle = col1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = col2;
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x, y + size);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      ctx.restore();

      // Lead framing lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = window.innerWidth < 640 ? 3 : 5;
      if (pattern === 'oldhouse') {
        const step = window.innerWidth < 640 ? 46 : 56;
        for (let x = 0; x <= w; x += step) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      } else if (pattern === 'rose') {
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.45;
        const rings = 4;
        const sectors = 12;
        for (let r = 1; r <= rings; r++) {
          ctx.beginPath(); ctx.arc(cx, cy, (r/rings)*maxR, 0, Math.PI*2); ctx.stroke();
        }
        for (let s = 0; s < sectors; s++) {
          const a = (s / sectors) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR); ctx.stroke();
        }
      }

      ctx.restore();
    }

    function handleLightMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      lightX = clientX - rect.left;
      lightY = clientY - rect.top;
      drawStainedGlass();
    }

    // Mouse events
    canvas.addEventListener('mousemove', (e) => handleLightMove(e.clientX, e.clientY));

    // Touch events for mobile & tablet
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleLightMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleLightMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    if (patternSelect) patternSelect.addEventListener('change', drawStainedGlass);
    if (opacitySlider) opacitySlider.addEventListener('input', drawStainedGlass);
    if (lightModeToggle) {
      lightModeToggle.addEventListener('click', () => {
        isNight = !isNight;
        lightModeToggle.innerHTML = isNight 
          ? `<i data-lucide="moon" class="w-4 h-4 text-amber-400"></i> 夜晚小夜燈模式 (LED光)` 
          : `<i data-lucide="sun" class="w-4 h-4 text-yellow-400"></i> 白晝日照穿透模式 (自然光)`;
        if (window.lucide) lucide.createIcons();
        drawStainedGlass();
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.getElementById('stainedGlassCanvas')) drawStainedGlass();
      }, 150);
    });

    drawStainedGlass();
  }
};

window.AestheticLabs = AestheticLabs;

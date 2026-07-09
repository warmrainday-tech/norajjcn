/* ========================================
   绫月乃萝粉丝站 · 交互逻辑
   GSAP 动效 + 花瓣粒子 + 主题切换
   ======================================== */

gsap.registerPlugin(ScrollTrigger);

/* ===== 花瓣粒子系统 ===== */
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  let petals = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 花瓣 SVG path
  const petalPath = new Path2D();
  petalPath.moveTo(0, -8);
  petalPath.quadraticCurveTo(6, -4, 5, 2);
  petalPath.quadraticCurveTo(2, 8, 0, 6);
  petalPath.quadraticCurveTo(-2, 8, -5, 2);
  petalPath.quadraticCurveTo(-6, -4, 0, -8);

  class Petal {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : -20;
      this.size = 0.6 + Math.random() * 0.8;
      this.speedY = 0.3 + Math.random() * 0.8;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.swayAmp = 20 + Math.random() * 40;
      this.swayFreq = 0.005 + Math.random() * 0.01;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.opacity = 0.3 + Math.random() * 0.4;
      // 薰衣草色系随机
      const colors = ['#B57EDC', '#C9A0E8', '#E6D7F5', '#D4A5E8', '#FFD6E8'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update(t) {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(t * this.swayFreq + this.swayOffset) * 0.5;
      this.rotation += this.rotSpeed;
      if (this.y > H + 20) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.size, this.size);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fill(petalPath);
      ctx.restore();
    }
  }

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 15 : 35;
  for (let i = 0; i < count; i++) petals.push(new Petal());

  let time = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    time++;
    petals.forEach(p => { p.update(time); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ===== 主题切换 ===== */
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('nora-theme', theme);
}

const savedTheme = localStorage.getItem('nora-theme');
if (savedTheme) {
  setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  // 圆形扩散过渡
  const btn = themeToggle.getBoundingClientRect();
  const x = btn.left + btn.width / 2;
  const y = btn.top + btn.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  
  // GSAP 过渡
  gsap.to(document.body, {
    duration: 0.4,
    ease: 'power2.inOut',
    onComplete: () => setTheme(next)
  });
  
  // 如果支持 View Transitions
  if (document.startViewTransition) {
    document.startViewTransition(() => setTheme(next));
  } else {
    setTheme(next);
  }
});

/* ===== 导航 ===== */
const navbar = document.getElementById('navbar');
const burger = document.getElementById('nav-burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => navLinks.classList.toggle('active'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('active'));
});

// 滚动改变导航样式
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 2px 20px rgba(181, 126, 220, 0.1)';
    navbar.style.background = html.getAttribute('data-theme') === 'dark' 
      ? 'rgba(26, 21, 37, 0.95)' : 'rgba(245, 240, 250, 0.95)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

/* ===== Gallery 生成 ===== */
const galleryImages = [
  'pixiv_hd_1', 'pixiv_hd_2', 'pixiv_hd_3', 'pixiv_hd_5',
  'pixiv_hd_6', 'pixiv_hd_7', 'pixiv_hd_9', 'pixiv_hd_10', 'pixiv_hd_12',
  'vid_1', 'vid_2', 'vid_3', 'vid_4', 'vid_5', 'vid_8'
];

const galleryGrid = document.getElementById('gallery-grid');
galleryImages.forEach((name, i) => {
  const ext = name.startsWith('goods') ? 'png' : 'jpg';
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.setAttribute('data-reveal', '');
  item.innerHTML = `<img src="https://nora-cdn.warmrainday.workers.dev/images/${name}.${ext}" alt="${name}" loading="lazy">`;
  item.addEventListener('click', () => openLightbox(i));
  galleryGrid.appendChild(item);
});

/* ===== Lightbox ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
let currentIdx = 0;

function openLightbox(idx) {
  currentIdx = idx;
  const name = galleryImages[idx];
  lightboxImg.src = `https://nora-cdn.warmrainday.workers.dev/images/${name}.jpg`;
  lightbox.classList.add('active');
  gsap.fromTo(lightboxImg, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function navLightbox(dir) {
  currentIdx = (currentIdx + dir + galleryImages.length) % galleryImages.length;
  const name = galleryImages[currentIdx];
  gsap.fromTo(lightboxImg, { opacity: 0, x: dir * 30 }, { opacity: 1, x: 0, duration: 0.3 });
  lightboxImg.src = `https://nora-cdn.warmrainday.workers.dev/images/${name}.jpg`;
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navLightbox(-1));
lightboxNext.addEventListener('click', () => navLightbox(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLightbox(-1);
  if (e.key === 'ArrowRight') navLightbox(1);
});

/* ===== 生日倒计时 ===== */
function updateBirthdayCountdown() {
  const now = new Date();
  const year = now.getFullYear();
  let birthday = new Date(year, 3, 21); // 4月21日 (月份0-indexed)
  if (now > birthday) birthday = new Date(year + 1, 3, 21);
  
  const diff = birthday - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  document.getElementById('birthday-countdown').textContent = `还有 ${days} 天 ${hours} 小时`;
}
updateBirthdayCountdown();

/* ===== GSAP 动效 ===== */

// Hero 入场
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTl
  .from('.hero-avatar-wrap', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.7)' })
  .from('.title-jp', { y: 30, opacity: 0, duration: 0.6 }, '-=0.4')
  .from('.title-cn', { y: 50, opacity: 0, duration: 0.8 }, '-=0.3')
  .from('.hero-tagline', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
  .from('.hero-slogan', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
  .from('.hero-cta > *', { y: 20, opacity: 0, duration: 0.4, stagger: 0.15 }, '-=0.2')
  .from('.hero-birthday', { y: 20, opacity: 0, duration: 0.5 }, '-=0.1')
  .from('.scroll-hint', { opacity: 0, duration: 0.5 }, '-=0.1');

// Hero 背景视差
gsap.to('.blob-1', { yPercent: 20, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
gsap.to('.blob-2', { yPercent: -20, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
gsap.to('.blob-3', { yPercent: 30, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

// Hero avatar 视差
gsap.to('.hero-content', { yPercent: -20, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

// 滚动 reveal
gsap.utils.toArray('[data-reveal]').forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true
    }
  });
});

// About 图片视差
gsap.to('.about-image img', {
  yPercent: -10,
  scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 }
});

// 数字递增
gsap.utils.toArray('.stat-num').forEach(num => {
  const target = parseInt(num.dataset.count);
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: num,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          num.textContent = target >= 1000 
            ? Math.floor(obj.val).toLocaleString() 
            : Math.floor(obj.val);
        }
      });
    }
  });
});

// Gallery 错落入场
ScrollTrigger.create({
  trigger: '.gallery-grid',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.from('.gallery-item', {
      opacity: 0,
      y: 40,
      scale: 0.9,
      duration: 0.6,
      stagger: { each: 0.08, from: 'random' },
      ease: 'power3.out'
    });
  }
});

// Timeline 左侧滑入
gsap.utils.toArray('.timeline-item').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0,
    x: -40,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 85%',
      once: true
    }
  });
});

// Quote 卡片旋转入场
gsap.utils.toArray('.quote-card').forEach((card, i) => {
  gsap.from(card, {
    opacity: 0,
    y: 40,
    rotation: i % 2 === 0 ? -3 : 3,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      once: true
    }
  });
});

// 鼠标光斑跟随 (Hero)
const hero = document.querySelector('.hero');
hero.addEventListener('mousemove', (e) => {
  const rect = hero.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  gsap.to('.blob-3', { x: (x - rect.width / 2) * 0.1, y: (y - rect.height / 2) * 0.1, duration: 2 });
});

// Gallery 卡片 3D 倾斜
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -8;
    const ry = ((x - cx) / cx) * 8;
    gsap.to(item, { rotationX: rx, rotationY: ry, duration: 0.3, ease: 'power2.out' });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(item, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power3.out' });
  });
});

/* ===== 弹幕留言 ===== */
const danmakuWall = document.getElementById('danmaku-wall');
const fanwallInput = document.getElementById('fanwall-input');
const fanwallSubmit = document.getElementById('fanwall-submit');

const defaultMessages = [
  '乃萝最可爱了！💜',
  '猫猫贴贴！🐱',
  '赛博损友永远在线',
  '涩图画师好啊',
  '4月21日快乐！',
  '乃萝加油！',
  '每天都在等直播',
  '画技太强了！',
  '猫猫猫猫猫',
  '来看乃萝发癫了',
  '本命无疑',
  '乃萝的声音好治愈',
];

// 从 localStorage 加载
let messages = JSON.parse(localStorage.getItem('nora-messages') || 'null') || defaultMessages;

function renderMessages() {
  danmakuWall.innerHTML = '';
  messages.forEach(msg => {
    const item = document.createElement('span');
    item.className = 'danmaku-item';
    item.textContent = msg;
    danmakuWall.appendChild(item);
  });
}
renderMessages();

fanwallSubmit.addEventListener('click', () => {
  const text = fanwallInput.value.trim();
  if (!text) return;
  messages.push(text);
  if (messages.length > 50) messages.shift();
  localStorage.setItem('nora-messages', JSON.stringify(messages));
  
  // 添加动画
  const item = document.createElement('span');
  item.className = 'danmaku-item';
  item.textContent = text;
  item.style.background = 'linear-gradient(135deg, var(--lavender), var(--sakura))';
  item.style.color = '#fff';
  danmakuWall.appendChild(item);
  
  fanwallInput.value = '';
  
  gsap.from(item, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
});

fanwallInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fanwallSubmit.click();
});

/* ===== 平滑滚动 ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      gsap.to(window, { duration: 1, scrollTo: target, ease: 'power2.inOut' });
    }
  });
});

/* ===== 导航高亮 ===== */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: () => {
    let current = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        current = sec.id;
      }
    });
    navItems.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` 
        ? 'var(--lavender)' : '';
    });
  }
});

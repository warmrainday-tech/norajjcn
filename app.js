/* 绫月乃萝粉丝站 · 交互 */

/* ===== 主题 ===== */
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('nora-theme', t);
}

const saved = localStorage.getItem('nora-theme');
if (saved) setTheme(saved);
else if (matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

themeToggle.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ===== 导航 ===== */
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
burger.addEventListener('click', () => navLinks.classList.toggle('active'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('active'));
});

const navbar = document.getElementById('navbar');
addEventListener('scroll', () => {
  navbar.style.boxShadow = scrollY > 50 ? '0 2px 20px rgba(181,126,220,.1)' : 'none';
});

/* ===== Gallery ===== */
const galleryImages = [
  'pixiv_hd_1','pixiv_hd_2','pixiv_hd_3','pixiv_hd_5',
  'pixiv_hd_6','pixiv_hd_7','pixiv_hd_9','pixiv_hd_10','pixiv_hd_12',
  'vid_1','vid_2','vid_3','vid_4','vid_5','vid_8'
];

const grid = document.getElementById('gallery-grid');
galleryImages.forEach((name, i) => {
  const el = document.createElement('div');
  el.className = 'gallery-item';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `<img src="assets/images/${name}.jpg" alt="${name}" loading="lazy">`;
  el.addEventListener('click', () => openLightbox(i));
  grid.appendChild(el);
});

/* ===== Lightbox ===== */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
let lbIdx = 0;

function openLightbox(i) {
  lbIdx = i;
  lbImg.src = `assets/images/${galleryImages[i]}.jpg`;
  lb.classList.add('active');
}
function closeLightbox() { lb.classList.remove('active'); }
function navLb(d) {
  lbIdx = (lbIdx + d + galleryImages.length) % galleryImages.length;
  lbImg.src = `assets/images/${galleryImages[lbIdx]}.jpg`;
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => navLb(-1));
document.getElementById('lightbox-next').addEventListener('click', () => navLb(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLb(-1);
  if (e.key === 'ArrowRight') navLb(1);
});

/* ===== 生日倒计时 ===== */
  const now = new Date();
  let bday = new Date(now.getFullYear(), 3, 21);
  if (now > bday) bday = new Date(now.getFullYear() + 1, 3, 21);
  const diff = bday - now;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  document.getElementById('birthday-countdown').textContent = `${d}天 ${h}小时`;
})();

/* ===== 入场动画 (CSS-driven, no GSAP dependency) ===== */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      e.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

/* Hero 入场 */
window.addEventListener('load', () => {
  const els = document.querySelectorAll('.hero-content > *');
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + i * 120);
  });
});

/* ===== Gallery 3D 倾斜 ===== */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mousemove', e => {
    const r = item.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height/2) / (r.height/2)) * -6;
    const ry = ((x - r.width/2) / (r.width/2)) * 6;
    item.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
  });
});

/* ==========================================================================
   Phuwaret Phattarapakorn — การทำงานและการโต้ตอบหน้าพอร์ตโฟลิโอ (Vanilla JavaScript)
   ========================================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-category-card');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toastEl = document.getElementById('toast');
  const currentYearEl = document.getElementById('currentYear');

  let toastTimer = null;

  /* ------------------------------------------------------------------------
     1. แสดงปีปัจจุบันที่ส่วนท้ายเว็บ (Footer)
     ------------------------------------------------------------------------ */
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     2. สลับโหมดสีมืด / สว่าง พร้อมบันทึกค่าลงใน localStorage
     ------------------------------------------------------------------------ */
  const THEME_KEY = 'phuwaret-portfolio-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      // ข้ามข้อผิดพลาดกรณีสภาพแวดล้อมจำกัดการใช้งาน localStorage
    }
  }

  (function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_KEY);
    } catch (_) {
      savedTheme = null;
    }

    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      showToast(next === 'dark' ? 'เปลี่ยนเป็นโหมดมืดแล้ว' : 'เปลี่ยนเป็นโหมดสว่างแล้ว');
    });
  }

  /* ------------------------------------------------------------------------
     3. เปิด-ปิดเมนูนำทางบนหน้าจอมือถือ
     ------------------------------------------------------------------------ */
  function setMenuOpen(isOpen) {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง');
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.contains('open');
      setMenuOpen(!isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener('click', function (event) {
      if (!navMenu.classList.contains('open')) return;
      const clickedInsideNav = navMenu.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);
      if (!clickedInsideNav && !clickedToggle) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenuOpen(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. แถบแสดงความคืบหน้าการเลื่อนหน้า และแสดง/ซ่อนปุ่มกลับขึ้นด้านบน
     ------------------------------------------------------------------------ */
  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    if (scrollProgress) {
      scrollProgress.style.width = progress + '%';
    }

    if (backToTop) {
      backToTop.classList.toggle('visible', scrollTop > 420);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     5. ติดตามหัวข้อที่กำลังอ่านเพื่อไฮไลต์เมนูนำทาง
     ------------------------------------------------------------------------ */
  const trackedSections = document.querySelectorAll('main section[id]');

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + activeId);
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
      }
    );

    trackedSections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------------
     6. แอนิเมชันแสดงเนื้อหาเมื่อเลื่อนหน้าลงมาถึง
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------------
     7. ตัวกรองหมวดหมู่ทักษะ
     ------------------------------------------------------------------------ */
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const selected = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      skillCards.forEach(function (card) {
        const category = card.getAttribute('data-category');
        const shouldShow = selected === 'all' || category === selected;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });

  /* ------------------------------------------------------------------------
     8. คัดลอกข้อมูลการติดต่อไปยังคลิปบอร์ด
     ------------------------------------------------------------------------ */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }

  copyButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      const textToCopy = button.getAttribute('data-copy');
      const label = button.getAttribute('data-label') || 'ข้อมูล';
      if (!textToCopy) return;

      try {
        await copyText(textToCopy);
        const originalText = button.textContent;
        button.textContent = 'คัดลอกแล้ว';
        showToast('คัดลอก' + label + ' (' + textToCopy + ') เรียบร้อยแล้ว');

        setTimeout(function () {
          button.textContent = originalText;
        }, 1800);
      } catch (_) {
        showToast('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
      }
    });
  });

  /* ------------------------------------------------------------------------
     9. ฟังก์ชันแสดงข้อความแจ้งเตือนแบบ Toast
     ------------------------------------------------------------------------ */
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2600);
  }
})();

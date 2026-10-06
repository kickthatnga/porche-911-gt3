/**
 * Porsche 911 GT3 RS Showcase — Main JavaScript
 * Handles sticky navbar scroll state, responsive hamburger toggle, and focus management.
 */

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

  /* --------------------------------------------------------------------------
     1. Sticky Navbar: Frosted Glass on Scroll (> 50px)
     -------------------------------------------------------------------------- */
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  /* --------------------------------------------------------------------------
     2. Mobile Menu (Hamburger) Toggle & Accessibility
     -------------------------------------------------------------------------- */
  const toggleMobileMenu = (forceClose = false) => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    mobileOverlay.setAttribute('aria-hidden', String(!shouldOpen));

    if (shouldOpen) {
      mobileOverlay.classList.add('active');
      document.body.classList.add('menu-open');
    } else {
      mobileOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  };

  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      toggleMobileMenu();
    });

    // Close menu when clicking on any mobile nav link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(true);
      });
    });

    // Close mobile menu on Esc key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        toggleMobileMenu(true);
        menuToggle.focus();
      }
    });

    // Close mobile menu if resized above 1024px
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && menuToggle.getAttribute('aria-expanded') === 'true') {
        toggleMobileMenu(true);
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. Hero Mouse Parallax (Desktop / Non-touch only)
     -------------------------------------------------------------------------- */
  const heroSection = document.getElementById('hero');
  const heroCarWrap = document.getElementById('heroCarWrap');
  const heroTitleGiant = document.querySelector('.hero-title-giant');

  const isTouchDevice = () => {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           window.matchMedia('(pointer: coarse)').matches;
  };

  if (heroSection && heroCarWrap && heroTitleGiant && !isTouchDevice()) {
    let targetX = 0;
    let targetY = 0;
    let currentCarX = 0;
    let currentCarY = 0;
    let currentTextX = 0;
    let currentTextY = 0;
    let rafId = null;

    const updateParallax = () => {
      // Smooth linear interpolation (lerp)
      const ease = 0.08;
      
      // Car moves up to 10px in pointer direction
      const carTargetX = targetX * 10;
      const carTargetY = targetY * 6;
      currentCarX += (carTargetX - currentCarX) * ease;
      currentCarY += (carTargetY - currentCarY) * ease;

      // Text moves up to 25px in opposite direction
      const textTargetX = -targetX * 25;
      const textTargetY = -targetY * 12;
      currentTextX += (textTargetX - currentTextX) * ease;
      currentTextY += (textTargetY - currentTextY) * ease;

      // Apply transforms
      heroCarWrap.style.transform = `translate3d(${currentCarX.toFixed(2)}px, ${currentCarY.toFixed(2)}px, 0)`;
      heroTitleGiant.style.transform = `translate3d(${currentTextX.toFixed(2)}px, ${currentTextY.toFixed(2)}px, 0)`;

      // Keep animation frame running while parallax is active
      rafId = requestAnimationFrame(updateParallax);
    };

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      targetX = x * 2; // -1 to 1
      targetY = y * 2; // -1 to 1

      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });
  }

  /* --------------------------------------------------------------------------
     4. SECTION 3: Cinematic Banner Word-by-Word Stagger Reveal
     -------------------------------------------------------------------------- */
  const bannerQuote = document.getElementById('bannerQuote');
  const bannerSection = document.getElementById('cinematic-banner');

  if (bannerSection && bannerQuote) {
    const words = bannerQuote.querySelectorAll('.word');
    // Set 80ms stagger delay for each word span
    words.forEach((word, index) => {
      word.style.transitionDelay = `${index * 80}ms`;
    });

    const bannerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bannerQuote.classList.add('revealed');
          observer.unobserve(entry.target); // Runs once
        }
      });
    }, {
      threshold: 0.40 // 40% visible
    });

    bannerObserver.observe(bannerSection);
  }

  /* --------------------------------------------------------------------------
     5. SECTION 4: Specs Grid Stagger & Count-Up Animation
     -------------------------------------------------------------------------- */
  const specsGrid = document.getElementById('specsGrid');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ease Out Cubic function: 1 - Math.pow(1 - t, 3)
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const isComma = el.getAttribute('data-format') === 'comma';

    if (prefersReducedMotion) {
      // Instant target without counting
      let formatted = target.toFixed(decimals);
      if (isComma) {
        formatted = Math.round(target).toLocaleString('en-US');
      }
      el.textContent = formatted;
      return;
    }

    const duration = 1600; // 1.6s
    const startTime = performance.now();

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentVal = target * easedProgress;

      let formatted = currentVal.toFixed(decimals);
      if (isComma) {
        formatted = Math.round(currentVal).toLocaleString('en-US');
      }
      el.textContent = formatted;

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        // Ensure final exact value
        let finalFormatted = target.toFixed(decimals);
        if (isComma) {
          finalFormatted = Math.round(target).toLocaleString('en-US');
        }
        el.textContent = finalFormatted;
      }
    };

    requestAnimationFrame(updateValue);
  };

  if (specsGrid) {
    const specCards = specsGrid.querySelectorAll('.spec-card');
    const counters = specsGrid.querySelectorAll('.spec-num');

    const specsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          specsGrid.classList.add('revealed');
          // Trigger count-up animation for all cards once
          counters.forEach(counter => animateCounter(counter));
          observer.unobserve(entry.target); // Runs once
        }
      });
    }, {
      threshold: 0.20 // Triggers when top of grid enters view
    });

    specsObserver.observe(specsGrid);
  }

  /* --------------------------------------------------------------------------
     6. SECTION 5: Interactive Configurator
     -------------------------------------------------------------------------- */
  const configStage = document.getElementById('configStage');
  const carImages = document.querySelectorAll('.config-car-img');
  const swatchButtons = document.querySelectorAll('.swatch-btn');
  const configColorTitle = document.getElementById('configColorTitle');
  const configColorPrice = document.getElementById('configColorPrice');

  const toggleWeissach = document.getElementById('toggleWeissach');
  const toggleCarbonWheels = document.getElementById('toggleCarbonWheels');

  const summaryPaint = document.getElementById('summaryPaint');
  const summaryWeissach = document.getElementById('summaryWeissach');
  const summaryWheels = document.getElementById('summaryWheels');
  const summaryTotal = document.getElementById('summaryTotal');

  const BASE_PRICE = 35100000; // ₹3,51,00,000
  let currentPaintCost = 0;
  let currentWeissachCost = 0;
  let currentWheelsCost = 0;
  let displayedTotal = BASE_PRICE;

  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  // Smooth Total Price Ticker (.6s)
  let priceRafId = null;
  const animateTotalPrice = (fromVal, toVal) => {
    if (prefersReducedMotion) {
      summaryTotal.textContent = inrFormatter.format(toVal);
      displayedTotal = toVal;
      return;
    }

    if (priceRafId) cancelAnimationFrame(priceRafId);

    const duration = 600; // 0.6s
    const startTime = performance.now();

    const updatePriceTicker = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(fromVal + (toVal - fromVal) * eased);

      summaryTotal.textContent = inrFormatter.format(current);

      if (progress < 1) {
        priceRafId = requestAnimationFrame(updatePriceTicker);
      } else {
        displayedTotal = toVal;
        summaryTotal.textContent = inrFormatter.format(toVal);
      }
    };

    priceRafId = requestAnimationFrame(updatePriceTicker);
  };

  const updateCalculations = () => {
    const newTotal = BASE_PRICE + currentPaintCost + currentWeissachCost + currentWheelsCost;

    // Paint summary line
    summaryPaint.textContent = currentPaintCost > 0 ? inrFormatter.format(currentPaintCost) : '₹0';

    // Weissach summary line
    summaryWeissach.textContent = currentWeissachCost > 0 ? inrFormatter.format(currentWeissachCost) : '—';

    // Wheels summary line
    summaryWheels.textContent = currentWheelsCost > 0 ? inrFormatter.format(currentWheelsCost) : '—';

    // Animate total price ticker
    animateTotalPrice(displayedTotal, newTotal);
  };

  // Swatch Selection Handler
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name');
      const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);

      if (btn.classList.contains('active')) return;

      // Update swatch active state & aria-pressed
      swatchButtons.forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Crossfade car image
      carImages.forEach(img => {
        if (img.getAttribute('data-color') === color) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });

      // Quick subtle stage pulse (scale 1 -> 1.015 -> 1)
      if (configStage && !prefersReducedMotion) {
        configStage.classList.remove('color-pulse');
        // trigger reflow
        void configStage.offsetWidth;
        configStage.classList.add('color-pulse');
      }

      // Update under-stage title and price description
      if (configColorTitle) configColorTitle.textContent = name;
      if (configColorPrice) {
        configColorPrice.textContent = cost > 0 ? `+${inrFormatter.format(cost)}` : 'Included';
      }

      // Update paint cost and recalculate total
      currentPaintCost = cost;
      updateCalculations();
    });
  });

  // Toggle Weissach Package
  if (toggleWeissach) {
    toggleWeissach.addEventListener('change', () => {
      currentWeissachCost = toggleWeissach.checked ? parseInt(toggleWeissach.getAttribute('data-cost'), 10) : 0;
      updateCalculations();
    });
  }

  // Toggle Carbon Wheels
  if (toggleCarbonWheels) {
    toggleCarbonWheels.addEventListener('change', () => {
      currentWheelsCost = toggleCarbonWheels.checked ? parseInt(toggleCarbonWheels.getAttribute('data-cost'), 10) : 0;
      updateCalculations();
    });
  }

  /* --------------------------------------------------------------------------
     7. SECTION 6: Aero Hotspots & Tooltips
     -------------------------------------------------------------------------- */
  const hotspotWrappers = document.querySelectorAll('.hotspot-wrapper');
  const hotspotBtns = document.querySelectorAll('.hotspot-btn');
  const hotspotListItems = document.querySelectorAll('.hotspot-list-item');

  const closeAllHotspots = () => {
    hotspotWrappers.forEach(w => w.classList.remove('open'));
    hotspotBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-expanded', 'false');
    });
  };

  hotspotBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.hotspot-wrapper');
      const isMobile = window.innerWidth < 600;

      if (isMobile) {
        // Mobile behavior: scroll to corresponding item in list
        const id = btn.getAttribute('data-hotspot');
        const targetItem = document.querySelector(`.hotspot-list-item[data-hotspot="${id}"]`);
        if (targetItem) {
          hotspotListItems.forEach(item => item.classList.remove('active'));
          targetItem.classList.add('active');
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Desktop: toggle tooltip card
      const isOpen = wrapper.classList.contains('open');
      closeAllHotspots();
      if (!isOpen) {
        wrapper.classList.add('open');
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Mobile list item tap highlights the car hotspot dot
  hotspotListItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-hotspot');
      hotspotListItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const correspondingBtn = document.querySelector(`.hotspot-btn[data-hotspot="${id}"]`);
      if (correspondingBtn) {
        correspondingBtn.classList.add('active');
        setTimeout(() => {
          correspondingBtn.classList.remove('active');
        }, 1200);
      }
    });
  });

  // Close tooltips on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hotspot-wrapper')) {
      closeAllHotspots();
    }
  });

  // Close tooltips on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllHotspots();
    }
  });

  /* --------------------------------------------------------------------------
     8. SECTION 7: Gallery — 3D Tilt + Lightbox
     -------------------------------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  // Gallery data
  const galleryData = [
    { src: 'assets/photos/front.webp', alt: 'Front three-quarter', caption: 'Front three-quarter' },
    { src: 'assets/photos/rear.webp', alt: 'Rear three-quarter', caption: 'Rear three-quarter' },
    { src: 'assets/photos/interior.webp', alt: 'Cockpit', caption: 'Cockpit' },
    { src: 'assets/photos/night.webp', alt: 'After dark', caption: 'After dark' }
  ];

  let currentLightboxIndex = 0;
  let lightboxTriggerEl = null;

  // --- 3D Tilt (desktop, pointer: fine, respects reduced motion) ---
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;

  if (isPointerFine && !prefersReducedMotion) {
    galleryItems.forEach(item => {
      let tiltRaf = null;

      item.addEventListener('mousemove', (e) => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        tiltRaf = requestAnimationFrame(() => {
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;

          const rotateY = ((x - cx) / cx) * 8;   // ±8deg
          const rotateX = ((cy - y) / cy) * 8;    // ±8deg

          const mxPct = (x / rect.width * 100).toFixed(1);
          const myPct = (y / rect.height * 100).toFixed(1);

          item.classList.add('tilting');
          item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          item.style.setProperty('--mx', mxPct + '%');
          item.style.setProperty('--my', myPct + '%');
        });
      });

      item.addEventListener('mouseleave', () => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        item.classList.remove('tilting');
        item.style.transform = '';
        item.style.removeProperty('--mx');
        item.style.removeProperty('--my');
      });
    });
  }

  // --- Lightbox ---
  const showLightboxImage = (index, animate = true) => {
    currentLightboxIndex = index;
    const data = galleryData[index];

    if (animate && !prefersReducedMotion) {
      lightboxImg.classList.remove('active');
      setTimeout(() => {
        lightboxImg.src = data.src;
        lightboxImg.alt = data.alt;
        lightboxCaption.textContent = data.caption;
        lightboxCounter.textContent = `${index + 1} / ${galleryData.length}`;
        // Force reflow then fade in
        void lightboxImg.offsetWidth;
        lightboxImg.classList.add('active');
      }, 150);
    } else {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      lightboxCaption.textContent = data.caption;
      lightboxCounter.textContent = `${index + 1} / ${galleryData.length}`;
      lightboxImg.classList.add('active');
    }
  };

  const openLightbox = (index, triggerEl) => {
    if (!lightbox) return;
    lightboxTriggerEl = triggerEl;
    showLightboxImage(index, false);
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
    // Trigger fade in after showModal
    requestAnimationFrame(() => {
      lightboxImg.classList.add('active');
    });
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    document.body.classList.remove('lightbox-open');
    lightbox.close();
    // Return focus
    if (lightboxTriggerEl) {
      lightboxTriggerEl.focus();
      lightboxTriggerEl = null;
    }
  };

  const lightboxPrevFn = () => {
    const newIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
    showLightboxImage(newIndex);
  };

  const lightboxNextFn = () => {
    const newIndex = (currentLightboxIndex + 1) % galleryData.length;
    showLightboxImage(newIndex);
  };

  // Item click → open lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(index, item);
    });
  });

  // Lightbox controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevFn);
  if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextFn);

  // Click backdrop to close
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard: Arrows + Esc
  if (lightbox) {
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lightboxPrevFn(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); lightboxNextFn(); }
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
    });
  }

  // Touch swipe on lightbox
  if (lightbox) {
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) lightboxNextFn();   // swipe left → next
        else lightboxPrevFn();            // swipe right → prev
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     9. SECTION 8 & 9: Test-Drive Form Validation, Toast & Footer
     -------------------------------------------------------------------------- */
  const driveForm = document.getElementById('driveForm');
  const btnSubmitDrive = document.getElementById('btnSubmitDrive');
  const toastNotification = document.getElementById('toastNotification');
  const toastClose = document.getElementById('toastClose');
  const btnBackToTop = document.getElementById('btnBackToTop');

  // Set min date to tomorrow
  const driveDate = document.getElementById('driveDate');
  if (driveDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    driveDate.min = `${yyyy}-${mm}-${dd}`;
  }

  // Floating label helper for inputs/selects
  const formInputs = document.querySelectorAll('.drive-form .form-input');
  formInputs.forEach(input => {
    const checkValue = () => {
      if (input.value && input.value.trim() !== '') {
        input.classList.add('has-value');
      } else {
        input.classList.remove('has-value');
      }
    };

    input.addEventListener('input', checkValue);
    input.addEventListener('change', checkValue);
    input.addEventListener('blur', checkValue);
    checkValue();
  });

  // Validation rules definition
  const fieldsConfig = [
    {
      id: 'driveName',
      errorId: 'nameError',
      validate: (val) => val.trim().length >= 2,
      errorMsg: 'Please enter your full name (at least 2 characters).'
    },
    {
      id: 'driveEmail',
      errorId: 'emailError',
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()),
      errorMsg: 'Please enter a valid email address.'
    },
    {
      id: 'drivePhone',
      errorId: 'phoneError',
      validate: (val) => /^(?:\+91[\-\s]?)?[6-9]\d{9}$/.test(val.trim().replace(/\s+/g, '')),
      errorMsg: 'Please enter a valid 10-digit Indian phone number.'
    },
    {
      id: 'driveCity',
      errorId: 'cityError',
      validate: (val) => val.trim() !== '',
      errorMsg: 'Please select a Porsche Centre.'
    },
    {
      id: 'driveDate',
      errorId: 'dateError',
      validate: (val) => {
        if (!val || val.trim() === '') return false;
        if (driveDate && driveDate.min && val < driveDate.min) return false;
        return true;
      },
      errorMsg: 'Please select a valid date (from tomorrow onwards).'
    },
    {
      id: 'driveConsent',
      errorId: 'consentError',
      isCheckbox: true,
      validate: (el) => el.checked,
      errorMsg: 'Please agree to be contacted to proceed.'
    }
  ];

  const hasBlurredMap = new Map();

  const validateField = (config, triggerShake = false) => {
    const el = document.getElementById(config.id);
    const errorEl = document.getElementById(config.errorId);
    if (!el || !errorEl) return true;

    const isValid = config.isCheckbox ? config.validate(el) : config.validate(el.value);

    if (isValid) {
      if (!config.isCheckbox) {
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
      }
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
      return true;
    } else {
      if (!config.isCheckbox) {
        el.classList.remove('is-valid');
        if (triggerShake) {
          el.classList.remove('is-invalid');
          void el.offsetWidth; // Reflow to trigger shake
          el.classList.add('is-invalid');
        } else {
          el.classList.add('is-invalid');
        }
      }
      errorEl.textContent = config.errorMsg;
      errorEl.classList.add('visible');
      return false;
    }
  };

  // Setup field events (blur first, then live input)
  fieldsConfig.forEach(config => {
    const el = document.getElementById(config.id);
    if (!el) return;

    el.addEventListener('blur', () => {
      hasBlurredMap.set(config.id, true);
      validateField(config, true);
    });

    const liveEvent = config.isCheckbox ? 'change' : 'input';
    el.addEventListener(liveEvent, () => {
      if (hasBlurredMap.get(config.id)) {
        validateField(config, false);
      }
    });
  });

  // Toast auto-hide timer
  let toastTimeout = null;
  const showToast = () => {
    if (!toastNotification) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastNotification.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4000);
  };

  if (toastClose) {
    toastClose.addEventListener('click', () => {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastNotification.classList.remove('show');
    });
  }

  // Submit Handler
  if (driveForm && btnSubmitDrive) {
    driveForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalidEl = null;

      fieldsConfig.forEach(config => {
        hasBlurredMap.set(config.id, true);
        const valid = validateField(config, true);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalidEl) {
            firstInvalidEl = document.getElementById(config.id);
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidEl) {
          firstInvalidEl.focus();
        }
        return;
      }

      // Valid: show loading state on button for 1.2s
      btnSubmitDrive.disabled = true;
      btnSubmitDrive.classList.add('is-loading');
      const btnText = btnSubmitDrive.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Booking...';

      setTimeout(() => {
        // Reset button
        btnSubmitDrive.disabled = false;
        btnSubmitDrive.classList.remove('is-loading');
        if (btnText) btnText.textContent = 'Book my test drive';

        // Reset form & states
        driveForm.reset();
        hasBlurredMap.clear();
        formInputs.forEach(input => {
          input.classList.remove('has-value', 'is-valid', 'is-invalid');
        });
        fieldsConfig.forEach(config => {
          const errorEl = document.getElementById(config.errorId);
          if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
          }
        });

        // Show success toast
        showToast();
      }, 1200);
    });
  }

  // Smooth scroll Back to top button
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }
});

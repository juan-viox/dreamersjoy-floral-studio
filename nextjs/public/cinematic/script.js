(function() {
  'use strict';

  // ─── NAV ACTIVE STATE: highlight current-page link ───
  // Runs ASAP so the class is on before paint. Inquire is a CTA —
  // never marked active even when you're on it.
  (function markActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var allLinks = document.querySelectorAll('.nav-links a, .nav-mobile .mobile-link');
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      var href = link.getAttribute('href');
      if (!href) continue;
      // Skip the Inquire CTA — it's a button, not an active-state target
      if (link.classList.contains('nav-cta') || link.classList.contains('mobile-link-cta')) continue;
      // Exact match OR same path minus trailing slash
      var target = href.replace(/\/$/, '') || '/';
      if (target === path) link.classList.add('is-active');
    }
  })();

  // ─── TOAST: editorial confirmation notification ───
  // Usage: window.djToast({ message, label?, type?, duration? })
  //   type: 'success' (default) | 'error'
  //   duration: ms before auto-dismiss (default 4200, 0 = persistent)
  function ensureToastStack() {
    var stack = document.getElementById('djToastStack');
    if (stack) return stack;
    stack = document.createElement('div');
    stack.id = 'djToastStack';
    stack.className = 'dj-toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
    return stack;
  }

  window.djToast = function(opts) {
    opts = opts || {};
    var message = opts.message || '';
    var label = opts.label || (opts.type === 'error' ? 'Something went wrong' : 'Received');
    var type = opts.type === 'error' ? 'error' : 'success';
    var duration = (typeof opts.duration === 'number') ? opts.duration : 4200;

    var stack = ensureToastStack();
    var toast = document.createElement('div');
    toast.className = 'dj-toast' + (type === 'error' ? ' dj-toast--error' : '');
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    var icon = document.createElement('span');
    icon.className = 'dj-toast__icon';
    icon.textContent = type === 'error' ? '!' : '\u2713';
    icon.setAttribute('aria-hidden', 'true');

    var body = document.createElement('div');
    body.className = 'dj-toast__body';
    var labelEl = document.createElement('span');
    labelEl.className = 'dj-toast__label';
    labelEl.textContent = label;
    var msgEl = document.createElement('p');
    msgEl.className = 'dj-toast__message';
    msgEl.textContent = message;
    body.appendChild(labelEl);
    body.appendChild(msgEl);

    var close = document.createElement('button');
    close.className = 'dj-toast__close';
    close.setAttribute('type', 'button');
    close.setAttribute('aria-label', 'Dismiss notification');
    close.innerHTML = '&times;';

    toast.appendChild(icon);
    toast.appendChild(body);
    toast.appendChild(close);
    stack.appendChild(toast);

    // trigger entrance after layout (setTimeout is more reliable than RAF
    // for backgrounded tabs, e.g. during automated browser testing)
    void toast.offsetWidth; // force layout so the initial state paints
    setTimeout(function() { toast.classList.add('dj-toast--visible'); }, 20);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toast.classList.remove('dj-toast--visible');
      toast.classList.add('dj-toast--leaving');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 600);
    }
    close.addEventListener('click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);
    return dismiss;
  };

  // ─── PAGE TRANSITION: mark page as ready (fades body in) ───
  function markPageReady() {
    document.body.classList.add('page-ready');
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(markPageReady, 30);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(markPageReady, 30);
    });
  }

  // ─── NAVIGATION HELPER: fade out body, then navigate ───
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.djNavigate = function(url) {
    if (prefersReducedMotion) {
      window.location.href = url;
      return;
    }
    document.body.classList.add('page-leaving');
    setTimeout(function() { window.location.href = url; }, 380);
  };

  // ─── PAGE TRANSITION: intercept internal nav → fade out → navigate ───
  // Bubble phase + defaultPrevented check, so specific handlers (booking/order) win.
  document.addEventListener('click', function(e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return; // only left-click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let modifier-clicks open new tab
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    try {
      var url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      // Same-page hash → let browser handle smooth scroll
      if (url.pathname === window.location.pathname) return;
      if (link.hasAttribute('download')) return;
      if (link.hasAttribute('target') && link.getAttribute('target') !== '_self') return;
      if (link.hasAttribute('data-no-transition')) return;
    } catch(err) { return; }
    e.preventDefault();
    window.djNavigate(link.href);
  });

  // ─── SAFETY NET: if GSAP/ScrollTrigger fail to load, content stays visible (CSS default) ───
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return; // fade-up elements remain at opacity:1 per default CSS
  }
  gsap.registerPlugin(ScrollTrigger);
  // Tell CSS that JS can handle animations → activates fade-up hiding
  document.documentElement.classList.add('js-animations-ready');

  // ─── NAV SCROLL ───
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ─── HAMBURGER ───
  var hamburger = document.getElementById('navHamburger');
  var mobileMenu = document.getElementById('navMobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-link').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    hamburger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click(); }
    });
  }

  // ─── SCROLL-DRIVEN VIDEO HERO (Canvas Frame Engine) ───
  (function() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return; // Hero only exists on homepage
    var ctx = canvas.getContext('2d');
    var frameCount = 122;
    var currentFrame = 0;
    var frames = [];
    var loaded = 0;

    function framePath(i) {
      return 'assets/frames/frame_' + String(i).padStart(4, '0') + '.jpg';
    }

    function resize() {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 2 : 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 2 : 1);
      drawFrame(currentFrame);
    }

    function drawFrame(idx) {
      if (!frames[idx] || !frames[idx].complete) return;
      var img = frames[idx];
      var cw = canvas.width, ch = canvas.height;
      var scale = Math.max(cw / img.width, ch / img.height);
      var w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    // Preload first frame immediately for instant hero display
    var firstImg = new Image();
    firstImg.src = framePath(1);
    firstImg.onload = function() {
      frames[0] = firstImg;
      loaded++;
      resize();
      drawFrame(0);
    };
    frames.push(firstImg);

    // Preload remaining frames
    for (var i = 2; i <= frameCount; i++) {
      (function(idx) {
        var img = new Image();
        img.src = framePath(idx);
        img.onload = function() { loaded++; };
        frames.push(img);
      })(i);
    }

    window.addEventListener('resize', resize);

    // ScrollTrigger drives the frame index
    gsap.to({ frame: 0 }, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.2
      },
      onUpdate: function() {
        var f = Math.round(this.targets()[0].frame);
        if (f !== currentFrame) {
          currentFrame = f;
          drawFrame(f);
        }
      }
    });

    // Fallback: keep trying to draw first frame until it renders
    var firstFrameInterval = setInterval(function() {
      if (frames[0] && frames[0].complete) {
        resize();
        drawFrame(0);
        clearInterval(firstFrameInterval);
      }
    }, 50);
  })();

  // ─── BOOKING MESH GRADIENT (Canvas) ───
  function initMesh(canvas, colors, speed, bgColor) {
    var ctx = canvas.getContext('2d');
    var blobs = colors.map(function(c) {
      return { x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed, r: 0.3 + Math.random() * 0.25, color: c };
    });
    function resize() { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      blobs.forEach(function(b) {
        b.x += b.vx / w;
        b.y += b.vy / h;
        if (b.x < -0.2 || b.x > 1.2) b.vx *= -1;
        if (b.y < -0.2 || b.y > 1.2) b.vy *= -1;
        var grd = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * Math.max(w, h));
        grd.addColorStop(0, b.color);
        grd.addColorStop(1, 'transparent');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Booking mesh — DISABLED via CSS (display:none) to eliminate the
  // light-square glow artifact. Guard here too: if canvas has zero
  // dimensions (hidden), skip init entirely so the IIFE doesn't crash.
  var bookingMeshEl = document.getElementById('bookingMesh');
  if (bookingMeshEl && bookingMeshEl.offsetWidth > 0 && bookingMeshEl.offsetHeight > 0) {
    initMesh(
      bookingMeshEl,
      ['rgba(242,242,235,0.06)', 'rgba(124,140,171,0.08)', 'rgba(135,115,76,0.05)', 'rgba(242,242,235,0.04)'],
      0.15,
      '#2C3E50'
    );
  }

  // ─── HERO ENTRANCE ANIMATIONS ───
  if (document.querySelector('.hero h1')) {
    gsap.from('.hero h1', { opacity: 0, y: 30, duration: 1, delay: 0.5, ease: 'power2.out' });
    gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.8, delay: 1.0, ease: 'power2.out' });
    gsap.from('.hero-cta-row', { opacity: 0, y: 20, duration: 0.8, delay: 1.2, ease: 'power2.out' });
    gsap.from('#scrollIndicator', { opacity: 0, duration: 0.6, delay: 1.5, ease: 'power2.out' });
  }

  // ─── TEXT MASK REVEAL ───
  var maskSection = document.querySelector('.mask-section');
  if (maskSection) {
    gsap.to('.mask-reveal', {
      clipPath: 'inset(0% 0 0 0)',
      ease: 'none',
      scrollTrigger: { trigger: maskSection, start: 'top top', end: '60% bottom', scrub: 0.3 }
    });
    gsap.to('.mask-subtext', {
      opacity: 1, y: 0,
      scrollTrigger: { trigger: maskSection, start: '55% top', end: '70% top', scrub: true }
    });
  }

  // ─── STICKY STACK (Experiences) ───
  var workshopCards = document.querySelectorAll('.workshop-card');
  var previewStates = document.querySelectorAll('.stack-preview-state');
  workshopCards.forEach(function(card) {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: function() { activateWorkshop(card.dataset.feature); },
      onEnterBack: function() { activateWorkshop(card.dataset.feature); }
    });
  });
  function activateWorkshop(num) {
    workshopCards.forEach(function(c) { c.classList.toggle('active', c.dataset.feature === num); });
    previewStates.forEach(function(s) { s.classList.toggle('active', s.dataset.state === num); });
  }

  // ─── (Curtain effect removed — What to Expect is now a clean grid) ───

  // ─── KINETIC MARQUEE ───
  document.querySelectorAll('.marquee-row, .hero-marquee-row, .testimonial-row').forEach(function(row) {
    var content = row.querySelector('.marquee-content, .testimonial-content');
    if (!content) return;
    // Clone enough times to ensure seamless looping on any screen width
    var copies = 3;
    for (var c = 0; c < copies; c++) {
      row.appendChild(content.cloneNode(true));
    }
  });

  var scrollVelocity = 0;
  ScrollTrigger.create({
    onUpdate: function(self) { scrollVelocity = Math.abs(self.getVelocity()); }
  });

  document.querySelectorAll('.marquee-row, .hero-marquee-row, .testimonial-row').forEach(function(row) {
    var content = row.querySelector('.marquee-content, .testimonial-content');
    if (!content) return;
    var direction = row.dataset.direction === 'right' ? 1 : -1;
    var speedMult = parseFloat(row.dataset.speed) || 1;
    var baseSpeed = 60;
    var contentWidth = content.offsetWidth;
    var x = direction === -1 ? 0 : -contentWidth;

    function animate() {
      var speed = (baseSpeed + scrollVelocity * 0.1) * speedMult;
      x += direction * -1 * speed / 60;
      if (direction === -1 && x <= -contentWidth) x += contentWidth;
      if (direction === 1 && x >= 0) x -= contentWidth;
      row.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(animate);
    }
    animate();
  });

  // ─── DESIGN ACCORDION ───
  document.querySelectorAll('.design-acc-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var item = trigger.parentElement;
      var body = item.querySelector('.design-acc-body');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.design-acc-item').forEach(function(el) {
        el.classList.remove('open');
        el.querySelector('.design-acc-body').style.maxHeight = null;
        el.querySelector('.design-acc-trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── SCROLL FADE-UPS ───
  gsap.utils.toArray('.fade-up').forEach(function(el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // ─── VIOX CRM INTEGRATION ───
  var CRM = {
    apiUrl: '/api/v1/ingest',
    apiKey: '8e2c0eaeca4b01990e4f60b660afa52d7ee93c15c9d1b5a2c8a138b9853f33aa'
  };

  // Newsletter form → CRM
  var nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = document.getElementById('newsletterEmail').value;
      var btn = document.getElementById('newsletterBtn');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      fetch(CRM.apiUrl + '/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': CRM.apiKey },
        body: JSON.stringify({ email: email })
      }).then(function(res) {
        if (!res.ok) throw new Error('Failed');
        btn.textContent = 'Thank you';
        document.getElementById('newsletterEmail').disabled = true;
        if (window.djToast) window.djToast({
          label: 'You\u2019re on the list',
          message: 'We\u2019ll be in touch when the next collection blooms.'
        });
      }).catch(function() {
        btn.textContent = 'Subscribe';
        btn.disabled = false;
        if (window.djToast) window.djToast({
          type: 'error',
          label: 'Hmm \u2014 try again',
          message: 'We couldn\u2019t reach the studio. Please retry in a moment or email hello@dreamersjoystudio.com.'
        });
      });
    });
  }

  // Booking inquiry form → CRM
  var bkForm = document.getElementById('bookingForm');
  if (bkForm) {
    bkForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = document.getElementById('bookingSubmitBtn');
      var wrap = document.getElementById('bookingFormWrap');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      var firstName = document.getElementById('bkFirstName').value;
      var lastName = document.getElementById('bkLastName').value;
      var email = document.getElementById('bkEmail').value;
      var phone = document.getElementById('bkPhone').value;
      var interest = document.getElementById('bkInterest').value;
      var budget = document.getElementById('bkBudget') ? document.getElementById('bkBudget').value : '';
      var eventDate = document.getElementById('bkDate') ? document.getElementById('bkDate').value : '';
      var message = document.getElementById('bkMessage').value;

      var desc = 'Interest: ' + interest;
      if (budget) desc += ' | Budget: ' + budget;
      if (eventDate) desc += ' | Date: ' + eventDate;
      if (message) desc += ' | ' + message;

      fetch(CRM.apiUrl + '/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': CRM.apiKey },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          description: desc,
          source: 'web_form'
        })
      }).then(function(res) {
        if (!res.ok) throw new Error('Failed');
        wrap.innerHTML = '<div class="form-success"><h3>Thank You, ' + firstName + '</h3><p>We received your inquiry and will be in touch soon.</p></div>';
        if (window.djToast) window.djToast({
          label: 'Inquiry received',
          message: 'Thank you, ' + firstName + '. We\u2019ll be in touch within two business days.',
          duration: 5200
        });
      }).catch(function() {
        btn.textContent = 'Send Inquiry';
        btn.disabled = false;
        if (window.djToast) window.djToast({
          type: 'error',
          label: 'Inquiry didn\u2019t send',
          message: 'Please try again, or email hello@dreamersjoystudio.com directly.',
          duration: 5200
        });
      });
    });
  }

  // CTA buttons → pre-select interest and scroll to form
  function scrollToBooking(interest) {
    var select = document.getElementById('bkInterest');
    if (select && interest) {
      select.value = interest;
    }
    var booking = document.getElementById('booking');
    if (booking) {
      booking.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        var firstInput = document.getElementById('bkFirstName');
        if (firstInput) firstInput.focus();
      }, 800);
    }
  }

  // Inquiry CTAs: if inquiry form is on this page → scroll & pre-fill, else → navigate to /inquire
  document.querySelectorAll('a[href="#booking"], a[href="/inquire"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var hasForm = document.getElementById('booking');
      var text = btn.textContent.trim();
      var interestMap = {
        'Request Custom': 'Custom Floral Design',
        'Join the Bloom Circle': 'Floral Subscription',
        'Custom Order': 'Custom Floral Design',
        'Inquire to begin': 'Custom Floral Design',
        'Inquire for a tailored subscription experience': 'Floral Subscription'
      };
      var interest = interestMap[text] || '';
      if (hasForm) {
        e.preventDefault();
        scrollToBooking(interest);
      } else {
        e.preventDefault();
        var url = '/inquire' + (interest ? '?interest=' + encodeURIComponent(interest) : '');
        window.djNavigate ? window.djNavigate(url) : (window.location.href = url);
      }
    });
  });

  // Pre-fill inquiry form from ?interest= on /inquire page (also legacy /booking /contact)
  if (window.location.pathname === '/inquire' || window.location.pathname === '/booking' || window.location.pathname.indexOf('contact') > -1) {
    var p = new URLSearchParams(window.location.search);
    var i = p.get('interest');
    if (i) {
      setTimeout(function() {
        var sel = document.getElementById('bkInterest');
        if (sel) sel.value = i;
      }, 200);
    }
  }

  // Order links → navigate to order page (with transition)
  document.querySelectorAll('a[href="#order"]').forEach(function(btn) {
    if (btn.hasAttribute('data-no-intercept')) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.djNavigate ? window.djNavigate('/order') : (window.location.href = '/order');
    });
  });

  // ─── SHOP LIGHTBOX ───
  // Card click → open modal with product details + Order/Inquire CTAs
  var lightbox = document.getElementById('shopLightbox');
  if (lightbox) {
    var lbImg = document.getElementById('shopLightboxImg');
    var lbCollection = document.getElementById('shopLightboxCollection');
    var lbTitle = document.getElementById('shopLightboxTitle');
    var lbSize = document.getElementById('shopLightboxSize');
    var lbPrice = document.getElementById('shopLightboxPrice');
    var lbDesc = document.getElementById('shopLightboxDesc');
    var lbOrder = document.getElementById('shopLightboxOrder');
    var lbInquire = document.getElementById('shopLightboxInquire');
    var lastTrigger = null;

    function openLightbox(card) {
      lastTrigger = card;
      lbImg.style.backgroundImage = 'url("' + card.getAttribute('data-image') + '")';
      lbCollection.textContent = card.getAttribute('data-collection') || '';
      lbTitle.textContent = card.getAttribute('data-name') || '';
      lbSize.textContent = card.getAttribute('data-size') || '';
      lbPrice.textContent = card.getAttribute('data-price') || '';
      lbDesc.textContent = card.getAttribute('data-desc') || '';
      var id = card.getAttribute('data-arrangement') || '';
      lbOrder.setAttribute('href', '/order' + (id ? '?arrangement=' + encodeURIComponent(id) : ''));
      var interest = encodeURIComponent('Custom Floral Design');
      lbInquire.setAttribute('href', '/inquire?interest=' + interest);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger) { try { lastTrigger.focus(); } catch(e) {} }
    }

    // Open on card click — but ignore clicks on inner buttons/links
    document.querySelectorAll('.shop-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        var interactive = e.target.closest('button, a');
        if (interactive) return; // let explicit Order/Inquire button handle it
        openLightbox(card);
      });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    // Close triggers
    lightbox.querySelectorAll('[data-shop-close]').forEach(function(el) {
      el.addEventListener('click', closeLightbox);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  // ─── SHOP Order buttons (data-shop-order) → /order?arrangement=<id> ───
  document.querySelectorAll('[data-shop-order]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // don't also open the lightbox
      var id = btn.getAttribute('data-shop-order');
      var url = '/order' + (id ? '?arrangement=' + encodeURIComponent(id) : '');
      window.djNavigate ? window.djNavigate(url) : (window.location.href = url);
    });
  });

  // ─── GALLERY LIGHTBOX ───
  var galleryLb = document.getElementById('galleryLightbox');
  if (galleryLb) {
    var glImg = document.getElementById('galleryLightboxImg');
    var glCat = document.getElementById('galleryLightboxCat');
    var glLabel = document.getElementById('galleryLightboxLabel');
    var glLastTrigger = null;

    function openGalleryLb(card) {
      glLastTrigger = card;
      var img = card.getAttribute('data-gallery-image');
      var cat = card.getAttribute('data-gallery-cat') || '';
      var label = card.getAttribute('data-gallery-label') || '';
      glImg.style.backgroundImage = 'url("' + img + '")';
      glCat.textContent = cat;
      glLabel.textContent = label;
      galleryLb.classList.add('is-open');
      galleryLb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeGalleryLb() {
      galleryLb.classList.remove('is-open');
      galleryLb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (glLastTrigger) { try { glLastTrigger.focus(); } catch(e) {} }
    }

    document.querySelectorAll('.gallery-card').forEach(function(card) {
      card.addEventListener('click', function() { openGalleryLb(card); });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGalleryLb(card);
        }
      });
    });
    galleryLb.querySelectorAll('[data-gallery-close]').forEach(function(el) {
      el.addEventListener('click', closeGalleryLb);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && galleryLb.classList.contains('is-open')) closeGalleryLb();
    });
  }

  // Flip card Inquire links → navigate to /inquire with private experience pre-selected
  document.querySelectorAll('.flip-link').forEach(function(link) {
    link.style.cursor = 'pointer';
    link.addEventListener('click', function() {
      var hasForm = document.getElementById('booking');
      if (hasForm) {
        scrollToBooking('Private Experience');
      } else {
        var url = '/inquire?interest=' + encodeURIComponent('Private Experience');
        window.djNavigate ? window.djNavigate(url) : (window.location.href = url);
      }
    });
  });

})();
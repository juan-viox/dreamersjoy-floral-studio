(function() {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);

  // ─── NAV SCROLL ───
  var nav = document.getElementById('mainNav');
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ─── HAMBURGER ───
  var hamburger = document.getElementById('navHamburger');
  var mobileMenu = document.getElementById('navMobile');
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

  // ─── SCROLL-DRIVEN VIDEO HERO (Canvas Frame Engine) ───
  (function() {
    var canvas = document.getElementById('heroCanvas');
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

  // Booking mesh only (hero is now video)
  initMesh(
    document.getElementById('bookingMesh'),
    ['rgba(212,184,160,0.15)', 'rgba(107,124,110,0.12)', 'rgba(201,184,168,0.1)', 'rgba(245,240,235,0.2)'],
    0.25,
    '#FAFAF8'
  );

  // ─── HERO ENTRANCE ANIMATIONS ───
  gsap.from('.hero h1', { opacity: 0, y: 30, duration: 1, delay: 0.5, ease: 'power2.out' });
  gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.8, delay: 1.0, ease: 'power2.out' });
  gsap.from('.hero-cta-row', { opacity: 0, y: 20, duration: 0.8, delay: 1.2, ease: 'power2.out' });
  gsap.from('#scrollIndicator', { opacity: 0, duration: 0.6, delay: 1.5, ease: 'power2.out' });

  // ─── TEXT MASK REVEAL ───
  var maskSection = document.querySelector('.mask-section');
  gsap.to('.mask-reveal', {
    clipPath: 'inset(0% 0 0 0)',
    ease: 'none',
    scrollTrigger: { trigger: maskSection, start: 'top top', end: '60% bottom', scrub: 0.3 }
  });
  gsap.to('.mask-subtext', {
    opacity: 1, y: 0,
    scrollTrigger: { trigger: maskSection, start: '55% top', end: '70% top', scrub: true }
  });

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
      }).then(function() {
        btn.textContent = 'Thank you!';
        document.getElementById('newsletterEmail').disabled = true;
      }).catch(function() {
        btn.textContent = 'Subscribe';
        btn.disabled = false;
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
      }).catch(function() {
        btn.textContent = 'Send Inquiry';
        btn.disabled = false;
        btn.style.background = '#e17055';
        btn.textContent = 'Something went wrong. Try again.';
        setTimeout(function() {
          btn.style.background = '';
          btn.textContent = 'Send Inquiry';
        }, 3000);
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

  // Booking CTAs: if booking form is on this page → scroll & pre-fill, else → navigate to /booking
  document.querySelectorAll('a[href="#booking"], a[href="/booking"]').forEach(function(btn) {
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
        // Navigate to /booking page; pass interest as query param
        e.preventDefault();
        var url = '/booking' + (interest ? '?interest=' + encodeURIComponent(interest) : '');
        window.location.href = url;
      }
    });
  });

  // Pre-fill booking form from ?interest= on /booking page
  if (window.location.pathname === '/booking' || window.location.pathname.indexOf('contact') > -1) {
    var p = new URLSearchParams(window.location.search);
    var i = p.get('interest');
    if (i) {
      setTimeout(function() {
        var sel = document.getElementById('bkInterest');
        if (sel) sel.value = i;
      }, 200);
    }
  }

  // Order links → navigate to order page
  document.querySelectorAll('a[href="#order"], a[href="/order"]').forEach(function(btn) {
    if (btn.hasAttribute('data-no-intercept')) return;
    if (btn.getAttribute('href') === '/order') return; // already absolute, let it through
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/order';
    });
  });

  // Flip card Inquire links → navigate to /booking with private experience pre-selected
  document.querySelectorAll('.flip-link').forEach(function(link) {
    link.style.cursor = 'pointer';
    link.addEventListener('click', function() {
      var hasForm = document.getElementById('booking');
      if (hasForm) {
        scrollToBooking('Private Experience');
      } else {
        window.location.href = '/booking?interest=' + encodeURIComponent('Private Experience');
      }
    });
  });

})();
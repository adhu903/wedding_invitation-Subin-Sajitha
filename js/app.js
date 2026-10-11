/**
 * Subin & Sajitha — Wedding Invitation
 * Core Application Logic: Scratch Reveal, Audio, Countdown, Gallery, Lightbox, RSVP
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. AUDIO CONTROLLER
  // --------------------------------------------------------------------------
  const bgAudio = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  let isAudioPlaying = false;

  function playAudioWithFade() {
    if (!bgAudio) return;
    bgAudio.volume = 0;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isAudioPlaying = true;
          if (musicToggle) musicToggle.classList.add('playing');
          // Smooth volume fade-in
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.75) {
              vol += 0.05;
              bgAudio.volume = Math.min(vol, 0.75);
            } else {
              clearInterval(fadeInterval);
            }
          }, 100);
        })
        .catch(err => {
          console.log('Audio autoplay prevented by browser policy:', err);
        });
    }
  }

  function toggleAudio() {
    if (!bgAudio) return;
    if (isAudioPlaying) {
      bgAudio.pause();
      isAudioPlaying = false;
      if (musicToggle) musicToggle.classList.remove('playing');
      showToast('Music Paused 🔇');
    } else {
      bgAudio.play().then(() => {
        isAudioPlaying = true;
        if (musicToggle) musicToggle.classList.add('playing');
        showToast('Music Playing 🎵');
      });
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', toggleAudio);
  }

  // --------------------------------------------------------------------------
  // 2. OPENING COVER / SPLASH SCREEN
  // --------------------------------------------------------------------------
  const openingCover = document.getElementById('opening-cover');
  const btnOpenInvite = document.getElementById('btn-open-invite');

  function openInvitation() {
    if (!openingCover) return;
    openingCover.classList.add('opened');

    // Start background music seamlessly on user gesture
    playAudioWithFade();

    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([30, 60, 30]);
    }

    // Gentle celebration burst on opening
    setTimeout(() => {
      if (window.weddingPetals) {
        window.weddingPetals.popBurst(40);
      }
    }, 600);
  }

  if (btnOpenInvite) {
    btnOpenInvite.addEventListener('click', openInvitation);
  }

  // --------------------------------------------------------------------------
  // 3. INTERACTIVE SCRATCH-TO-REVEAL FOR WEDDING DATE
  // --------------------------------------------------------------------------
  const scratchCanvas = document.getElementById('scratch-canvas');
  const scratchWrap = document.querySelector('.scratch-container');
  const btnResetScratch = document.getElementById('btn-reset-scratch');
  const btnBurstPetals = document.getElementById('btn-burst-petals');

  let isScratching = false;
  let isDateRevealed = false;
  let scratchCtx = null;

  function initScratchCard() {
    if (!scratchCanvas || !scratchWrap) return;
    scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    const rect = scratchWrap.getBoundingClientRect();
    const w = (scratchCanvas.width = rect.width);
    const h = (scratchCanvas.height = rect.height);

    isDateRevealed = false;
    scratchCanvas.classList.remove('fade-out');

    // Fill with Premium Golden Foil Gradient
    const goldGrad = scratchCtx.createLinearGradient(0, 0, w, h);
    goldGrad.addColorStop(0, '#B88E2B');
    goldGrad.addColorStop(0.25, '#FCF6BA');
    goldGrad.addColorStop(0.5, '#D4AF37');
    goldGrad.addColorStop(0.75, '#FFE680');
    goldGrad.addColorStop(1, '#996E1A');

    scratchCtx.fillStyle = goldGrad;
    scratchCtx.fillRect(0, 0, w, h);

    // Decorative Stippled Gold Glitter Texture
    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 450; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      const r = Math.random() * 2;
      scratchCtx.beginPath();
      scratchCtx.arc(rx, ry, r, 0, Math.PI * 2);
      scratchCtx.fill();
    }

    // Foil Border Line
    scratchCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    scratchCtx.lineWidth = 2;
    scratchCtx.strokeRect(10, 10, w - 20, h - 20);

    // Center Golden Seal Badge
    scratchCtx.fillStyle = 'rgba(28, 20, 16, 0.85)';
    const badgeW = Math.min(260, w - 40);
    const badgeH = 80;
    const badgeX = (w - badgeW) / 2;
    const badgeY = (h - badgeH) / 2;

    scratchCtx.beginPath();
    scratchCtx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    scratchCtx.fill();
    scratchCtx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
    scratchCtx.lineWidth = 1.5;
    scratchCtx.stroke();

    // Text on Seal
    scratchCtx.fillStyle = '#FCF6BA';
    scratchCtx.font = '600 12px "Cinzel", serif';
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';
    scratchCtx.fillText('✨ SCRATCH TO REVEAL ✨', w / 2, badgeY + 28);

    scratchCtx.fillStyle = '#FFFFFF';
    scratchCtx.font = '400 13px "Outfit", sans-serif';
    scratchCtx.fillText('Touch & scratch our wedding date', w / 2, badgeY + 52);
  }

  function getScratchPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  let strokePoints = 0;
  function scratch(e) {
    if (!isScratching || isDateRevealed || !scratchCtx) return;
    if (e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault(); // Stop mobile screen from scrolling while scratching!
    }

    const pos = getScratchPos(e);
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
    scratchCtx.fill();

    strokePoints++;
    // Check cleared percentage every 14 strokes for efficiency
    if (strokePoints % 14 === 0) {
      checkScratchPercentage();
    }
  }

  function checkScratchPercentage() {
    if (isDateRevealed || !scratchCtx) return;
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;
    // Downsample grid calculation
    const imgData = scratchCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    let transparentCount = 0;
    const totalSampled = pixels.length / 16; // Sample every 4th pixel

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const clearedRatio = transparentCount / totalSampled;
    if (clearedRatio > 0.35) {
      triggerDateReveal();
    }
  }

  function triggerDateReveal() {
    if (isDateRevealed) return;
    isDateRevealed = true;

    // Smoothly fade out remaining foil
    if (scratchCanvas) {
      scratchCanvas.classList.add('fade-out');
    }

    // Trigger Flower Petal & Confetti Pop Effect! 🌸💐
    if (window.weddingPetals) {
      window.weddingPetals.popBurst(120);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    showToast('✨ Auspicious Date Revealed! 💐');
  }

  if (scratchCanvas) {
    // Touch Events
    scratchCanvas.addEventListener('touchstart', e => {
      isScratching = true;
      scratch(e);
    }, { passive: false });

    scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', () => { isScratching = false; });

    // Mouse Events
    scratchCanvas.addEventListener('mousedown', e => {
      isScratching = true;
      scratch(e);
    });
    scratchCanvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => { isScratching = false; });

    initScratchCard();
  }

  if (btnResetScratch) {
    btnResetScratch.addEventListener('click', () => {
      initScratchCard();
      showToast('Scratch card reset ✨');
    });
  }

  if (btnBurstPetals) {
    btnBurstPetals.addEventListener('click', () => {
      if (window.weddingPetals) {
        window.weddingPetals.popBurst(90);
      }
      showToast('Shower of Blessings! 🌸');
    });
  }

  // --------------------------------------------------------------------------
  // 4. LIVE COUNTDOWN TIMER (Nov 22, 2026, 10:00 AM IST)
  // --------------------------------------------------------------------------
  // 10:00 AM Indian Standard Time (UTC+05:30) on November 22, 2026
  const targetDate = new Date('2026-11-22T10:00:00+05:30').getTime();

  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --------------------------------------------------------------------------
  // 5. COUPLE GALLERY & FULLSCREEN LIGHTBOX
  // --------------------------------------------------------------------------
  const galleryTrack = document.getElementById('gallery-track');
  const galleryDots = document.querySelectorAll('.gallery-dot');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  const galleryData = [
    {
      src: 'assets/pic_4.jpg',
      title: 'Subin & Sajitha — Traditional Vows',
      desc: 'Traditional portrait with holy Nilavilakku and flower decor'
    },
    {
      src: 'assets/pic_5.jpg',
      title: 'Cherished Laughter & Moments',
      desc: 'Candid smiles on the ancestral veranda steps'
    },
    {
      src: 'assets/pic_3.jpg',
      title: 'Mark Your Calendar — Save The Date',
      desc: 'Sunday, 22 November 2026 calendar invitation'
    },
    {
      src: 'assets/pic_1.jpg',
      title: 'Wedding Invitation Card (English)',
      desc: 'Solemnized at Sree Badra & Mangalya Auditorium'
    },
    {
      src: 'assets/pic_2.jpg',
      title: 'Wedding Invitation Card (Malayalam)',
      desc: 'വിവാഹ ക്ഷണക്കത്ത് — സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു'
    }
  ];

  let currentGalleryIndex = 0;

  // Sync scroll position with dots
  if (galleryTrack && galleryDots.length > 0) {
    galleryTrack.addEventListener('scroll', () => {
      const scrollPos = galleryTrack.scrollLeft;
      const cardWidth = galleryTrack.querySelector('.gallery-card')?.offsetWidth || 300;
      const activeIdx = Math.round(scrollPos / (cardWidth + 16));
      galleryDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    });

    galleryDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const cardWidth = galleryTrack.querySelector('.gallery-card')?.offsetWidth || 300;
        galleryTrack.scrollTo({
          left: idx * (cardWidth + 16),
          behavior: 'smooth'
        });
      });
    });
  }

  // Open Lightbox
  function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightbox();
    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function updateLightbox() {
    const item = galleryData[currentGalleryIndex];
    if (!item) return;
    if (lightboxImg) lightboxImg.src = item.src;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryData.length}`;
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function nextLightbox() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateLightbox();
  }

  function prevLightbox() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }

  galleryCards.forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
  });

  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Touch Swipe inside Lightbox
  let touchStartX = 0;
  if (lightboxModal) {
    lightboxModal.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (diff > 45) prevLightbox();
      if (diff < -45) nextLightbox();
    }, { passive: true });
  }

  // Layout switcher (Carousel vs Grid)
  const tabCarousel = document.getElementById('tab-carousel');
  const tabGrid = document.getElementById('tab-grid');
  const viewCarousel = document.getElementById('view-carousel');
  const viewGrid = document.getElementById('view-grid');

  if (tabCarousel && tabGrid && viewCarousel && viewGrid) {
    tabCarousel.addEventListener('click', () => {
      tabCarousel.classList.add('active');
      tabGrid.classList.remove('active');
      viewCarousel.style.display = 'block';
      viewGrid.classList.remove('active');
    });

    tabGrid.addEventListener('click', () => {
      tabGrid.classList.add('active');
      tabCarousel.classList.remove('active');
      viewCarousel.style.display = 'none';
      viewGrid.classList.add('active');
    });
  }

  // --------------------------------------------------------------------------
  // 6. BILINGUAL LANGUAGE SWITCHER (EN / ML)
  // --------------------------------------------------------------------------
  const langToggleBtn = document.getElementById('lang-toggle');
  let currentLang = 'en';

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ml' : 'en';
    if (currentLang === 'ml') {
      document.body.classList.add('lang-active-ml');
      if (langToggleBtn) langToggleBtn.textContent = 'മലയാളം';
      showToast('മലയാളത്തിലേക്ക് മാറ്റി 🌸');
    } else {
      document.body.classList.remove('lang-active-ml');
      if (langToggleBtn) langToggleBtn.textContent = 'EN';
      showToast('Switched to English ✨');
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
  }

  // --------------------------------------------------------------------------
  // 7. CALENDAR (.ICS & GOOGLE CALENDAR) EXPORT
  // --------------------------------------------------------------------------
  const btnGoogleCal = document.getElementById('btn-google-cal');
  const btnIcsCal = document.getElementById('btn-ics-cal');

  const eventTitle = 'Wedding of Subin & Sajitha';
  const eventDetails =
    'Wedding (Muhurtham): 10:00 AM - 11:00 AM at Sree Badra Auditorium, Mannuthi, Thrissur.\n' +
    'Reception: 4:00 PM - 7:00 PM at Mangalya Auditorium, Kannambra, Palakkad.\n' +
    'We look forward to celebrating with you!';
  const eventLocation = 'Sree Badra Auditorium, Mannuthi & Mangalya Auditorium, Kannambra';
  const startISO = '20261122T043000Z'; // 10:00 AM IST in UTC (10 - 5.5 = 04:30 UTC)
  const endISO = '20261122T133000Z';   // 07:00 PM IST in UTC (19 - 5.5 = 13:30 UTC)

  if (btnGoogleCal) {
    btnGoogleCal.addEventListener('click', () => {
      const gcalUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(eventTitle)}` +
        `&dates=${startISO}/${endISO}` +
        `&details=${encodeURIComponent(eventDetails)}` +
        `&location=${encodeURIComponent(eventLocation)}`;
      window.open(gcalUrl, '_blank');
    });
  }

  if (btnIcsCal) {
    btnIcsCal.addEventListener('click', () => {
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Subin & Sajitha Wedding//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDetails.replace(/\n/g, '\\n')}`,
        `LOCATION:${eventLocation}`,
        `DTSTART:${startISO}`,
        `DTEND:${endISO}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Subin-Sajitha-Wedding.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar event downloaded 📅');
    });
  }

  // --------------------------------------------------------------------------
  // 8. VENUE ADDRESS COPY
  // --------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('.btn-copy-address');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const addr = btn.getAttribute('data-address');
      if (addr && navigator.clipboard) {
        navigator.clipboard.writeText(addr).then(() => {
          showToast('Address copied to clipboard! 📋');
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. WHATSAPP SHARE & RSVP INTEGRATION
  // --------------------------------------------------------------------------
  const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
  const btnSendRsvp = document.getElementById('btn-send-rsvp');
  const rsvpName = document.getElementById('rsvp-name');
  const rsvpGuests = document.getElementById('rsvp-guests');

  if (btnShareWhatsapp) {
    btnShareWhatsapp.addEventListener('click', () => {
      const pageUrl = window.location.href;
      const shareText =
        `💍 *Wedding Invitation: Subin & Sajitha*\n\n` +
        `With hearts full of love and blessings of our families, we cordially invite you to celebrate our wedding on *Sunday, 22 November 2026*.\n\n` +
        `✨ *Wedding (Muhurtham):* 10:00 AM – 11:00 AM at Sree Badra Auditorium, Mannuthi, Thrissur.\n` +
        `🥂 *Reception:* 4:00 PM – 7:00 PM at Mangalya Auditorium, Kannambra, Palakkad.\n\n` +
        `View our interactive digital wedding invitation:\n${pageUrl}`;

      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    });
  }

  if (btnSendRsvp) {
    btnSendRsvp.addEventListener('click', () => {
      const name = rsvpName?.value?.trim() || 'Guest';
      const guests = rsvpGuests?.value || '1';
      const selectedOption =
        document.querySelector('input[name="rsvp-attendance"]:checked')?.value || 'Attending Both Functions';

      const rsvpMsg =
        `🌸 *Wedding RSVP for Subin & Sajitha*\n\n` +
        `Dear Subin & Sajitha,\n` +
        `I am happy to confirm our presence!\n\n` +
        `👤 *Name:* ${name}\n` +
        `👥 *Number of Guests:* ${guests}\n` +
        `✨ *Attendance:* ${selectedOption}\n\n` +
        `Wishing you both a lifetime of happiness and love! ❤️`;

      // Family contact number from invitation: 9020875035
      const waRsvpUrl = `https://api.whatsapp.com/send?phone=919020875035&text=${encodeURIComponent(rsvpMsg)}`;
      window.open(waRsvpUrl, '_blank');

      if (window.weddingPetals) {
        window.weddingPetals.popBurst(70);
      }
      showToast('Thank you for your RSVP! 💖');
    });
  }

  // --------------------------------------------------------------------------
  // 10. SCROLL REVEAL (IntersectionObserver)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-fade-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // --------------------------------------------------------------------------
  // 11. TOAST NOTIFICATION UTILITY
  // --------------------------------------------------------------------------
  const toastEl = document.getElementById('toast-msg');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }
});

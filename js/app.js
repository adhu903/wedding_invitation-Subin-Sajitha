/**
 * Subin & Sajitha — Wedding Invitation
 * Core Application Logic: Scratch Reveal, Audio, Countdown, Gallery, RSVP
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
  // 5. COUPLE PHOTO ALBUMS & SWIPE CAROUSEL
  // --------------------------------------------------------------------------
  const albums = {
    engagement: {
      title: 'Engagement',
      description: 'A promise made with love, family, and blessings.',
      photos: [
        ['assets/gallery/engagement/engagement_01.jpg', 'A Portrait to Remember', 'A quiet portrait from our celebration.'],
        ['assets/gallery/engagement/engagement_02.jpg', 'Our Happy Beginning', 'A treasured moment from our engagement memories.'],
        ['assets/gallery/engagement/engagement_03.jpg', 'Together in Tradition', 'Sharing a special day with the people we love.'],
        ['assets/gallery/engagement/engagement_04.jpg', 'A Moment of Joy', 'A little glimpse of our celebration.'],
        ['assets/gallery/engagement/engagement_05.jpg', 'Side by Side', 'A candid moment together at the ceremony.'],
        ['assets/gallery/engagement/engagement_06.jpg', 'A Day to Remember', 'Celebrating this beautiful beginning together.']
      ]
    },
    'save-the-date': {
      title: 'Save the Date',
      description: 'A few memories from the day we chose.',
      photos: [
        ['assets/gallery/save-the-date/save_date_01.jpg', 'The Day We Chose', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_02.jpg', 'Close to You', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_03.jpg', 'Our Favourite Promise', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_04.jpg', 'A Little Closer', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_05.jpg', 'Just the Two of Us', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_06.jpg', 'A Moment to Keep', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_07.jpg', 'Our Story', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_08.jpg', 'Forever Starts Here', 'A memory from our Save the Date collection.'],
        ['assets/gallery/save-the-date/save_date_09.jpg', 'With Love', 'A memory from our Save the Date collection.']
      ]
    }
  };

  albums.all = {
    title: 'All',
    description: 'Engagement and Save the Date memories, together.',
    photos: [...albums.engagement.photos, ...albums['save-the-date'].photos]
  };

  const categoryButtons = document.querySelectorAll('.gallery-category');
  const galleryHome = document.getElementById('gallery-home');
  const galleryAlbum = document.getElementById('gallery-album');
  const albumGrid = document.getElementById('album-grid');
  const albumTitle = document.getElementById('album-title');
  const albumDescription = document.getElementById('album-description');
  const galleryBack = document.getElementById('gallery-back');
  const galleryTrack = document.getElementById('gallery-track');
  const galleryDots = document.getElementById('gallery-dots');
  let activeAlbumKey = 'all';
  let activeAlbum = albums[activeAlbumKey];
  let activePhotoIndex =0;
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDescription = document.getElementById('lightbox-description');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryIndex = 0;

  function updateLightbox() {
    const [src, title, description] = activeAlbum.photos[currentGalleryIndex];
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description;
    lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${activeAlbum.photos.length}`;
  }

  function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightbox();
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function changeLightboxPhoto(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + activeAlbum.photos.length) % activeAlbum.photos.length;
    updateLightbox();
  }

  function updateDots() {
    const cards = [...galleryTrack.querySelectorAll('.gallery-photo-card')];
    if (!cards.length) return;
    const center = galleryTrack.getBoundingClientRect().left + galleryTrack.clientWidth / 2;
    const activeIndex = cards.reduce((closest, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;
    activePhotoIndex = activeIndex;
    galleryDots.querySelectorAll('.gallery-dot').forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
  }

  function centerActivePhoto() {
    if (galleryHome.hidden) return;
    const cards = galleryTrack.querySelectorAll('.gallery-photo-card');
    const card = cards[Math.min(activePhotoIndex, cards.length - 1)];
    if (!card) return;
    const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
    const trackCenter = galleryTrack.getBoundingClientRect().left + galleryTrack.clientWidth / 2;
    galleryTrack.scrollTo({ left: galleryTrack.scrollLeft + cardCenter - trackCenter, behavior: 'auto' });
    updateDots();
  }

  function renderCarousel() {
    activeAlbum = albums[activeAlbumKey];
    activePhotoIndex = 0;
    galleryTrack.replaceChildren(...activeAlbum.photos.map(([src, title], index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-photo-card';
      card.setAttribute('aria-label', `${activeAlbum.title}: ${title}. Select to open album.`);
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = index < 2 ? 'eager' : 'lazy';
      const caption = document.createElement('span');
      caption.className = 'gallery-photo-caption';
      const category = document.createElement('span');
      category.className = 'gallery-photo-category';
      if (activeAlbumKey === 'engagement') {
        category.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 9.5c-4.8 0-8.7 3.7-8.7 8.2S11.2 27 16 27s8.7-4.8 8.7-9.3S20.8 9.5 16 9.5Z"/><path d="M13.4 8.5h5.2M16 8.5V5m-3 0h6m-3 22v2"/></svg>';
      } else if (activeAlbumKey === 'all') {
        category.textContent = '♥';
      } else {
        category.textContent = '✦';
      }
      const label = document.createElement('span');
      label.textContent = activeAlbumKey === 'all'
        ? (index < albums.engagement.photos.length ? albums.engagement.title : albums['save-the-date'].title)
        : activeAlbum.title;
      const note = document.createElement('small');
      note.textContent = title;
      const expandHint = document.createElement('span');
      expandHint.className = 'gallery-photo-expand';
      expandHint.textContent = 'Tap to enlarge  ⤢';
      caption.append(category, label, note, expandHint);
      card.append(img, caption);
      card.addEventListener('click', () => openLightbox(index));
      return card;
    }));
    galleryDots.replaceChildren(...activeAlbum.photos.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `gallery-dot${index === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Photo ${index + 1}`);
      dot.addEventListener('click', () => {
        const card = galleryTrack.querySelectorAll('.gallery-photo-card')[index];
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      return dot;
    }));
    requestAnimationFrame(centerActivePhoto);
  }

  function selectCategory(key) {
    if (!albums[key]) return;
    activeAlbumKey = key;
    categoryButtons.forEach(button => {
      const selected = button.dataset.album === key;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    renderCarousel();
    openAlbum();
  }

  function openAlbum() {
    albumTitle.textContent = activeAlbum.title;
    albumDescription.textContent = activeAlbum.description;
    albumGrid.replaceChildren(...activeAlbum.photos.map(([src, title, description], index) => {
      const figure = document.createElement('figure');
      figure.className = 'photo-grid-item';
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `View ${title} full screen`);
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.className = 'photo-grid-caption';
      const heading = document.createElement('strong');
      heading.textContent = title;
      const note = document.createElement('small');
      note.textContent = description;
      caption.append(heading, note);
      figure.append(img, caption);
      figure.addEventListener('click', () => openLightbox(index));
      figure.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
      return figure;
    }));
    galleryHome.hidden = true;
    galleryAlbum.hidden = false;
    galleryBack.focus();
  }

  categoryButtons.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.album)));
  galleryTrack.addEventListener('scroll', updateDots, { passive: true });
  if (galleryBack) galleryBack.addEventListener('click', () => {
    galleryAlbum.hidden = true;
    galleryHome.hidden = false;
    requestAnimationFrame(centerActivePhoto);
    document.querySelector(`.gallery-category[data-album="${activeAlbumKey}"]`)?.focus();
  });
  let galleryResizeFrame = 0;
  window.addEventListener('resize', () => {
    const preserveIndex = activePhotoIndex;
    cancelAnimationFrame(galleryResizeFrame);
    galleryResizeFrame = requestAnimationFrame(() => {
      activePhotoIndex = preserveIndex;
      centerActivePhoto();
    });
  }, { passive: true });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => changeLightboxPhoto(-1));
  lightboxNext.addEventListener('click', () => changeLightboxPhoto(1));
  window.addEventListener('keydown', event => {
    if (!lightboxModal.classList.contains('active')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') changeLightboxPhoto(-1);
    if (event.key === 'ArrowRight') changeLightboxPhoto(1);
  });
  let lightboxTouchStartX = 0;
  lightboxModal.addEventListener('touchstart', event => { lightboxTouchStartX = event.touches[0].clientX; }, { passive: true });
  lightboxModal.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - lightboxTouchStartX;
    if (distance > 45) changeLightboxPhoto(-1);
    if (distance < -45) changeLightboxPhoto(1);
  }, { passive: true });
  renderCarousel();

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



class StepManager {
  constructor() {
    this.currentStep = 1;
    this.steps = document.querySelectorAll('.step');
    this.body = document.body;
    this.init();
  }

  init() {
    this.showStep(1);
  }

  showStep(stepNumber) {
    this.currentStep = stepNumber;
    this.steps.forEach((step, index) => {
      step.classList.toggle('active', index + 1 === stepNumber);
    });
    this.body.className = `step-${stepNumber}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.showStep(this.currentStep + 1);
    }
  }

  reset() {
    this.showStep(1);
    this.resetAnimations();
  }

  resetAnimations() {
    const envelope = document.getElementById('envelope');
    if (envelope) {
      envelope.classList.remove('open');
      envelope.classList.add('bounce');
    }

    const cutLine = document.getElementById('cutLine');
    const cutHandle = document.getElementById('cutHandle');
    const cakeMessage = document.getElementById('cakeMessage');
    if (cutLine && cutHandle) {
      cutLine.style.top = '50%';
      cutHandle.style.top = '50%';
    }
    if (cakeMessage) {
      cakeMessage.textContent = 'Drag the handle across the cake to cut it';
      cakeMessage.classList.remove('success');
    }
  }
}

class TypingController {
  constructor() {
    this.introTyped = false;
    this.letterTyped = false;
  }

  reset() {
    this.introTyped = false;
    this.letterTyped = false;
  }

  typeText(element, text, speed = 50, callback) {
    if (!element) return;
    element.textContent = '';
    let index = 0;

    const typeChar = () => {
      if (index < text.length) {
        const char = text[index];
        element.textContent += char;
        index++;
        setTimeout(typeChar, speed);
      } else if (callback) {
        callback();
      }
    };

    typeChar();
  }

  startIntroTyping() {
    if (this.introTyped) return;
    const heading = document.getElementById('introHeading');
    if (!heading) return;
    const text = 'Someone made something special for you 💖';
    this.typeText(heading, text, 80, () => {
      this.introTyped = true;
    });
  }

  startLetterTyping() {
    if (this.letterTyped) return;
    const letterText = document.getElementById('letterText');
    if (!letterText) return;
    const text = 'You are so incredibly special, and I wanted to create something just for you.\n\n' +
                 'Every moment with you feels like a gift. Your smile lights up the world, and your kindness touches everyone around you.\n\n' +
                 'I hope this little surprise brings as much joy to your day as you bring to mine. You deserve all the happiness, love, and wonderful moments life has to offer.\n\n' +
                 'Thank you for being exactly who you are. You are loved, cherished, and absolutely amazing. 💖';
    this.typeText(letterText, text, 40, () => {
      this.letterTyped = true;
    });
  }
}

class EnvelopeController {
  constructor(stepManager) {
    this.envelope = document.getElementById('envelope');
    this.isOpen = false;
    this.stepManager = stepManager;
    this.init();
  }

  init() {
    if (!this.envelope) return;
    this.envelope.addEventListener('click', () => this.open());
    this.envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
      }
    });
  }

  open() {
    if (this.isOpen) {
      setTimeout(() => {
        this.stepManager.showStep(3);
        typingController.startLetterTyping();
        fireConfetti(800);
      }, 300);
      return;
    }

    this.isOpen = true;
    this.envelope.classList.add('open');
    this.envelope.classList.remove('bounce');

    setTimeout(() => {
      this.stepManager.showStep(3);
      typingController.startLetterTyping();
      fireConfetti(1200);
    }, 1000);
  }

  reset() {
    this.isOpen = false;
    if (this.envelope) {
      this.envelope.classList.remove('open');
      this.envelope.classList.add('bounce');
    }
  }
}

class CakeCuttingController {
  constructor(stepManager) {
    this.cakeWrapper = document.getElementById('cakeWrapper');
    this.cutLine = document.getElementById('cutLine');
    this.cutHandle = document.getElementById('cutHandle');
    this.cakeMessage = document.getElementById('cakeMessage');
    this.stepManager = stepManager;
    this.isDragging = false;
    this.isCut = false;
    this.startY = 0;
    this.currentY = 0;
    this.init();
  }

  init() {
    if (!this.cutHandle || !this.cakeWrapper) return;

    this.cutHandle.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());

    this.cutHandle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
    document.addEventListener('touchend', () => this.endDrag());

    this.cutHandle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.handleKeyboard(e.key);
      }
    });
  }

  startDrag(e) {
    if (this.isCut) return;
    this.isDragging = true;
    this.cutHandle.classList.add('dragging');
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = this.cakeWrapper.getBoundingClientRect();
    this.startY = clientY - rect.top;
    this.currentY = this.startY;
    e.preventDefault();
  }

  onDrag(e) {
    if (!this.isDragging || this.isCut) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = this.cakeWrapper.getBoundingClientRect();
    let y = clientY - rect.top;
    y = Math.max(0, Math.min(rect.height, y));
    this.currentY = y;

    const percent = (y / rect.height) * 100;
    this.cutLine.style.top = `${percent}%`;
    this.cutHandle.style.top = `${percent}%`;

    const dragDistance = Math.abs(this.currentY - this.startY);
    const minCutDistance = rect.height * 0.3;
    if (dragDistance > minCutDistance) {
      this.completeCut();
    }

    e.preventDefault();
  }

  handleKeyboard(key) {
    if (this.isCut) return;
    const rect = this.cakeWrapper.getBoundingClientRect();
    const step = 10;
    
    if (key === 'ArrowUp') {
      this.currentY = Math.max(0, this.currentY - step);
    } else if (key === 'ArrowDown') {
      this.currentY = Math.min(rect.height, this.currentY + step);
    }

    const percent = (this.currentY / rect.height) * 100;
    this.cutLine.style.top = `${percent}%`;
    this.cutHandle.style.top = `${percent}%`;

    const dragDistance = Math.abs(this.currentY - this.startY);
    const minCutDistance = rect.height * 0.3;
    if (this.currentY < 10 || this.currentY > rect.height - 10 || dragDistance > minCutDistance) {
      this.completeCut();
    }
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.cutHandle.classList.remove('dragging');

    if (!this.isCut && this.cakeWrapper) {
      const rect = this.cakeWrapper.getBoundingClientRect();
      const dragDistance = Math.abs(this.currentY - this.startY);
      const minCutDistance = rect.height * 0.3;
      if (dragDistance > minCutDistance) {
        this.completeCut();
      }
    }
  }

  completeCut() {
    if (this.isCut) return;
    this.isCut = true;
    this.isDragging = false;
    this.cutHandle.classList.remove('dragging');

    if (this.cakeMessage) {
      this.cakeMessage.textContent = 'Make a wish ✨';
      this.cakeMessage.classList.add('success');
    }

    fireConfetti(2000);

    setTimeout(() => {
      this.stepManager.showStep(5);
      fireConfetti(3000);
    }, 2000);
  }

  reset() {
    this.isCut = false;
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    
    if (this.cutLine && this.cutHandle) {
      this.cutLine.style.top = '50%';
      this.cutHandle.style.top = '50%';
    }
    
    if (this.cutHandle) {
      this.cutHandle.classList.remove('dragging');
    }
    
    if (this.cakeMessage) {
      this.cakeMessage.textContent = 'Drag the handle across the cake to cut it';
      this.cakeMessage.classList.remove('success');
    }
  }
}

class ShareController {
  constructor() {
    this.toast = document.getElementById('toast');
    this.instagramHelp = document.getElementById('instagramHelp');
    this.init();
  }

  init() {
    const btnWhatsApp = document.getElementById('btnWhatsApp');
    const btnInstagram = document.getElementById('btnInstagram');

    if (btnWhatsApp) {
      btnWhatsApp.addEventListener('click', (e) => {
        e.preventDefault();
        this.shareWhatsApp();
      });
    }

    if (btnInstagram) {
      btnInstagram.addEventListener('click', () => {
        this.shareInstagram();
      });
    }
  }

  shareWhatsApp() {
    const currentUrl = encodeURIComponent(window.location.href);
    const message = encodeURIComponent('I made something special for you 💖🎂\nOpen this surprise 👇\n');
    const whatsappUrl = `https://wa.me/?text=${message}${currentUrl}`;
    window.open(whatsappUrl, '_blank');
  }

  shareInstagram() {
    const currentUrl = window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        this.showToast('Link copied! Paste it in Instagram 💖');
        if (this.instagramHelp) {
          this.instagramHelp.style.display = 'block';
        }
      }).catch(() => {
        this.fallbackCopy(currentUrl);
      });
    } else {
      this.fallbackCopy(currentUrl);
    }
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('Link copied! Paste it in Instagram 💖');
      if (this.instagramHelp) {
        this.instagramHelp.style.display = 'block';
      }
    } catch (err) {
      this.showToast('Please copy the URL manually');
    }
    
    document.body.removeChild(textarea);
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }
}

function fireConfetti(duration = 2000) {
  if (typeof confetti === 'undefined') return;

  const end = Date.now() + duration;
  const colors = ['#ff6b9d', '#c44569', '#ff9a9e', '#fecfef', '#ffe0f7', '#ffd1dc'];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

class MusicController {
  constructor() {
    this.audio = document.getElementById('bgMusic');
    this.hasStarted = false;
  }

  start() {
    if (this.hasStarted || !this.audio) return;
    this.hasStarted = true;
    this.audio.volume = 0.3;
    this.audio.play().catch(() => {});
  }

  reset() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.hasStarted = false;
    }
  }
}

let stepManager;
let typingController;
let envelopeController;
let cakeController;
let shareController;
let musicController;

document.addEventListener('DOMContentLoaded', () => {
  stepManager = new StepManager();
  typingController = new TypingController();
  envelopeController = new EnvelopeController(stepManager);
  cakeController = new CakeCuttingController(stepManager);
  shareController = new ShareController();
  musicController = new MusicController();

  typingController.startIntroTyping();

  const btnOpenSurprise = document.getElementById('btnOpenSurprise');
  if (btnOpenSurprise) {
    btnOpenSurprise.addEventListener('click', () => {
      musicController.start();
      stepManager.showStep(2);
      fireConfetti(1200);
    });
  }

  const btnCutCake = document.getElementById('btnCutCake');
  if (btnCutCake) {
    btnCutCake.addEventListener('click', () => {
      stepManager.showStep(4);
      fireConfetti(1000);
    });
  }

  const btnReplay = document.getElementById('btnReplay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      stepManager.reset();
      envelopeController.reset();
      cakeController.reset();
      musicController.reset();
      if (shareController.instagramHelp) {
        shareController.instagramHelp.style.display = 'none';
      }
      typingController.startIntroTyping();
    });
  }

  const envelope = document.getElementById('envelope');
  if (envelope) {
    envelope.setAttribute('tabindex', '0');
    envelope.setAttribute('role', 'button');
    envelope.setAttribute('aria-label', 'Open envelope');
  }

  const cutHandle = document.getElementById('cutHandle');
  if (cutHandle) {
    cutHandle.setAttribute('tabindex', '0');
  }
});

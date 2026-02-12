import { setupMenu, menuScroll } from './menu.js';
import { setupTabs } from './tabs.js';
import { led } from './led.js';
import { enviar } from './enviar.js';
import { protege } from './protege.js';
import { router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMenu();
  //setupTabs();
  menuScroll();
  led();
  //router();

  async function checaLocal() {

    const configs = await fetch("/frontend/js/_config.json").then(r => r.json());

    const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

    const API_URL = isLocalhost ? configs.DEV_API_URL : configs.PROD_API_URL;

    return API_URL;

  }

  async function checaLogin() {

    const API_URL = await checaLocal();

    const data = await enviar(`${API_URL}/auth/check`, '{}');

    if (data.user) {
      document.querySelectorAll(".auth-only").forEach(el => {
        el.style.display = "block";
      });

      document.querySelectorAll(".guest-only").forEach(el => {
        el.style.display = "none";
      });

    } else {
      document.querySelectorAll(".auth-only").forEach(el => {
        el.style.display = "none";
      });

      document.querySelectorAll(".guest-only").forEach(el => {
        el.style.display = "block";
      });

    }


  }

  //checaLogin();

  function sair() {
    if (!confirm("Tem certeza que deseja sair?")) return;
    enviar('/auth/logout/', '{}').then(data => {
      if (data.msg) {
        alert(data.msg);
        location.reload();
      } else {
        alert("Erro ao sair: " + data.message);
      }
    });
  }

  window.sair = sair;

/* ====== SLIDER ====== */
const slides = document.querySelectorAll('.slide');
const progressBar = document.getElementById('progress-bar');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dotsContainer = document.querySelector('.dots');

let current = 0;
let timer;
let youtubePlayers = {};
let progressInterval;

// Cria dots dinamicamente
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

// Inicializa YouTube API
function loadYouTubeAPI() {
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }
}

function onYouTubeIframeAPIReady() {
  slides.forEach((slide, i) => {
    const ytId = slide.getAttribute('data-youtube');
    if (ytId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&controls=1&rel=0`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      slide.appendChild(iframe);

      youtubePlayers[i] = new YT.Player(iframe, {
        events: {
          'onStateChange': (event) => {
            if (event.data === YT.PlayerState.ENDED) nextSlide();
          }
        }
      });
    }
  });
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
loadYouTubeAPI();

function stopAllMedia() {
  slides.forEach((s, i) => {
    const video = s.querySelector('video');
    if (video) { video.pause(); video.currentTime = 0; }
    if (youtubePlayers[i]) youtubePlayers[i].pauseVideo();
  });
}

function updateProgressBar(duration) {
  let startTime = Date.now();
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = Math.min(100, (elapsed / duration) * 100);
    progressBar.style.width = percent + '%';
  }, 100);
}

function goToSlide(index) {
  clearTimeout(timer);
  clearInterval(progressInterval);
  stopAllMedia();

  slides[current].classList.remove('active');
  document.querySelectorAll('.dot')[current].classList.remove('active');

  current = index;
  slides[current].classList.add('active');
  document.querySelectorAll('.dot')[current].classList.add('active');

  const video = slides[current].querySelector('video');
  const ytId = slides[current].getAttribute('data-youtube');
  const duration = slides[current].dataset.duration || 6;

  if (video) {
    video.play();
    updateProgressBar(video.duration || duration);
    video.onended = nextSlide;
  } else if (ytId && youtubePlayers[current]) {
    youtubePlayers[current].playVideo();
    let checkDuration = setInterval(() => {
      if (youtubePlayers[current].getDuration() > 0) {
        updateProgressBar(youtubePlayers[current].getDuration());
        clearInterval(checkDuration);
      }
    }, 500);
  } else {
    updateProgressBar(duration);
    timer = setTimeout(nextSlide, duration * 1000);
  }
}

function nextSlide() {
  goToSlide((current + 1) % slides.length);
}

function prevSlide() {
  goToSlide((current - 1 + slides.length) % slides.length);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Inicial
goToSlide(0);

// Parallax Effect

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const windowHeight = window.innerHeight;
  const elements = document.querySelectorAll('[data-aaa]');

  elements.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-aaa'));
    const elementTop = el.offsetTop;
    
    // Distância do elemento até o topo da viewport 
    let dist = elementTop - scrolled;

    // --- LÓGICA DE MOVIMENTO (PARALLAX) ---
    // Se dist > 0, ele ainda está "vindo". Se dist <= 0, trava na posição real.
    let yPos = dist > 0 ? dist * speed : 0;
    el.style.transform = `translateY(${yPos}px)`;

    // --- LÓGICA DE OPACIDADE (FADE) ---
    // Calculamos o progresso: quanto ele percorreu dentro da tela
    // 1 no topo da tela, 0 quando entra na parte inferior da tela
    let progress = 1 - (dist / windowHeight);
    
    // Limitamos entre 0 e 1 para não dar erro de renderização
    let opacityValue = Math.min(Math.max(progress, 0), 1);
    
    // Se quiser que ele faça fade-out após passar do topo, 
    // podemos simplificar mantendo 1 se dist <= 0
    if (dist <= 0) opacityValue = 1;

    el.style.opacity = opacityValue;
  });
});


const secao = document.querySelector('.conteudos');

// Calcula a posição do elemento menos o recuo de 50px
const topoElemento = secao.getBoundingClientRect().top + window.pageYOffset;
const offset = 120;

window.scrollTo({
  top: topoElemento - offset,
  behavior: 'smooth' // Define a suavidade
});

const sections = document.querySelectorAll(".conteudos");

let lastScrollY = window.scrollY;
let lastTime = performance.now();
let isSnapping = false;

const SNAP_DISTANCE = 120;   // px do topo
const MAX_VELOCITY = 0.4;    // quanto menor, mais "exigente"

window.addEventListener("scroll", () => {
  if (isSnapping) return;

  const now = performance.now();
  const currentScroll = window.scrollY;

  const deltaScroll = currentScroll - lastScrollY;
  const deltaTime = now - lastTime;

  const velocity = Math.abs(deltaScroll / deltaTime); // px/ms

  lastScrollY = currentScroll;
  lastTime = now;

  // se estiver rolando rápido, não snapa
  if (velocity > MAX_VELOCITY) return;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top);

    if (distance < SNAP_DISTANCE) {
      isSnapping = true;

      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      setTimeout(() => {
        isSnapping = false;
      }, 600);
    }
  });
});



});


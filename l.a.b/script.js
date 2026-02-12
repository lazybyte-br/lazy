const socket = io();
const originalSlides = Array.from(document.querySelectorAll('slide'));
const presentationRoot = document.getElementById('presentationRoot');
const toggleBtn = document.getElementById('togglePresentation');
const nextBtn = document.getElementById('nextSlide');
const prevBtn = document.getElementById('prevSlide');
const statusDiv = document.getElementById('controlStatus');

let presentationMode = false;
let current = 0;
let presentationSlides = []; // elementos clonados usados no fullscreen
window.presentationActive = false; // status global (usado para bloquear controle remoto)

/* ---- UTIL ---- */
function getTitleFromSlide(el, index){
  const h = el.querySelector('h2, h1, h3');
  return h ? h.textContent.trim() : `Slide ${index+1}`;
}

/* ---- CRIAR LAYER DE APRESENTAÇÃO (clonar slides) ---- */
function buildPresentationLayer() {
  // limpar
  presentationRoot.innerHTML = '';
  presentationSlides = [];

  // criar contêiner flex
  const frag = document.createDocumentFragment();

  // clona cada <slide>
  originalSlides.forEach((s, i) => {
    const clone = document.createElement('div');
    clone.className = 'presentation-slide';
    clone.innerHTML = s.innerHTML; // copiar conteúdo
    clone.setAttribute('data-index', i);
    frag.appendChild(clone);
    presentationSlides.push(clone);
  });

  // controles visuais dentro do layer (também respondem localmente)
  const controls = document.createElement('div');
  controls.style.position = 'fixed';
  controls.style.right = '20px';
  controls.style.bottom = '20px';
  controls.style.zIndex = '1300';
  controls.innerHTML = `
    <button id="layerPrev" style="margin-right:8px;padding:10px 14px;border-radius:8px;">◀ Anterior</button>
    <button id="layerNext" style="padding:10px 14px;border-radius:8px;">Próximo ▶</button>
  `;
  frag.appendChild(controls);

  presentationRoot.appendChild(frag);

  // eventos locais nos botões do layer
  document.getElementById('layerNext').addEventListener('click', () => localChange(current + 1));
  document.getElementById('layerPrev').addEventListener('click', () => localChange(current - 1));
}

/* ---- Mostrar slide no layer ---- */
function showPresentationSlide(index) {
  if (index < 0 || index >= presentationSlides.length) return;
  presentationSlides.forEach((el,i) => el.classList.toggle('active', i === index));
  current = index;
  // enviar status para controles remotos
  socket.emit('presentation_status', {
    active: presentationMode,
    slide: current,
    title: getTitleFromSlide(originalSlides[current], current)
  });
  updateLocalStatus();
}

/* ---- Entrar / Sair apresentação ---- */
function enterPresentation() {
  if (originalSlides.length === 0) return alert('Não há slides definidos com <slide>...</slide>');
  buildPresentationLayer();
  presentationRoot.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  presentationMode = true;
  window.presentationActive = true;
  showPresentationSlide(0);
  toggleBtn.textContent = '❌ Sair da Apresentação';
  // enviar status inicial
  socket.emit('presentation_status', {
    active: true, slide: current, title: getTitleFromSlide(originalSlides[current], current)
  });
}

function exitPresentation() {
  presentationMode = false;
  window.presentationActive = false;
  presentationRoot.style.display = 'none';
  document.body.style.overflow = '';
  toggleBtn.textContent = '🎞️ Modo Apresentação';
  // limpar layer (opcional)
  presentationRoot.innerHTML = '';
  // notificar controles
  socket.emit('presentation_status', { active: false, slide: current, title: '' });
  updateLocalStatus();
}

/* ---- Navegação local (PC) ---- */
function localChange(index) {
  if (!presentationMode) return; // não navega se não estiver em apresentação
  if (index < 0 || index >= presentationSlides.length) return;
  showPresentationSlide(index);
}

/* ---- Navegação via controle remoto (recebe socket) ---- */
socket.on('slide_changed', data => {
  // se podemos aplicar remotamente (apresentação ativa localmente), aplica
  if (presentationMode) {
    showPresentationSlide(data.index);
  } else {
    // se apresentação não estiver ativa localmente, ignorar (bloqueio)
  }
});

/* ---- Recebe atualização de status (quando o apresentador envia) ---- */
socket.on('presentation_update', data => {
  // usado pelos clientes de controle (window.IS_CONTROL === true)
  window.presentationActive = data.active;
  if (window.IS_CONTROL) {
    if (!data.active) {
      statusDiv.textContent = '❌ Apresentação inativa';
      disableControlButtons(true);
    } else {
      statusDiv.textContent = `📊 Slide ${data.slide + 1}: ${data.title}`;
      disableControlButtons(false);
    }
  }
});

/* ---- Botões principais (na página normal) ---- */
nextBtn.addEventListener('click', () => {
  if (presentationMode) localChange(current + 1);
  else { /* comportamento em modo leitura: avançar para próximo slide-segmento no conteúdo (opcional) */ }
});
prevBtn.addEventListener('click', () => {
  if (presentationMode) localChange(current - 1);
});

/* ---- Toggle botão ---- */
toggleBtn.addEventListener('click', () => {
  if (!presentationMode) enterPresentation();
  else exitPresentation();
});

/* ---- Teclado e fullscreen ---- */
document.addEventListener('keydown', (e) => {
  if (!presentationMode) return;
  if (e.key === 'ArrowRight' || e.key === ' ') { localChange(current + 1); }
  if (e.key === 'ArrowLeft') { localChange(current - 1); }
  if (e.key.toLowerCase() === 'f') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});
document.body.addEventListener('dblclick', () => {
  if (!presentationMode) return;
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

/* ---- Controle remoto envia comandos (apenas se apresentação ativa no servidor) ---- */
if (window.IS_CONTROL) {
  // botões do controle já são os #nextSlide e #prevSlide no mesmo template — eles enviarão comandos
  document.getElementById('nextSlide').addEventListener('click', () => {
    // só enviaremos o comando se sabemos que a apresentação está ativa (window.presentationActive)
    if (window.presentationActive) socket.emit('change_slide', { index: Math.min(originalSlides.length-1, (window.lastKnownSlide || 0) + 1) });
  });
  document.getElementById('prevSlide').addEventListener('click', () => {
    if (window.presentationActive) socket.emit('change_slide', { index: Math.max(0, (window.lastKnownSlide || 0) - 1) });
  });

  // Atualizar lastKnownSlide quando receber presentation_update
  socket.on('presentation_update', data => {
    if (data && typeof data.slide === 'number') window.lastKnownSlide = data.slide;
  });
}

/* ---- desativa/ativa botões do controle (visual) ---- */
function disableControlButtons(disabled) {
  // busca botões do template de controle (se existirem)
  const next = document.getElementById('nextSlide');
  const prev = document.getElementById('prevSlide');
  if (next) next.disabled = disabled;
  if (prev) prev.disabled = disabled;
}

/* ---- atualizar status local (PC) também para debug --- */
function updateLocalStatus(){
  if (!window.IS_CONTROL) {
    statusDiv.textContent = presentationMode ? `📊 Slide ${current+1}: ${getTitleFromSlide(originalSlides[current], current)}` : 'Apresentação desligada';
  }
}

/* ---- Inicialização: mostrar status inicial (controle verá inativo até apresentar) ---- */
updateLocalStatus();

// Também quando o apresentador abre a página e entra em apresentação, ele emite presentation_status (já feito em showPresentationSlide/enterPresentation)

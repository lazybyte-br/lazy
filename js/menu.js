export function setupMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const logoHeader = document.getElementById('logo-header');
  const topo = document.querySelector("#topo");
  const logoMob = document.querySelector("#logoMob");

  menuBtn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuBtn.classList.toggle('active');

    if (isOpen) {
      // Move o logo para a direita e apaga o texto
      logoHeader.classList.add('move-right');
      menu.classList.add('glass');
      topo.classList.add('hide');
      logoMob.classList.remove('hide');
      
    } else {
      // Volta o logo para a posição original
      logoHeader.classList.remove('move-right');
      menu.classList.remove('glass');
      topo.classList.remove('hide');
      logoMob.classList.add('hide');
    }
  });
}

export function menuScroll() {
  const logoHeader = document.getElementById('logo-header');
  const menu = document.getElementById('topo');
  // Controla o "shrink" no scroll (sem pular)
  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) {
      if (window.scrollY > 80) {
        menu.classList.add('shrink');
        logoHeader.classList.add('logo-header-desce');
      } else {
        menu.classList.remove('shrink');
        logoHeader.classList.remove('logo-header-desce');
      }
    }
  });
}


'use strict';

export function setupTabs() 
{
  
  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove a classe 'active' de todos os botões
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Adiciona a classe 'active' ao botão clicado
      this.classList.add('active');

      // Oculta todos os painéis de conteúdo
      tabPanels.forEach(panel => panel.classList.add('hidden'));

      // Obtém o ID do painel correspondente
      const panelId = this.getAttribute('data-tab');
      const targetPanel = document.getElementById(panelId);

      // Exibe o painel de conteúdo correspondente
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }
    });
  });
}

// Chama a função para configurar as abas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', setupTabs);
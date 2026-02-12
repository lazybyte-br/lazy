
export function led()
{
    const led = document.getElementById('led');
    const statusText = document.getElementById('statusText');

    // Se o usuário prefere reduzir movimento, não animate automaticamente
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Estado inicial: ligado / piscando
    let blinking = true;

    // Função para aplicar classes de acordo com estado
    function applyState(){
        if(blinking && !reduceMotion){
        led.classList.remove('off');
        led.classList.add('on','blink');
        led.setAttribute('aria-pressed','true');
        statusText.textContent = 'Agenda disponível para projetos!';
        } else {
        // "on" visual mas sem animação se preferir reduzir movimento -> mostra sempre aceso
        if (blinking && reduceMotion) {
            led.classList.remove('off','blink');
            led.classList.add('on');
            statusText.textContent = 'Agenda disponível para projetos!';
            led.setAttribute('aria-pressed','true');
        } else {
            // desligado visual (não disponível)
            led.classList.remove('on','blink');
            led.classList.add('off');
            statusText.textContent = 'Agenda indisponível no momento.';
            led.setAttribute('aria-pressed','false');
        }
        }
    }

    // Alterna o estado de blinking (piscando ligado/desligado)
    function toggleBlink(){
        blinking = !blinking;
        applyState();
    }

    // Permite controlar via clique e via teclado (Enter/Space)
    led.addEventListener('click', toggleBlink);
    led.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        toggleBlink();
        }
    });

    // Se o usuário não prefere reduzir movimento, damos comportamento extra: piscar automático por JS
    // (a classe .blink.on já anima via CSS keyframes). Mantivemos lógica simples (estado boolean).
    // Estado inicial aplicado:
    applyState();

    // Observador para detectar mudança de preferência de redução de movimento em tempo real
    if (window.matchMedia){
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener && mq.addEventListener('change', function(){
        // atualizar flag e reaplicar estado
        const nowReduce = mq.matches;
        // atualizamos a variável e re-aplicamos
        if (nowReduce !== reduceMotion) {
            // Note: reduceMotion is const; read again from matchMedia:
            applyState();
        } else {
            applyState();
        }
        });
    }
}

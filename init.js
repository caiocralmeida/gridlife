/* INICIALIZAÇÃO: setup básico do jogo */

// Função auxiliar para encontrar elementos DOM
window.$=function(id){return document.getElementById(id)};

// Função auxiliar para mostrar diálogos
window.dlg=function(msg,opts,cb){
  opts=opts||{c:0};
  if(opts.c){
    if(confirm(msg)&&cb)cb();
  }else{
    alert(msg);
    if(cb)cb();
  }
};

// Função auxiliar para mostrar overlay
window.ovl=function(show){
  // Placeholder
};

// Números aleatórios
window.RN=function(min,max){
  return min+Math.random()*(max-min);
};

// Formatação de moeda
window.M=function(val){
  return '$'+Math.round(val/1000)+'k';
};

// Barra de progresso
window.bar=function(percent,cls,min,opt,max){
  const fill=Math.round(percent);
  const empty=100-fill;
  return `<div style="background:#222;height:8px;border-radius:2px;overflow:hidden"><div style="background:linear-gradient(90deg,#e11d48,#f97316);width:${fill}%;height:100%;transition:width .3s"></div></div>`;
};

// Estado global
window.s=null;
window.m_state=null;
window.V='home';

// Carregar estado salvo
function loadGame(){
  try{
    const saved=localStorage.getItem('gridlife1');
    if(saved)s=JSON.parse(saved);
  }catch(e){}
  
  try{
    const saved_mgr=localStorage.getItem('gridlife_manager');
    if(saved_mgr)m_state=JSON.parse(saved_mgr);
  }catch(e){}
}

// Salvar estado
function saveGame(){
  if(s){
    try{localStorage.setItem('gridlife1',JSON.stringify(s))}catch(e){}
  }
  if(m_state){
    try{localStorage.setItem('gridlife_manager',JSON.stringify(m_state))}catch(e){}
  }
}

// Chamar draw quando página carregar
window.addEventListener('load',function(){
  loadGame();
  if(typeof draw==='function'){
    draw();
  }
});

// Salvar antes de sair
window.addEventListener('beforeunload',function(){
  saveGame();
});

// Setup inicial
console.log('GRIDLIFE carregado - Modo Gestor ativado');

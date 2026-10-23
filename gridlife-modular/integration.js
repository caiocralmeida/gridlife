/* INTEGRAÇÃO: adiciona modo gestor ao menu principal */

// Função auxiliar para encontrar elementos
if(!window.$) window.$=function(id){return document.getElementById(id)};

// Override da função draw para suportar gestor
const _original_draw=(typeof window.draw === 'function') ? window.draw : function(){};
window.draw=function(){
  const a=$('app');
  if(!a) return; // Elemento não existe
  
  // Menu principal
  if(!s && !m_state){
    const sv=(()=>{try{return localStorage.getItem('gridlife1')}catch(e){}})();
    a.innerHTML=`<div class="menu"><h1 style="font-size:4rem;text-shadow:0 0 30px #e11d4888">GRIDLIFE</h1><p class="sm" style="letter-spacing:3px">MOTORSPORT LIFE SIMULATION MANAGER</p><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:10px"><span class="chip">CIRCUITO</span><span class="chip">RALI</span><span class="chip">ENDURANCE</span></div><div class="card sm" style="text-align:left;margin-top:16px">${LORE}</div><button class="b" onclick="create()">Nova carreira piloto</button><button class="b s" onclick="create(1)">Modo livre piloto</button><button class="b" style="background:linear-gradient(135deg,#8e44ad,#3498db)" onclick="mgrCreate()">👥 Modo gestor</button><button class="b s" onclick="create(1)">Gerenciador livre</button>${slotsHtml()}<button class="b s" onclick="imp()">Importar save</button><button class="b s" onclick="optPop()">Opções e ajuda</button></div>`;return;
  }
  
  // Tela do gestor
  if(m_state && !s){
    ovl(0);
    const t={n:['Kart Regional','Copa Formação','Aurora F3','Aurora F2','Grand Prix'][m_state.t]||'Categoria'};
    a.innerHTML=`<div class="top"><h1 style="font-size:1.6rem">GRIDLIFE · GESTOR</h1><div class="sm">${t.n} · Ano ${m_state.yr} · Saldo <b style="color:var(--g)">${M(m_state.bank)}</b> · REP <b>${m_state.rep.toFixed(1)}</b><br><button class="b s" style="padding:3px 10px;font-size:.65rem;margin-top:4px" onclick="mgrExp()">Exportar save</button></div></div><nav>${[['gestor_home','Central'],['gestor_equipe','Equipe'],['gestor_instalacoes','Instalações'],['gestor_engenharia','Engenharia'],['gestor_patrocinios','Patrocínios'],['gestor_carreira','Carreira']].map(x=>`<button class="${V==x[0]?'on':''}" onclick="V='${x[0]}';draw()">${x[1]}</button>`).join('')}<button class="gor" onclick="mgrToRace()">Ir para corrida ➔</button></nav><div id="v"></div>`;
    ({gestor_home:vManagerHome,gestor_equipe:vManagerTeam,gestor_instalacoes:vManagerFacilities,gestor_engenharia:vManagerEngineering,gestor_patrocinios:vManagerSponsors,gestor_carreira:vManagerCareer}[V]||vManagerHome)();
    return;
  }
  
  // Chamar draw original para o modo piloto
  _original_draw();
}

// Criar nova carreira de gestor
window.mgrCreate=function(){
  let st=[];
  const styles=Object.keys(MGR_STYLES);
  const op=(id,l,a)=>`<label class="sm">${l}</label><select id="${id}">${a.map(o=>`<option value="${o[0]}" ${o[2]?'selected':''}>${o[1]}</option>`).join('')}</select>`;
  
  $('app').innerHTML=`<div class="menu" style="max-width:560px"><h2 style="font-size:2rem">Criar gestor</h2><input id="gnm" value="GESTOR" maxlength="18" placeholder="Nome do gestor"><div class="card" style="text-align:left;margin-top:10px"><h3>Seu estilo de gestão</h3><div class="g">${styles.map(s=>{const data=MGR_STYLES[s];return`<div class="card" onclick="document.getElementById('gst').value='${data[0]}';this.style.opacity=1;document.querySelectorAll('.card').forEach(c=>c.style.opacity=0.6);this.style.opacity=1" style="opacity:0.6;cursor:pointer;transition:opacity .3s"><b>${s}</b><p class="sm">${data[1]}</p></div>`}).join('')}</div><input id="gst" type="hidden" value="${MGR_STYLES[styles[0]][0]}"></div>${op('gcat','Categoria inicial',['Kart Regional','Copa Formação','Aurora F3','Aurora F2','Grand Prix'].map((n,i)=>[i,n,i==1]))}${op('gdf','Dificuldade',[[0,'Fácil'],[1,'Normal',1],[2,'Difícil']])}${op('gbank','Dinheiro inicial',[[500000,'$500k',1],[1000000,'$1M'],[2000000,'$2M'],[5000000,'$5M']])}${op('grep','Reputação inicial',[[0,'Mínima',1],[20,'+20'],[50,'+50']])}}<button class="b" onclick="mgrGo()">Começar carreira</button><button class="b s" onclick="s=null;m_state=null;draw()">Voltar</button></div>`;
}

// Iniciar carreira do gestor
window.mgrGo=function(){
  const name=($('gnm').value||'GESTOR').replace(/[<>&"'`]/g,'');
  const style_val=$('gst').value;
  let style_name='Engenheiro';
  Object.entries(MGR_STYLES).forEach(([k,v])=>{if(v[0]==style_val) style_name=k});
  
  const opts={
    t:+$('gcat').value,
    cat:+$('gcat').value,
    bank:+$('gbank').value,
    rep:+$('grep').value
  };
  
  m_state=newManagerCareer(name,style_name,opts);
  V='gestor_home';
  m_save();
  draw();
}

// Exportar save do gestor
window.mgrExp=function(){
  if(!m_state) return;
  const data='data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(m_state,null,2));
  const a=document.createElement('a');
  a.href=data;
  a.download='gridlife_gestor_'+m_state.yr+'.json';
  a.click();
}

// Ir para corrida (placeholder)
window.mgrToRace=function(){
  dlg('Sistema de corrida do gestor será integrado em breve.');
}

// Voltar ao menu do gestor
window.mgrMenu=function(){
  m_state=null;
  V='perfil';
  draw();
}

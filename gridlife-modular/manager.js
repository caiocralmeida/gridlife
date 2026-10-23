/* MODO GESTOR: sistema completo de gerenciamento de equipes */

// === CONSTANTES DO GESTOR ===
const MGR_STYLES={Engenheiro:['eng','Desenvolvimento técnico',{eng:5}],Empresário:['bus','Negociação e finanças',{neg:5}],'Líder de Equipe':['lead','Motivação e gestão',{lead:5}],Estrategista:['strat','Análise e estratégia',{strat:5}],Competidor:['comp','Preparação competitiva',{comp:5}]};
const MGR_ATTRS=['eng','neg','lead','strat','fin','tal','prep','rep'];
const MGR_ATTR_NM={eng:'Engenharia',neg:'Negociação',lead:'Liderança',strat:'Estratégia',fin:'Finanças',tal:'Avaliação talentos',prep:'Preparação',rep:'Reputação'};
const STAFF_ROLES=['Piloto','Engenheiro','Mecânico'];
const FACILITY_NAMES=['Oficina','Túnel de vento','Centro de treinamento','Laboratório de pesquisa','Armazém de peças'];
const FACILITY_COSTS=[50000,80000,60000,100000,40000];
const FACILITY_CAPS=[[2,3,4,5,6],[1,2,3,4,5],[2,3,4,5,6],[1,1,2,3,4],[5,10,20,30,50]];

// === INICIALIZAR MODO GESTOR ===
function newManagerCareer(name,style,opts){
  opts=opts||{};
  const base={v:2,type:'manager',mname:name,mstyle:style,yr:1,mo:0,t:opts.t||1,category:opts.cat||1,team:opts.team||null,bank:opts.bank||500000,rep:opts.rep||0,attr:{},log:[],staff:[],facilities:[1,0,0,0,3],stock:{},sponsors:[],pres_moral:50,contracts:[],dev_projects:[],achievements:[]};
  
  // Inicializar atributos com estilo
  MGR_ATTRS.forEach(a=>base.attr[a]=20);
  const style_data=Object.values(MGR_STYLES).find(s=>s[0]==style);
  if(style_data){Object.assign(base.attr,style_data[2])}
  
  // Equipe inicial
  base.staff=[
    {role:'Piloto',name:'Piloto A',skill:RN(35,45),salary:15000,moral:60},
    {role:'Engenheiro',name:'Engenheiro Junior',skill:RN(25,35),salary:8000,moral:50},
    {role:'Mecânico',name:'Mecânico Senior',skill:RN(40,50),salary:6000,moral:65}
  ];
  
  // Objetivos da presidência
  base.pres_goals={season:base.yr,targets:['Posição mínima: top 5','Saldo positivo',`${Math.round(RN(2,4))} pódios mínimos`]};
  
  return base;
}

// === TELAS PRINCIPAIS DO GESTOR ===
function vManagerHome(){
  const m=m_get();
  if(!m) return;
  
  $('v').innerHTML=`
    <div class="card">
      <h2 style="font-size:1.8rem">${m.mname}</h2>
      <p class="sm">${m.mstyle} · Equipe: ${m.team||'Sem equipe'}</p>
      <hr style="border:0;border-top:1px solid var(--l);margin:10px 0">
      <div class="row"><span>Ano</span><b>${m.yr}</b></div>
      <div class="row"><span>Saldo</span><b style="color:var(--g)">${M(m.bank)}</b></div>
      <div class="row"><span>REP</span><b>${m.rep.toFixed(1)}</b></div>
      <div class="row"><span>Moral com presidência</span><b>${m.pres_moral}%</b></div>
      ${bar(m.pres_moral)}
    </div>
    
    <div class="card">
      <h3>Objetivos do presidente</h3>
      ${(m.pres_goals.targets||[]).map(t=>`<p class="sm">• ${t}</p>`).join('')}
    </div>
    
    <div class="card">
      <h3>Equipe atual</h3>
      ${m.staff.map(s=>`<p class="sm"><b>${s.name}</b> (${s.role}) · Habilidade: ${Math.round(s.skill)} · Moral: ${s.moral}%</p>`).join('')}
    </div>
    
    <div class="card">
      <h3>Comunicados</h3>
      ${m.log.slice(-5).reverse().map(l=>`<p class="sm" style="padding:4px 0;border-bottom:1px solid var(--l)">${l}</p>`).join('')}
    </div>
  `;
}

function vManagerTeam(){
  const m=m_get();
  if(!m) return;
  
  let html=`<div class="card"><h3>Gestão de pessoal</h3><p class="sm">Contrate, negocie e gerencie a moral da equipe</p></div>`;
  
  // Mostrar staff contratado
  html+=`<div class="card"><h3>Seu pessoal (${m.staff.length})</h3>`;
  m.staff.forEach((s,i)=>{
    html+=`<div style="padding:10px;border:1px solid var(--l);border-radius:4px;margin:8px 0">
      <div class="row"><b>${s.name}</b><span class="sm">${s.role}</span></div>
      <div class="row"><span>Habilidade</span><b>${Math.round(s.skill)}</b></div>
      <div class="row"><span>Moral</span><b>${s.moral}%</b></div>
      ${bar(s.moral)}
      <div class="row"><span>Salário</span><b>${M(s.salary)}/temp</b></div>
      <button class="b s w" style="margin-top:6px" onclick="mgrFire(${i})">Demitir</button>
    </div>`;
  });
  html+=`</div>`;
  
  // Mercado de contratação
  html+=`<div class="card"><h3>Mercado de contratação</h3><p class="sm">Opções disponíveis nesta semana</p>`;
  const market=m_generateMarket();
  html+=`<div class="g">`;
  market.forEach((cand,i)=>{
    html+=`<div class="card" style="text-align:left">
      <b>${cand.name}</b>
      <p class="sm">${cand.role} · Habilidade: ${Math.round(cand.skill)}</p>
      <p class="sm">Salário: ${M(cand.salary)}/temp</p>
      <button class="b w" ${m.bank<cand.salary*2?'disabled':''} onclick="mgrHire(${i})">${M(cand.salary*2)} (contrato 2 temp.)</button>
    </div>`;
  });
  html+=`</div></div>`;
  
  $('v').innerHTML=html;
}

function vManagerFacilities(){
  const m=m_get();
  if(!m) return;
  
  let html=`<div class="card"><h3>Instalações</h3><p class="sm">Nivele instalações para melhorar produção, pesquisa e qualidade</p></div>`;
  
  FACILITY_NAMES.forEach((name,i)=>{
    const lv=m.facilities[i]||0;
    const caps=FACILITY_CAPS[i];
    const cost=FACILITY_COSTS[i];
    const nextCost=Math.round(cost*(1.3**lv));
    const max_staff=caps[lv]||caps[caps.length-1];
    
    html+=`<div class="card">
      <div class="row"><b>${name}</b><span class="sm">Nível ${lv}/${caps.length-1}</span></div>
      <p class="sm">Capacidade: ${max_staff} funcionários</p>
      ${bar(lv*100/(caps.length-1))}
      <button class="b w" style="margin-top:8px" ${lv>=caps.length-1 || m.bank<nextCost?'disabled':''} onclick="mgrUpgrade(${i})">
        ${lv>=caps.length-1?'Máximo':M(nextCost)}
      </button>
    </div>`;
  });
  
  $('v').innerHTML=html;
}

function vManagerEngineering(){
  const m=m_get();
  if(!m) return;
  
  let html=`<div class="card"><h3>Engenharia e pesquisa</h3><p class="sm">Desenvolva componentes para melhorar o carro</p></div>`;
  
  // Projetos em desenvolvimento
  html+=`<div class="card"><h3>Projetos em curso</h3>`;
  if((m.dev_projects||[]).length==0){
    html+=`<p class="sm">Nenhum projeto. Pesquise abaixo.</p>`;
  }else{
    m.dev_projects.forEach((p,i)=>{
      const progress=Math.round((p.weeks_done||0)/(p.weeks_total||1)*100);
      html+=`<div style="margin:10px 0">
        <div class="row"><b>${p.name}</b><span class="sm">${p.weeks_done}/${p.weeks_total} semanas</span></div>
        ${bar(progress)}
      </div>`;
    });
  }
  html+=`</div>`;
  
  // Áreas de pesquisa
  html+=`<div class="card"><h3>Áreas de pesquisa</h3><div class="g">`;
  const research_areas=[
    {name:'Motor',desc:'Aumenta potência em +2%',cost:40000,weeks:4},
    {name:'Aerodinâmica',desc:'Reduz arrasto em -3%',cost:35000,weeks:3},
    {name:'Suspensão',desc:'Melhora aderência em +5%',cost:30000,weeks:3},
    {name:'Freios',desc:'Desaceleração em +3%',cost:25000,weeks:2}
  ];
  
  research_areas.forEach((area,i)=>{
    html+=`<div class="card" style="text-align:left">
      <b>${area.name}</b>
      <p class="sm">${area.desc}</p>
      <p class="sm">${area.weeks} semanas · ${M(area.cost)}</p>
      <button class="b w" ${m.bank<area.cost?'disabled':''} onclick="mgrStartProject('${area.name}',${area.cost},${area.weeks})">Iniciar</button>
    </div>`;
  });
  html+=`</div></div>`;
  
  $('v').innerHTML=html;
}

function vManagerSponsors(){
  const m=m_get();
  if(!m) return;
  
  let html=`<div class="card"><h3>Patrocínios (${m.sponsors.length}/5)</h3><p class="sm">Gerencie contratos de patrocínio para financiar a equipe</p></div>`;
  
  // Patrocinadores atuais
  if(m.sponsors.length>0){
    html+=`<div class="card"><h3>Contratos ativos</h3>`;
    m.sponsors.forEach((sp,i)=>{
      html+=`<div style="padding:10px;border:1px solid var(--l);margin:8px 0">
        <div class="row"><b>${sp.name}</b><span class="sm">Races: ${sp.races_remaining}/${sp.races_total}</span></div>
        <p class="sm">Valor: ${M(sp.value)}/contrato</p>
        <button class="b s w" onclick="mgrBreakSponsor(${i})">Rescindir</button>
      </div>`;
    });
    html+=`</div>`;
  }
  
  // Ofertas disponíveis
  if(m.sponsors.length<5){
    html+=`<div class="card"><h3>Ofertas disponíveis</h3>`;
    const offers=m_generateSponsors();
    offers.forEach((offer,i)=>{
      html+=`<div class="card" style="text-align:left">
        <b>${offer.name}</b>
        <p class="sm">${offer.races} corridas · ${M(offer.value)}</p>
        <button class="b w" onclick="mgrAcceptSponsor(${i})">${M(offer.value)}</button>
      </div>`;
    });
    html+=`</div>`;
  }
  
  $('v').innerHTML=html;
}

function vManagerCareer(){
  const m=m_get();
  if(!m) return;
  
  let html=`<div class="card"><h3>Carreira como gestor</h3></div>`;
  
  // Estatísticas
  html+=`<div class="card"><h3>Atributos (${m.mstyle})</h3>`;
  MGR_ATTRS.forEach(attr=>{
    const val=m.attr[attr]||0;
    html+=`<div class="row"><span>${MGR_ATTR_NM[attr]}</span><b>${Math.round(val)}</b></div>`;
    html+=bar(Math.min(val,100),'');
  });
  html+=`</div>`;
  
  // Histórico
  html+=`<div class="card"><h3>Histórico (${m.log.length} eventos)</h3>`;
  m.log.slice(-10).reverse().forEach(log=>{
    html+=`<p class="sm" style="padding:4px 0;border-bottom:1px solid var(--l)">${log}</p>`;
  });
  html+=`</div>`;
  
  // Conquistas
  html+=`<div class="card"><h3>Conquistas (${m.achievements.length})</h3>`;
  (m.achievements||[]).forEach(ach=>{
    html+=`<p class="sm">✓ ${ach}</p>`;
  });
  if(!m.achievements || m.achievements.length==0){
    html+=`<p class="sm">Nenhuma conquista ainda. Cumpra objetivos para desbloqueá-las.</p>`;
  }
  html+=`</div>`;
  
  // Opções de aposentadoria
  if(m.yr>=10){
    html+=`<div class="card"><button class="b" onclick="mgrRetire()">Aposentar-se como gestor</button></div>`;
  }
  
  $('v').innerHTML=html;
}

// === AÇÕES DO GESTOR ===
function mgrUpgrade(facility_idx){
  const m=m_get();
  if(!m) return;
  const lv=m.facilities[facility_idx]||0;
  const caps=FACILITY_CAPS[facility_idx];
  const cost=FACILITY_COSTS[facility_idx];
  const nextCost=Math.round(cost*(1.3**lv));
  
  if(lv>=caps.length-1 || m.bank<nextCost){
    dlg('Operação não permitida.');
    return;
  }
  
  dlg(`Upgrade ${FACILITY_NAMES[facility_idx]} para nível ${lv+1}?\n\nCusto: ${M(nextCost)}`,{c:1},()=>{
    m.bank-=nextCost;
    m.facilities[facility_idx]++;
    m.log.push(`Upgrade ${FACILITY_NAMES[facility_idx]} para nível ${lv+1}.`);
    m_save();
    draw();
  });
}

function mgrHire(market_idx){
  const m=m_get();
  if(!m) return;
  const market=m_generateMarket();
  if(!market[market_idx]) return;
  const cand=market[market_idx];
  const cost=cand.salary*2;
  
  if(m.bank<cost){
    dlg('Saldo insuficiente.');
    return;
  }
  
  dlg(`Contratar ${cand.name} (${cand.role})?\n\nSalário: ${M(cand.salary)}/temporada\nContrato: 2 temporadas\nCusto inicial: ${M(cost)}`,{c:1},()=>{
    m.bank-=cost;
    m.staff.push({...cand});
    m.log.push(`Contratou ${cand.name} como ${cand.role}.`);
    m_save();
    V='gestor_equipe';
    draw();
  });
}

function mgrFire(staff_idx){
  const m=m_get();
  if(!m || !m.staff[staff_idx]) return;
  const staff=m.staff[staff_idx];
  
  dlg(`Demitir ${staff.name}?\n\nImpacto na moral da equipe: -5%`,{c:1},()=>{
    m.staff.splice(staff_idx,1);
    m.pres_moral=Math.max(0,m.pres_moral-5);
    m.log.push(`Demitiu ${staff.name}.`);
    m_save();
    V='gestor_equipe';
    draw();
  });
}

function mgrAcceptSponsor(offer_idx){
  const m=m_get();
  if(!m || m.sponsors.length>=5) return;
  const offers=m_generateSponsors();
  if(!offers[offer_idx]) return;
  const offer=offers[offer_idx];
  
  dlg(`Aceitar patrocínio de ${offer.name}?\n\n${offer.races} corridas\nValor: ${M(offer.value)}\nReputação: +${offer.rep||1}`,{c:1},()=>{
    m.bank+=offer.value;
    m.rep+=(offer.rep||1);
    m.sponsors.push({name:offer.name,value:offer.value,races_total:offer.races,races_remaining:offer.races});
    m.log.push(`Patrocínio com ${offer.name} aceito.`);
    m_save();
    V='gestor_patrocinios';
    draw();
  });
}

function mgrBreakSponsor(sponsor_idx){
  const m=m_get();
  if(!m || !m.sponsors[sponsor_idx]) return;
  const sp=m.sponsors[sponsor_idx];
  
  dlg(`Rescindir patrocínio com ${sp.name}?\n\nPenalidade: -${M(sp.value)}`,{c:1},()=>{
    m.bank-=sp.value;
    m.rep=Math.max(0,m.rep-2);
    m.sponsors.splice(sponsor_idx,1);
    m.log.push(`Patrocínio com ${sp.name} rescindido.`);
    m_save();
    V='gestor_patrocinios';
    draw();
  });
}

function mgrStartProject(name,cost,weeks){
  const m=m_get();
  if(!m || m.bank<cost) return;
  
  dlg(`Iniciar pesquisa: ${name}?\n\nCusto: ${M(cost)}\nTempo: ${weeks} semanas`,{c:1},()=>{
    m.bank-=cost;
    m.dev_projects.push({name,cost,weeks_total:weeks,weeks_done:0});
    m.log.push(`Iniciou pesquisa de ${name}.`);
    m_save();
    V='gestor_engenharia';
    draw();
  });
}

function mgrRetire(){
  const m=m_get();
  if(!m) return;
  
  dlg('Aposentar-se como gestor?\n\nSua carreira será finalizada.',{c:1},()=>{
    m.retired=true;
    m_save();
    dlg(`Carreira finalizada!\n\nAnos como gestor: ${m.yr}\nReputação final: ${m.rep.toFixed(1)}\nPrêmios: ${M(m.bank)}`);
    s=null;
    draw();
  });
}

// === FUNÇÕES AUXILIARES ===
function m_get(){
  return m_state;
}

function m_save(){
  if(m_state){
    try{localStorage.setItem('gridlife_manager',JSON.stringify(m_state))}catch(e){}
  }
}

function m_load(){
  try{const saved=localStorage.getItem('gridlife_manager');if(saved) m_state=JSON.parse(saved);else m_state=null}catch(e){m_state=null}
}

function m_generateMarket(){
  const roles=['Piloto','Engenheiro','Mecânico'];
  const first_names=['Alex','Bruno','Carlos','Diego','Elisa','Fernanda','Gustavo','Helena','Igor','Julia','Kevin','Lucia'];
  const last_names=['Silva','Santos','Oliveira','Costa','Ferreira','Alves','Gomes','Rocha','Carvalho','Martins'];
  
  const market=[];
  roles.forEach(role=>{
    for(let i=0;i<Math.floor(RN(2,4));i++){
      const fname=first_names[Math.floor(Math.random()*first_names.length)];
      const lname=last_names[Math.floor(Math.random()*last_names.length)];
      market.push({
        name:`${fname} ${lname}`,
        role,
        skill:role=='Piloto'?RN(30,55):RN(25,50),
        salary:role=='Piloto'?RN(8000,25000):role=='Engenheiro'?RN(5000,15000):RN(3000,8000)
      });
    }
  });
  return market;
}

function m_generateSponsors(){
  const sponsors=[
    {name:'TechCorp Motors',races:8,value:80000,rep:2},
    {name:'EnergiMax',races:6,value:50000,rep:1},
    {name:'AutoShield',races:10,value:120000,rep:3},
    {name:'FuelPro',races:5,value:35000,rep:1},
    {name:'PrecisionTech',races:7,value:70000,rep:2},
    {name:'RaceLux Watches',races:4,value:40000,rep:1},
    {name:'SpeedOil Premium',races:8,value:60000,rep:2}
  ];
  
  return sponsors.sort(()=>Math.random()-.5).slice(0,Math.floor(RN(2,4)));
}

// === VARIÁVEL GLOBAL ===
let m_state=null;

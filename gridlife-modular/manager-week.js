/* MODO GESTOR: Sistema de Semana e Ações */

// === CONSTANTES DE SEMANA ===
const MGR_WEEK_ACTIONS={
  reuniao:['Reunião técnica',m=>{const eng=m.staff.filter(s=>s.role=='Engenheiro');if(!eng.length){dlg('Sem engenheiros para reunião');return false}const boost=RN(1.5,3.5)*eng.length;m.attr.eng+=boost/10;m.attr.prep+=RN(0.5,1.5);return{text:`+${boost.toFixed(1)} produção técnica`}}],
  talento:['Avaliação de talentos',m=>{m.market_refresh=true;m.attr.tal+=RN(1,2);return{text:'Mercado renovado, habilidades reais reveladas'}}],
  presidente:['Conversa com presidente',m=>{const boost=RN(2,5);m.pres_moral=Math.min(100,m.pres_moral+boost);m.attr.lead+=RN(0.5,1);return{text:`Moral com presidente +${Math.round(boost)}%`}}],
  negociacao:['Negociação com patrocinador',m=>{if(!m.sponsors.length){dlg('Nenhum patrocinador para negociar');return false}const sp=m.sponsors[Math.floor(Math.random()*m.sponsors.length)];const bonus=Math.round(sp.value*0.05);m.bank+=bonus;m.rep+=0.5;m.attr.neg+=RN(1,2);return{text:`Bônus de ${M(bonus)} em negociação`}}],
  descanso:['Descanso da equipe',m=>{m.staff.forEach(s=>s.moral=Math.min(100,s.moral+RN(8,15)));m.attr.lead+=RN(0.5,1);return{text:'Moral de toda equipe elevada'}}],
  rivais:['Análise de rivais',m=>{m.hint_setup=true;m.attr.strat+=RN(1.5,2.5);m.attr.prep+=RN(1,2);return{text:'Estratégia de corrida melhorada'}}]
};

const MGR_WEEK_SLOTS=3;

// === TELA DE SEMANA DO GESTOR ===
function vManagerWeek(){
  const m=m_get();
  if(!m) return;
  
  const slots=m.week_actions||MGR_WEEK_SLOTS;
  const bonus_slot=m.sponsors.length>0?1:0;
  const max_slots=MGR_WEEK_SLOTS+bonus_slot;
  
  let html=`<div class="card">
    <h3>Semana de preparação - Ano ${m.yr}</h3>
    <div class="row"><span>Ações disponíveis</span><b style="font-size:1.4rem;letter-spacing:4px">${'●'.repeat(slots)}${'○'.repeat(Math.max(0,max_slots-slots))}</b></div>
    <p class="sm">Escolha uma ação, confira o efeito e confirme.</p>
  </div>`;
  
  html+=`<div class="g">`;
  Object.entries(MGR_WEEK_ACTIONS).forEach(([key,action])=>{
    html+=`<div class="card" style="text-align:left">
      <b>${action[0]}</b>
      <p class="sm" style="margin:4px 0 8px">${getMgrActionDesc(key)}</p>
      <button class="b w" ${slots>0?'':'disabled'} onclick="mgrAction('${key}')">Executar</button>
    </div>`;
  });
  html+=`</div>`;
  
  // Consumíveis
  html+=`<div class="card">
    <h3>Suplementos</h3>
    <p class="sm">Recuperam ações ou boosters</p>
    <div class="g">`;
  const supplements=[
    {id:'energy',name:'Energético de preparação',effect:'+3 ações',owned:m.inv_energy||0},
    {id:'focus',name:'Bebida de foco',effect:'+1 habilidade para corrida',owned:m.inv_focus||0}
  ];
  supplements.forEach(sup=>{
    html+=`<div class="card">
      <b>${sup.name}</b> <span class="sm">x${sup.owned}</span>
      <p class="sm">${sup.effect}</p>
      <button class="b s w" ${sup.owned>0?'':'disabled'} onclick="mgrUseSupplement('${sup.id}')">Usar</button>
    </div>`;
  });
  html+=`</div></div>`;
  
  // Status da equipe
  html+=`<div class="card">
    <h3>Status da equipe</h3>`;
  m.staff.forEach(s=>{
    const moral_color=s.moral<30?'#e74c3c':s.moral>80?'#27ae60':'#f39c12';
    html+=`<div style="margin:8px 0">
      <div class="row"><span>${s.name}</span><span class="sm">${s.role}</span></div>
      <div class="row"><span>Moral</span><b style="color:${moral_color}">${Math.round(s.moral)}%</b></div>
      ${bar(s.moral)}
    </div>`;
  });
  html+=`</div>`;
  
  $('v').innerHTML=html;
}

function getMgrActionDesc(key){
  const descs={
    reuniao:'Reúna com engenheiros para revisar o desenvolvimento do carro.',
    talento:'Avalie o mercado e descubra habilidades reais dos candidatos.',
    presidente:'Melhore relações com a presidência da equipe.',
    negociacao:'Negocie com patrocinadores por bônus extras.',
    descanso:'Dê folga para a equipe recuperar moral e energia.',
    rivais:'Analise estratégia dos rivais para a próxima corrida.'
  };
  return descs[key]||'Ação desconhecida';
}

// === EXECUTAR AÇÃO ===
function mgrAction(key){
  const m=m_get();
  if(!m || !m.week_actions) return;
  
  const action=MGR_WEEK_ACTIONS[key];
  if(!action){
    dlg('Ação inválida.');
    return;
  }
  
  dlg(`Executar: ${action[0]}?\n\n${getMgrActionDesc(key)}`,{c:1},()=>{
    const result=action[1](m);
    if(result===false){
      dlg('Não foi possível executar essa ação.');
      return;
    }
    
    m.week_actions--;
    const log_msg=`Semana ${m.week||1} · ${action[0]}: ${result.text||'executado'}`;
    m.log.push(log_msg);
    
    // Efeito visual
    m_save();
    draw();
    dlg(`✓ ${action[0]}\n${result.text||'Ação executada com sucesso'}`);
  });
}

function mgrUseSupplement(id){
  const m=m_get();
  if(!m) return;
  
  if(id=='energy'){
    if(!m.inv_energy || m.inv_energy<1) return;
    const max_slots=MGR_WEEK_SLOTS+(m.sponsors.length>0?1:0);
    m.week_actions=max_slots;
    m.inv_energy--;
    m.log.push(`Usou energético de preparação. Ações restauradas.`);
  }else if(id=='focus'){
    if(!m.inv_focus || m.inv_focus<1) return;
    m.attr.prep+=3;
    m.inv_focus--;
    m.log.push(`Usou bebida de foco. Preparação +3.`);
  }
  
  m_save();
  draw();
}

// === SISTEMA DE METAS DO PRESIDENTE ===
function checkPresidentGoals(){
  const m=m_get();
  if(!m) return;
  
  const goals=m.pres_goals.targets||[];
  let met=0;
  
  // Simulação de cumprimento (em produção isso vem dos resultados)
  if(Math.random()>0.3) met++;
  
  if(met>=goals.length){
    m.pres_moral=Math.min(100,m.pres_moral+15);
    m.log.push(`Metas cumpridas! Moral do presidente +15%.`);
  }else{
    m.pres_moral=Math.max(0,m.pres_moral-10);
    m.log.push(`Metas não cumpridas. Moral do presidente -10%.`);
  }
  
  // Avisos
  if(m.pres_moral<=20 && !m.pres_warning1){
    m.pres_warning1=true;
    dlg('⚠️ AVISO DO PRESIDENTE\n\nSua performance está abaixo do esperado. Melhore nos próximos meses ou será demitido.');
  }
  
  if(m.pres_moral<=10 && m.pres_warning_count>=3){
    dlg('❌ DEMISSÃO\n\nO presidente perdeu a confiança em você. Você foi demitido como gestor.');
    m_state=null;
    draw();
    return;
  }
}

// === SISTEMA DE DÍVIDA ===
function checkDebt(){
  const m=m_get();
  if(!m) return;
  
  if(m.bank<0){
    m.debt_weeks=(m.debt_weeks||0)+1;
    
    if(m.debt_weeks==2){
      dlg('⚠️ AVISO FINANCEIRO\n\nSua equipe está em dívida há 2 semanas. Liquidar a dívida em 7 dias ou enfrentará consequências.');
    }
    
    if(m.debt_weeks>7){
      dlg('❌ INSOLVÊNCIA\n\nSua equipe está insolvente. A temporada foi encerrada.');
      m_state=null;
      draw();
      return;
    }
  }else{
    m.debt_weeks=0;
  }
}

// === AVANÇO DE SEMANA ===
function advanceWeek(){
  const m=m_get();
  if(!m) return;
  
  m.week=(m.week||0)+1;
  m.week_actions=MGR_WEEK_SLOTS+(m.sponsors.length>0?1:0);
  
  // Custos fixos
  const salary_cost=m.staff.reduce((a,s)=>a+s.salary,0);
  m.bank-=salary_cost;
  m.log.push(`Salários pagos: ${M(salary_cost)}`);
  
  // Patrocínios
  m.sponsors.forEach((sp,i)=>{
    if(sp.races_remaining>0){
      sp.races_remaining--;
      m.log.push(`Patrocínio com ${sp.name}: ${sp.races_remaining} corridas restantes.`);
    }else{
      m.sponsors.splice(i,1);
      m.log.push(`Patrocínio com ${sp.name} expirou.`);
    }
  });
  
  // Projetos em desenvolvimento
  (m.dev_projects||[]).forEach((proj,i)=>{
    proj.weeks_done++;
    if(proj.weeks_done>=proj.weeks_total){
      m.log.push(`✓ Pesquisa de ${proj.name} concluída!`);
      m.dev_projects.splice(i,1);
    }
  });
  
  // Checar objetivos
  if(m.week%4==0){ // A cada 4 semanas
    checkPresidentGoals();
  }
  
  // Checar dívida
  checkDebt();
  
  m_save();
  return true;
}

// === SISTEMA DE CONTRATO ===
function mgrNegotiateContract(staff_idx){
  const m=m_get();
  if(!m || !m.staff[staff_idx]) return;
  const staff=m.staff[staff_idx];
  
  // Chance de renovação depende de moral e performance
  const chance=0.4+(m.attr.neg/100*0.4)+(staff.moral/100*0.2);
  
  if(Math.random()<chance){
    dlg(`✓ ${staff.name} aceitou renovação!\n\nNovo contrato: 2 temporadas`);
    staff.contract_years=2;
    m.attr.neg+=0.5;
    m.rep+=1;
  }else{
    dlg(`❌ ${staff.name} rejeitou renovação.\n\nO jogador entrou no mercado.`);
    m.staff.splice(staff_idx,1);
  }
  
  m_save();
  draw();
}

// === SISTEMA DE EVOLUÇÃO DE RIVAIS ===
function evolveRivalTeams(){
  const m=m_get();
  if(!m) return;
  
  // Simular que equipes rivais melhoram/pioram
  if(Math.random()>0.4){
    m.log.push('Aurora Motorsport fez grande contratação no mercado.');
  }
  if(Math.random()>0.5){
    m.log.push('Vortex GP iniciou pesquisa de motor avançado.');
  }
}

// === TELA DE FINAL DE TEMPORADA ===
function vManagerSeasonEnd(){
  const m=m_get();
  if(!m) return;
  
  const html=`<div class="card">
    <h2 style="font-size:2rem">Fim da temporada ${m.yr}</h2>
    <hr style="border:0;border-top:1px solid var(--l);margin:10px 0">
    <p style="margin:8px 0"><b>Resultados</b></p>
    <p class="sm">Posição final: Cálculo em progresso...</p>
    <p class="sm">Premiação: ${M(Math.round(RN(50000,200000)))}</p>
    <p class="sm">Saldo final: <b style="color:var(--g)">${M(m.bank)}</b></p>
    <hr style="border:0;border-top:1px solid var(--l);margin:10px 0">
    <p style="margin:8px 0"><b>Próxima temporada</b></p>
    <p class="sm">Escolha as peças principais para ${m.yr+1}:</p>
  </div>
  <div class="g">
    ${getComponentChoices().map((comp,i)=>`<div class="card" style="text-align:left">
      <b>${comp.name}</b>
      <p class="sm" style="margin:4px 0">Seleção de fornecedor</p>
      <select id="comp_${i}" onchange="selectComponent(${i},this.value)">
        ${comp.options.map((opt,j)=>`<option value="${j}">${opt.name} · ${M(opt.cost)}</option>`).join('')}
      </select>
    </div>`).join('')}
  </div>
  <div class="card"><button class="b w" onclick="startNewSeason()">Começar temporada ${m.yr+1}</button></div>`;
  
  $('v').innerHTML=html;
}

function getComponentChoices(){
  return [
    {
      name:'Motor',
      options:[
        {name:'Ferrari V6',cost:50000,power:7},
        {name:'Honda V6',cost:10000,power:5},
        {name:'Mercedes V6',cost:40000,power:6},
        {name:'Audi V6',cost:20000,power:5}
      ]
    },
    {
      name:'Carroceria',
      options:[
        {name:'Dallara',cost:35000,aero:6},
        {name:'Tatuus',cost:20000,aero:5},
        {name:'Ligier',cost:30000,aero:6}
      ]
    },
    {
      name:'Fornecedor de gasolina',
      options:[
        {name:'Shell V-Power',cost:8000,fuel:5},
        {name:'Mobil 1',cost:12000,fuel:6},
        {name:'Castrol',cost:10000,fuel:5}
      ]
    },
    {
      name:'Fornecedor de pneus',
      options:[
        {name:'Pirelli',cost:15000,grip:6},
        {name:'Michelin',cost:18000,grip:7},
        {name:'Goodyear',cost:12000,grip:5}
      ]
    },
    {
      name:'Freios',
      options:[
        {name:'AP Racing',cost:22000,brake:7},
        {name:'Brembo',cost:25000,brake:8},
        {name:'Wilwood',cost:16000,brake:6}
      ]
    }
  ];
}

function selectComponent(idx,opt_idx){
  // Salvar seleção
  const m=m_get();
  if(!m.season_config) m.season_config={};
  m.season_config['comp_'+idx]=+opt_idx;
}

function startNewSeason(){
  const m=m_get();
  if(!m) return;
  
  m.yr++;
  m.week=0;
  m.week_actions=MGR_WEEK_SLOTS;
  
  // Limpar antigos eventos
  m.pres_warning1=false;
  m.debt_weeks=0;
  
  m.log.push(`=== TEMPORADA ${m.yr} INICIADA ===`);
  m_save();
  V='gestor_home';
  draw();
}

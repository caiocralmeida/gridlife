/* MODO GESTOR: Integração com sistema de corrida */

// === PREPARAÇÃO PARA CORRIDA (MODO GESTOR) ===
function vManagerRacePrep(){
  const m=m_get();
  if(!m) return;
  
  const pilotos=m.staff.filter(s=>s.role=='Piloto');
  if(!pilotos.length){
    dlg('Você não tem pilotos para correr.');
    return;
  }
  
  let html=`<div class="card">
    <h3>Preparação para corrida</h3>
    <p class="sm">Pista: ${getTracks()[m.current_race%14]}</p>
    <p class="sm">Etapa ${m.current_race+1} do campeonato</p>
  </div>`;
  
  // Painel de pilotos
  html+=`<div class="card">
    <h3>Seus pilotos</h3>
    <div class="g">`;
  
  pilotos.forEach((piloto,idx)=>{
    const setup=m.race_setups?.[idx]||{tires:0,wing:0,fuel:0};
    const strength=Math.round(piloto.skill*0.8+(m.attr.prep*0.2));
    
    html+=`<div class="card" style="text-align:left">
      <div class="row"><b>${piloto.name}</b><span class="sm">Habilidade ${Math.round(piloto.skill)}</span></div>
      <p class="sm" style="margin:8px 0"><b>Força prevista: ${strength}</b></p>
      <p class="sm">Moral: ${Math.round(piloto.moral)}%</p>
      ${bar(piloto.moral)}
      <div style="margin-top:8px">
        <label class="sm">Estratégia</label>
        <select id="strat_${idx}" onchange="setRaceStrat(${idx},this.value)">
          <option value="0">Conservar (fuel +20%)</option>
          <option value="1" selected>Normal</option>
          <option value="2">Atacar (pneu -15%)</option>
        </select>
      </div>
      <button class="b s w" style="margin-top:6px" onclick="briefPilot(${idx})">Briefing</button>
    </div>`;
  });
  
  html+=`</div></div>`;
  
  // Decisões técnicas
  html+=`<div class="card">
    <h3>Decisões técnicas</h3>
    <div class="row"><span>Setup do carro</span><b>${m.car_setup||50}%</b></div>
    ${bar(m.car_setup||50)}
    <p class="sm" style="margin-top:8px">Baseado em:</p>
    <ul class="sm">
      <li>Pesquisa de pista: ${m.hint_setup?'✓ Completa':'○ Não feita'}</li>
      <li>Análise de rivais: ${m.hint_rivals?'✓ Completa':'○ Não feita'}</li>
      <li>Qualidade do engenheiro: ${Math.round((m.staff.find(s=>s.role=='Engenheiro')?.skill||0)/10)}/10</li>
    </ul>
  </div>`;
  
  // Previsão de resultado
  html+=`<div class="card">
    <h3>Previsão de resultado</h3>
    <p class="sm">Seu melhor piloto tem <b>${Math.round(pilotos[0].skill*0.9 + (m.attr.prep*0.1))}% de chance de pódio</b></p>
    <p class="sm">Fator equipe: ${Math.round((1 + m.staff.length/10)*100)}%</p>
    <p class="sm">Fator experiência: ${Math.round((1 + m.yr/5)*100)}%</p>
  </div>`;
  
  html+=`<div class="card"><button class="b w" onclick="startManagerRace()">Ir para a corrida</button></div>`;
  
  $('v').innerHTML=html;
}

// === INTERFACE DE CORRIDA COM 2 PILOTOS ===
function startManagerRace(){
  const m=m_get();
  if(!m) return;
  
  const pilotos=m.staff.filter(s=>s.role=='Piloto');
  if(pilotos.length<1) return;
  
  // Inicializar race state
  m.race_state={
    lap:0,
    total_laps:14+(m.t||0)*2, // Laps aumentam com categoria
    pilots:[
      {name:pilotos[0].name,pos:RN(1,5),gap:0,tires:50,damage:0,fuel:100,pts:0},
      pilotos[1]?{name:pilotos[1].name,pos:RN(1,8),gap:RN(0.5,2),tires:50,damage:0,fuel:100,pts:0}:null
    ].filter(Boolean),
    message:'Largada!'
  };
  
  V='gestor_race';
  draw();
}

function vManagerRaceDisplay(){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const race=m.race_state;
  const progress=(race.lap/race.total_laps)*100;
  
  let html=`<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:20px;border-radius:8px;color:white">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0;font-size:1.4rem">Volta ${race.lap}/${race.total_laps}</h3>
        <p style="margin:4px 0;opacity:0.8">${getTracks()[m.current_race%14]}</p>
      </div>
      <div style="text-align:right">
        <p style="margin:0;font-size:1.2rem;color:#27ae60">${race.message}</p>
      </div>
    </div>
    ${bar(progress)}
  </div>`;
  
  // Painéis dos pilotos lado a lado
  html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">`;
  
  race.pilots.forEach((pilot,idx)=>{
    html+=`<div class="card" style="border-left:4px solid ${['#3498db','#e74c3c'][idx]}">
      <h4 style="margin:0 0 8px">${pilot.name}</h4>
      <div class="row"><span>Posição</span><b style="font-size:1.4rem">${Math.round(pilot.pos)}º</b></div>
      <div class="row"><span>Gap</span><b>${pilot.gap.toFixed(2)}s</b></div>
      <hr style="border:0;border-top:1px solid var(--l);margin:8px 0">
      <p class="sm" style="margin:4px 0"><b>Pneus</b> ${Math.round(pilot.tires)}%</p>
      ${bar(pilot.tires,'',10,50,70)}
      <p class="sm" style="margin:4px 0"><b>Combustível</b> ${Math.round(pilot.fuel)}%</p>
      ${bar(pilot.fuel)}
      <p class="sm" style="margin:4px 0"><b>Dano</b> ${Math.round(pilot.damage)}%</p>
      ${bar(pilot.damage,'',0,30,70)}
    </div>`;
  });
  
  html+=`</div>`;
  
  // Botões globais
  html+=`<div class="card">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <button class="b" style="background:#e74c3c" onclick="mgrSetRaceMode('attack')">Atacar</button>
      <button class="b" style="background:#f39c12" onclick="mgrSetRaceMode('normal')">Normal</button>
      <button class="b" style="background:#27ae60" onclick="mgrSetRaceMode('conserve')">Conservar</button>
    </div>
  </div>`;
  
  // Ajustes finos
  html+=`<div class="card">
    <details>
      <summary><b>Ajustes finos</b></summary>
      <div style="margin-top:8px">
        <p class="sm"><b>Pit stop?</b></p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${race.pilots.map((p,i)=>`<button class="b s" onclick="mgrPitStop(${i})">Parar ${p.name}</button>`).join('')}
        </div>
      </div>
    </details>
  </div>`;
  
  // Botões de controle
  html+=`<div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <button class="b" onclick="advanceRaceLap()">Próxima volta</button>
    <button class="b s" onclick="mgrPauseRace()">Pausar/Retomar</button>
  </div>`;
  
  // Botão voltar
  html+=`<div class="card"><button class="b w" onclick="exitRace()">Sair da corrida</button></div>`;
  
  $('v').innerHTML=html;
}

// === SIMULAÇÃO DE VOLTA ===
function advanceRaceLap(){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const race=m.race_state;
  const pilotos=m.staff.filter(s=>s.role=='Piloto');
  
  race.pilots.forEach((pilot,idx)=>{
    const skill=pilotos[idx]?.skill||50;
    const mental_state=pilotos[idx]?.moral||50;
    
    // Desgaste de pneus
    pilot.tires-=RN(0.8,1.5);
    if(pilot.tires<15) pilot.tires=15;
    
    // Consumo de combustível
    pilot.fuel-=RN(1.2,1.8);
    
    // Risco de dano aumenta com degradação
    if(Math.random()<(pilot.damage/100)*0.1){
      pilot.damage+=RN(2,8);
    }
    
    // Posição (simulação simples)
    const performance=skill/100+mental_state/100*0.3-(pilot.damage/100)*0.5;
    pilot.gap+=RN(-0.3,0.3)*(1-performance);
    
    if(idx==0 && pilot.gap<0) pilot.pos--;
    else if(idx>0 && pilot.gap>0) pilot.pos++;
  });
  
  race.lap++;
  
  // Eventos aleatórios
  if(Math.random()>0.85){
    const events=['Ultrapassagem!','Toque na curva','Pit stop forçado','Bandeira amarela'];
    race.message=events[Math.floor(Math.random()*events.length)];
  }else{
    race.message='Volta em andamento...';
  }
  
  // Fim da corrida
  if(race.lap>=race.total_laps){
    finishRace();
  }else{
    draw();
  }
}

function mgrSetRaceMode(mode){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const effects={
    attack:{message:'⚡ Modo Ataque ativado',tire_wear:1.3,fuel_use:1.1,risk:1.5},
    normal:{message:'⚪ Estratégia Normal',tire_wear:1.0,fuel_use:1.0,risk:1.0},
    conserve:{message:'🛡️ Modo Conservador',tire_wear:0.75,fuel_use:0.8,risk:0.5}
  };
  
  m.race_state.message=effects[mode].message;
  m.race_state.mode_effects=effects[mode];
  draw();
}

function mgrPitStop(pilot_idx){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const pilot=m.race_state.pilots[pilot_idx];
  if(!pilot) return;
  
  // Pit stop leva 5-8 segundos
  const time_loss=RN(5,8);
  pilot.gap+=time_loss;
  
  // Recupera pneus
  pilot.tires=Math.min(100,pilot.tires+60);
  
  // Pode reabastecer
  pilot.fuel=100;
  
  m.race_state.message=`📍 ${pilot.name} fez pit stop (-${time_loss.toFixed(1)}s)`;
  m_save();
  draw();
}

function mgrPauseRace(){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  m.race_paused=!m.race_paused;
  m.race_state.message=m.race_paused?'⏸️ Corrida pausada':'▶️ Retomando...';
  draw();
}

function finishRace(){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const race=m.race_state;
  
  // Atribuir pontos
  const points=[25,18,15,12,10,8,6,4,2,1];
  const standings=race.pilots.map((p,i)=>({...p,idx:i})).sort((a,b)=>a.pos-b.pos);
  
  standings.forEach((standing,i)=>{
    if(i<points.length){
      standing.pts=points[i];
      race.pilots[standing.idx].pts=points[i];
    }
  });
  
  // Log de resultados
  m.log.push(`=== CORRIDA ETAPA ${m.current_race+1} ===`);
  standings.forEach((s,i)=>{
    m.log.push(`${i+1}º - ${s.name} (+${s.pts} pts)`);
  });
  
  // Atualizar moral baseado em resultado
  m.staff.filter(s=>s.role=='Piloto').forEach((p,i)=>{
    const standing=standings.find(s=>s.name==p.name);
    if(standing){
      if(standing.idx<3) p.moral=Math.min(100,p.moral+15);
      else if(standing.idx>5) p.moral=Math.max(0,p.moral-10);
      else p.moral=Math.min(100,p.moral+5);
    }
  });
  
  // Ir para tela de resultados
  m.current_race++;
  if(m.current_race>=14){ // Fim da temporada
    V='gestor_season_end';
  }else{
    V='gestor_race_results';
  }
  
  m_save();
  draw();
}

function vManagerRaceResults(){
  const m=m_get();
  if(!m || !m.race_state) return;
  
  const standings=m.race_state.pilots.map((p,i)=>({...p,idx:i})).sort((a,b)=>a.pos-b.pos);
  
  let html=`<div class="card">
    <h2 style="font-size:2rem">Resultados - Etapa ${m.current_race}</h2>
    <table style="width:100%;text-align:left">
      <tr style="border-bottom:2px solid var(--l)">
        <th>Pos</th><th>Piloto</th><th>Tempo</th><th>Pts</th>
      </tr>`;
  
  standings.forEach((s,i)=>{
    html+=`<tr>
      <td>${i+1}º</td>
      <td><b>${s.name}</b></td>
      <td>${(s.gap).toFixed(2)}s</td>
      <td style="color:var(--g);font-weight:bold">${s.pts}</td>
    </tr>`;
  });
  
  html+=`</table></div>`;
  
  html+=`<div class="card">
    <h3>Estatísticas</h3>
    <p class="sm">Melhor volta: ${standings[0].name}</p>
    <p class="sm">Mais consistente: Análise...</p>
  </div>`;
  
  html+=`<div class="card"><button class="b w" onclick="V='gestor_home';draw()">Voltar à central</button></div>`;
  
  $('v').innerHTML=html;
}

function exitRace(){
  const m=m_get();
  if(m && m.race_state){
    // Contar como abandono
    m.log.push(`Corrida abandonada na volta ${m.race_state.lap}.`);
    m.race_state=null;
  }
  V='gestor_home';
  draw();
}

// === FUNÇÕES AUXILIARES ===
function getTracks(){
  return ['Aurora 1','Sakura','Sombrio','Rocha','Ventosa','Ferro','Chamas','Neon','Prateado','Gélido','Solar','Rodovia 66','Polar','Final'];
}

function briefPilot(idx){
  const m=m_get();
  if(!m) return;
  const pilotos=m.staff.filter(s=>s.role=='Piloto');
  const p=pilotos[idx];
  
  dlg(`Briefing com ${p.name}\n\nHabilidade: ${Math.round(p.skill)}\nMoral: ${p.moral}%\nForça prevista: ${Math.round(p.skill*0.8)}\n\nEstrategia sugerida: Modo ${p.moral>75?'Ataque':'Normal'}`);
}

function setRaceStrat(idx,strat){
  const m=m_get();
  if(!m) m.race_setups=[];
  m.race_setups[idx]={strat:+strat};
}

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Desk, { SPOTS } from './src/components/Desk.jsx';
import PersonPanel from './src/components/PersonPanel.jsx';
import TopBar from './src/components/TopBar.jsx';
import { useDesk } from './src/desk.jsx';
import { makeShift } from './src/data/shift.js';
import { newCase } from './src/flow.js';

const shift = makeShift('alignment-long-names');
const person = shift.people[0];
function Preview() {
  const [c,setC] = useState({...newCase(),loaded:true,step:'caderno'});
  const [signatures,setSignatures] = useState({});
  const desk = useDesk(SPOTS);
  const noop = ()=>{};
  const on = {key:noop,read:noop,list:noop,action:noop,row:row=>setC(s=>({...s,marked:row.seq,step:'assinatura'})),sign:()=>setSignatures(s=>({...s,[c.marked]:{name:'Maria da Silva',hand:0}}))};
  return <main className="app"><TopBar time="08:03" crowd={5} people={shift.people} waiting={[1,2]} served={0} errors={0} total={12} marks={[]} onCall={noop} onSkip={noop}/><div className="board"><PersonPanel person={person} running c={c} onAsk={noop}/><Desk person={person} running c={c} signatures={signatures} ledger={shift.ledger} blocked={shift.blocked} time="08:03" desk={desk} on={on}/></div></main>;
}
const root=createRoot(document.getElementById('root'));
flushSync(()=>root.render(<Preview/>));
const checks=[];
function check(ok,message){checks.push(`${ok?'PASS':'FAIL'}: ${message}`);if(!ok)throw Error(message);}
const click=selector=>flushSync(()=>document.querySelector(selector).click());
try {
  const seen=[];
  do {
    const rows=[...document.querySelectorAll('.book tbody tr')];
    check(rows.length<=6,'Até seis nomes por folha');
    seen.push(...rows.map(row=>Number(row.cells[0].textContent)));
    if(document.querySelector('[aria-label="Próxima folha"]').disabled)break;
    click('[aria-label="Próxima folha"]');
  } while(true);
  check(JSON.stringify(seen)===JSON.stringify(shift.ledger.map(row=>Number(row.seq))),'Todos os nomes disponíveis, em ordem, sem duplicação');
  while(!document.querySelector('[aria-label="Folha anterior"]').disabled)click('[aria-label="Folha anterior"]');
  click('[aria-label="Próxima folha"]');
  click('.book tbody .linha');
  click('.assinar');
  check(document.querySelector('.firma')?.textContent==='Maria da Silva','Assinatura na segunda folha');
  click('[aria-label="Folha anterior"]');
  click('[aria-label="Próxima folha"]');
  check(document.querySelector('.firma')?.textContent==='Maria da Silva','Assinatura preservada ao voltar à folha');
  click('[aria-label="Folha anterior"]');

  const reader=document.querySelector('.p-leitor');
  const origin=reader.getBoundingClientRect();
  reader.setPointerCapture=()=>{};reader.releasePointerCapture=()=>{};
  const evt=(type,x,y)=>new PointerEvent(type,{bubbles:true,pointerId:1,pointerType:'mouse',button:0,clientX:x,clientY:y});
  flushSync(()=>reader.querySelector('.leitor-marca').dispatchEvent(evt('pointerdown',origin.x+20,origin.y+10)));
  flushSync(()=>reader.dispatchEvent(evt('pointermove',origin.x+40,origin.y-20)));
  flushSync(()=>reader.dispatchEvent(evt('pointerup',origin.x+40,origin.y-20)));
  check(reader.style.bottom===''&&reader.style.top.endsWith('px'),'Arrasto troca a âncora inferior por coordenadas em pixels');
  check(Math.abs(reader.getBoundingClientRect().y-(origin.y-30))<2,'Objeto acompanha o deslocamento do ponteiro');

  flushSync(()=>root.render(<Preview key="initial-layout"/>));
  const surface=document.querySelector('.mesa-superficie').getBoundingClientRect();
  const pieces=[...document.querySelectorAll('.piece')].map(el=>({name:el.getAttribute('aria-label'),rect:el.getBoundingClientRect()}));
  for(const {name,rect} of pieces)check(rect.left>=surface.left-1&&rect.right<=surface.right+1&&rect.top>=surface.top-1&&rect.bottom<=surface.bottom+1,`${name} dentro do tampo`);
  for(let i=0;i<pieces.length;i++)for(let j=i+1;j<pieces.length;j++){
    const a=pieces[i].rect,b=pieces[j].rect;
    check(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1,`${pieces[i].name} / ${pieces[j].name}: sem sobreposição inicial`);
  }
  document.documentElement.dataset.checks='passed';
} catch(error) { document.documentElement.dataset.checks='failed';checks.push(error.message); }
const report=document.createElement('pre');report.id='verification';report.hidden=true;report.textContent=checks.join('\n');document.body.append(report);

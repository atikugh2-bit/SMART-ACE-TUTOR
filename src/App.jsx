import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the SMART-ACE AI Tutor by Dr Adam Atiku. Expert MSRA SJT coach.

STRICT FORMATTING RULES - NEVER BREAK THESE:
- Never use markdown tables or pipe characters ever
- Never use | in your responses
- Use plain text only
- Use plain dashes --- as dividers if needed
- Always show ALL answer options completely, never cut them off

SMART-ACE FRAMEWORK:
S - Safety First: Patient safety overrides EVERYTHING
M - Maintain Professionalism: GMC standards always
A - Actively Involve Others: Right person, right time
R - Reflect and Learn: Insight and improvement
T - Take Ownership: Responsibility within competence
ACE: Actionable, Collaborative, Ethical
5T: Timing, Tone, Target, Threshold, Trust

SCENARIO TYPES:
1. Clinical Safety: S then T then A then M then R
2. Communication and Consent: M then A then S then T then R
3. Team Dynamics: M then A then T then S then R
4. Ethical Dilemmas: M then S then T then A then R
5. Personal Development: R then T then A then M then S

NHS ESCALATION:
Tier 1: Handle yourself or speak to colleague directly
Tier 2: Registrar - DEFAULT for most concerns
Tier 3: Consultant - when registrar unavailable or is the problem
Tier 4: Educational Supervisor - your own performance or health
Tier 5: MDO, pharmacist, safeguarding, occupational health
Tier 6: Datix, hospital management - LEARNING TOOL not safety action
Tier 7: GMC, police - LAST RESORT only

KEY RULES:
- Concealment of error = always bottom rank
- Public confrontation = always downgraded
- Datix = never rank 1, it is a learning tool
- Family as interpreter = never appropriate
- Tone can downrank a correct action
- Timing can downrank a correct action
- Patient safety ALWAYS overrides everything

TEACHING MODE - use this plain text structure:
SCENARIO INTELLIGENCE: type, dominant priority, key risk, format
SMART-ACE ANALYSIS: score each option with SMART scores, ACE check, 5T check, total out of 24, rank
FINAL ANSWER: correct ranking or selection with clear logic chain
TRAP ANALYSIS: what examiner tests, common wrong answer, why it fails
CLINICAL LESSON: transferable principle, GMC reference
EXAM TECHNIQUE: 30 second protocol, scoring insight

PRACTICE MODE: Show ALL options completely. Never cut off any options. Mark each option correct or wrong after student answers. Reveal the main trap. Give key rule.`;

const SCENARIOS = [
  {id:1,type:"Clinical Safety",difficulty:"Medium",title:"Prescribing Error — Penicillin Allergy",
   stem:"You are reviewing the drug chart of Tim, a young male patient with a previous anaphylactic reaction to penicillin. Your registrar has prescribed Tazocin which you know contains a penicillin antibiotic. The patient has not yet received his first dose.",
   format:"ranking",answer:"A, E, D, C, B",
   options:["A. Strike out the prescription and let the nurse know it should not be administered","B. Complete a clinical incident form","C. Speak with the registrar to alert him to this error","D. Ensure the allergy is recorded clearly on the drug chart and in the patient notes","E. Amend the prescription but do not cause a fuss as no harm was done"]},
  {id:2,type:"Ethical Dilemma",difficulty:"Hard",title:"Whistleblowing — Conflicted Supervisors",
   stem:"You are concerned that patients on your ward are rarely seen by a senior doctor. They are reviewed weekly by a registrar but almost never by consultants who seem to be working at a private hospital. Both your Clinical and Educational Supervisors are consultants within this department. You are deciding whom to contact for advice.",
   format:"selection",answer:"C, E, H",
   options:["A. The consultant who seems most absent and has the biggest private practice","B. Your partner","C. Your medical defence organization","D. A friend from school who is now a solicitor","E. An employer liaison officer at the GMC","F. A consultant in another department known for opposition to private practice","G. An SHO who spends weekends at the private hospital","H. A senior non-clinical colleague such as a manager"]},
  {id:3,type:"Communication & Consent",difficulty:"Medium",title:"Angry Relative — Public Disruption",
   stem:"A patient adult son bursts into your consultation room while you are with another patient. He is shouting that nobody tells them anything about his father treatment and demanding to speak to someone senior. Other patients in the waiting room can hear.",
   format:"ranking",answer:"B, A, C, D, E",
   options:["A. Stay calm and acknowledge his obvious frustration and concern","B. Ask him politely to wait outside while you finish with your current patient","C. Offer to speak with him privately in a side room once you have finished","D. Explain the NHS referral process and expected waiting times for his father","E. Direct him to make a formal complaint through the practice manager"]},
  {id:4,type:"Team Dynamics",difficulty:"Medium",title:"FY1 Colleague Shouting at Nurse",
   stem:"You observe an FY1 colleague shouting at a staff nurse in front of a patient. The nurse tells you afterwards the FY1 has had several angry outbursts since joining the ward two months ago.",
   format:"ranking",answer:"D, B, A, E, C",
   options:["A. Advise the nurse to talk to his line manager as it is not your responsibility","B. Bleep the FY1 and ask him to return and apologize to the nurse and patient","C. Apologize on behalf of the FY1 and ask the nurse not to pursue the matter","D. Inform the FY1 colleague Clinical Supervisor about the episode","E. Send an email to your FY1 colleague detailing what the nurse told you"]},
  {id:5,type:"Personal Development",difficulty:"Easy",title:"Prescribing Error — Matron Involved",
   stem:"Matron has raised an issue about a drug you prescribed incorrectly. A times overdose was spotted by a pharmacist and never administered. Matron will contact your Educational Supervisor. You feel tiredness caused the error.",
   format:"ranking",answer:"B, E, D, A, C",
   options:["A. Tell Matron the error was not your fault because the Trust made you work unsafe hours","B. Accept personal responsibility but explain the factors that contributed to the error","C. Ask Matron not to contact your Educational Supervisor as this was an isolated error","D. Use your e-portfolio to record the error and reflect on its reasons","E. Ask to meet your Educational Supervisor to discuss the error and your concerns about the rota"]},
  {id:6,type:"Clinical Safety",difficulty:"Hard",title:"Rapidly Deteriorating Patient",
   stem:"You are seeing a very unwell patient with chest pain and increasing hypotension despite fluids. He has started to become drowsy. You are FY1 and recently completed ALS.",
   format:"ranking",answer:"A, D, C, E, B",
   options:["A. Summon the resuscitation team immediately","B. Continue to manage the patient regardless of their clinical condition","C. Call the consultant on his mobile phone","D. Call the SHO on her mobile phone for advice","E. Continue managing the patient unless he continues to deteriorate"]}
];

const TC={"Clinical Safety":{bg:"#dc2626",light:"#fef2f2"},"Communication & Consent":{bg:"#2563eb",light:"#eff6ff"},"Team Dynamics":{bg:"#7c3aed",light:"#f5f3ff"},"Ethical Dilemma":{bg:"#d97706",light:"#fffbeb"},"Personal Development":{bg:"#059669",light:"#ecfdf5"}};
const DC={Easy:"#059669",Medium:"#d97706",Hard:"#dc2626"};

function Gate({onKey}){
  const[k,setK]=useState("");const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
  const go=async()=>{
    const key=k.trim();
    if(!key.startsWith("sk-")){setErr("Key must start with sk-");return;}
    setBusy(true);setErr("");
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:5,messages:[{role:"user",content:"hi"}]})});
      if(r.status===401){setErr("Invalid API key. Please check and try again.");}
      else{localStorage.setItem("sa_k",key);onKey(key);}
    }catch{setErr("Network error. Please check your connection.");}
    setBusy(false);
  };
  return(
    <div style={{minHeight:"100vh",background:"#f0f4f5",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:16}}>
      <div style={{background:"#fff",borderRadius:12,padding:36,maxWidth:440,width:"100%",boxShadow:"0 4px 24px rgba(0,0,0,.1)",border:"1px solid #d8dde0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <div style={{width:44,height:44,background:"#003087",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14,flexShrink:0}}>SA</div>
          <div><div style={{fontWeight:800,fontSize:16,color:"#003087"}}>SMART-ACE AI Tutor</div><div style={{fontSize:11,color:"#425563"}}>MSRA SJT Training by Dr Adam Atiku</div></div>
        </div>
        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:12,marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1e40af",marginBottom:3}}>Anthropic API Key Required</div>
          <div style={{fontSize:11,color:"#1e40af",lineHeight:1.7}}>Get a free key at:<br/><a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:"#005EB8",fontWeight:700}}>console.anthropic.com</a></div>
        </div>
        <label style={{fontSize:12,fontWeight:700,color:"#003087",display:"block",marginBottom:5}}>Enter your API Key</label>
        <input type="password" value={k} onChange={e=>setK(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="sk-ant-..."
          style={{width:"100%",padding:"9px 11px",border:`1px solid ${err?"#dc2626":"#d8dde0"}`,borderRadius:6,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        {err&&<div style={{fontSize:11,color:"#dc2626",marginTop:3}}>{err}</div>}
        <button onClick={go} disabled={busy||!k.trim()} style={{width:"100%",padding:11,background:busy||!k.trim()?"#aeb3b7":"#003087",color:"#fff",border:"none",borderRadius:6,fontSize:14,fontWeight:700,cursor:busy||!k.trim()?"not-allowed":"pointer",marginTop:10}}>
          {busy?"Verifying...":"Enter the Tutor"}
        </button>
        <div style={{marginTop:12,fontSize:10,color:"#6b7280",textAlign:"center",lineHeight:1.7}}>Your key is stored in your browser only. Never shared.</div>
      </div>
    </div>
  );
}

export default function App(){
  const[key,setKey]=useState(()=>{try{return localStorage.getItem("sa_k")||""}catch{return""}});
  if(!key)return<Gate onKey={setKey}/>;
  return<Tutor apiKey={key} onLogout={()=>{localStorage.removeItem("sa_k");setKey("")}}/>;
}

function Tutor({apiKey,onLogout}){
  const[tab,setTab]=useState("home");
  const[tM,setTM]=useState([]);const[pM,setPM]=useState([]);
  const[tI,setTI]=useState("");const[pI,setPI]=useState("");
  const[tB,setTB]=useState(false);const[pB,setPB]=useState(false);
  const[sel,setSel]=useState(null);const[pSt,setPSt]=useState("idle");
  const[filt,setFilt]=useState("All");
  const[prog,setProg]=useState(()=>{try{const s=localStorage.getItem("sa_p");return s?JSON.parse(s):{sessions:0,history:[]}}catch{return{sessions:0,history:[]}}});
  const tR=useRef(null);const pR=useRef(null);
  useEffect(()=>{tR.current?.scrollIntoView({behavior:"smooth"})},[tM]);
  useEffect(()=>{pR.current?.scrollIntoView({behavior:"smooth"})},[pM]);
  const sv=p=>{setProg(p);try{localStorage.setItem("sa_p",JSON.stringify(p))}catch{}};

  const api=async(messages,system)=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:system||SYSTEM_PROMPT,messages})});
    if(r.status===401){onLogout();throw new Error("Invalid API key");}
    if(!r.ok){const d=await r.json();throw new Error(d.error?.message||"Error "+r.status);}
    const d=await r.json();return d.content?.[0]?.text||"No response.";
  };

  const sendT=async(custom)=>{
    const content=custom||tI;if(!content.trim()||tB)return;
    const msg={role:"user",content:content.trim()};const msgs=[...tM,msg];
    setTM(msgs);setTI("");setTB(true);
    try{const r=await api(msgs.map(m=>({role:m.role,content:m.content})));setTM(p=>[...p,{role:"assistant",content:r}]);sv({...prog,sessions:prog.sessions+1});}
    catch(e){setTM(p=>[...p,{role:"assistant",content:"Error: "+e.message}]);}
    setTB(false);
  };

  const stP=async s=>{
    setSel(s);setPSt("question");setPM([]);setPB(true);setPI("");
    const pr=`PRACTICE MODE: Present this scenario with ALL options shown completely. Do not cut off any options. No hints.\n\nSCENARIO:\n${s.stem}\n\nALL OPTIONS:\n${s.options.join("\n")}\n\nFORMAT: ${s.format==="ranking"?"Rank ALL FIVE options 1 to 5 where 1 is most appropriate":"Choose the THREE most appropriate from ALL EIGHT options"}\n\nAsk the student to type their answer.`;
    try{const r=await api([{role:"user",content:pr}]);setPM([{role:"assistant",content:r}]);}
    catch(e){setPM([{role:"assistant",content:"Error: "+e.message}]);}
    setPB(false);
  };

  const sendP=async()=>{
    if(!pI.trim()||pB)return;
    const msg={role:"user",content:pI.trim()};const all=[...pM,msg];
    setPM(all);setPI("");setPB(true);setPSt("answered");
    const sys=SYSTEM_PROMPT+`\n\nPRACTICE FEEDBACK: Correct answer is ${sel.answer}. Mark each option correct or wrong. Reveal THE MAIN TRAP in one paragraph. Give THE KEY RULE to remember. Be encouraging. Plain text only no tables.`;
    try{const r=await api(all.map(m=>({role:m.role,content:m.content})),sys);setPM(p=>[...p,{role:"assistant",content:r}]);sv({...prog,sessions:prog.sessions+1,history:[...(prog.history||[]),{scenario:sel.title,type:sel.type,date:new Date().toLocaleDateString()}].slice(-20)});}
    catch(e){setPM(p=>[...p,{role:"assistant",content:"Error: "+e.message}]);}
    setPB(false);
  };

  const fmt=txt=>txt.split("\n").map((ln,i)=>{
    if(!ln.trim())return<div key={i}style={{height:5}}/>;
    if(ln.startsWith("---"))return<hr key={i}style={{border:"none",borderTop:"1px solid #d8dde0",margin:"6px 0"}}/>;
    const isBold=ln.startsWith("**")&&ln.endsWith("**");
    if(isBold)return<div key={i}style={{fontWeight:700,color:"#003087",marginTop:8,marginBottom:2}}>{ln.replace(/\*\*/g,"")}</div>;
    const allCaps=ln.match(/^[A-Z][A-Z\s&]{4,}$/)&&ln.length<60;
    if(allCaps)return<div key={i}style={{fontWeight:800,fontSize:13,color:"#003087",marginTop:10,marginBottom:3,borderBottom:"1px solid #e0e4e8",paddingBottom:2}}>{ln}</div>;
    const col=ln.includes("correct")||ln.includes("CORRECT")||ln.startsWith("A. ")&&ln.includes("CORRECT")?"#065f46":ln.includes("wrong")||ln.includes("WRONG")||ln.includes("incorrect")?"#991b1b":"#1a1a2e";
    return<div key={i}style={{fontSize:13,lineHeight:1.7,marginBottom:3,color:col,wordBreak:"break-word",paddingLeft:ln.match(/^[A-H]\. /)?4:0,fontWeight:ln.match(/^[A-H]\. /)?500:400}}>{ln.replace(/\*\*/g,"")}</div>;
  });

  const S={
    app:{fontFamily:"Georgia,serif",background:"#f0f4f5",minHeight:"100vh"},
    hdr:{background:"linear-gradient(135deg,#003087,#005EB8)",padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56},
    nav:{display:"flex",background:"#fff",borderBottom:"1px solid #d8dde0",padding:"0 10px",overflowX:"auto"},
    nb:a=>({padding:"9px 13px",fontSize:12,fontWeight:a?700:500,color:a?"#005EB8":"#425563",background:"none",border:"none",borderBottom:a?"3px solid #005EB8":"3px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}),
    main:{maxWidth:1060,margin:"0 auto",padding:"16px 12px",boxSizing:"border-box"},
    card:{background:"#fff",borderRadius:8,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #d8dde0"},
    chat:{background:"#fff",borderRadius:8,border:"1px solid #d8dde0",overflow:"hidden",display:"flex",flexDirection:"column",height:510},
    msgs:{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10},
    bar:{borderTop:"1px solid #d8dde0",padding:"9px 11px",display:"flex",gap:8,background:"#f7f8f9"},
    inp:{flex:1,padding:"8px 11px",border:"1px solid #aeb3b7",borderRadius:6,fontSize:13,outline:"none",fontFamily:"inherit",resize:"none",height:40,minWidth:0},
    sBtn:d=>({padding:"8px 15px",background:d?"#aeb3b7":"#005EB8",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:d?"not-allowed":"pointer",flexShrink:0}),
    uBub:{alignSelf:"flex-end",background:"#005EB8",color:"#fff",padding:"9px 13px",borderRadius:"12px 12px 2px 12px",maxWidth:"78%",fontSize:13,lineHeight:1.5,wordBreak:"break-word"},
    aBub:{alignSelf:"flex-start",background:"#f8f9fa",border:"1px solid #e0e4e8",padding:"12px 15px",borderRadius:"2px 12px 12px 12px",maxWidth:"92%",minWidth:0},
    ld:{display:"flex",gap:4,alignItems:"center",padding:"9px 13px",background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:"2px 12px 12px 12px"},
    dot:d=>({width:7,height:7,borderRadius:"50%",background:"#005EB8",animation:"bounce 1.2s infinite",animationDelay:d}),
    tb:t=>({background:TC[t]?.bg||"#425563",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:9,display:"inline-block"}),
    db:d=>({background:DC[d]||"#425563",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:9,display:"inline-block",marginLeft:3}),
    fb:a=>({padding:"4px 11px",fontSize:11,fontWeight:a?700:500,background:a?"#003087":"#fff",color:a?"#fff":"#425563",border:"1px solid #d8dde0",borderRadius:13,cursor:"pointer"}),
    sc:(t,a)=>({background:a?(TC[t]?.light||"#f0f4f5"):"#fff",borderRadius:8,border:`2px solid ${TC[t]?.bg||"#d8dde0"}`,padding:11,cursor:"pointer",marginBottom:7,transition:"all .15s"}),
    ab:bg=>({padding:"6px 11px",background:bg,color:"#fff",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer"}),
  };

  const f2=filt==="All"?SCENARIOS:SCENARIOS.filter(s=>s.type===filt);
  const types=["All",...Object.keys(TC)];
  const Spin=()=><div style={S.ld}><div style={S.dot("0s")}/><div style={S.dot(".2s")}/><div style={S.dot(".4s")}/><span style={{fontSize:11,color:"#425563",marginLeft:5}}>Analysing with SMART-ACE...</span></div>;

  return(<div style={S.app}>
    <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}button:hover{opacity:.88}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#f0f4f5}::-webkit-scrollbar-thumb{background:#aeb3b7;border-radius:3px}`}</style>
    <div style={S.hdr}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#003087"}}>SA</div>
        <div><div style={{color:"#fff",fontWeight:800,fontSize:14}}>SMART-ACE AI Tutor</div><div style={{color:"rgba(255,255,255,.7)",fontSize:10}}>MSRA SJT by Dr Adam Atiku</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{background:"#00A499",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:9}}>NHS FRAMEWORK</div>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",borderRadius:5,fontSize:10,padding:"3px 7px",cursor:"pointer"}}>Change Key</button>
      </div>
    </div>
    <div style={S.nav}>{[["home","Home"],["teaching","Teaching"],["practice","Practice"],["library","Library"],["progress","Progress"]].map(([id,lbl])=><button key={id}style={S.nb(tab===id)}onClick={()=>setTab(id)}>{lbl}</button>)}</div>
    <div style={S.main}>

    {tab==="home"&&<div>
      <div style={{marginBottom:16}}><div style={{fontSize:19,fontWeight:800,color:"#003087",marginBottom:2}}>Welcome to SMART-ACE AI Tutor</div><div style={{fontSize:12,color:"#425563"}}>Your intelligent MSRA SJT coach by Dr Adam Atiku</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[["📖","Teaching Mode","Paste any SJT question for full 6-section SMART-ACE analysis.","#005EB8","teaching"],["🏃","Practice Mode","Test yourself on real scenarios. Submit your answer first.","#007f3b","practice"],["📚","Scenario Library","Browse 6 scenarios across all 5 MSRA types.","#d97706","library"],["📊","My Progress","Track your sessions and scenario coverage.","#7c3aed","progress"]].map(([icon,title,desc,col,t])=><div key={t}onClick={()=>setTab(t)}style={{background:"#fff",borderRadius:8,padding:16,border:`2px solid ${col}`,cursor:"pointer"}}><div style={{fontSize:24,marginBottom:7}}>{icon}</div><div style={{fontSize:13,fontWeight:800,color:"#003087",marginBottom:4}}>{title}</div><div style={{fontSize:11,color:"#425563",lineHeight:1.6,marginBottom:8}}>{desc}</div><span style={{fontSize:11,fontWeight:700,color:col}}>Open</span></div>)}
      </div>
      <div style={S.card}><div style={{fontSize:12,fontWeight:800,color:"#003087",marginBottom:10}}>SMART-ACE Quick Reference</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><div style={{fontSize:10,fontWeight:700,color:"#005EB8",textTransform:"uppercase",marginBottom:7}}>SMART Framework</div>
            {[["S","Safety First","Overrides EVERYTHING"],["M","Maintain Professionalism","GMC standards"],["A","Actively Involve Others","Right person right time"],["R","Reflect and Learn","Insight and improvement"],["T","Take Ownership","Within competence"]].map(([l,t,d])=><div key={l}style={{display:"flex",gap:6,marginBottom:5}}><div style={{width:19,height:19,background:"#003087",color:"#fff",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,flexShrink:0}}>{l}</div><div><div style={{fontSize:11,fontWeight:700,color:"#003087"}}>{t}</div><div style={{fontSize:10,color:"#425563"}}>{d}</div></div></div>)}
          </div>
          <div><div style={{fontSize:10,fontWeight:700,color:"#005EB8",textTransform:"uppercase",marginBottom:7}}>Priority by Scenario Type</div>
            {[["Clinical Safety","S-T-A-M-R","#dc2626"],["Communication","M-A-S-T-R","#2563eb"],["Team Dynamics","M-A-T-S-R","#7c3aed"],["Ethical Dilemma","M-S-T-A-R","#d97706"],["Personal Dev","R-T-A-M-S","#059669"]].map(([t,o,c])=><div key={t}style={{display:"flex",justifyContent:"space-between",padding:"3px 7px",marginBottom:3,background:"#f0f4f5",borderRadius:4,borderLeft:`3px solid ${c}`}}><span style={{fontSize:10,fontWeight:600,color:"#003087"}}>{t}</span><span style={{fontSize:10,fontWeight:700,color:c}}>{o}</span></div>)}
            <div style={{marginTop:5,background:"#003087",borderRadius:4,padding:"5px 7px"}}><div style={{fontSize:10,color:"#fff",fontWeight:700}}>Safety ALWAYS overrides all priorities</div></div>
          </div>
        </div>
      </div>
    </div>}

    {tab==="teaching"&&<div>
      <div style={{marginBottom:12}}><div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>Teaching Mode</div><div style={{fontSize:11,color:"#425563"}}>Paste any SJT question for full 6-section SMART-ACE analysis</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 230px",gap:12}}>
        <div style={S.chat}>
          <div style={S.msgs}>
            {tM.length===0&&<div style={{textAlign:"center",color:"#425563",marginTop:30}}><div style={{fontSize:30,marginBottom:8}}>📖</div><div style={{fontSize:13,fontWeight:700,color:"#003087",marginBottom:5}}>Teaching Mode Active</div><div style={{fontSize:11,marginBottom:14}}>Paste a SJT question or click a quick question below</div><div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>{["How does SMART-ACE work?","NHS escalation hierarchy","What makes an option rank last?","How do Selection questions work?"].map(q=><button key={q}onClick={()=>sendT(q)}style={{padding:"4px 9px",background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:11,fontSize:11,cursor:"pointer",color:"#003087"}}>{q}</button>)}</div></div>}
            {tM.map((m,i)=><div key={i}style={m.role==="user"?S.uBub:S.aBub}>{m.role==="assistant"?fmt(m.content):m.content}</div>)}
            {tB&&<Spin/>}<div ref={tR}/>
          </div>
          <div style={S.bar}><textarea value={tI}onChange={e=>setTI(e.target.value)}onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendT()}}}placeholder="Paste your SJT question here or ask anything..."style={S.inp}/><button onClick={()=>sendT()}disabled={tB||!tI.trim()}style={S.sBtn(tB||!tI.trim())}>{tB?"...":"Analyse"}</button></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={S.card}><div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:7}}>Quick Questions</div>{["Clinical Safety priority order","When to escalate to consultant","Explain tone nuance in SJT","Explain the ACE filter","What is Duty of Candour","Ranking vs Selection strategy"].map(q=><button key={q}onClick={()=>sendT(q)}style={{display:"block",width:"100%",textAlign:"left",padding:"5px 7px",marginBottom:3,background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:4,fontSize:11,cursor:"pointer",color:"#003087"}}>{q}</button>)}</div>
          <div style={S.card}><div style={{fontSize:10,fontWeight:700,color:"#003087",marginBottom:4}}>Tips</div>{["Include full scenario stem","Include all answer options A-E or A-H","Specify ranking or selection","Ask follow-up questions"].map(t=><div key={t}style={{fontSize:10,color:"#425563",marginBottom:2}}>✅ {t}</div>)}</div>
        </div>
      </div>
    </div>}

    {tab==="practice"&&<div>
      <div style={{marginBottom:12}}><div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>Practice Mode</div><div style={{fontSize:11,color:"#425563"}}>Select scenario — Submit answer — Get instant SMART-ACE feedback</div></div>
      <div style={{display:"grid",gridTemplateColumns:"230px 1fr",gap:12}}>
        <div style={{overflowY:"auto",maxHeight:510}}><div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:7}}>Select Scenario</div>
          {SCENARIOS.map(s=><div key={s.id}onClick={()=>stP(s)}style={S.sc(s.type,sel?.id===s.id)}><div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}><span style={S.tb(s.type)}>{s.type}</span><span style={S.db(s.difficulty)}>{s.difficulty}</span></div><div style={{fontSize:11,fontWeight:700,color:"#003087",lineHeight:1.4}}>{s.title}</div><div style={{fontSize:10,color:"#425563",marginTop:2}}>{s.format==="ranking"?"Ranking 1-5":"Selection choose 3"}</div></div>)}
        </div>
        <div style={S.chat}>
          <div style={S.msgs}>
            {pM.length===0&&<div style={{textAlign:"center",color:"#425563",marginTop:50}}><div style={{fontSize:30,marginBottom:8}}>🏃</div><div style={{fontSize:13,fontWeight:700,color:"#003087",marginBottom:5}}>Select a Scenario</div><div style={{fontSize:11}}>Choose from the list on the left</div></div>}
            {pM.map((m,i)=><div key={i}style={m.role==="user"?S.uBub:S.aBub}>{m.role==="assistant"?fmt(m.content):m.content}</div>)}
            {pB&&<Spin/>}<div ref={pR}/>
          </div>
          <div style={S.bar}><textarea value={pI}onChange={e=>setPI(e.target.value)}onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendP()}}}disabled={pM.length===0||pB}placeholder={pM.length===0?"Select a scenario first...":pSt==="answered"?"Ask follow-up or select new scenario...":"Type your answer e.g. A, B, C, D, E or C, E, H..."}style={{...S.inp,background:pM.length===0?"#f0f4f5":"#fff"}}/><button onClick={sendP}disabled={pB||!pI.trim()||pM.length===0}style={S.sBtn(pB||!pI.trim()||pM.length===0)}>{pB?"...":"Submit"}</button></div>
        </div>
      </div>
    </div>}

    {tab==="library"&&<div>
      <div style={{marginBottom:12}}><div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>Scenario Library</div><div style={{fontSize:11,color:"#425563"}}>Browse all scenarios — click to analyse or practise</div></div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>{types.map(t=><button key={t}style={S.fb(filt===t)}onClick={()=>setFilt(t)}>{t}</button>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11}}>
        {f2.map(s=><div key={s.id}style={{background:"#fff",borderRadius:8,border:`2px solid ${TC[s.type]?.bg||"#d8dde0"}`,padding:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:3}}><div><span style={S.tb(s.type)}>{s.type}</span><span style={S.db(s.difficulty)}>{s.difficulty}</span></div><span style={{fontSize:9,color:"#425563",background:"#f0f4f5",padding:"2px 6px",borderRadius:7}}>{s.format==="ranking"?"Rank 1-5":"Choose 3"}</span></div><div style={{fontSize:12,fontWeight:800,color:"#003087",marginBottom:4}}>{s.title}</div><div style={{fontSize:11,color:"#425563",lineHeight:1.6,marginBottom:9}}>{s.stem.slice(0,140)}...</div><div style={{display:"flex",gap:6}}><button onClick={()=>{setTI("Analyse this SJT question with full SMART-ACE framework:\n\n"+s.stem+"\n\nOPTIONS:\n"+s.options.join("\n")+"\n\nFORMAT: "+(s.format==="ranking"?"Rank 1 to 5 where 1 is most appropriate":"Choose the 3 most appropriate"));setTab("teaching")}}style={S.ab("#005EB8")}>Teach Me</button><button onClick={()=>{setTab("practice");setTimeout(()=>stP(s),50)}}style={S.ab("#007f3b")}>Practise</button></div></div>)}
      </div>
    </div>}

    {tab==="progress"&&<div>
      <div style={{marginBottom:12}}><div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>My Progress</div><div style={{fontSize:11,color:"#425563"}}>Track your SMART-ACE learning journey</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:14}}>
        {[["#005EB8",prog.sessions,"Total Sessions"],["#007f3b",SCENARIOS.length,"Scenarios Available"],["#d97706",(prog.history||[]).length,"Questions Attempted"]].map(([c,n,l])=><div key={l}style={{background:"#fff",borderRadius:8,padding:14,border:`2px solid ${c}`,textAlign:"center"}}><div style={{fontSize:32,fontWeight:900,color:c,lineHeight:1}}>{n}</div><div style={{fontSize:10,color:"#425563",marginTop:2,fontWeight:600}}>{l}</div></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={S.card}><div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:10}}>Scenario Type Coverage</div>
          {Object.keys(TC).map(type=>{const count=(prog.history||[]).filter(h=>h.type===type).length;const total=SCENARIOS.filter(s=>s.type===type).length;const pct=total>0?Math.round((count/total)*100):0;return<div key={type}style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,fontWeight:700,color:"#003087"}}>{type}</span><span style={{fontSize:10,color:"#425563"}}>{count}/{total}</span></div><div style={{background:"#f0f4f5",borderRadius:3,height:6,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:TC[type].bg,borderRadius:3,transition:"width .5s"}}/></div></div>})}
        </div>
        <div style={S.card}><div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:10}}>Recent Activity</div>
          {(prog.history||[]).length===0?<div style={{textAlign:"center",color:"#425563",padding:"12px 0"}}><div style={{fontSize:20,marginBottom:4}}>📝</div><div style={{fontSize:11}}>No activity yet.</div><button onClick={()=>setTab("practice")}style={{marginTop:7,padding:"4px 10px",background:"#005EB8",color:"#fff",border:"none",borderRadius:5,fontSize:11,cursor:"pointer",fontWeight:700}}>Start</button></div>
          :[...(prog.history||[])].reverse().slice(0,8).map((h,i)=><div key={i}style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f0f4f5"}}><div style={{minWidth:0,flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#003087",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.scenario}</div><span style={S.tb(h.type)}>{h.type}</span></div><div style={{fontSize:10,color:"#425563",flexShrink:0,marginLeft:5}}>{h.date}</div></div>)}
        </div>
      </div>
      <div style={S.card}><div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:8}}>SMART Priority Rules</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
          {[["Clinical Safety","S-T-A-M-R","#dc2626"],["Communication","M-A-S-T-R","#2563eb"],["Team Dynamics","M-A-T-S-R","#7c3aed"],["Ethical Dilemma","M-S-T-A-R","#d97706"],["Personal Dev","R-T-A-M-S","#059669"]].map(([t,o,c])=><div key={t}style={{background:"#f0f4f5",borderRadius:4,padding:7,borderLeft:`3px solid ${c}`}}><div style={{fontSize:10,fontWeight:800,color:"#003087",marginBottom:2}}>{t}</div><div style={{fontSize:10,fontWeight:700,color:c}}>{o}</div></div>)}
          <div style={{background:"#003087",borderRadius:4,padding:7}}><div style={{fontSize:10,fontWeight:800,color:"#fff",marginBottom:2}}>Golden Rule</div><div style={{fontSize:10,color:"rgba(255,255,255,.85)"}}>Safety ALWAYS overrides all</div></div>
        </div>
        <button onClick={()=>sv({sessions:0,history:[]})}style={{marginTop:10,padding:"3px 9px",background:"#dc2626",color:"#fff",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>Reset Progress</button>
      </div>
    </div>}

    </div>
  </div>);}

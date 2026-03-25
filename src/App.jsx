import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the SMART-ACE AI Tutor — an elite MSRA SJT coach created by Dr Adam Atiku. Your purpose is to help doctors think like examiners, not just memorise answers.

You are an expert medical educator specialising in MSRA SJT preparation. You combine deep knowledge of UK medical professionalism, GMC Good Medical Practice, NHS escalation hierarchies, and the psychology of high-stakes exams.

THE SMART-ACE FRAMEWORK:
S — Safety First: Patient safety overrides EVERYTHING.
M — Maintain Professionalism: GMC standards, calm under pressure, no public confrontation.
A — Actively Involve Others: Right person, right time. Collaboration = strength.
R — Reflect & Learn: Insight, learning from mistakes, improvement plans.
T — Take Ownership: Responsibility within competence. Know when to escalate.

ACE Filter:
A — Actionable: Clear, practical step (not vague)
C — Collaborative: Right people involved
E — Ethical: GMC-aligned, patient dignity protected

5T Nuance Filter: Timing, Tone, Target, Threshold, Trust — each can downrank a correct action.

5 SCENARIO TYPES & SMART PRIORITY:
1. Clinical Safety: S→T→A→M→R
2. Communication & Consent: M→A→S→T→R
3. Team Dynamics & Conflict: M→A→T→S→R
4. Ethical Dilemmas: M→S→T→A→R
5. Personal & Professional Development: R→T→A→M→S

NHS ESCALATION HIERARCHY:
Tier 1: Handle yourself / speak to colleague directly
Tier 2: Registrar/SpR — DEFAULT escalation
Tier 3: Consultant (registrar unavailable or IS the problem)
Tier 4: Educational/Clinical Supervisor (your own performance/health)
Tier 5: Specialist services (MDO, pharmacist, safeguarding, OH)
Tier 6: Hospital management/Datix (learning tool — NOT first response)
Tier 7: GMC/CQC/police — LAST RESORT only

KEY RULES:
- Concealment of any error = bottom rank always
- Public confrontation = always downgraded
- Datix/incident form = learning tool, NEVER rank 1
- Family as interpreter = NEVER appropriate
- Tone can downrank a correct action
- Timing can downrank a correct action
- Patient safety ALWAYS overrides everything

MARKING: Ranking = out of 20 (partial credit). Selection (choose 3/8) = 4 marks each = 12 total.

TEACHING MODE structure:
**SCENARIO INTELLIGENCE**: Type + dominant SMART priority + key risk + format
**SMART-ACE ANALYSIS**: Score all options (SMART 0-3 each, ACE filter, 5T check, total/24)
**FINAL ANSWER**: Clean ranking/selection + logic chain
**TRAP ANALYSIS**: What examiner is testing + most common wrong answer + why
**CLINICAL LESSON**: Transferable principle + GMC reference
**EXAM TECHNIQUE**: 30-second protocol + scoring insight

PRACTICE MODE: Present scenario clearly, wait for answer, then give correct/incorrect per option, reveal the trap, give key rule. Offer full analysis if wanted.

Always treat students as intelligent medical professionals. Always explain WHY. Always name the trap.`;

const SCENARIOS = [
  { id:1, type:"Clinical Safety", difficulty:"Medium", title:"Prescribing Error — Penicillin Allergy",
    stem:"You are reviewing the drug chart of Tim, a young male patient with a previous anaphylactic reaction to penicillin. Your registrar has prescribed Tazocin which you know contains a penicillin antibiotic. The patient has not yet received his first dose.",
    format:"ranking", answer:"A, E, D, C, B",
    options:["A. Strike out the prescription and let the nurse know it should not be administered","B. Complete a clinical incident form","C. Speak with the registrar to alert him/her to this error","D. Ensure the allergy is recorded clearly on the drug chart and in the patient's notes","E. Amend the prescription but do not cause a fuss as no harm was done"] },
  { id:2, type:"Ethical Dilemma", difficulty:"Hard", title:"Whistleblowing — Conflicted Supervisors",
    stem:"You are concerned that patients on your ward are rarely seen by a senior doctor. They are reviewed weekly by a registrar but almost never by consultants, who seem to be working at a private hospital most of the time. Both your Clinical and Educational Supervisors are consultants within this department. You are deciding whom to contact for advice.",
    format:"selection", answer:"C, E, H",
    options:["A. The consultant who seems most absent (biggest private practice)","B. Your partner","C. Your medical defence organization","D. A friend from school whose judgement you trust and is now a solicitor","E. An employer liaison officer at the GMC","F. A consultant in another department known for fierce opposition to private practice","G. An SHO who spends weekends at the private hospital assisting in theatre","H. A senior non-clinical colleague (e.g. a manager)"] },
  { id:3, type:"Communication & Consent", difficulty:"Medium", title:"Angry Relative — Public Disruption",
    stem:"A patient's adult son bursts into your consultation room while you're with another patient. He is shouting: 'Nobody tells us anything about Dad's treatment! This is ridiculous! I demand to speak to someone senior right now!' Other patients in the waiting room can hear the commotion.",
    format:"ranking", answer:"B, A, C, D, E",
    options:["A. Stay calm and acknowledge his obvious frustration and concern","B. Ask him politely to wait outside while you finish with your current patient","C. Immediately offer to speak with him privately in a side room once you've finished","D. Explain the NHS referral process and expected waiting times for his father's case","E. Direct him to make a formal complaint through the practice manager"] },
  { id:4, type:"Team Dynamics", difficulty:"Medium", title:"FY1 Colleague Shouting at Nurse",
    stem:"You observe an FY1 colleague shouting at a staff nurse in front of a patient. Afterwards, the nurse approaches you to discuss the FY1 doctor's behaviour. He explains that the FY1 has had several 'angry outbursts' since joining the ward two months ago.",
    format:"ranking", answer:"D, B, A, E, C",
    options:["A. Advise the nurse to talk to his line manager as it is not your responsibility","B. Bleep the FY1 and ask him to return to the ward and apologize to the nurse and patient","C. Apologize on behalf of the FY1, and ask the nurse not to pursue the matter","D. Inform the FY1 colleague's Clinical Supervisor about the episode","E. Send an email to your FY1 colleague detailing what the staff nurse has told you"] },
  { id:5, type:"Personal Development", difficulty:"Easy", title:"Prescribing Error — Matron Involved",
    stem:"Matron has raised an issue about a drug that you prescribed incorrectly. You prescribed a times overdose which was spotted by a vigilant pharmacist and never administered. A clinical incident form has been completed and Matron is going to contact your Educational Supervisor. You feel this error was caused by being overly tired.",
    format:"ranking", answer:"B, E, D, A, C",
    options:["A. Tell Matron the error was not your fault because the Trust made you work unsafe hours","B. Accept personal responsibility but explain the factors that you believe contributed to the error","C. Ask Matron not to contact your Educational Supervisor as this was an isolated error","D. Use your e-portfolio to record the error and reflect on its reasons","E. Ask to meet your Educational Supervisor to discuss the error and your concerns about the night rota"] },
  { id:6, type:"Clinical Safety", difficulty:"Hard", title:"Rapidly Deteriorating Patient",
    stem:"You are seeing a very unwell patient on your ward. He is complaining of chest pain and is also becoming increasingly hypotensive, despite fluid resuscitation. Over the previous few minutes, he has started to become drowsy. Although you are an FY1 doctor, you recently completed an ALS course and feel confident in managing acutely unwell patients.",
    format:"ranking", answer:"A, D, C, E, B",
    options:["A. Summon the resuscitation team","B. Continue to manage the patient regardless of their clinical condition","C. Call the consultant on his mobile phone","D. Call the SHO on her mobile phone for advice","E. Continue managing the patient unless he continues to deteriorate"] },
];

const TC = { "Clinical Safety":{bg:"#dc2626",light:"#fef2f2"}, "Communication & Consent":{bg:"#2563eb",light:"#eff6ff"}, "Team Dynamics":{bg:"#7c3aed",light:"#f5f3ff"}, "Ethical Dilemma":{bg:"#d97706",light:"#fffbeb"}, "Personal Development":{bg:"#059669",light:"#ecfdf5"} };
const DC = { Easy:"#059669", Medium:"#d97706", Hard:"#dc2626" };

function Gate({ onKey }) {
  const [k,setK] = useState(""); const [err,setErr] = useState(""); const [busy,setBusy] = useState(false);
  const go = async () => {
    const key = k.trim();
    if (!key.startsWith("sk-")) { setErr("Key must start with sk-"); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:5,messages:[{role:"user",content:"hi"}]})
      });
      if (r.status===401) { setErr("Invalid API key. Please check and try again."); }
      else { localStorage.setItem("sa_k",key); onKey(key); }
    } catch { setErr("Network error. Please check your internet connection."); }
    setBusy(false);
  };
  return (
    <div style={{minHeight:"100vh",background:"#f0f4f5",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:16}}>
      <div style={{background:"#fff",borderRadius:12,padding:34,maxWidth:440,width:"100%",boxShadow:"0 4px 24px rgba(0,0,0,.1)",border:"1px solid #d8dde0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <div style={{width:44,height:44,background:"#003087",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14,flexShrink:0}}>SA</div>
          <div><div style={{fontWeight:800,fontSize:16,color:"#003087"}}>SMART-ACE AI Tutor</div><div style={{fontSize:11,color:"#425563"}}>MSRA SJT Training by Dr Adam Atiku</div></div>
        </div>
        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:12,marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1e40af",marginBottom:3}}>🔑 Anthropic API Key Required</div>
          <div style={{fontSize:11,color:"#1e40af",lineHeight:1.7}}>Powered by Claude AI. Get a free key at:<br/><a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:"#005EB8",fontWeight:700}}>console.anthropic.com →</a></div>
        </div>
        <label style={{fontSize:12,fontWeight:700,color:"#003087",display:"block",marginBottom:5}}>Enter your API Key</label>
        <input type="password" value={k} onChange={e=>setK(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="sk-ant-..."
          style={{width:"100%",padding:"9px 11px",border:`1px solid ${err?"#dc2626":"#d8dde0"}`,borderRadius:6,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}} />
        {err && <div style={{fontSize:11,color:"#dc2626",marginTop:3}}>⚠️ {err}</div>}
        <button onClick={go} disabled={busy||!k.trim()} style={{width:"100%",padding:11,background:busy||!k.trim()?"#aeb3b7":"#003087",color:"#fff",border:"none",borderRadius:6,fontSize:14,fontWeight:700,cursor:busy||!k.trim()?"not-allowed":"pointer",marginTop:10}}>
          {busy?"Verifying...":"Enter the Tutor →"}
        </button>
        <div style={{marginTop:12,fontSize:10,color:"#6b7280",textAlign:"center",lineHeight:1.7}}>🔒 Key stored in your browser only. Never shared.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [key,setKey] = useState(()=>{ try{return localStorage.getItem("sa_k")||""}catch{return""} });
  if (!key) return <Gate onKey={setKey} />;
  return <Tutor apiKey={key} onLogout={()=>{localStorage.removeItem("sa_k");setKey("")}} />;
}

function Tutor({apiKey,onLogout}) {
  const [tab,setTab] = useState("home");
  const [tMsgs,setTMsgs] = useState([]); const [pMsgs,setPMsgs] = useState([]);
  const [tIn,setTIn] = useState(""); const [pIn,setPIn] = useState("");
  const [tBusy,setTBusy] = useState(false); const [pBusy,setPBusy] = useState(false);
  const [sel,setSel] = useState(null); const [pState,setPState] = useState("idle");
  const [filt,setFilt] = useState("All");
  const [prog,setProg] = useState(()=>{ try{const s=localStorage.getItem("sa_p");return s?JSON.parse(s):{sessions:0,history:[]}}catch{return{sessions:0,history:[]}} });
  const tRef=useRef(null); const pRef=useRef(null);
  useEffect(()=>{tRef.current?.scrollIntoView({behavior:"smooth"})},[tMsgs]);
  useEffect(()=>{pRef.current?.scrollIntoView({behavior:"smooth"})},[pMsgs]);
  const saveProg = p => { setProg(p); try{localStorage.setItem("sa_p",JSON.stringify(p))}catch{} };

  const api = async (messages, sys) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,system:sys||SYSTEM_PROMPT,messages})
    });
    if (r.status===401){onLogout();throw new Error("Invalid API key")}
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const d=await r.json(); return d.content?.[0]?.text||"No response.";
  };

  const sendT = async () => {
    if (!tIn.trim()||tBusy) return;
    const m={role:"user",content:tIn.trim()};
    const msgs=[...tMsgs,m]; setTMsgs(msgs); setTIn(""); setTBusy(true);
    try { const rep=await api(msgs.map(x=>({role:x.role,content:x.content}))); setTMsgs(p=>[...p,{role:"assistant",content:rep}]); saveProg({...prog,sessions:prog.sessions+1}); }
    catch(e){ setTMsgs(p=>[...p,{role:"assistant",content:`⚠️ ${e.message} — please check your API key and try again.`}]); }
    setTBusy(false);
  };

  const startP = async (s) => {
    setSel(s); setPState("question"); setPMsgs([]); setPBusy(true); setPIn("");
    const prompt=`PRACTICE MODE: Present this SJT scenario to the student. Show the stem and all options. Do NOT give hints or analysis. Ask them to submit their answer.\n\nSCENARIO:\n${s.stem}\n\nOPTIONS:\n${s.options.join("\n")}\n\nFORMAT: ${s.format==="ranking"?"Rank ALL FIVE options (1=Most appropriate, 5=Least appropriate)":"Choose the THREE most appropriate options"}`;
    try { const rep=await api([{role:"user",content:prompt}]); setPMsgs([{role:"assistant",content:rep}]); }
    catch(e){ setPMsgs([{role:"assistant",content:`⚠️ ${e.message}`}]); }
    setPBusy(false);
  };

  const sendP = async () => {
    if (!pIn.trim()||pBusy) return;
    const m={role:"user",content:pIn.trim()};
    const all=[...pMsgs,m]; setPMsgs(all); setPIn(""); setPBusy(true); setPState("answered");
    const sys=SYSTEM_PROMPT+`\n\nPRACTICE FEEDBACK: Correct answer is: ${sel.answer}. Give: (1) mark each option correct/wrong, (2) THE MAIN TRAP in one paragraph, (3) THE KEY RULE. Be encouraging. Offer full Teaching Mode analysis.`;
    try { const rep=await api(all.map(x=>({role:x.role,content:x.content})),sys); setPMsgs(p=>[...p,{role:"assistant",content:rep}]); saveProg({...prog,sessions:prog.sessions+1,history:[...(prog.history||[]),{scenario:sel.title,type:sel.type,date:new Date().toLocaleDateString()}].slice(-20)}); }
    catch(e){ setPMsgs(p=>[...p,{role:"assistant",content:`⚠️ ${e.message}`}]); }
    setPBusy(false);
  };

  const fmt = txt => txt.split("\n").map((ln,i)=>{
    if (!ln.trim()) return <div key={i} style={{height:5}}/>;
    if (ln.startsWith("# ")) return <div key={i} style={{fontWeight:900,fontSize:17,color:"#003087",marginTop:12,marginBottom:4}}>{ln.slice(2)}</div>;
    if (ln.startsWith("## ")) return <div key={i} style={{fontWeight:800,fontSize:14,color:"#003087",marginTop:10,marginBottom:3,borderBottom:"2px solid #005EB8",paddingBottom:2}}>{ln.slice(3)}</div>;
    if (ln.startsWith("**")&&ln.endsWith("**")) return <div key={i} style={{fontWeight:700,color:"#003087",marginTop:7,marginBottom:2}}>{ln.replace(/\*\*/g,"")}</div>;
    const col=ln.startsWith("✅")?"#065f46":ln.startsWith("❌")?"#991b1b":"#1a1a2e";
    return <div key={i} style={{fontSize:13,lineHeight:1.65,marginBottom:3,color:col,wordBreak:"break-word",overflowWrap:"break-word"}}>{ln}</div>;
  });

  const S={
    app:{fontFamily:"Georgia,serif",background:"#f0f4f5",minHeight:"100vh",overflowX:"hidden"},
    hdr:{background:"linear-gradient(135deg,#003087,#005EB8)",padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexShrink:0},
    nav:{display:"flex",background:"#fff",borderBottom:"1px solid #d8dde0",padding:"0 10px",overflowX:"auto"},
    nb:a=>({padding:"9px 13px",fontSize:11.5,fontWeight:a?700:500,color:a?"#005EB8":"#425563",background:"none",border:"none",borderBottom:a?"3px solid #005EB8":"3px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}),
    main:{maxWidth:1040,margin:"0 auto",padding:"16px 12px",boxSizing:"border-box"},
    card:{background:"#fff",borderRadius:8,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #d8dde0"},
    chat:{background:"#fff",borderRadius:8,border:"1px solid #d8dde0",overflow:"hidden",display:"flex",flexDirection:"column",height:490},
    msgs:{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10},
    bar:{borderTop:"1px solid #d8dde0",padding:"8px 10px",display:"flex",gap:7,background:"#f7f8f9",flexShrink:0},
    inp:{flex:1,padding:"8px 10px",border:"1px solid #aeb3b7",borderRadius:6,fontSize:13,outline:"none",fontFamily:"inherit",resize:"none",height:40,minWidth:0,background:"#fff"},
    btn:d=>({padding:"8px 14px",background:d?"#aeb3b7":"#005EB8",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:d?"not-allowed":"pointer",flexShrink:0}),
    uBub:{alignSelf:"flex-end",background:"#005EB8",color:"#fff",padding:"8px 12px",borderRadius:"12px 12px 2px 12px",maxWidth:"78%",fontSize:13,lineHeight:1.5,wordBreak:"break-word"},
    aBub:{alignSelf:"flex-start",background:"#f0f4f5",border:"1px solid #d8dde0",padding:"11px 13px",borderRadius:"2px 12px 12px 12px",maxWidth:"92%",minWidth:0,overflow:"hidden"},
    loading:{display:"flex",gap:4,alignItems:"center",padding:"8px 12px",background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:"2px 12px 12px 12px"},
    dot:d=>({width:7,height:7,borderRadius:"50%",background:"#005EB8",animation:"bounce 1.2s infinite",animationDelay:d}),
    tb:t=>({background:TC[t]?.bg||"#425563",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:9,display:"inline-block",whiteSpace:"nowrap"}),
    db:d=>({background:DC[d]||"#425563",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:9,display:"inline-block",marginLeft:3,whiteSpace:"nowrap"}),
    fb:a=>({padding:"4px 10px",fontSize:11,fontWeight:a?700:500,background:a?"#003087":"#fff",color:a?"#fff":"#425563",border:"1px solid #d8dde0",borderRadius:13,cursor:"pointer"}),
    sc:(t,a)=>({background:a?(TC[t]?.light||"#f0f4f5"):"#fff",borderRadius:8,border:`2px solid ${TC[t]?.bg||"#d8dde0"}`,padding:11,cursor:"pointer",marginBottom:7,transition:"all .15s"}),
    ab:bg=>({padding:"6px 11px",background:bg,color:"#fff",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer"}),
  };

  const filt2 = filt==="All"?SCENARIOS:SCENARIOS.filter(s=>s.type===filt);
  const types=["All",...Object.keys(TC)];
  const Spin=()=><div style={S.loading}><div style={S.dot("0s")}/><div style={S.dot(".2s")}/><div style={S.dot(".4s")}/><span style={{fontSize:11,color:"#425563",marginLeft:5}}>Analysing...</span></div>;

  return (
    <div style={S.app}>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}} button:hover{opacity:.88} .sc:hover{transform:translateY(-2px)} .hc:hover{transform:translateY(-2px);box-shadow:0 5px 12px rgba(0,0,0,.1)!important} *{box-sizing:border-box} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#f0f4f5} ::-webkit-scrollbar-thumb{background:#aeb3b7;border-radius:3px}`}</style>

      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#003087",flexShrink:0}}>SA</div>
          <div><div style={{color:"#fff",fontWeight:800,fontSize:14}}>SMART-ACE AI Tutor</div><div style={{color:"rgba(255,255,255,.7)",fontSize:10}}>MSRA SJT · Dr Adam Atiku</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{background:"#00A499",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:9,whiteSpace:"nowrap"}}>NHS FRAMEWORK</div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",borderRadius:5,fontSize:10,padding:"3px 7px",cursor:"pointer"}}>Change Key</button>
        </div>
      </div>

      <div style={S.nav}>
        {[["home","🏠 Home"],["teaching","📖 Teaching"],["practice","🏃 Practice"],["library","📚 Library"],["progress","📊 Progress"]].map(([id,lbl])=>(
          <button key={id} style={S.nb(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div style={S.main}>

        {tab==="home" && (
          <div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:19,fontWeight:800,color:"#003087",marginBottom:2}}>Welcome to SMART-ACE AI Tutor</div>
              <div style={{fontSize:12,color:"#425563"}}>Your intelligent MSRA SJT coach — built on the evidence-based SMART-ACE framework</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
              {[["📖","Teaching Mode","Paste any SJT question for full 6-section SMART-ACE analysis with examiner reasoning.","#005EB8","teaching"],
                ["🏃","Practice Mode","Test yourself on real scenarios. Submit your answer first, then get instant feedback.","#007f3b","practice"],
                ["📚","Scenario Library","Browse 6 scenarios across all 5 MSRA types. Filter, study, or practise.","#d97706","library"],
                ["📊","My Progress","Track your sessions and scenario coverage.","#7c3aed","progress"]
              ].map(([icon,title,desc,col,t])=>(
                <div key={t} className="hc" onClick={()=>setTab(t)} style={{background:"#fff",borderRadius:8,padding:16,border:`2px solid ${col}`,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{fontSize:24,marginBottom:7}}>{icon}</div>
                  <div style={{fontSize:13,fontWeight:800,color:"#003087",marginBottom:4}}>{title}</div>
                  <div style={{fontSize:11,color:"#425563",lineHeight:1.6,marginBottom:8}}>{desc}</div>
                  <span style={{fontSize:11,fontWeight:700,color:col}}>Open →</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontSize:12,fontWeight:800,color:"#003087",marginBottom:10}}>⚡ SMART-ACE Quick Reference</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#005EB8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>SMART Framework</div>
                  {[["S","Safety First","Overrides EVERYTHING"],["M","Maintain Professionalism","GMC standards"],["A","Actively Involve Others","Right person, right time"],["R","Reflect & Learn","Insight + improvement"],["T","Take Ownership","Responsibility within competence"]].map(([l,t,d])=>(
                    <div key={l} style={{display:"flex",gap:6,marginBottom:5}}>
                      <div style={{width:19,height:19,background:"#003087",color:"#fff",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,flexShrink:0}}>{l}</div>
                      <div><div style={{fontSize:11,fontWeight:700,color:"#003087"}}>{t}</div><div style={{fontSize:10,color:"#425563"}}>{d}</div></div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#005EB8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Priority by Scenario Type</div>
                  {[["Clinical Safety","S→T→A→M→R","#dc2626"],["Communication","M→A→S→T→R","#2563eb"],["Team Dynamics","M→A→T→S→R","#7c3aed"],["Ethical Dilemma","M→S→T→A→R","#d97706"],["Personal Dev.","R→T→A→M→S","#059669"]].map(([t,o,c])=>(
                    <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 7px",marginBottom:3,background:"#f0f4f5",borderRadius:4,borderLeft:`3px solid ${c}`}}>
                      <span style={{fontSize:10,fontWeight:600,color:"#003087"}}>{t}</span>
                      <span style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"1px"}}>{o}</span>
                    </div>
                  ))}
                  <div style={{marginTop:5,background:"#003087",borderRadius:4,padding:"5px 7px"}}>
                    <div style={{fontSize:10,color:"#fff",fontWeight:700}}>🔑 Safety ALWAYS overrides all priorities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="teaching" && (
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>📖 Teaching Mode</div>
              <div style={{fontSize:11,color:"#425563"}}>Paste any SJT question for full 6-section SMART-ACE analysis</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 230px",gap:12}}>
              <div style={S.chat}>
                <div style={S.msgs}>
                  {tMsgs.length===0 && (
                    <div style={{textAlign:"center",color:"#425563",marginTop:28}}>
                      <div style={{fontSize:30,marginBottom:7}}>📖</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#003087",marginBottom:4}}>Teaching Mode Active</div>
                      <div style={{fontSize:11,marginBottom:12}}>Paste a SJT question or ask anything about MSRA SJT</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>
                        {["How does SMART-ACE work?","NHS escalation hierarchy","What makes an option rank last?","How do Selection questions work?"].map(q=>(
                          <button key={q} onClick={()=>setTIn(q)} style={{padding:"4px 8px",background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:11,fontSize:11,cursor:"pointer",color:"#003087"}}>{q}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {tMsgs.map((m,i)=>(
                    <div key={i} style={m.role==="user"?S.uBub:S.aBub}>{m.role==="assistant"?fmt(m.content):m.content}</div>
                  ))}
                  {tBusy && <Spin/>}
                  <div ref={tRef}/>
                </div>
                <div style={S.bar}>
                  <textarea value={tIn} onChange={e=>setTIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendT()}}} placeholder="Paste your SJT question here, or ask anything..." style={S.inp}/>
                  <button onClick={sendT} disabled={tBusy||!tIn.trim()} style={S.btn(tBusy||!tIn.trim())}>{tBusy?"...":"Analyse →"}</button>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <div style={S.card}>
                  <div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:7}}>Quick Questions</div>
                  {["Clinical Safety priority order","When to escalate to consultant?","Explain tone nuance","Explain the ACE filter","What is Duty of Candour?","Ranking vs Selection strategy"].map(q=>(
                    <button key={q} onClick={()=>setTIn(q)} style={{display:"block",width:"100%",textAlign:"left",padding:"5px 7px",marginBottom:3,background:"#f0f4f5",border:"1px solid #d8dde0",borderRadius:4,fontSize:11,cursor:"pointer",color:"#003087"}}>{q}</button>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{fontSize:10,fontWeight:700,color:"#003087",marginBottom:4}}>💡 Tips</div>
                  {["Include full scenario stem","Include all answer options","Specify ranking or selection","Ask follow-up questions"].map(t=>(
                    <div key={t} style={{fontSize:10,color:"#425563",marginBottom:2}}>✅ {t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="practice" && (
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>🏃 Practice Mode</div>
              <div style={{fontSize:11,color:"#425563"}}>Select scenario · Submit answer · Get instant SMART-ACE feedback</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:12}}>
              <div style={{overflowY:"auto",maxHeight:490}}>
                <div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:7}}>Select Scenario</div>
                {SCENARIOS.map(s=>(
                  <div key={s.id} className="sc" onClick={()=>startP(s)} style={S.sc(s.type,sel?.id===s.id)}>
                    <div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:3}}>
                      <span style={S.tb(s.type)}>{s.type}</span>
                      <span style={S.db(s.difficulty)}>{s.difficulty}</span>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:"#003087",lineHeight:1.4}}>{s.title}</div>
                    <div style={{fontSize:10,color:"#425563",marginTop:2}}>{s.format==="ranking"?"📊 Ranking":"✅ Selection"}</div>
                  </div>
                ))}
              </div>
              <div style={S.chat}>
                <div style={S.msgs}>
                  {pMsgs.length===0 && (
                    <div style={{textAlign:"center",color:"#425563",marginTop:50}}>
                      <div style={{fontSize:30,marginBottom:7}}>🏃</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#003087",marginBottom:4}}>Select a Scenario</div>
                      <div style={{fontSize:11}}>Choose from the list on the left to begin</div>
                    </div>
                  )}
                  {pMsgs.map((m,i)=>(
                    <div key={i} style={m.role==="user"?S.uBub:S.aBub}>{m.role==="assistant"?fmt(m.content):m.content}</div>
                  ))}
                  {pBusy && <Spin/>}
                  <div ref={pRef}/>
                </div>
                <div style={S.bar}>
                  <textarea value={pIn} onChange={e=>setPIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendP()}}} disabled={pMsgs.length===0||pBusy}
                    placeholder={pMsgs.length===0?"Select a scenario first...":pState==="answered"?"Ask follow-up or select new scenario...":"Type your answer e.g. 'B, A, C, D, E' or 'C, E, H'..."}
                    style={{...S.inp,background:pMsgs.length===0?"#f0f4f5":"#fff"}}/>
                  <button onClick={sendP} disabled={pBusy||!pIn.trim()||pMsgs.length===0} style={S.btn(pBusy||!pIn.trim()||pMsgs.length===0)}>{pBusy?"...":"Submit →"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="library" && (
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>📚 Scenario Library</div>
              <div style={{fontSize:11,color:"#425563"}}>Browse all scenarios — click to analyse or practise</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {types.map(t=><button key={t} style={S.fb(filt===t)} onClick={()=>setFilt(t)}>{t}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11}}>
              {filt2.map(s=>(
                <div key={s.id} style={{background:"#fff",borderRadius:8,border:`2px solid ${TC[s.type]?.bg||"#d8dde0"}`,padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:3}}>
                    <div><span style={S.tb(s.type)}>{s.type}</span><span style={S.db(s.difficulty)}>{s.difficulty}</span></div>
                    <span style={{fontSize:9,color:"#425563",background:"#f0f4f5",padding:"2px 6px",borderRadius:7}}>{s.format==="ranking"?"📊 Rank 1-5":"✅ Choose 3"}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:800,color:"#003087",marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:11,color:"#425563",lineHeight:1.6,marginBottom:9}}>{s.stem.slice(0,140)}...</div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setTIn(`Please analyse this SJT question using the full SMART-ACE framework:\n\n${s.stem}\n\nOPTIONS:\n${s.options.join("\n")}\n\nFORMAT: ${s.format==="ranking"?"Rank 1-5 (1=Most appropriate)":"Choose 3 most appropriate"}`);setTab("teaching");}} style={S.ab("#005EB8")}>📖 Teach Me</button>
                    <button onClick={()=>{setTab("practice");setTimeout(()=>startP(s),50);}} style={S.ab("#007f3b")}>🏃 Practise</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="progress" && (
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:17,fontWeight:800,color:"#003087",marginBottom:2}}>📊 My Progress</div>
              <div style={{fontSize:11,color:"#425563"}}>Track your SMART-ACE learning journey</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:14}}>
              {[["#005EB8",prog.sessions,"Total Sessions"],["#007f3b",SCENARIOS.length,"Scenarios Available"],["#d97706",(prog.history||[]).length,"Questions Attempted"]].map(([c,n,l])=>(
                <div key={l} style={{background:"#fff",borderRadius:8,padding:14,border:`2px solid ${c}`,textAlign:"center"}}>
                  <div style={{fontSize:32,fontWeight:900,color:c,lineHeight:1}}>{n}</div>
                  <div style={{fontSize:10,color:"#425563",marginTop:2,fontWeight:600}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div style={S.card}>
                <div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:10}}>Scenario Type Coverage</div>
                {Object.keys(TC).map(type=>{
                  const count=(prog.history||[]).filter(h=>h.type===type).length;
                  const total=SCENARIOS.filter(s=>s.type===type).length;
                  const pct=total>0?Math.round((count/total)*100):0;
                  return (
                    <div key={type} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:10,fontWeight:700,color:"#003087"}}>{type}</span>
                        <span style={{fontSize:10,color:"#425563"}}>{count}/{total}</span>
                      </div>
                      <div style={{background:"#f0f4f5",borderRadius:3,height:6,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:TC[type].bg,borderRadius:3,transition:"width .5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={S.card}>
                <div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:10}}>Recent Activity</div>
                {(prog.history||[]).length===0 ? (
                  <div style={{textAlign:"center",color:"#425563",padding:"12px 0"}}>
                    <div style={{fontSize:20,marginBottom:4}}>📝</div>
                    <div style={{fontSize:11}}>No activity yet.<br/>Start practising!</div>
                    <button onClick={()=>setTab("practice")} style={{marginTop:7,padding:"4px 10px",background:"#005EB8",color:"#fff",border:"none",borderRadius:5,fontSize:11,cursor:"pointer",fontWeight:700}}>Start →</button>
                  </div>
                ) : [...(prog.history||[])].reverse().slice(0,8).map((h,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f0f4f5"}}>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#003087",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.scenario}</div>
                      <span style={S.tb(h.type)}>{h.type}</span>
                    </div>
                    <div style={{fontSize:10,color:"#425563",flexShrink:0,marginLeft:5}}>{h.date}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={{fontSize:11,fontWeight:800,color:"#003087",marginBottom:8}}>SMART Priority Rules</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                {[["Clinical Safety","S→T→A→M→R","#dc2626"],["Communication","M→A→S→T→R","#2563eb"],["Team Dynamics","M→A→T→S→R","#7c3aed"],["Ethical Dilemma","M→S→T→A→R","#d97706"],["Personal Dev.","R→T→A→M→S","#059669"]].map(([t,o,c])=>(
                  <div key={t} style={{background:"#f0f4f5",borderRadius:4,padding:7,borderLeft:`3px solid ${c}`}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#003087",marginBottom:2}}>{t}</div>
                    <div style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"1px"}}>{o}</div>
                  </div>
                ))}
                <div style={{background:"#003087",borderRadius:4,padding:7}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#fff",marginBottom:2}}>Golden Rule</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.85)"}}>Safety ALWAYS overrides all</div>
                </div>
              </div>
              <button onClick={()=>saveProg({sessions:0,history:[]})} style={{marginTop:10,padding:"3px 9px",background:"#dc2626",color:"#fff",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>Reset Progress</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

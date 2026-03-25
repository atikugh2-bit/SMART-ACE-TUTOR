import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the SMART-ACE AI Tutor — an elite MSRA SJT coach created by Dr Adam Atiku. Your purpose is to help doctors think like examiners, not just memorise answers.

## YOUR IDENTITY
You are an expert medical educator specialising in MSRA SJT preparation. You combine deep knowledge of UK medical professionalism, GMC Good Medical Practice, NHS escalation hierarchies, and the psychology of high-stakes exams.

## THE SMART-ACE FRAMEWORK (YOUR CORE BRAIN)

### SMART — Primary Decision Engine:
- S — Safety First: Patient safety overrides EVERYTHING. Immediate risk = immediate action.
- M — Maintain Professionalism: GMC standards, calm under pressure, no public confrontation.
- A — Actively Involve Others: Right person, right time. Collaboration = strength.
- R — Reflect & Learn: Insight, learning from mistakes, improvement plans.
- T — Take Ownership: Responsibility within competence. Know when to escalate.

### ACE — Quality Filter:
- A — Actionable: Clear, practical step (not vague)
- C — Collaborative: Right people involved
- E — Ethical: GMC-aligned, patient dignity protected

### 5T Nuance Filter (applies to EVERY option):
- Timing: Is this appropriate NOW vs later?
- Tone: Calm, respectful, non-confrontational?
- Target: Right person, right level?
- Threshold: Over- or under-escalated?
- Trust: Builds or damages trust?

## THE 5 SCENARIO TYPES & SMART PRIORITY ORDER:
1. Clinical Safety → S → T → A → M → R
2. Communication & Consent → M → A → S → T → R
3. Team Dynamics & Conflict → M → A → T → S → R
4. Ethical Dilemmas → M → S → T → A → R
5. Personal & Professional Development → R → T → A → M → S

## NHS ESCALATION HIERARCHY:
- Tier 1: Handle yourself / speak to colleague directly (minor issues, peers)
- Tier 2: Registrar/SpR (first port of call for clinical concerns) — DEFAULT escalation
- Tier 3: Consultant (registrar unavailable, or registrar IS the problem)
- Tier 4: Educational/Clinical Supervisor (your own performance, training, health)
- Tier 5: Specialist services (MDO, pharmacist, safeguarding, occupational health)
- Tier 6: Hospital management/Datix (systemic failures, learning — NOT first response)
- Tier 7: GMC/CQC/police (LAST RESORT only — exhaust internal routes first)

## CRITICAL MICRO-RULES:
- P3: Prescribing error sequence: STOP the drug → Document → Tell prescriber → THEN Datix
- E4: Simple procedure: ask confident FY1 peer BEFORE calling registrar
- E5: Dangerous/complex task beyond competence: REFUSE + find alternative senior
- E6: Rapidly deteriorating patient: call RESUSCITATION TEAM, not phone calls
- E7: Criminal caution anywhere in world: inform GMC immediately, no delay
- E8: Bystander to bullying: supervisor beats direct mediation
- P5: Emergency anywhere: GMC requires you to offer assistance
- CP1: Forgot result after shift: call duty FY1 first, go back yourself second
- U1: Concealment of any error = bottom rank always
- U2: Public confrontation = always downgraded
- U3: Datix/incident form = learning tool, NEVER a safety action (don't rank it 1st)
- U4: Family as interpreter = NEVER appropriate
- U5: Tone can downrank a correct action
- U6: Timing can downrank a correct action

## MARKING SCHEME:
- Ranking questions: marked out of 20 per question. Partial credit awarded. Complete answer minimum 8/20.
- Selection questions (choose 3 from 8): 4 marks each = 12 marks total. Zero if more than 3 selected.

## YOUR ANSWER STRUCTURE — Follow this EXACTLY for Teaching Mode:

**🔍 SCENARIO INTELLIGENCE**
- Scenario Type + dominant SMART priority + key risk + question format

**🧠 SMART-ACE ANALYSIS**
For ranking: analyse all 5 options with SMART scores (0-3 each), ACE filter, 5T check, total/24, preliminary rank
For selection: categorise all 8 as MUST SELECT / CONSIDER / ELIMINATE with reasons

**✅ FINAL ANSWER**
Clean ranking or selection + logic chain explaining best to worst

**⚠️ TRAP ANALYSIS**
What the examiner is testing + most common wrong answer + why it fails

**📚 CLINICAL LESSON**
One transferable principle + pattern recognition + GMC reference

**⏱️ EXAM TECHNIQUE**
30-second protocol applied + scoring insight

## PRACTICE MODE:
When in practice mode, present the scenario and options clearly, wait for the student's answer, then give a concise verdict (✅ or ❌ per option), the trap, and the key rule. Don't give the full analysis unless asked.

## TONE RULES:
- Treat students as intelligent medical professionals
- Always explain WHY, never just give the answer
- Always name the trap — the examiner's logic must be visible
- Use "you" language throughout
- Be specific and actionable, never vague
- Be encouraging but honest`;

const SCENARIO_LIBRARY = [
  {
    id: 1, type: "Clinical Safety", difficulty: "Medium",
    title: "Prescribing Error — Penicillin Allergy",
    stem: "You are reviewing the drug chart of Tim, a young male patient with a previous anaphylactic reaction to penicillin. Your registrar has prescribed Tazocin which you know contains a penicillin antibiotic. The patient has not yet received his first dose.",
    format: "ranking",
    options: ["A. Strike out the prescription and let the nurse know it should not be administered","B. Complete a clinical incident form","C. Speak with the registrar to alert him/her to this error","D. Ensure the allergy is recorded clearly on the drug chart and in the patient's notes","E. Amend the prescription but do not cause a fuss as no harm was done"],
    answer: "A, E, D, C, B"
  },
  {
    id: 2, type: "Ethical Dilemma", difficulty: "Hard",
    title: "Whistleblowing — Conflicted Supervisors",
    stem: "You are concerned that patients on your ward are rarely seen by a senior doctor. They are reviewed weekly by a registrar but almost never by consultants, who seem to be working at a private hospital most of the time. Both your Clinical and Educational Supervisors are consultants within this department. You are deciding whom to contact for advice.",
    format: "selection",
    options: ["A. The consultant who seems most absent (biggest private practice)","B. Your partner","C. Your medical defence organization","D. A friend from school whose judgement you trust and is now a solicitor","E. An employer liaison officer at the GMC","F. A consultant in another department known for fierce opposition to private practice","G. An SHO who spends weekends at the private hospital assisting in theatre","H. A senior non-clinical colleague (e.g. a manager)"],
    answer: "C, E, H"
  },
  {
    id: 3, type: "Communication & Consent", difficulty: "Medium",
    title: "Angry Relative — Public Disruption",
    stem: "A patient's adult son bursts into your consultation room while you're with another patient. He is shouting: 'Nobody tells us anything about Dad's treatment! This is ridiculous! I demand to speak to someone senior right now!' Other patients in the waiting room can hear the commotion.",
    format: "ranking",
    options: ["A. Stay calm and acknowledge his obvious frustration and concern","B. Ask him politely to wait outside while you finish with your current patient","C. Immediately offer to speak with him privately in a side room once you've finished","D. Explain the NHS referral process and expected waiting times for his father's case","E. Direct him to make a formal complaint through the practice manager"],
    answer: "B, A, C, D, E"
  },
  {
    id: 4, type: "Team Dynamics", difficulty: "Medium",
    title: "Colleague Shouting at Nurse",
    stem: "You observe an FY1 colleague shouting at a staff nurse in front of a patient. Afterwards, the nurse approaches you to discuss the FY1 doctor's behaviour. He explains that the FY1 has had several 'angry outbursts' since joining the ward two months ago and he is unsure how to deal with them.",
    format: "ranking",
    options: ["A. Advise the nurse to talk to his line manager as it is not your responsibility","B. Bleep the FY1 and ask him to return to the ward and apologize to the nurse and patient","C. Apologize on behalf of the FY1, and ask the nurse not to pursue the matter","D. Inform the FY1 colleague's Clinical Supervisor about the episode","E. Send an email to your FY1 colleague detailing what the staff nurse has told you"],
    answer: "D, B, A, E, C"
  },
  {
    id: 5, type: "Personal Development", difficulty: "Easy",
    title: "Prescribing Error — Matron Involved",
    stem: "Matron has raised an issue about a drug that you prescribed incorrectly. You prescribed a times overdose which was spotted by a vigilant pharmacist and never administered. A clinical incident form has been completed and Matron is going to contact your Educational Supervisor. You feel this error was caused by being overly tired.",
    format: "ranking",
    options: ["A. Tell Matron the error was not your fault because the Trust made you work unsafe hours","B. Accept personal responsibility but explain the factors that you believe contributed to the error","C. Ask Matron not to contact your Educational Supervisor as this was an isolated error","D. Use your e-portfolio to record the error and reflect on its reasons","E. Ask to meet your Educational Supervisor to discuss the error and your concerns about the night rota"],
    answer: "B, E, D, A, C"
  },
  {
    id: 6, type: "Clinical Safety", difficulty: "Hard",
    title: "Deteriorating Patient — FY1 Alone",
    stem: "You are seeing a very unwell patient on your ward. He is complaining of chest pain and is also becoming increasingly hypotensive, despite fluid resuscitation. Over the previous few minutes, he has started to become drowsy. Although you are an FY1 doctor, you recently completed an Advanced Life Support (ALS) course and feel confident in managing acutely unwell patients.",
    format: "ranking",
    options: ["A. Summon the resuscitation team","B. Continue to manage the patient regardless of their clinical condition","C. Call the consultant on his mobile phone","D. Call the SHO on her mobile phone for advice","E. Continue managing the patient unless he continues to deteriorate"],
    answer: "A, D, C, E, B"
  }
];

const TYPE_COLORS = {
  "Clinical Safety": { bg: "#dc2626", light: "#fef2f2", text: "#991b1b" },
  "Communication & Consent": { bg: "#2563eb", light: "#eff6ff", text: "#1e40af" },
  "Team Dynamics": { bg: "#7c3aed", light: "#f5f3ff", text: "#5b21b6" },
  "Ethical Dilemma": { bg: "#d97706", light: "#fffbeb", text: "#92400e" },
  "Personal Development": { bg: "#059669", light: "#ecfdf5", text: "#065f46" },
};

const DIFFICULTY_COLORS = {
  "Easy": "#059669", "Medium": "#d97706", "Hard": "#dc2626"
};

export default function SmartAceTutor() {
  const [activeTab, setActiveTab] = useState("home");
  const [teachingMessages, setTeachingMessages] = useState([]);
  const [practiceMessages, setPracticeMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [practiceState, setPracticeState] = useState("idle"); // idle, question, answered
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("smartace_progress");
      return saved ? JSON.parse(saved) : { sessions: 0, correct: 0, byType: {}, history: [] };
    } catch { return { sessions: 0, correct: 0, byType: {}, history: [] }; }
  });
  const [filterType, setFilterType] = useState("All");
  const teachingEndRef = useRef(null);
  const practiceEndRef = useRef(null);

  useEffect(() => { teachingEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [teachingMessages]);
  useEffect(() => { practiceEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [practiceMessages]);

  const saveProgress = (p) => {
    setProgress(p);
    try { localStorage.setItem("smartace_progress", JSON.stringify(p)); } catch {}
  };

  const callAPI = async (messages, onChunk) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "I encountered an error. Please try again.";
  };

  const sendTeachingMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...teachingMessages, userMsg];
    setTeachingMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callAPI(newMessages.map(m => ({ role: m.role, content: m.content })));
      setTeachingMessages(prev => [...prev, { role: "assistant", content: reply }]);
      const newProgress = { ...progress, sessions: progress.sessions + 1 };
      saveProgress(newProgress);
    } catch (e) {
      setTeachingMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please check your network and try again." }]);
    }
    setLoading(false);
  };

  const startPracticeScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setPracticeState("question");
    const prompt = `PRACTICE MODE — Present this scenario to the student clearly. Show the scenario stem, then list ALL options (${scenario.format === "ranking" ? "rank them 1-5" : "choose 3 from 8"}). Do NOT give any hints or analysis yet. Just present the question professionally.

SCENARIO: ${scenario.stem}

OPTIONS:
${scenario.options.join("\n")}

FORMAT: ${scenario.format === "ranking" ? "Ranking (1 = Most appropriate, 5 = Least appropriate)" : "Selection (Choose the 3 most appropriate)"}

Wait for the student's answer.`;
    
    setPracticeLoading(true);
    setPracticeMessages([]);
    try {
      const reply = await callAPI([{ role: "user", content: prompt }]);
      setPracticeMessages([{ role: "assistant", content: reply }]);
    } catch {
      setPracticeMessages([{ role: "assistant", content: "⚠️ Error loading scenario. Please try again." }]);
    }
    setPracticeLoading(false);
  };

  const sendPracticeAnswer = async () => {
    if (!practiceInput.trim() || practiceLoading) return;
    const userMsg = { role: "user", content: practiceInput.trim() };
    const allMessages = [...practiceMessages, userMsg];
    setPracticeMessages(allMessages);
    setPracticeInput("");
    setPracticeLoading(true);
    setPracticeState("answered");
    
    const systemWithMode = SYSTEM_PROMPT + `\n\nThe student has just answered. The correct answer is: ${selectedScenario.answer}. Give PRACTICE MODE feedback: score each option ✅ or ❌ concisely, reveal THE TRAP in one paragraph, give the KEY RULE to remember. Be encouraging. Ask if they want the full Teaching Mode analysis.`;
    
    try {
      const apiMessages = allMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemWithMode, messages: apiMessages })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Error";
      setPracticeMessages(prev => [...prev, { role: "assistant", content: reply }]);
      
      const newProgress = {
        ...progress,
        sessions: progress.sessions + 1,
        history: [...(progress.history || []), { scenario: selectedScenario.title, type: selectedScenario.type, date: new Date().toLocaleDateString() }].slice(-20)
      };
      saveProgress(newProgress);
    } catch {
      setPracticeMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error. Please try again." }]);
    }
    setPracticeLoading(false);
  };

  const formatMessage = (content) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 12, marginBottom: 4, color: "#003087" }}>{line.replace(/\*\*/g, "")}</div>;
      if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 800, fontSize: 17, marginTop: 16, marginBottom: 6, color: "#003087", borderBottom: "2px solid #005EB8", paddingBottom: 4 }}>{line.replace("## ", "")}</div>;
      if (line.startsWith("# ")) return <div key={i} style={{ fontWeight: 900, fontSize: 20, marginTop: 16, marginBottom: 8, color: "#003087" }}>{line.replace("# ", "")}</div>;
      if (line.startsWith("→ ") || line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 16, marginBottom: 3, color: "#1a1a2e", fontSize: 14 }}>• {line.replace("→ ", "").replace("- ", "")}</div>;
      if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("⚠️") || line.startsWith("🔍") || line.startsWith("🧠") || line.startsWith("⏱️") || line.startsWith("📚") || line.startsWith("🪤") || line.startsWith("📌") || line.startsWith("🔁") || line.startsWith("🏆") || line.startsWith("⚡") || line.startsWith("🔴") || line.startsWith("📋") || line.startsWith("🔗")) {
        return <div key={i} style={{ marginBottom: 6, fontSize: 14, fontWeight: line.includes("CORRECT") || line.includes("FINAL") ? 700 : 400, color: line.startsWith("✅") ? "#065f46" : line.startsWith("❌") ? "#991b1b" : "#1a1a2e" }}>{line}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ marginBottom: 4, fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{line}</div>;
    });
  };

  const filteredScenarios = filterType === "All" ? SCENARIO_LIBRARY : SCENARIO_LIBRARY.filter(s => s.type === filterType);
  const typeList = ["All", ...Object.keys(TYPE_COLORS)];

  const styles = {
    app: { fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f0f4f5", minHeight: "100vh", color: "#1a1a2e" },
    header: { background: "linear-gradient(135deg, #003087 0%, #005EB8 100%)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, boxShadow: "0 2px 8px rgba(0,48,135,0.3)" },
    logo: { display: "flex", alignItems: "center", gap: 12 },
    logoIcon: { width: 40, height: 40, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#003087" },
    logoText: { color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" },
    logoSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 1 },
    badge: { background: "#00A499", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, letterSpacing: "0.5px" },
    nav: { display: "flex", background: "#fff", borderBottom: "1px solid #d8dde0", padding: "0 24px", gap: 0 },
    navBtn: (active) => ({ padding: "12px 20px", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#005EB8" : "#425563", borderBottom: active ? "3px solid #005EB8" : "3px solid transparent", background: "none", border: "none", borderBottom: active ? "3px solid #005EB8" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.3px" }),
    main: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
    card: { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #d8dde0" },
    sectionTitle: { fontSize: 22, fontWeight: 800, color: "#003087", marginBottom: 4 },
    sectionSub: { fontSize: 14, color: "#425563", marginBottom: 24 },
    chatContainer: { background: "#fff", borderRadius: 8, border: "1px solid #d8dde0", overflow: "hidden", height: 520 },
    chatMessages: { height: 440, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
    chatInput: { borderTop: "1px solid #d8dde0", padding: 12, display: "flex", gap: 8, background: "#f0f4f5" },
    inputField: { flex: 1, padding: "10px 14px", border: "1px solid #aeb3b7", borderRadius: 6, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" },
    sendBtn: (disabled) => ({ padding: "10px 20px", background: disabled ? "#aeb3b7" : "#005EB8", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.2s" }),
    userBubble: { alignSelf: "flex-end", background: "#005EB8", color: "#fff", padding: "10px 14px", borderRadius: "12px 12px 2px 12px", maxWidth: "80%", fontSize: 14, lineHeight: 1.5 },
    aiBubble: { alignSelf: "flex-start", background: "#f0f4f5", border: "1px solid #d8dde0", padding: "14px 16px", borderRadius: "2px 12px 12px 12px", maxWidth: "90%", fontSize: 14 },
    scenarioCard: (type) => ({ background: "#fff", borderRadius: 8, border: `2px solid ${TYPE_COLORS[type]?.bg || "#d8dde0"}`, padding: 20, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }),
    typeBadge: (type) => ({ background: TYPE_COLORS[type]?.bg || "#425563", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, display: "inline-block" }),
    diffBadge: (diff) => ({ background: DIFFICULTY_COLORS[diff] || "#425563", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, display: "inline-block", marginLeft: 6 }),
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 },
    statCard: (color) => ({ background: "#fff", borderRadius: 8, padding: 20, border: `2px solid ${color}`, textAlign: "center" }),
    statNum: (color) => ({ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }),
    statLabel: { fontSize: 12, color: "#425563", marginTop: 4, fontWeight: 600 },
    filterBtn: (active) => ({ padding: "6px 14px", fontSize: 12, fontWeight: active ? 700 : 500, background: active ? "#003087" : "#fff", color: active ? "#fff" : "#425563", border: "1px solid #d8dde0", borderRadius: 20, cursor: "pointer", transition: "all 0.2s" }),
    homeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
    homeCard: (color) => ({ background: "#fff", borderRadius: 8, padding: 24, border: `2px solid ${color}`, cursor: "pointer", transition: "all 0.2s" }),
    quickBtn: { padding: "8px 16px", background: "#005EB8", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", marginRight: 8, marginTop: 8 },
    loadingDots: { display: "flex", gap: 4, alignItems: "center", padding: "10px 14px", background: "#f0f4f5", borderRadius: "2px 12px 12px 12px", width: "fit-content" },
    dot: (delay) => ({ width: 8, height: 8, borderRadius: "50%", background: "#005EB8", animation: "bounce 1.2s infinite", animationDelay: delay }),
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
        button:hover { opacity: 0.9; }
        .scenario-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important; }
        .home-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f0f4f5; } ::-webkit-scrollbar-thumb { background: #aeb3b7; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>SA</div>
          <div>
            <div style={styles.logoText}>SMART-ACE AI Tutor</div>
            <div style={styles.logoSub}>MSRA SJT + Clinical Decision Training</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.badge}>NHS FRAMEWORK</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>by Dr Adam Atiku</div>
        </div>
      </div>

      {/* Nav */}
      <div style={styles.nav}>
        {[["home","🏠 Home"],["teaching","📖 Teaching Mode"],["practice","🏃 Practice Mode"],["library","📚 Scenario Library"],["progress","📊 My Progress"]].map(([id, label]) => (
          <button key={id} style={styles.navBtn(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* HOME */}
        {activeTab === "home" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sectionTitle}>Welcome to the SMART-ACE AI Tutor</div>
              <div style={styles.sectionSub}>Your intelligent coach for MSRA SJT mastery — powered by the evidence-based SMART-ACE framework</div>
            </div>

            <div style={styles.homeGrid}>
              <div className="home-card" style={styles.homeCard("#005EB8")} onClick={() => setActiveTab("teaching")}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#003087", marginBottom: 8 }}>Teaching Mode</div>
                <div style={{ fontSize: 13, color: "#425563", lineHeight: 1.6 }}>Paste any SJT question and receive a full 6-section SMART-ACE analysis with examiner-level reasoning, trap exposure, and clinical lessons.</div>
                <button style={{ ...styles.quickBtn, marginTop: 16 }}>Start Learning →</button>
              </div>
              <div className="home-card" style={styles.homeCard("#007f3b")} onClick={() => setActiveTab("practice")}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏃</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#003087", marginBottom: 8 }}>Practice Mode</div>
                <div style={{ fontSize: 13, color: "#425563", lineHeight: 1.6 }}>Test yourself on real SJT scenarios. Submit your answer first, then get instant feedback with the trap revealed and your score.</div>
                <button style={{ ...styles.quickBtn, background: "#007f3b", marginTop: 16 }}>Start Practising →</button>
              </div>
              <div className="home-card" style={styles.homeCard("#d97706")} onClick={() => setActiveTab("library")}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#003087", marginBottom: 8 }}>Scenario Library</div>
                <div style={{ fontSize: 13, color: "#425563", lineHeight: 1.6 }}>Browse scenarios organised by the 5 MSRA scenario types. Filter by Clinical Safety, Communication, Team Dynamics, Ethics, or Personal Development.</div>
                <button style={{ ...styles.quickBtn, background: "#d97706", marginTop: 16 }}>Browse Scenarios →</button>
              </div>
              <div className="home-card" style={styles.homeCard("#7c3aed")} onClick={() => setActiveTab("progress")}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#003087", marginBottom: 8 }}>My Progress</div>
                <div style={{ fontSize: 13, color: "#425563", lineHeight: 1.6 }}>Track your learning journey, review performance by scenario type, and identify your strongest and weakest areas.</div>
                <button style={{ ...styles.quickBtn, background: "#7c3aed", marginTop: 16 }}>View Progress →</button>
              </div>
            </div>

            {/* SMART-ACE Quick Reference */}
            <div style={styles.card}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#003087", marginBottom: 16 }}>⚡ SMART-ACE Quick Reference</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#005EB8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>SMART Framework</div>
                  {[["S","Safety First","Patient safety overrides EVERYTHING"],["M","Maintain Professionalism","GMC standards, calm under pressure"],["A","Actively Involve Others","Right person, right time"],["R","Reflect & Learn","Insight + improvement plans"],["T","Take Ownership","Responsibility within competence"]].map(([l,t,d]) => (
                    <div key={l} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, background: "#003087", color: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{l}</div>
                      <div><div style={{ fontSize: 13, fontWeight: 700, color: "#003087" }}>{t}</div><div style={{ fontSize: 11, color: "#425563" }}>{d}</div></div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#005EB8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>ACE Filter + 5T Nuance</div>
                  {[["A","Actionable","Clear practical step, not vague"],["C","Collaborative","Right people involved"],["E","Ethical","GMC-aligned, patient dignity protected"]].map(([l,t,d]) => (
                    <div key={l} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, background: "#00A499", color: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{l}</div>
                      <div><div style={{ fontSize: 13, fontWeight: 700, color: "#003087" }}>{t}</div><div style={{ fontSize: 11, color: "#425563" }}>{d}</div></div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, background: "#f0f4f5", borderRadius: 6, padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#003087", marginBottom: 6 }}>5T Nuance Check</div>
                    {["Timing","Tone","Target","Threshold","Trust"].map(t => (
                      <div key={t} style={{ fontSize: 11, color: "#425563", marginBottom: 2 }}>• {t}: can downrank a correct action</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEACHING MODE */}
        {activeTab === "teaching" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sectionTitle}>📖 Teaching Mode</div>
              <div style={styles.sectionSub}>Paste any SJT question below for full SMART-ACE analysis with 6-section breakdown</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
              <div style={styles.chatContainer}>
                <div style={styles.chatMessages}>
                  {teachingMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#425563", marginTop: 40 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#003087", marginBottom: 8 }}>Teaching Mode Active</div>
                      <div style={{ fontSize: 13, marginBottom: 20 }}>Paste a complete SJT question with all options,<br/>or ask any MSRA SJT question to get started.</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {["How does SMART-ACE work?","Explain the escalation hierarchy","What is the 5T filter?","How do I approach Selection questions?"].map(q => (
                          <button key={q} onClick={() => setInput(q)} style={{ padding: "6px 12px", background: "#f0f4f5", border: "1px solid #d8dde0", borderRadius: 16, fontSize: 12, cursor: "pointer", color: "#003087" }}>{q}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {teachingMessages.map((m, i) => (
                    <div key={i} style={m.role === "user" ? styles.userBubble : styles.aiBubble}>
                      {m.role === "assistant" ? formatMessage(m.content) : m.content}
                    </div>
                  ))}
                  {loading && (
                    <div style={styles.loadingDots}>
                      <div style={styles.dot("0s")} />
                      <div style={styles.dot("0.2s")} />
                      <div style={styles.dot("0.4s")} />
                      <div style={{ marginLeft: 6, fontSize: 12, color: "#425563" }}>Analysing with SMART-ACE...</div>
                    </div>
                  )}
                  <div ref={teachingEndRef} />
                </div>
                <div style={styles.chatInput}>
                  <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTeachingMessage(); }}} placeholder="Paste your SJT question here, or ask anything about MSRA SJT..." style={{ ...styles.inputField, resize: "none", height: 44, paddingTop: 12 }} />
                  <button onClick={sendTeachingMessage} disabled={loading || !input.trim()} style={styles.sendBtn(loading || !input.trim())}>
                    {loading ? "..." : "Analyse →"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#003087", marginBottom: 12 }}>Quick Questions</div>
                  {["Explain Clinical Safety priority order","When should I escalate to consultant?","What makes an option rank last?","How does the ACE filter work?","Explain tone nuance in SJT"].map(q => (
                    <button key={q} onClick={() => { setInput(q); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 6, background: "#f0f4f5", border: "1px solid #d8dde0", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#003087", fontWeight: 500 }}>{q}</button>
                  ))}
                </div>
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#003087", marginBottom: 8 }}>Teaching Tips</div>
                  <div style={{ fontSize: 11, color: "#425563", lineHeight: 1.7 }}>
                    ✅ Include full scenario stem<br/>
                    ✅ Include all answer options (A-E or A-H)<br/>
                    ✅ Specify ranking or selection<br/>
                    ✅ Ask follow-up questions<br/>
                    ✅ Request specific section details
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRACTICE MODE */}
        {activeTab === "practice" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sectionTitle}>🏃 Practice Mode</div>
              <div style={styles.sectionSub}>Select a scenario, submit your answer, then get instant SMART-ACE feedback</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#003087", marginBottom: 12 }}>Choose a Scenario</div>
                {SCENARIO_LIBRARY.map(s => (
                  <div key={s.id} className="scenario-card" onClick={() => startPracticeScenario(s)} style={{ ...styles.scenarioCard(s.type), marginBottom: 10, background: selectedScenario?.id === s.id ? TYPE_COLORS[s.type]?.light : "#fff" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={styles.typeBadge(s.type)}>{s.type}</span>
                      <span style={styles.diffBadge(s.difficulty)}>{s.difficulty}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#003087", lineHeight: 1.4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#425563", marginTop: 4 }}>{s.format === "ranking" ? "📊 Ranking" : "✅ Selection"}</div>
                  </div>
                ))}
              </div>

              <div style={styles.chatContainer}>
                <div style={styles.chatMessages}>
                  {practiceMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#425563", marginTop: 60 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#003087", marginBottom: 8 }}>Select a Scenario</div>
                      <div style={{ fontSize: 13 }}>Choose from the list on the left to begin practising</div>
                    </div>
                  )}
                  {practiceMessages.map((m, i) => (
                    <div key={i} style={m.role === "user" ? styles.userBubble : styles.aiBubble}>
                      {m.role === "assistant" ? formatMessage(m.content) : m.content}
                    </div>
                  ))}
                  {practiceLoading && (
                    <div style={styles.loadingDots}>
                      <div style={styles.dot("0s")} />
                      <div style={styles.dot("0.2s")} />
                      <div style={styles.dot("0.4s")} />
                      <div style={{ marginLeft: 6, fontSize: 12, color: "#425563" }}>SMART-ACE thinking...</div>
                    </div>
                  )}
                  <div ref={practiceEndRef} />
                </div>
                <div style={styles.chatInput}>
                  <textarea value={practiceInput} onChange={e => setPracticeInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPracticeAnswer(); }}} disabled={practiceMessages.length === 0 || practiceLoading} placeholder={practiceMessages.length === 0 ? "Select a scenario first..." : practiceState === "answered" ? "Ask a follow-up or select a new scenario..." : "Enter your answer (e.g. 'B, A, C, D, E' or 'C, E, H')..."} style={{ ...styles.inputField, resize: "none", height: 44, paddingTop: 12 }} />
                  <button onClick={sendPracticeAnswer} disabled={practiceLoading || !practiceInput.trim() || practiceMessages.length === 0} style={styles.sendBtn(practiceLoading || !practiceInput.trim() || practiceMessages.length === 0)}>
                    {practiceLoading ? "..." : "Submit →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY */}
        {activeTab === "library" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sectionTitle}>📚 Scenario Library</div>
              <div style={styles.sectionSub}>Browse all scenarios by type — click any scenario to analyse it in Teaching Mode</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {typeList.map(t => (
                <button key={t} style={styles.filterBtn(filterType === t)} onClick={() => setFilterType(t)}>{t}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {filteredScenarios.map(s => (
                <div key={s.id} className="scenario-card" style={{ ...styles.scenarioCard(s.type), cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={styles.typeBadge(s.type)}>{s.type}</span>
                      <span style={styles.diffBadge(s.difficulty)}>{s.difficulty}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#425563", background: "#f0f4f5", padding: "2px 8px", borderRadius: 10 }}>{s.format === "ranking" ? "📊 Rank 1-5" : "✅ Choose 3"}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#003087", marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "#425563", lineHeight: 1.6, marginBottom: 12 }}>{s.stem.slice(0, 180)}...</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setInput(`Please analyse this SJT question using the full SMART-ACE framework:\n\n${s.stem}\n\n${s.options.join("\n")}\n\nFormat: ${s.format === "ranking" ? "Rank 1-5 (1 = Most appropriate)" : "Choose 3 most appropriate"}`); setActiveTab("teaching"); }} style={{ padding: "6px 12px", background: "#005EB8", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      📖 Teach Me
                    </button>
                    <button onClick={() => { setActiveTab("practice"); startPracticeScenario(s); }} style={{ padding: "6px 12px", background: "#007f3b", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      🏃 Practise
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sectionTitle}>📊 My Progress</div>
              <div style={styles.sectionSub}>Track your SMART-ACE learning journey</div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard("#005EB8")}>
                <div style={styles.statNum("#005EB8")}>{progress.sessions}</div>
                <div style={styles.statLabel}>Total Sessions</div>
              </div>
              <div style={styles.statCard("#007f3b")}>
                <div style={styles.statNum("#007f3b")}>{SCENARIO_LIBRARY.length}</div>
                <div style={styles.statLabel}>Scenarios Available</div>
              </div>
              <div style={styles.statCard("#d97706")}>
                <div style={styles.statNum("#d97706")}>{progress.history?.length || 0}</div>
                <div style={styles.statLabel}>Questions Attempted</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={styles.card}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#003087", marginBottom: 16 }}>Scenario Type Coverage</div>
                {Object.keys(TYPE_COLORS).map(type => {
                  const count = (progress.history || []).filter(h => h.type === type).length;
                  const total = SCENARIO_LIBRARY.filter(s => s.type === type).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={type} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#003087" }}>{type}</span>
                        <span style={{ fontSize: 11, color: "#425563" }}>{count}/{total} attempted</span>
                      </div>
                      <div style={{ background: "#f0f4f5", borderRadius: 4, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: TYPE_COLORS[type]?.bg, borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.card}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#003087", marginBottom: 16 }}>Recent Activity</div>
                {(progress.history || []).length === 0 ? (
                  <div style={{ textAlign: "center", color: "#425563", padding: "20px 0" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
                    <div style={{ fontSize: 13 }}>No activity yet.<br/>Start practising to track your progress!</div>
                    <button onClick={() => setActiveTab("practice")} style={{ ...styles.quickBtn, marginTop: 12, display: "inline-block" }}>Start Practising</button>
                  </div>
                ) : (
                  <div>
                    {[...(progress.history || [])].reverse().slice(0, 8).map((h, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f4f5" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#003087" }}>{h.scenario}</div>
                          <span style={{ ...styles.typeBadge(h.type), fontSize: 9 }}>{h.type}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#425563" }}>{h.date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ ...styles.card, marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#003087", marginBottom: 16 }}>SMART-ACE Priority Rules — Quick Review</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  ["Clinical Safety", "S → T → A → M → R", "#dc2626"],
                  ["Communication", "M → A → S → T → R", "#2563eb"],
                  ["Team Dynamics", "M → A → T → S → R", "#7c3aed"],
                  ["Ethical Dilemma", "M → S → T → A → R", "#d97706"],
                  ["Personal Dev.", "R → T → A → M → S", "#059669"],
                ].map(([type, order, color]) => (
                  <div key={type} style={{ background: "#f0f4f5", borderRadius: 6, padding: 12, borderLeft: `3px solid ${color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#003087", marginBottom: 4 }}>{type}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: "1px" }}>{order}</div>
                  </div>
                ))}
                <div style={{ background: "#003087", borderRadius: 6, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Golden Rule</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>Safety ALWAYS overrides all other priorities</div>
                </div>
              </div>
              <button onClick={() => { saveProgress({ sessions: 0, correct: 0, byType: {}, history: [] }); }} style={{ marginTop: 16, padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                Reset Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

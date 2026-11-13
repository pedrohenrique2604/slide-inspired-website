import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  GraduationCap, Home, Menu, ArrowLeft, CalendarDays, ClipboardList, Search,
  Newspaper, Utensils, BookOpen, Users, LogOut, Plus, CheckCircle2, Circle,
  ChevronLeft, ChevronRight, X, LockKeyhole, ShieldCheck, Video, ImagePlus,
  Trash2, Settings2, UserPlus, Award, Bell, Sparkles, MapPin, Clock3, Filter,
  BookMarked, LayoutDashboard, Eye, EyeOff, Camera, PartyPopper, Info
} from "lucide-react";

export const Route = createFileRoute("/")({ component: HelpSchool });

type Role = "student" | "teacher" | "director";
type Staff = { name: string; role: Role };
type Task = { id: string; subject: string; deadline: string; description: string; done: boolean };
type LostItem = { id: string; name: string; description: string; location: string; image: string; resolved: boolean };
type SchoolEvent = { id: string; title: string; description: string; category: string; date: string };
type Student = { name: string; year: number; password: string };
type Grade = { student: string; subject: string; score: number; period: number; periodType: string; year: number };

const subjectsSeed = ["Português", "Matemática", "Ciências", "História", "Geografia", "Inglês", "Educação Física", "Arte"];
const eventsSeed: SchoolEvent[] = [
  { id: "e1", title: "Reunião de responsáveis", description: "Encontro para conversar sobre o desenvolvimento das turmas e os próximos projetos.", category: "Comunicados", date: "2026-11-18" },
  { id: "e2", title: "Feira de Ciências", description: "As turmas apresentarão experiências e projetos desenvolvidos em sala.", category: "Eventos", date: "2026-11-24" },
  { id: "e3", title: "Projeto leitura", description: "Semana dedicada à leitura, troca de livros e apresentações literárias.", category: "Projetos", date: "2026-11-27" },
  { id: "e4", title: "Atualização do calendário", description: "Confira as datas importantes do encerramento do ano letivo.", category: "Informativos", date: "2026-11-30" },
];
const lostSeed: LostItem[] = [
  { id: "l1", name: "Garrafa azul", description: "Garrafa reutilizável azul com tampa preta.", location: "Quadra esportiva", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800", resolved: false },
  { id: "l2", name: "Estojo escolar", description: "Estojo preto com lápis e canetas.", location: "Biblioteca", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800", resolved: false },
  { id: "l3", name: "Casaco infantil", description: "Casaco azul-marinho tamanho juvenil.", location: "Pátio principal", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800", resolved: false },
];
const menu = [
  { day: "Segunda", meals: [["Café da manhã", "Pão integral, leite e banana"], ["Almoço", "Arroz, feijão, frango assado e salada"], ["Lanche da tarde", "Iogurte e maçã"]] },
  { day: "Terça", meals: [["Café da manhã", "Vitamina de frutas e pão"], ["Almoço", "Macarrão à bolonhesa e legumes"], ["Lanche da tarde", "Bolo caseiro e suco"]] },
  { day: "Quarta", meals: [["Café da manhã", "Leite, aveia e mamão"], ["Almoço", "Arroz, lentilha, carne e cenoura"], ["Lanche da tarde", "Sanduíche natural"]] },
  { day: "Quinta", meals: [["Café da manhã", "Pão com queijo e fruta"], ["Almoço", "Purê, frango desfiado e salada"], ["Lanche da tarde", "Salada de frutas"]] },
  { day: "Sexta", meals: [["Café da manhã", "Leite, pão e banana"], ["Almoço", "Arroz, feijão, peixe e legumes"], ["Lanche da tarde", "Biscoito integral e suco"]] },
];
const demoStudents: Student[] = [];
const demoGrades: Grade[] = [];

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function saveStore(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be disabled */ }
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function labelYear(year: number) { return `${year}º Ano`; }
function strongPassword(value: string) { return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value); }

function HelpSchool() {
  const [screen, setScreen] = useState<"splash" | "classes" | "staffLogin" | "home" | "more">("splash");
  const [year, setYear] = useState<number | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [section, setSection] = useState("home");
  const [tasks, setTasks] = useState<Task[]>(() => readStore("hs_tasks", []));
  const [lost, setLost] = useState<LostItem[]>(() => readStore("hs_lost", lostSeed));
  const [events, setEvents] = useState<SchoolEvent[]>(() => readStore("hs_events", eventsSeed));
  const [students, setStudents] = useState<Student[]>(() => readStore("hs_students", demoStudents).filter(s => s.name !== "Aluno Exemplo"));
  const [grades, setGrades] = useState<Grade[]>(() => readStore("hs_grades", demoGrades).filter(g => g.student !== "Aluno Exemplo"));
  const [subjects, setSubjects] = useState<string[]>(() => readStore("hs_subjects", subjectsSeed));
  const [periodType, setPeriodType] = useState(() => readStore("hs_period_type", "Bimestre"));
  const [periodCount, setPeriodCount] = useState(() => readStore("hs_period_count", 4));
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [selectedLost, setSelectedLost] = useState<LostItem | null>(null);
  const [checkedLost, setCheckedLost] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [eventFilter, setEventFilter] = useState("Todos");
  const [menuDay, setMenuDay] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [videoTab, setVideoTab] = useState("Professores");
  const [gradeStudent, setGradeStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffPass, setStaffPass] = useState("");
  const [taskForm, setTaskForm] = useState({ subject: subjectsSeed[0], deadline: "", description: "" });
  const [lostForm, setLostForm] = useState({ name: "", description: "", location: "", image: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", category: "Comunicados", date: "" });
  const [newSubject, setNewSubject] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", year: "5", password: "" });
  const [gradeForm, setGradeForm] = useState({ student: "", subject: subjectsSeed[0], score: "8", period: "1" });
  const [studentFilter, setStudentFilter] = useState("Todos");
  const [gradeSearch, setGradeSearch] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [periodCustom, setPeriodCustom] = useState("4");
  const [mealDraft, setMealDraft] = useState("");

  useEffect(() => { saveStore("hs_tasks", tasks); }, [tasks]);
  useEffect(() => { saveStore("hs_lost", lost); }, [lost]);
  useEffect(() => { saveStore("hs_events", events); }, [events]);
  useEffect(() => { saveStore("hs_students", students); }, [students]);
  useEffect(() => { saveStore("hs_grades", grades); }, [grades]);
  useEffect(() => { saveStore("hs_subjects", subjects); }, [subjects]);
  useEffect(() => { saveStore("hs_period_type", periodType); saveStore("hs_period_count", periodCount); }, [periodType, periodCount]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(""), 3000); return () => window.clearTimeout(t); }, [toast]);

  const visibleTasks = tasks.filter(t => year === null || (t as Task & { classYear?: number }).classYear === undefined || (t as Task & { classYear?: number }).classYear === year);
  const activeLost = lost.filter(item => !item.resolved);
  const filteredEvents = events.filter(e => eventFilter === "Todos" || e.category === eventFilter);
  const visibleStudents = students.filter(s => studentFilter === "Todos" || String(s.year) === studentFilter);
  const isStaff = !!staff;

  function notify(message: string) { setToast(message); }
  function goSection(next: string) {
    if (section === "grades") { setGradeStudent(null); setStudentName(""); setStudentPass(""); }
    setSection(next);
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function chooseClass(value: number) { setYear(value); setSection("home"); setScreen("home"); }
  function loginStaff(e: FormEvent) {
    e.preventDefault();
    const normalized = staffName.trim().toLocaleLowerCase("pt-BR");
    const found = normalized === "diretora exemplo" && staffPass === "Direção@2026"
      ? { name: "Diretora Exemplo", role: "director" as Role }
      : normalized === "professor exemplo" && staffPass === "Professor@2026"
        ? { name: "Professor Exemplo", role: "teacher" as Role } : null;
    if (!found) { notify("Nome ou senha incorretos."); return; }
    setStaff(found); setScreen(found.role === "director" ? "home" : "classes"); setSection(found.role === "director" ? "staff" : "home"); setYear(null); setStaffName(""); setStaffPass(""); notify("Acesso da equipe liberado!");
  }
  function logoutStaff() { setStaff(null); setScreen("classes"); setYear(null); setSection("home"); notify("Você saiu da conta da equipe."); }
  function loginStudent(e: FormEvent) {
    e.preventDefault();
    const found = students.find(s => s.name.toLocaleLowerCase("pt-BR") === studentName.trim().toLocaleLowerCase("pt-BR") && s.password === studentPass);
    if (!found) { notify("Confira seu nome completo e sua senha."); return; }
    setGradeStudent(found); setStudentPass(""); notify("Boletim liberado com segurança.");
  }
  function addTask(e: FormEvent) {
    e.preventDefault();
    if (!taskForm.deadline || !taskForm.description.trim()) { notify("Preencha todos os campos."); return; }
    setTasks(v => [...v, { id: uid(), ...taskForm, done: false, classYear: year } as Task]);
    setTaskForm({ subject: subjects[0] || "", deadline: "", description: "" }); setModal(""); notify("Tarefa adicionada!");
  }
  function addLost(e: FormEvent) {
    e.preventDefault();
    if (!lostForm.name.trim() || !lostForm.description.trim() || !lostForm.location.trim()) { notify("Preencha nome, local e descrição."); return; }
    setLost(v => [{ id: uid(), ...lostForm, image: lostForm.image || "https://images.unsplash.com/photo-1503602642458-232111445657?w=800", resolved: false }, ...v]);
    setLostForm({ name: "", description: "", location: "", image: "" }); setModal(""); notify("Objeto registrado no mural!");
  }
  function confirmLost() {
    if (!checkedLost.length) { notify("Marque o objeto antes de confirmar."); return; }
    setLost(v => v.map(item => checkedLost.includes(item.id) ? { ...item, resolved: true } : item));
    setCheckedLost([]); setSelectedLost(null); setModal(""); notify("Dono encontrado! Item retirado do mural.");
  }
  function addEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.date) { notify("Preencha todos os campos."); return; }
    setEvents(v => [{ id: uid(), ...eventForm }, ...v]); setEventForm({ title: "", description: "", category: "Comunicados", date: "" }); setModal(""); notify("Publicação criada!");
  }
  function addStudent(e: FormEvent) {
    e.preventDefault();
    if (!newStudent.name.trim()) { notify("Informe o nome completo."); return; }
    if (!strongPassword(newStudent.password)) { notify("Senha fraca: use 8+ caracteres, maiúscula, minúscula, número e símbolo."); return; }
    if (students.some(s => s.name.toLocaleLowerCase("pt-BR") === newStudent.name.trim().toLocaleLowerCase("pt-BR"))) { notify("Já existe um aluno com esse nome."); return; }
    setStudents(v => [...v, { name: newStudent.name.trim(), year: Number(newStudent.year), password: newStudent.password }]);
    setNewStudent({ name: "", year: "5", password: "" }); notify("Aluno cadastrado!");
  }
  function addGrade(e: FormEvent) {
    e.preventDefault();
    const score = Number(gradeForm.score);
    if (!gradeForm.student || !gradeForm.subject || Number.isNaN(score) || score < 0 || score > 10) { notify("Informe uma nota entre 0 e 10."); return; }
    const student = students.find(s => s.name === gradeForm.student);
    if (!student) { notify("Aluno não encontrado."); return; }
    setGrades(v => [...v.filter(g => !(g.student === gradeForm.student && g.subject === gradeForm.subject && g.period === Number(gradeForm.period) && g.year === 2026)), { student: gradeForm.student, subject: gradeForm.subject, score, period: Number(gradeForm.period), periodType, year: 2026, classYear: student.year } as Grade]);
    notify("Nota salva com sucesso!");
  }
  function savePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Escolha um arquivo de imagem."); return; }
    const reader = new FileReader(); reader.onload = () => setLostForm(v => ({ ...v, image: String(reader.result) })); reader.readAsDataURL(file);
  }
  const goBack = () => { if (section === "grades") setGradeStudent(null); goSection("home"); };

  return (
    <div className="app-shell">
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
      {screen === "splash" && <main className="splash">
        <div className="splash-orb orb-one"/><div className="splash-orb orb-two"/><div className="splash-orb orb-three"/>
        <div className="splash-content"><div className="brand-mark"><GraduationCap size={54}/></div><p className="eyebrow">SUA ESCOLA, MAIS CONECTADA</p><h1>HELP <span>SCHOOL</span></h1><p className="splash-copy">Aprender, organizar e compartilhar.<br/>Tudo em um só lugar!</p><button className="btn btn-white btn-xl" onClick={() => setScreen("classes")}>Começar <ChevronRight size={20}/></button><span className="splash-foot">Tecnologia que facilita a vida na escola</span></div>
      </main>}

      {screen === "classes" && <main className="class-screen">
        <header className="simple-header"><div className="brand-small"><GraduationCap/> HELP SCHOOL</div><span className="tag">ÁREA ESCOLAR</span></header>
        <div className="class-intro"><span className="eyebrow blue">VAMOS COMEÇAR?</span><h1>Quem vai<br/><span>estudar hoje?</span></h1><p>Escolha sua turma para acessar as novidades da escola.</p></div>
        <div className="class-list">{[5,6,7,8,9].map((n,i)=><button className="class-option" key={n} onClick={() => chooseClass(n)}><span className="class-emoji">{["📘","📗","📙","📕","🎓"][i]}</span><span><b>{labelYear(n)}</b><small>Área do estudante</small></span><ChevronRight className="class-arrow"/></button>)}
          <button className="class-option staff-option" onClick={() => setScreen("staffLogin")}><span className="class-emoji"><ShieldCheck/></span><span><b>Professores e diretores</b><small>Acesso da equipe escolar</small></span><ChevronRight className="class-arrow"/></button></div>
        {staff && <div className="connected-card"><div><b>Conectado como {staff.name}</b><small>{staff.role === "director" ? "Direção" : "Professor(a)"}</small></div><button onClick={logoutStaff}>Sair da conta de professor/diretor</button></div>}
        <p className="muted center tiny">Help School • Ensino Fundamental</p>
      </main>}

      {screen === "staffLogin" && <main className="login-screen"><button className="back-link" onClick={() => setScreen("classes")}><ArrowLeft size={18}/> Voltar às turmas</button><div className="login-icon"><ShieldCheck size={34}/></div><span className="eyebrow blue">ACESSO RESTRITO</span><h1>Área da equipe</h1><p>Entre com seu nome completo e senha.</p><form className="stack-form" onSubmit={loginStaff}><label>Nome completo<input value={staffName} onChange={e=>setStaffName(e.target.value)} placeholder="Seu nome completo" required/></label><label>Senha<input type="password" value={staffPass} onChange={e=>setStaffPass(e.target.value)} placeholder="Sua senha" required/></label><button className="btn btn-primary btn-block">Entrar <ArrowLeft className="rotate-180" size={18}/></button></form><div className="demo-hint"><Info size={16}/> Demonstração: Diretora Exemplo / Direção@2026 ou Professor Exemplo / Professor@2026.</div></main>}

      {(screen === "home" || screen === "more") && <><header className="topbar"><div className="brand-small"><GraduationCap/> HELP SCHOOL</div><button className="avatar-btn" onClick={() => setScreen("more")}><Menu/></button></header>
        {screen === "more" ? <main className="page-content more-page"><span className="eyebrow blue">MENU</span><h1>Mais opções</h1><button className="btn btn-danger btn-block" onClick={() => { setGradeStudent(null); setScreen("classes"); setYear(null); setSection("home"); }}><Users size={18}/> Trocar de turma</button><section className="about-card"><div className="about-logo"><GraduationCap size={30}/></div><h2>Sobre o Help School</h2><p>Uma plataforma criada para deixar a rotina escolar mais organizada, aproximar a comunidade e apoiar a aprendizagem.</p><div className="about-meta"><span>Versão 1.0.0</span><span>Projeto educacional</span></div><small>Créditos pedagógicos: comunidade escolar e equipe Help School.</small></section>{staff && <section className="panel-card"><h3>Conta conectada</h3><p>{staff.name} · {staff.role === "director" ? "Direção" : "Professor(a)"}</p><button className="btn btn-outline btn-block" onClick={logoutStaff}><LogOut size={17}/> Sair da conta</button></section>}</main> : <main className="page-content">
          <section className="welcome-card"><div><span className="eyebrow white-soft">BEM-VINDO(A) DE VOLTA</span><h1>{staff?.role === "director" ? "Olá, diretora!" : staff?.role === "teacher" ? "Olá, professor(a)!" : "Olá, estudante!"}</h1><p>{staff ? (staff.role === "director" ? "Painel da direção" : "Área da equipe") : year ? labelYear(year) : "Comunidade escolar"} <span className="dot"/> Vamos aprender?</p></div><div className="welcome-art"><GraduationCap size={56}/></div></section>
          {staff && <button className="staff-shortcut" onClick={() => goSection("staff")}><ShieldCheck/><span><b>Área da Equipe</b><small>Painel pedagógico e gestão escolar</small></span><ChevronRight/></button>}
          {section === "home" && <><div className="section-heading"><div><span className="eyebrow blue">EXPLORE</span><h2>O que você precisa?</h2></div><Sparkles className="heading-spark"/></div><div className="feature-grid">
            <Feature icon={<CalendarDays/>} title="Data de Provas" desc="Provas e tarefas" tone="red" onClick={()=>goSection("planner")}/>
            <Feature icon={<Search/>} title="Achados e Perdidos" desc="Encontre seus itens" tone="blue" onClick={()=>goSection("lost")}/>
            <Feature icon={<Newspaper/>} title="Eventos Escolares" desc="Avisos e novidades" tone="orange" onClick={()=>goSection("events")}/>
            <Feature icon={<Utensils/>} title="Cardápio da Semana" desc="Veja as refeições" tone="green" onClick={()=>goSection("menu")}/>
            <Feature icon={<Award/>} title="Médias" desc="Consulte seu boletim" tone="purple" onClick={()=>goSection("grades")}/>
            <Feature icon={<Video/>} title="Vídeos Educativos" desc="Aprenda assistindo" tone="cyan" onClick={()=>goSection("videos")}/>
          </div><div className="tip-card"><div className="tip-icon"><BookOpen/></div><div><b>Um passo de cada vez!</b><p>Organize suas tarefas e acompanhe tudo o que acontece na escola.</p></div></div></>}
          {section === "planner" && <section className="module"><ModuleHeader title="Data de Provas" subtitle="Organize sua rotina de estudos" onBack={goBack}/><div className="module-banner red-banner"><CalendarDays/><div><b>Seu planner escolar</b><small>Não deixe nenhuma data passar!</small></div></div><h3 className="subhead">Próximas avaliações</h3>{[{s:"Matemática",d:"2026-11-19",c:"Frações e números decimais"},{s:"Ciências",d:"2026-11-25",c:"Sistema solar e movimentos da Terra"},{s:"Português",d:"2026-12-02",c:"Interpretação de texto"}].map((p,i)=><div className="exam-row" key={i}><div className="date-box"><b>{p.d.slice(8)}</b><small>NOV/DEZ</small></div><div><b>{p.s}</b><p>{p.c}</p><small><CalendarDays size={12}/> {new Date(p.d+"T12:00:00").toLocaleDateString("pt-BR")}</small></div></div>)}<div className="row-between"><h3 className="subhead">Minhas tarefas</h3><button className="btn btn-primary btn-small" onClick={()=>setModal("task")}><Plus size={15}/> Adicionar</button></div>{visibleTasks.length===0?<Empty text="Você ainda não tem tarefas cadastradas."/>:visibleTasks.map(t=><label className={"task-row "+(t.done?"task-done":"")} key={t.id}><input type="checkbox" checked={t.done} onChange={e=>setTasks(v=>v.map(x=>x.id===t.id?{...x,done:e.target.checked}:x))}/><span><b>{t.subject}</b><small>{t.description}</small><small>Prazo: {new Date(t.deadline+"T12:00:00").toLocaleDateString("pt-BR")}</small></span></label>)}</section>}
          {section === "lost" && <section className="module"><ModuleHeader title="Achados e Perdidos" subtitle="Vamos encontrar o dono?" onBack={goBack}/><div className="module-banner blue-banner"><Search/><div><b>Mural da escola</b><small>{activeLost.length} objetos aguardando seus donos</small></div></div><div className="lost-grid">{activeLost.map(item=><button className="lost-card" key={item.id} onClick={()=>{setSelectedLost(item);setModal("lostDetail");}}><img src={item.image} alt={item.name}/><span><b>{item.name}</b><small><MapPin size={12}/> {item.location}</small></span></button>)}</div>{activeLost.length===0&&<Empty text="Nenhum objeto pendente no momento."/>}<div className="confirm-box"><b>Reconheceu algum objeto?</b><p>Marque os itens e confirme para avisar que o dono foi encontrado.</p>{activeLost.map(item=><label className="check-line" key={item.id}><input type="checkbox" checked={checkedLost.includes(item.id)} onChange={e=>setCheckedLost(v=>e.target.checked?[...v,item.id]:v.filter(id=>id!==item.id))}/>{item.name}</label>)}<button className="btn btn-primary btn-block" onClick={confirmLost}>Confirmar dono encontrado</button></div><button className="floating-add" onClick={()=>setModal("lost")}><Plus/> Registrar objeto</button></section>}
          {section === "events" && <section className="module"><ModuleHeader title="Eventos Escolares" subtitle="Fique por dentro da escola" onBack={goBack}/><div className="filter-pills">{["Todos","Comunicados","Eventos","Projetos","Informativos"].map(c=><button className={eventFilter===c?"active":""} key={c} onClick={()=>setEventFilter(c)}>{c}</button>)}</div>{filteredEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(e=><button className="event-card" key={e.id} onClick={()=>{setSelectedEvent(e);setModal("eventDetail");}}><div className="event-date"><b>{e.date.slice(8)}</b><small>{e.date.slice(5,7)==="11"?"NOV":"DEZ"}</small></div><div><Badge category={e.category}/><h3>{e.title}</h3><p>{e.description}</p><small>{new Date(e.date+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><ChevronRight/></button>)}</section>}
          {section === "menu" && <section className="module"><ModuleHeader title="Cardápio da Semana" subtitle="Alimentação saudável todos os dias" onBack={goBack}/><div className="week-switch"><button onClick={()=>setWeekOffset(v=>v-1)}><ChevronLeft/></button><b>{weekOffset===0?"Semana atual":weekOffset>0?`Próxima semana (+${weekOffset})`:`Semana anterior (${weekOffset})`}</b><button onClick={()=>setWeekOffset(v=>v+1)}><ChevronRight/></button></div><div className="day-tabs">{menu.map((d,i)=><button key={d.day} className={menuDay===i?"selected":""} onClick={()=>setMenuDay(i)}>{d.day.slice(0,3)}</button>)}</div><div className="menu-day-title"><Utensils/><div><b>{menu[menuDay].day}-feira</b><small>Refeições planejadas para você</small></div></div>{menu[menuDay].meals.map(([name,desc],i)=><div className="meal-card" key={name}><span className="meal-emoji">{["🥛","🍽️","🍎"][i]}</span><div><b>{name}</b><p>{weekOffset===0?desc:`Sugestão de refeição equilibrada: ${desc.toLocaleLowerCase("pt-BR")}`}</p><small>Refeição variada e nutritiva</small></div></div>)}</section>}
          {section === "grades" && <section className="module"><ModuleHeader title="Minhas Médias" subtitle="Boletim individual e protegido" onBack={goBack}/>{!gradeStudent?<div className="grade-login"><div className="login-icon"><LockKeyhole/></div><h2>Acesse seu boletim</h2><p>Digite seu nome completo e sua senha. Seus dados são privados.</p><form className="stack-form" onSubmit={loginStudent}><label>Nome completo<input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Nome completo do aluno" required/></label><label>Senha<input type="password" value={studentPass} onChange={e=>setStudentPass(e.target.value)} placeholder="Sua senha" required/></label><button className="btn btn-primary btn-block">Consultar minhas médias</button></form><small className="privacy-note"><ShieldCheck size={14}/> A sessão é encerrada ao sair desta tela.</small></div>:<><div className="student-grade-head"><div className="student-avatar">{gradeStudent.name.slice(0,1).toUpperCase()}</div><div><b>{gradeStudent.name}</b><small>{labelYear(gradeStudent.year)} · Ano letivo 2026</small></div><button className="btn btn-outline btn-small" onClick={()=>{setGradeStudent(null);setStudentName("");notify("Sessão do boletim encerrada.");}}>Sair</button></div>{Array.from({length:periodCount},(_,i)=>i+1).map(period=>{const rows=grades.filter(g=>g.student===gradeStudent.name&&g.period===period&&g.year===2026);return <div className="grade-period" key={period}><h3>{period}º {periodType}</h3>{rows.length===0?<p className="muted tiny">Ainda não há notas neste período.</p>:rows.map(g=><div className="grade-row" key={g.subject}><span>{g.subject}</span><b className={g.score>=6?"score-good":"score-low"}>{g.score.toFixed(1).replace(".",",")}</b><small>{g.score>=6?"Em andamento":"Atenção"}</small></div>)}</div>})}<p className="privacy-note"><ShieldCheck size={14}/> Somente suas notas são exibidas. Ao sair desta área, a sessão será encerrada.</p></>}</section>}
          {section === "videos" && <section className="module"><ModuleHeader title="Vídeos Educativos" subtitle="Aprenda com conteúdos em vídeo" onBack={goBack}/><div className="filter-pills"><button className={videoTab==="Professores"?"active":""} onClick={()=>setVideoTab("Professores")}>Recomendados</button><button className={videoTab==="Alunos"?"active":""} onClick={()=>setVideoTab("Alunos")}>Compartilhados por alunos</button></div>{(videoTab==="Professores"?[{t:"Matemática: frações",id:"Yttr3g9d9s8"},{t:"Ciências: sistema solar",id:"libKVRa01L8"}]:[{t:"Dicas de estudo",id:"dQw4w9WgXcQ"}]).map(v=><div className="video-card" key={v.id}><div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${v.id}`} title={v.t} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div><b>{v.t}</b><small>{videoTab==="Professores"?"Indicado pela equipe pedagógica":"Compartilhado pela comunidade"}</small></div>)}<button className="btn btn-outline btn-block" onClick={()=>setModal("video")}> <Plus size={16}/> Compartilhar vídeo do YouTube</button></section>}
          {section === "staff" && staff && <section className="module"><ModuleHeader title="Painel Pedagógico" subtitle={`Olá, ${staff.name}`} onBack={goBack}/><div className="staff-tabs"><button onClick={()=>goSection("staff")}>Gestão</button><button onClick={()=>goSection("staffGrades")}>Notas</button></div><div className="staff-dashboard"><button onClick={()=>goSection("staffGrades")}><Award/><b>Gestão de médias</b><small>Lançar e consultar notas</small></button><button onClick={()=>setModal("newStudent")}><UserPlus/><b>Cadastrar aluno</b><small>Criar acesso estudantil</small></button><button onClick={()=>setModal("studentList")}><Users/><b>Ver logins de alunos</b><small>Consultar alunos por turma</small></button><button onClick={()=>setModal("event")}><Newspaper/><b>Publicar comunicado</b><small>Eventos e informativos</small></button><button onClick={()=>setModal("meal")}><Utensils/><b>Editar cardápio</b><small>Atualizar refeição do dia</small></button>{staff.role==="director"&&<button onClick={()=>setModal("periods")}><Settings2/><b>Alterar períodos letivos</b><small>Configuração exclusiva da direção</small></button>}</div></section>}
          {section === "staffGrades" && staff && <section className="module"><ModuleHeader title="Médias e Matérias" subtitle="Gerencie notas, alunos e disciplinas em um só lugar" onBack={()=>goSection("staff")}/>{staff.role==="director"&&<div className="row-between"><span className="muted tiny">{students.length} alunos cadastrados</span><button className="btn btn-outline btn-small" onClick={()=>setModal("newStudent")}><UserPlus size={15}/> Adicionar login</button></div>}<label className="search-label">Buscar aluno<input value={gradeSearch} onChange={e=>setGradeSearch(e.target.value)} placeholder="Nome completo do aluno"/></label><form className="stack-form" onSubmit={addGrade}><label>Aluno<select value={gradeForm.student} onChange={e=>setGradeForm(v=>({...v,student:e.target.value}))}>{students.filter(s=>s.name.toLowerCase().includes(gradeSearch.toLowerCase())).map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Matéria<select value={gradeForm.subject} onChange={e=>setGradeForm(v=>({...v,subject:e.target.value}))}>{subjects.map(s=><option key={s}>{s}</option>)}</select></label><div className="two-fields"><label>Nota (0 a 10)<input type="number" min="0" max="10" step=".1" value={gradeForm.score} onChange={e=>setGradeForm(v=>({...v,score:e.target.value}))}/></label><label>Período<select value={gradeForm.period} onChange={e=>setGradeForm(v=>({...v,period:e.target.value}))}>{Array.from({length:periodCount},(_,i)=><option key={i+1} value={i+1}>{i+1}º</option>)}</select></label></div><button className="btn btn-primary btn-block">Salvar nota</button></form><h3 className="subhead">Matérias ativas</h3>{subjects.map(s=><div className="subject-row" key={s}>{s}<button onClick={()=>setSubjects(v=>v.filter(x=>x!==s))}><Trash2 size={15}/></button></div>)}<button className="btn btn-outline btn-block" onClick={()=>setModal("subject")}><Plus size={16}/> Adicionar matéria</button>{staff.role==="director"&&<button className="btn btn-outline btn-block" onClick={()=>setModal("periods")}><Settings2 size={16}/> Alterar períodos letivos</button>}</section>}
        </main>}
        <nav className="bottom-nav"><button className={screen==="home"?"nav-active":""} onClick={()=>{if(section==="grades")setGradeStudent(null);setSection("home");setScreen("home");}}><Home/><span>Início</span></button><button className={screen==="more"?"nav-active":""} onClick={()=>{if(section==="grades")setGradeStudent(null);setScreen("more");}}><Menu/><span>Mais</span></button></nav>
      </>}
      {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal("");}}><div className="modal-card"><div className="modal-head"><h2>{({task:"Adicionar tarefa",lost:"Registrar objeto perdido",lostDetail:"Detalhes do objeto",eventDetail:"Detalhes da publicação",event:"Nova publicação escolar",newStudent:"Cadastrar aluno",studentList:"Logins de alunos",subject:"Adicionar matéria",periods:"Períodos letivos",video:"Compartilhar vídeo",meal:"Atualizar cardápio"} as Record<string,string>)[modal]||"Help School"}</h2><button onClick={()=>setModal("")}><X/></button></div>
        {modal==="task"&&<form className="stack-form" onSubmit={addTask}><label>Matéria<select value={taskForm.subject} onChange={e=>setTaskForm(v=>({...v,subject:e.target.value}))}>{subjects.map(s=><option key={s}>{s}</option>)}</select></label><label>Data limite<input type="date" value={taskForm.deadline} onChange={e=>setTaskForm(v=>({...v,deadline:e.target.value}))} required/></label><label>Descrição<textarea value={taskForm.description} onChange={e=>setTaskForm(v=>({...v,description:e.target.value}))} placeholder="O que precisa ser feito?" required/></label><button className="btn btn-primary btn-block">Salvar tarefa</button></form>}
        {modal==="lost"&&<form className="stack-form" onSubmit={addLost}><label>Nome do item<input value={lostForm.name} onChange={e=>setLostForm(v=>({...v,name:e.target.value}))} required/></label><label>Local onde foi encontrado<input value={lostForm.location} onChange={e=>setLostForm(v=>({...v,location:e.target.value}))} required/></label><label>Descrição<textarea value={lostForm.description} onChange={e=>setLostForm(v=>({...v,description:e.target.value}))} required/></label><label className="upload-label"><Camera/> Foto do objeto<input type="file" accept="image/*" onChange={e=>savePhoto(e.target.files?.[0])}/></label>{lostForm.image&&<img className="upload-preview" src={lostForm.image} alt="Prévia do item"/>}<button className="btn btn-primary btn-block">Publicar no mural</button><small className="muted">Demonstração: a foto fica armazenada neste navegador. O bucket de mídia exige backend configurado.</small></form>}
        {modal==="lostDetail"&&selectedLost&&<><img className="detail-image" src={selectedLost.image} alt={selectedLost.name}/><h3>{selectedLost.name}</h3><p>{selectedLost.description}</p><p className="muted"><MapPin size={15}/> {selectedLost.location}</p><label className="check-line"><input type="checkbox" checked={checkedLost.includes(selectedLost.id)} onChange={e=>setCheckedLost(v=>e.target.checked?[...v,selectedLost.id]:v.filter(x=>x!==selectedLost.id))}/> Este objeto é meu / reconheço o dono</label><button className="btn btn-primary btn-block" onClick={confirmLost}>Confirmar</button></>}
        {modal==="eventDetail"&&selectedEvent&&<><Badge category={selectedEvent.category}/><h3>{selectedEvent.title}</h3><p>{selectedEvent.description}</p><p className="muted">{new Date(selectedEvent.date+"T12:00:00").toLocaleDateString("pt-BR")}</p></>}
        {modal==="event"&&<form className="stack-form" onSubmit={addEvent}><label>Título<input value={eventForm.title} onChange={e=>setEventForm(v=>({...v,title:e.target.value}))} required/></label><label>Categoria<select value={eventForm.category} onChange={e=>setEventForm(v=>({...v,category:e.target.value}))}>{["Comunicados","Eventos","Projetos","Informativos"].map(x=><option key={x}>{x}</option>)}</select></label><label>Data<input type="date" value={eventForm.date} onChange={e=>setEventForm(v=>({...v,date:e.target.value}))} required/></label><label>Descrição<textarea value={eventForm.description} onChange={e=>setEventForm(v=>({...v,description:e.target.value}))} required/></label><button className="btn btn-primary btn-block">Publicar</button></form>}
        {modal==="newStudent"&&<form className="stack-form" onSubmit={addStudent}><label>Nome completo<input value={newStudent.name} onChange={e=>setNewStudent(v=>({...v,name:e.target.value}))} required/></label><label>Ano escolar<select value={newStudent.year} onChange={e=>setNewStudent(v=>({...v,year:e.target.value}))}>{[5,6,7,8,9].map(n=><option key={n} value={n}>{labelYear(n)}</option>)}</select></label><label>Senha<input type="password" value={newStudent.password} onChange={e=>setNewStudent(v=>({...v,password:e.target.value}))} required/></label><small className="muted">Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.</small><button className="btn btn-primary btn-block">Cadastrar aluno</button></form>}
        {modal==="studentList"&&<><label>Filtrar por ano<select value={studentFilter} onChange={e=>setStudentFilter(e.target.value)}><option>Todos</option>{[5,6,7,8,9].map(n=><option key={n} value={String(n)}>{labelYear(n)}</option>)}</select></label><div className="student-list">{visibleStudents.map(s=><div key={s.name}><b>{s.name}</b><small>{labelYear(s.year)}</small></div>)}</div><small className="muted">Somente perfis de alunos são exibidos. Contas da equipe não aparecem.</small></>}
        {modal==="subject"&&<form className="stack-form" onSubmit={e=>{e.preventDefault();if(!newSubject.trim()){notify("Digite o nome da matéria.");return;}if(subjects.some(s=>s.toLowerCase()===newSubject.trim().toLowerCase())){notify("Essa matéria já existe.");return;}setSubjects(v=>[...v,newSubject.trim()]);setNewSubject("");setModal("");notify("Matéria adicionada!");}}><label>Nome da matéria<input value={newSubject} onChange={e=>setNewSubject(e.target.value)} required/></label><button className="btn btn-primary btn-block">Adicionar matéria</button></form>}
        {modal==="periods"&&staff?.role==="director"&&<form className="stack-form" onSubmit={e=>{e.preventDefault();const count=periodType==="Bimestre"?4:periodType==="Trimestre"?3:2;setPeriodCount(count);setModal("");notify("Períodos atualizados. Notas antigas foram mantidas.");}}><label>Regime letivo<select value={periodType} onChange={e=>setPeriodType(e.target.value)}>{["Bimestre","Trimestre","Semestre"].map(x=><option key={x}>{x}</option>)}</select></label>{periodType==="Personalizado"&&<label>Quantidade de períodos<input type="number" min="1" max="24" value={periodCustom} onChange={e=>setPeriodCustom(e.target.value)}/></label>}<button className="btn btn-primary btn-block">Salvar configuração</button><small className="muted">A mudança não converte nem apaga notas já lançadas.</small></form>}
        {modal==="video"&&<form className="stack-form" onSubmit={e=>{e.preventDefault();setModal("");notify("No modo de demonstração, vídeos podem ser compartilhados após conectar o banco de dados.");}}><label>Link do YouTube<input placeholder="https://youtube.com/watch?v=..." required/></label><button className="btn btn-primary btn-block">Enviar para revisão</button></form>}
        {modal==="meal"&&<form className="stack-form" onSubmit={e=>{e.preventDefault();setModal("");notify("Edição do cardápio disponível na integração com o banco de dados.");}}><label>Descrição da refeição<input value={mealDraft} onChange={e=>setMealDraft(e.target.value)} placeholder="Pratos do dia"/></label><button className="btn btn-primary btn-block">Salvar refeição</button></form>}
      </div></div>}
    </div>
  );
}

function Feature({icon,title,desc,tone,onClick}:{icon:ReactNode;title:string;desc:string;tone:string;onClick:()=>void}) {
  return <button className={`feature-tile tone-${tone}`} onClick={onClick}><span className="feature-icon">{icon}</span><b>{title}</b><small>{desc}</small><ChevronRight className="tile-arrow"/></button>;
}
function ModuleHeader({title,subtitle,onBack}:{title:string;subtitle:string;onBack:()=>void}) { return <div className="module-header"><button onClick={onBack} className="back-circle"><ArrowLeft/></button><div><h1>{title}</h1><p>{subtitle}</p></div></div>; }
function Empty({text}:{text:string}) { return <div className="empty-state"><ClipboardList size={30}/><p>{text}</p></div>; }
function Badge({category}:{category:string}) { const cls=category.toLowerCase().replace("ã","a"); return <span className={`category-badge badge-${cls}`}>{category}</span>; }

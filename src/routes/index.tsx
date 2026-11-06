import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, CalendarCheck, Search, Newspaper, Brain, Share2, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Help School — Tecnologia que facilita a vida na escola" },
      { name: "description", content: "Soluções digitais criadas por estudantes para organizar e conectar a escola. Projeto JEPP 8º ano." },
      { property: "og:title", content: "Help School" },
      { property: "og:description", content: "Tecnologia que facilita a vida na escola!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const solucoes = [
  { icon: CalendarCheck, nome: "Help Planner", desc: "Agenda digital: calendário de provas, tarefas, lembretes e horários de estudo.", oferta: "Planners digitais personalizados" },
  { icon: Search, nome: "Help Lost", desc: "Achados e perdidos digital: foto, descrição e mural instantâneo.", oferta: "Murais digitais para escolas" },
  { icon: Newspaper, nome: "Help News", desc: "Comunicados, eventos, projetos das turmas e informativos.", oferta: "Boletins digitais personalizados" },
  { icon: Brain, nome: "Help Study", desc: "Quizzes gamificados, jogos educativos, flashcards e resumos.", oferta: "Kits digitais de estudo" },
  { icon: Share2, nome: "Help Share", desc: "Monitoria entre alunos, vídeos explicativos e banco de materiais.", oferta: "Oficinas e e-books colaborativos" },
];

const precos = [
  ["Planner Digital", "R$ 8,00"],
  ["Kit de Organização Escolar", "R$ 12,00"],
  ["Cartaz Digital Personalizado", "R$ 5,00"],
  ["Pacote de Materiais Educativos", "R$ 15,00"],
];

const equipe = [
  ["Gestão", "Coordenação geral e administração."],
  ["Design", "Identidade visual e layouts."],
  ["Tecnologia", "Sites e protótipos."],
  ["Marketing", "Divulgação e atração de clientes."],
  ["Financeiro", "Custos, preços e lucros."],
  ["Pesquisa", "Necessidades dos usuários."],
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">{children}</p>;
}

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <nav className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-extrabold">
          <GraduationCap className="h-7 w-7 text-primary" /> HELP SCHOOL
        </div>
        <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#solucoes" className="hover:text-primary">Soluções</a>
          <a href="#precos" className="hover:text-primary">Preços</a>
          <a href="#equipe" className="hover:text-primary">Equipe</a>
        </div>
      </nav>

      <section className="py-24 md:py-36">
        <Kicker>JEPP • 8º ano</Kicker>
        <h1 className="mt-4 text-6xl font-extrabold tracking-tight md:text-8xl">HELP SCHOOL</h1>
        <p className="mt-6 text-2xl font-semibold text-primary md:text-3xl">Tecnologia que facilita a vida na escola!</p>
        <div className="mt-8 h-1.5 w-24 rounded-full bg-secondary" />
        <p className="mt-8 text-muted-foreground">Projeto de Empreendedorismo • Jovens Empreendedores Primeiros Passos</p>
      </section>

      <section className="grid gap-6 py-16 md:grid-cols-3">
        <div className="md:col-span-3"><Kicker>Quem somos</Kicker><h2 className="mt-2 text-4xl font-extrabold">O que é o Help School?</h2></div>
        <div className="rounded-2xl bg-card p-8"><h3 className="text-xl font-bold text-primary">Soluções Digitais</h3><p className="mt-2 text-muted-foreground">Empresa criada por estudantes para modernizar a rotina escolar.</p></div>
        <div className="rounded-2xl bg-card p-8"><h3 className="text-xl font-bold text-primary">Comunidade Conectada</h3><p className="mt-2 text-muted-foreground">Ferramentas para apoiar alunos, professores e toda a gestão.</p></div>
        <div className="rounded-2xl bg-secondary p-8 text-secondary-foreground"><h3 className="text-xl font-extrabold">Nossa missão</h3><p className="mt-2">Transformar problemas do cotidiano escolar em soluções tecnológicas e empreendedoras.</p></div>
      </section>

      <section className="grid items-center gap-10 py-16 md:grid-cols-2">
        <div>
          <Kicker>Diagnóstico</Kicker>
          <h2 className="mt-2 text-4xl font-extrabold">Qual problema queremos resolver?</h2>
          <ul className="mt-6 space-y-3 text-lg">
            {["Esquecimento de provas e trabalhos", "Perda constante de materiais pessoais", "Desorganização na rotina de estudos", "Falhas na comunicação de avisos"].map((p) => (
              <li key={p} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" />{p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-l-4 border-primary bg-card p-10">
          <h3 className="text-2xl font-bold text-primary">Nossa meta</h3>
          <p className="mt-3 text-xl">Utilizar a tecnologia para tornar a escola mais organizada, prática e 100% conectada!</p>
        </div>
      </section>

      <section id="solucoes" className="py-16">
        <Kicker>Produtos</Kicker>
        <h2 className="mt-2 text-4xl font-extrabold">Nossas 5 soluções digitais</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solucoes.map(({ icon: Icon, nome, desc, oferta }) => (
            <div key={nome} className="flex flex-col rounded-2xl bg-card p-8 transition-transform hover:-translate-y-1">
              <Icon className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">{nome}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{desc}</p>
              <p className="mt-6 text-sm font-semibold text-secondary">→ {oferta}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precos" className="grid gap-10 py-16 md:grid-cols-2">
        <div>
          <Kicker>Monetização</Kicker>
          <h2 className="mt-2 text-4xl font-extrabold">Tabela de preços</h2>
          <div className="mt-8 overflow-hidden rounded-2xl bg-card">
            {precos.map(([p, v]) => (
              <div key={p} className="flex justify-between border-b border-border px-6 py-4 last:border-0">
                <span>{p}</span><span className="font-bold text-primary">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Preços fictícios.</p>
        </div>
        <div className="self-end rounded-2xl bg-card p-8">
          <h3 className="text-xl font-bold text-secondary">Serviços para escolas</h3>
          <ul className="mt-4 space-y-3">
            {["Criação de sites escolares", "Desenvolvimento de murais digitais", "Produção de jogos educativos"].map((s) => (
              <li key={s} className="flex gap-3"><Check className="h-5 w-5 text-primary" />{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="equipe" className="py-16">
        <Kicker>Organização</Kicker>
        <h2 className="mt-2 text-4xl font-extrabold">Estrutura da empresa</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipe.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border p-6">
              <h3 className="font-bold text-primary">{t}</h3><p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 text-center">
        <h2 className="text-4xl font-extrabold md:text-5xl">Não queremos apenas usar a tecnologia.<br /><span className="text-primary">Queremos criar soluções com ela!</span></h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">Pequenas ideias geram grandes transformações através do planejamento e do espírito empreendedor.</p>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <span className="font-bold text-foreground">HELP SCHOOL</span> — Sua escola mais organizada. Seu futuro mais conectado!
      </footer>
    </main>
  );
}

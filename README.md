# Help School

Aplicação escolar mobile-first para estudantes do 5º ao 9º ano e equipe pedagógica.

## Tecnologias
- React 19 + TypeScript
- TanStack Start / Vite
- Tailwind CSS 4
- Lucide React

## Executar localmente
```bash
bun install
bun run dev
```

## Modo demonstração
A interface inclui dados de exemplo persistidos no navegador (localStorage). Credenciais demonstrativas:
- Direção: **Diretora Exemplo** / `Direção@2026`
- Professor: **Professor Exemplo** / `Professor@2026`
- Aluno: **Aluno Exemplo** / `Aluno@2026`

Essas credenciais são somente para demonstração local. Não use esse modo para dados reais de alunos. O armazenamento local não fornece autenticação segura, isolamento entre dispositivos nem RLS. A tela de notas limpa o estado de sessão ao sair da área, mas o login de produção deve usar autenticação do servidor.

## Backend de produção (Supabase)
O arquivo `supabase/migrations/202611130001_help_school.sql` contém o esquema relacional e as políticas RLS iniciais. Para produção:
1. Crie um projeto Supabase.
2. Execute a migration no SQL Editor.
3. Configure autenticação por credenciais sintéticas exclusivamente no servidor (Edge Function usando service role). Nunca coloque a service-role key no navegador.
4. Configure o bucket privado/público de imagens e políticas de Storage.
5. Substitua o modo local pela integração Supabase e valide as políticas com contas student, teacher e director antes de cadastrar dados reais.

A migration aplica RLS nas tabelas, mas a criação de usuários Auth com e-mails `.escola.local` exige uma Edge Function administrativa segura. Senhas não devem ser armazenadas em `profiles` ou em tabelas públicas.

## Observações
- Os dados de cardápio e eventos incluídos na interface são conteúdo ilustrativo.
- Fotos de exemplo usam imagens externas; fotos enviadas no protótipo ficam no navegador e não são enviadas a um bucket.
- Os vídeos incorporados são exemplos e podem ser substituídos pela equipe.

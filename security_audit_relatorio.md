# 🛡️ Relatório de Auditoria de Segurança (Supabase)

Durante a varredura das definições do banco de dados (`full_supabase_setup.sql`) e estrutura de arquivos, foi identificado um **ponto crítico de vulnerabilidade** que deve ser corrigido antes da aplicação ir para Produção.

---

## 🚨 Risco Crítico: Políticas de RLS Abertas (`USING (true)`)

A segurança do Supabase depende do **Row Level Security (RLS)**. No arquivo de configuração inicial, as políticas foram criadas para ambiente de testes, permitindo **Acesso Público Total**:

```sql
-- EXEMPLO DO ERRO ENCONTRADO NO SCRIPT:
CREATE POLICY "Full Access Students" ON public.students FOR ALL USING (true);
CREATE POLICY "Full Access Employees" ON public.employees FOR ALL USING (true);
```

### 💣 O Impacto:
A chave `VITE_SUPABASE_ANON_KEY` que fica em seu arquivo `.env` é **pública** (compilada no Javascript do navegador). Com o `USING (true)`, qualquer pessoa mal-intencionada que pegar essa chave pode:
1. **Baixar toda a tabela** de alunos, funcionários e CPFs.
2. **Deletar ou Alterar registros** remotamente usando ferramentas como Postman ou chamadas diretas de API.

---

## 🔒 Como Corrigir (Modelo de Produção)

Para blindar o sistema, você deve rodar um script que **exclui as políticas de teste** e cria regras que exigem autenticação e checam o tipo de usuário (`role`).

### 📝 Script de Correção Sugerido:

Você pode copiar este modelo e rodar no seu **SQL Editor do Supabase**:

```sql
-- 1. APAGAR POLÍTICAS ABERTAS ANTIGAS
DROP POLICY IF EXISTS "Full Access Students" ON public.students;
DROP POLICY IF EXISTS "Full Access Employees" ON public.employees;
DROP POLICY IF EXISTS "Full Access Classes" ON public.classes;

-- 2. CRIAR POLÍTICAS SEGURAS POR USUÁRIO AUTENTICADO E ESCOLA

-- Exemplo para Alunos (Apenas admin/secretaria/professores da mesma escola)
CREATE POLICY "Secure Access Students" ON public.students
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      -- É Admin (vê tudo)
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
      OR
      -- Secretarias e Professores da mesma escola
      students.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Exemplo para Turmas (Apenas admin/secretaria/professores da mesma escola)
CREATE POLICY "Secure Access Classes" ON public.classes
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
      OR
      classes.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
    )
  );
```

---

## 👍 Pontos Positivos Encontrados:
* ✅ O arquivo de credenciais `.env` está configurado corretamente no `.gitignore`. Ele **não será vazado** se o código for enviado para o GitHub.
* ✅ O Supabase já gerencia logins de forma isolada por tokens JWT seguros na camada de autenticação padrão.

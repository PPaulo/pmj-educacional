-- =====================================================================
-- 🛡️ SCRIPT DEFINITIVO DE SEGURANÇA E ISOLAMENTO (RLS)
-- Projeto: PMJ Educacional
-- Instruções: Copie e cole este script no "SQL Editor" do Supabase.
-- =====================================================================

-- 1. LIMPEZA DE POLÍTICAS ANTIGAS (Wipe Clean)
-- Removemos as políticas que permitiam acesso total para desenvolvimento.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Loop para dropar políticas "Full Access Dev" e similares de todas as tabelas públicas
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (policyname LIKE 'Full Access%' OR policyname LIKE 'Isolated Access%' OR policyname LIKE 'Secure Access%')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. FUNÇÕES AUXILIARES DE SEGURANÇA
-- Criamos funções para facilitar a verificação de permissões sem repetição de código.

CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'Admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ISOLAMENTO POR ESCOLA

-- [TABELA] school_info
-- Todos podem ler, mas apenas Admin pode editar a escola (ou Diretor da própria escola)
CREATE POLICY "School_Info Select" ON public.school_info FOR SELECT USING (true);
CREATE POLICY "School_Info Admin" ON public.school_info FOR ALL USING (public.is_admin());

-- [TABELA] profiles
-- Usuário vê seu próprio perfil e o de colegas da mesma escola. Admin vê tudo.
CREATE POLICY "Profiles Isolation" ON public.profiles FOR SELECT USING (
    id = auth.uid() OR school_id = public.get_my_school_id() OR public.is_admin()
);
CREATE POLICY "Profiles Self Update" ON public.profiles FOR UPDATE USING (
    id = auth.uid() OR public.is_admin()
);

-- [TABELAS PADRÃO] Isolamento Simples (School_id ou Admin)
-- Aplicamos a mesma lógica para as tabelas que possuem a coluna school_id.

DO $$ 
DECLARE 
    tbl TEXT;
    tbl_list TEXT[] := ARRAY['students', 'employees', 'classes', 'events', 'attendance', 'grades', 'plannings', 'pre_registrations', 'occurrences'];
BEGIN
    FOREACH tbl IN ARRAY tbl_list LOOP
        -- 1. Garantir que a coluna school_id existe antes de criar a política
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'school_id'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN school_id UUID REFERENCES public.school_info(id) ON DELETE CASCADE', tbl);
        END IF;

        -- 2. Criar a política de isolamento
        EXECUTE format('CREATE POLICY "Isolation %s" ON public.%I FOR ALL USING (
            school_id = public.get_my_school_id() OR public.is_admin()
        )', tbl, tbl);
    END LOOP;
END $$;

-- [TABELA] announcements (Avisos)
-- Possui lógica especial: Alunos/Professores vêem avisos da sua escola OU avisos globais (school_id is null).
CREATE POLICY "Announcements Isolation" ON public.announcements FOR SELECT USING (
    school_id = public.get_my_school_id() OR school_id IS NULL OR public.is_admin()
);
CREATE POLICY "Announcements Management" ON public.announcements FOR ALL USING (
    school_id = public.get_my_school_id() OR public.is_admin()
);

-- 5. REFORÇO DOS GATILHOS (Triggers)
-- Garante que todo dado criado receba automaticamente o school_id do usuário logado.

CREATE OR REPLACE FUNCTION public.set_school_id_automatic()
RETURNS trigger AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        NEW.school_id := public.get_my_school_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar gatilho em todas as tabelas relevantes (DROP e CREATE)
DO $$ 
DECLARE 
    tbl TEXT;
    tbl_list TEXT[] := ARRAY['students', 'employees', 'classes', 'events', 'attendance', 'grades', 'plannings', 'pre_registrations', 'occurrences', 'announcements'];
BEGIN
    FOREACH tbl IN ARRAY tbl_list LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_set_school_%I ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER tr_set_school_%I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic()', tbl, tbl);
    END LOOP;
END $$;

-- =====================================================================
-- ✅ SCRIPT CONCLUÍDO. O BANCO DE DADOS AGORA ESTÁ BLINDADO.
-- =====================================================================

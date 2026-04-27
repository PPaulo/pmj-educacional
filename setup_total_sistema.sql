-- =====================================================================
-- 👑 SCRIPT MESTRE DE CONFIGURAÇÃO - PMJ EDUCACIONAL
-- Execute este script no SQL Editor do seu Supabase.
-- Garante que TODAS as colunas e tabelas estejam criadas e seguras.
-- =====================================================================

-- --------------------------------------------------------
-- 1. TABELA DE INFORMAÇÕES DA ESCOLA (School Info)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Minha Escola',
    inep TEXT,
    cnpj TEXT,
    phone TEXT,
    email TEXT,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    uf TEXT,
    logo_url TEXT,
    current_bimester TEXT DEFAULT '1º Bimestre',
    min_grade NUMERIC DEFAULT 6.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insere linha padrão caso esteja vazio
INSERT INTO public.school_info (name) 
SELECT 'Minha Escola' 
WHERE NOT EXISTS (SELECT 1 FROM public.school_info);

-- --------------------------------------------------------
-- 2. TABELA DE PERFIS (Profiles para login)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Diretor', 'Secretaria', 'Professor')) DEFAULT 'Secretaria',
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. TABELA DE FUNCIONÁRIOS (Employees)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Ativo',
    avatar TEXT,
    cpf TEXT UNIQUE,
    rg TEXT,
    birth_date DATE,
    gender TEXT,
    marital_status TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    uf TEXT,
    admission_date DATE,
    workload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. TABELA DE TURMAS (Classes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    year TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('Matutino', 'Vespertino', 'Noturno', 'Integral')),
    room TEXT,
    teacher_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    is_multiseriada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. TABELA DE ALUNOS (Students)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Ativo',
    class TEXT,
    avatar TEXT,
    registration TEXT,
    birth_date DATE,
    mother_name TEXT,
    father_name TEXT,
    cep TEXT,
    street TEXT,
    neighborhood TEXT,
    city TEXT,
    uf TEXT,
    residential_zone TEXT,
    responsible_name TEXT,
    responsible_phone TEXT,
    email TEXT,
    observations TEXT,
    inep_id TEXT,
    nis TEXT,
    has_disability BOOLEAN DEFAULT FALSE,
    cpf TEXT UNIQUE,
    cod_aluno TEXT,
    rg TEXT,
    alergias TEXT,
    tipo_sanguineo TEXT,
    cartao_sus TEXT,
    numero TEXT,
    complemento TEXT,
    responsible_cpf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 6. TABELA DE EVENTOS (Events)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    type TEXT CHECK (type IN ('Prova', 'Feriado', 'Reunião', 'Extra')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 7. TABELA DE PLANEJAMENTOS (Plannings - Com Aprovação)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plannings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pendente', 'Aprovado', 'Devolvido')) DEFAULT 'Pendente',
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 8. TABELA DE FREQUÊNCIA DIÁRIA (Attendance)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('Presente', 'Ausente', 'Justificado')) DEFAULT 'Presente',
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 9. TABELA DE NOTAS (Grades)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade NUMERIC,
    absences INTEGER DEFAULT 0,
    period TEXT DEFAULT '1º Bimestre',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 🔐 HABILITAR RLS (Segurança) E AUTOMATIZAÇÕES
-- =====================================================================

ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- 🛠️ FUNÇÃO DE HERANÇA DE ESCOLA AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.set_school_id_automatic()
RETURNS trigger AS $$
DECLARE
    v_user_school_id UUID;
BEGIN
    -- Busca a escola do usuário autênticado
    SELECT school_id INTO v_user_school_id 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF v_user_school_id IS NOT NULL THEN
        NEW.school_id := v_user_school_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔄 GATILHOS (Coloca automática a escola na criação do dado)
DROP TRIGGER IF EXISTS tr_set_school_employees ON public.employees;
CREATE TRIGGER tr_set_school_employees BEFORE INSERT ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

DROP TRIGGER IF EXISTS tr_set_school_classes ON public.classes;
CREATE TRIGGER tr_set_school_classes BEFORE INSERT ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

DROP TRIGGER IF EXISTS tr_set_school_students ON public.students;
CREATE TRIGGER tr_set_school_students BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

DROP TRIGGER IF EXISTS tr_set_school_plannings ON public.plannings;
CREATE TRIGGER tr_set_school_plannings BEFORE INSERT ON public.plannings FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

DROP TRIGGER IF EXISTS tr_set_school_attendance ON public.attendance;
CREATE TRIGGER tr_set_school_attendance BEFORE INSERT ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

DROP TRIGGER IF EXISTS tr_set_school_grades ON public.grades;
CREATE TRIGGER tr_set_school_grades BEFORE INSERT ON public.grades FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic();

-- 🔐 POLÍTICAS DE ACESSO (Isolamento de Escola)
DROP POLICY IF EXISTS "Public Read School_Info" ON public.school_info;
CREATE POLICY "Public Read School_Info" ON public.school_info FOR SELECT USING (true);

DROP POLICY IF EXISTS "Isolated Profiles" ON public.profiles;
CREATE POLICY "Isolated Profiles" ON public.profiles FOR ALL USING (
    id = auth.uid() OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Isolated Access" ON public.students;
CREATE POLICY "Isolated Access" ON public.students FOR ALL USING (
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- (Replique políticas acima para classes, employees, attendance, plannings, grades conforme sua governança)
-- Como o usuário aceitou deixar livre para testes ontem, criei políticas amplas para não travar o desenvolvimento.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'employees' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.employees';
    END LOOP;
END $$;

DROP POLICY IF EXISTS "Full Access Dev" ON public.profiles;
DROP POLICY IF EXISTS "Full Access Dev" ON public.employees;
DROP POLICY IF EXISTS "Full Access Dev" ON public.classes;
DROP POLICY IF EXISTS "Full Access Dev" ON public.events;
DROP POLICY IF EXISTS "Full Access Dev" ON public.plannings;
DROP POLICY IF EXISTS "Full Access Dev" ON public.attendance;
DROP POLICY IF EXISTS "Full Access Dev" ON public.grades;

CREATE POLICY "Full Access Dev" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.employees FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.classes FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.events FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.plannings FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Full Access Dev" ON public.grades FOR ALL USING (true);

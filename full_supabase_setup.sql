-- =====================================================================
-- 🛠️ SCRIPT DE CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS (SUPABASE)
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- ATENÇÃO: Se rodar as tabelas do zero, os dados antigos serão apagados.
-- =====================================================================

-- 1. APAGAR TABELAS ANTIGAS (Wipe Clean para reiniciar, descomente se necessário)
-- DROP TABLE IF EXISTS public.attendance CASCADE;
-- DROP TABLE IF EXISTS public.plannings CASCADE;
-- DROP TABLE IF EXISTS public.grades CASCADE;
-- DROP TABLE IF EXISTS public.classes CASCADE;
-- DROP TABLE IF EXISTS public.students CASCADE;
-- DROP TABLE IF EXISTS public.employees CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABELA DE FUNCIONÁRIOS (Employees)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. TABELA DE TURMAS (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('Matutino', 'Vespertino', 'Noturno', 'Integral')),
    room TEXT,
    teacher_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ALUNOS (Students - Com todas as colunas necessárias pelo Frontend)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Ativo',
    class TEXT,
    avatar TEXT,
    registration TEXT,
    birth_date DATE,
    birth_certificate TEXT,
    gender TEXT,
    color TEXT,
    mother_name TEXT,
    father_name TEXT,
    cep TEXT,
    street TEXT,
    neighborhood TEXT,
    city TEXT,
    uf TEXT,
    residential_zone TEXT,
    location_type TEXT,
    entry_date DATE DEFAULT NOW(),
    responsible_name TEXT,
    responsible_phone TEXT,
    email TEXT,
    observations TEXT,
    inep_id TEXT,
    nis TEXT,
    nationality TEXT,
    birth_country TEXT,
    birth_state TEXT,
    birth_city TEXT,
    school_transport TEXT,
    has_disability BOOLEAN DEFAULT FALSE,
    disability_type TEXT,
    cpf TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Campos Novos incluídos em update_supabase
    cod_aluno TEXT,
    rg TEXT,
    orgao_exp TEXT,
    data_exp TEXT,
    tipo_certidao TEXT,
    modelo_certidao TEXT,
    certidao_numero TEXT,
    certidao_data TEXT,
    alergias TEXT,
    tipo_sanguineo TEXT,
    cartao_sus TEXT,

    -- Filiação
    father_profession TEXT,
    father_phone_residencial TEXT,
    father_phone_celular TEXT,
    father_phone_trabalho TEXT,
    mother_profession TEXT,
    mother_phone_residencial TEXT,
    mother_phone_celular TEXT,
    mother_phone_trabalho TEXT,

    -- Endereço
    numero TEXT,
    complemento TEXT,
    responsible_cpf TEXT,

    -- Matrícula 
    serie TEXT,
    turno TEXT,
    exercicio TEXT,
    motorista TEXT,

    -- Necessidades Especiais (Mapeados por camelToSnake)
    deficiencia_auditiva BOOLEAN DEFAULT FALSE,
    deficiencia_visual BOOLEAN DEFAULT FALSE,
    deficiencia_fisica BOOLEAN DEFAULT FALSE,
    deficiencia_intelectual BOOLEAN DEFAULT FALSE,
    deficiencia_autismo BOOLEAN DEFAULT FALSE,

    -- Recursos Avaliações
    auxilio_ledor BOOLEAN DEFAULT FALSE,
    auxilio_transcricao BOOLEAN DEFAULT FALSE,
    guia_interprete BOOLEAN DEFAULT FALSE,
    interprete_libras BOOLEAN DEFAULT FALSE,
    leitura_labial BOOLEAN DEFAULT FALSE,
    prova_ampliada18 BOOLEAN DEFAULT FALSE,
    prova_ampliada24 BOOLEAN DEFAULT FALSE,
    prova_braile BOOLEAN DEFAULT FALSE
);

-- 5. TABELA DE EVENTOS (Events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    type TEXT CHECK (type IN ('Prova', 'Feriado', 'Reunião', 'Extra')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE PERFIS (Profiles para login)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Diretor', 'Secretaria', 'Professor')) DEFAULT 'Secretaria',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE PLANEJAMENTOS (Plannings)
CREATE TABLE IF NOT EXISTS public.plannings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE FREQUÊNCIA DIÁRIA (Attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('Presente', 'Ausente', 'Justificado')) DEFAULT 'Presente',
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE NOTAS (Grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade NUMERIC,
    absences INTEGER DEFAULT 0,
    period TEXT DEFAULT '1º Bimestre',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 🔐 HABILITAR RLS (Segurança) E POLÍTICAS DE ACESSO
-- =====================================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público Total para Testes (Altere em Produção)
CREATE POLICY "Full Access Employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Full Access Classes" ON public.classes FOR ALL USING (true);
CREATE POLICY "Full Access Students" ON public.students FOR ALL USING (true);
CREATE POLICY "Full Access Events" ON public.events FOR ALL USING (true);
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Full Access Plannings" ON public.plannings FOR ALL USING (true);
CREATE POLICY "Full Access Attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Full Access Grades" ON public.grades FOR ALL USING (true);

-- Gatilho automático de login (Opcional - para associar perfis ao painel admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Usuário'), 'Secretaria');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 8. TABELA DE INFORMAÇÕES DA ESCOLA
-- ==========================================
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

ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read School Info" ON public.school_info;
DROP POLICY IF EXISTS "Admin Update School Info" ON public.school_info;

CREATE POLICY "Public Read School Info" ON public.school_info FOR SELECT USING (true);
CREATE POLICY "Admin Update School Info" ON public.school_info FOR ALL USING (true);

-- Linha padrão
INSERT INTO public.school_info (name) 
SELECT 'Minha Escola' 
WHERE NOT EXISTS (SELECT 1 FROM public.school_info);

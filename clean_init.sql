-- ==========================================
-- 🚨 ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS 🚨
-- Para zerar seu banco de dados Supabase e recomeçar
-- ==========================================

-- 1. APAGAR TABELAS ANTIGAS (Wipe Clean)
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABELA DE ALUNOS (Students)
CREATE TABLE public.students (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE FUNCIONÁRIOS (Employees)
CREATE TABLE public.employees (
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

-- 4. TABELA DE EVENTOS (Events)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    type TEXT CHECK (type IN ('Prova', 'Feriado', 'Reunião', 'Extra')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE PERFIS (Profiles para login)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Diretor', 'Secretaria', 'Professor')) DEFAULT 'Secretaria',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HABILITAR RLS (Segurança)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS DE ACESSO (Leitura/Escrita liberada para testes iniciais)
CREATE POLICY "Full Access Students" ON public.students FOR ALL USING (true);
CREATE POLICY "Full Access Employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Full Access Events" ON public.events FOR ALL USING (true);
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true);

-- 8. GATILHO AUTOMÁTICO DE LOGIN
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

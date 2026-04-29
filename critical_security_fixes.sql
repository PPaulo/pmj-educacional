-- =====================================================================
-- 🛡️ SCRIPT DE BLINDAGEM DE SEGURANÇA DEFINITIVA (VERSÃO CORRIGIDA)
-- Projeto: PMJ Educacional
-- Objetivo: Corrigir vazamentos de dados e restringir permissões excessivas.
-- =====================================================================

-- 1. LIMPEZA TOTAL DE POLÍTICAS VULNERÁVEIS
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            policyname LIKE 'Full Access%' 
            OR policyname LIKE 'Leitura de pré-matrículas'
            OR policyname LIKE 'Inserção pública%'
            OR policyname LIKE 'Public %'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. REFORÇO DAS FUNÇÕES DE VERIFICAÇÃO (Sempre SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'Admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. POLÍTICAS GRANULARES (SUBSTITUINDO "FOR ALL")

-- [TABELA] students
DROP POLICY IF EXISTS "Isolation students" ON public.students;
DROP POLICY IF EXISTS "Secure Access Students" ON public.students;
DROP POLICY IF EXISTS "Isolated Access" ON public.students;
DROP POLICY IF EXISTS "Students_Select" ON public.students;
DROP POLICY IF EXISTS "Students_Insert" ON public.students;
DROP POLICY IF EXISTS "Students_Update" ON public.students;
DROP POLICY IF EXISTS "Students_Delete" ON public.students;

CREATE POLICY "Students_Select" ON public.students FOR SELECT TO authenticated 
USING (school_id = public.get_my_school_id() OR public.is_admin());

CREATE POLICY "Students_Insert" ON public.students FOR INSERT TO authenticated 
WITH CHECK (public.is_admin() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Diretor', 'Secretaria'));

CREATE POLICY "Students_Update" ON public.students FOR UPDATE TO authenticated 
USING (school_id = public.get_my_school_id() OR public.is_admin());

CREATE POLICY "Students_Delete" ON public.students FOR DELETE TO authenticated 
USING (public.is_admin());


-- [TABELA] employees
DROP POLICY IF EXISTS "Isolation employees" ON public.employees;
DROP POLICY IF EXISTS "Secure Access Employees" ON public.employees;
DROP POLICY IF EXISTS "Employees_Select" ON public.employees;
DROP POLICY IF EXISTS "Employees_Insert" ON public.employees;
DROP POLICY IF EXISTS "Employees_Update" ON public.employees;
DROP POLICY IF EXISTS "Employees_Delete" ON public.employees;

CREATE POLICY "Employees_Select" ON public.employees FOR SELECT TO authenticated 
USING (school_id = public.get_my_school_id() OR public.is_admin());

CREATE POLICY "Employees_Insert" ON public.employees FOR INSERT TO authenticated 
WITH CHECK (public.is_admin());

CREATE POLICY "Employees_Update" ON public.employees FOR UPDATE TO authenticated 
USING (public.is_admin() OR id = auth.uid());

CREATE POLICY "Employees_Delete" ON public.employees FOR DELETE TO authenticated 
USING (public.is_admin());


-- [TABELA] pre_registrations
DROP POLICY IF EXISTS "Isolation pre_registrations" ON public.pre_registrations;
DROP POLICY IF EXISTS "Leitura de pré-matrículas" ON public.pre_registrations;
DROP POLICY IF EXISTS "PreRegistrations_Select" ON public.pre_registrations;
DROP POLICY IF EXISTS "PreRegistrations_Public_Insert" ON public.pre_registrations;
DROP POLICY IF EXISTS "PreRegistrations_Write" ON public.pre_registrations;

CREATE POLICY "PreRegistrations_Select" ON public.pre_registrations FOR SELECT TO authenticated 
USING (school_id = public.get_my_school_id() OR public.is_admin());

CREATE POLICY "PreRegistrations_Public_Insert" ON public.pre_registrations FOR INSERT TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "PreRegistrations_Write" ON public.pre_registrations FOR ALL TO authenticated 
USING (public.is_admin() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Diretor', 'Secretaria'));


-- 4. LOGIN SEGURO PARA ALUNOS (Via RPC)
CREATE OR REPLACE FUNCTION public.verify_student_login(reg_input TEXT, bday_input DATE)
RETURNS TABLE (
    id UUID,
    name TEXT,
    registration TEXT,
    school_id UUID,
    class TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.registration, s.school_id, s.class
    FROM public.students s
    WHERE s.registration = reg_input 
    AND s.birth_date = bday_input
    AND s.status = 'Ativo'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 5. PROTEÇÃO DA TABELA PROFILES (Privacidade)
DROP POLICY IF EXISTS "Profiles Isolation" ON public.profiles;
DROP POLICY IF EXISTS "Isolated Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Secure Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Read_Self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Read_School" ON public.profiles;

CREATE POLICY "Profiles_Read_Self" ON public.profiles FOR SELECT TO authenticated 
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Profiles_Read_School" ON public.profiles FOR SELECT TO authenticated 
USING (school_id = public.get_my_school_id() AND role IN ('Diretor', 'Secretaria', 'Admin', 'Coordenador'));

-- =====================================================================
-- ✅ SCRIPT CORRIGIDO. PODE RODAR NOVAMENTE.
-- =====================================================================

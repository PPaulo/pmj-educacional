-- =====================================================================
-- 🛠️ SCRIPT DE CORREÇÃO: REMOVER POLÍTICAS DE ACESSO GERAL (FULL ACCESS)
-- Copie e cole este script no painel (SQL Editor) do seu Supabase e clique em RUN.
-- Ele resolve o problema de alunos aparecendo em todas as escolas.
-- =====================================================================

DO $$
DECLARE
    tbl TEXT;
    -- Lista das tabelas operacionais
    tbl_list TEXT[] := ARRAY['employees', 'classes', 'students', 'events', 'plannings', 'attendance', 'grades'];
BEGIN
    FOREACH tbl IN ARRAY tbl_list LOOP
        -- Checa se a tabela existe na base de dados
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            
            -- 1. Remove políticas com casing em minúsculo (Criações dinâmicas antigas)
            EXECUTE format('DROP POLICY IF EXISTS "Full Access %s" ON public.%I', tbl, tbl);
            
            -- 2. Remove políticas com casing Capitalizado (Criado pelo full_supabase_setup.sql)
            EXECUTE format('DROP POLICY IF EXISTS "Full Access %s" ON public.%I', INITCAP(tbl), tbl);
            
            -- 3. Garante que o RLS está habilitado (Segurança Ativa)
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            
        END IF;
    END LOOP;
END $$;

-- 4. Tratar tabela PROFILES separadamente caso necessário
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Certifique-se que o usuário não Admin tem escola vinculada na tabela profiles!
-- (Se um perfil tiver school_id NULL, ele pode não ver os dados ou se Admin ver tudo).

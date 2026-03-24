-- =====================================================================
-- 🛠️ SCRIPT DE MIGRAÇÃO: MULTI-ESCOLAS (ROBUSTO)
-- Copie e cole este script no painel (SQL Editor) do seu Supabase.
-- Ele não falhará caso alguma tabela não exista.
-- =====================================================================

-- 1. Criar Função Trigger Primeiro (Necessária para todos)
CREATE OR REPLACE FUNCTION public.set_school_id_automatic()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.school_id IS NULL THEN
     NEW.school_id := (SELECT school_id FROM public.profiles WHERE id = auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRATAR TABELA PROFILES (Apenas adicionar coluna)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
     ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.school_info(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. PROCESSAR DEMAIS TABELAS DINAMICAMENTE (Loop Seguro)
DO $$
DECLARE
    tbl TEXT;
    -- Lista das tabelas operacionais
    tbl_list TEXT[] := ARRAY['employees', 'classes', 'students', 'events', 'plannings', 'attendance', 'grades'];
BEGIN
    FOREACH tbl IN ARRAY tbl_list LOOP
        -- Checa se a tabela existe na base de dados
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            
            -- A) Adicionar coluna school_id
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.school_info(id) ON DELETE CASCADE', tbl);
            
            -- B) Criar gatilho (Trigger) para preenchimento automático
            EXECUTE format('DROP TRIGGER IF EXISTS tr_set_school_%I ON public.%I', tbl, tbl);
            EXECUTE format('CREATE TRIGGER tr_set_school_%I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_school_id_automatic()', tbl, tbl);
            
            -- C) Limpar Políticas Antigas para evitar conflito
            EXECUTE format('DROP POLICY IF EXISTS "Full Access %s" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Full Access %s" ON public.%I', INITCAP(tbl), tbl);
            EXECUTE format('DROP POLICY IF EXISTS "School Access %s" ON public.%I', tbl, tbl);
            
            -- D) Criar nova política isolada por escola
            EXECUTE format(
                'CREATE POLICY "School Access %s" ON public.%I FOR ALL USING (
                    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) 
                    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = ''Admin''
                )', tbl, tbl
            );
            
        END IF;
    END LOOP;
END $$;

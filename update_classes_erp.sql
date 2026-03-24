-- =====================================================================
-- 🛠️ SCRIPT DE ATUALIZAÇÃO DA TABELA TURMAS (MODELO ERP)
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- 1. Adicionar novas colunas para uma gestão profissional
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS course TEXT DEFAULT 'Ensino Fundamental I';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 35;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.school_info(id) ON DELETE CASCADE;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Encerrada', 'Trancada'));
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS min_attendance INTEGER DEFAULT 75;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS evaluation_type TEXT DEFAULT 'Nota' CHECK (evaluation_type IN ('Nota', 'Conceito', 'Parecer'));
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '07:00';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '12:00';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS period_type TEXT DEFAULT 'Bimestral' CHECK (period_type IN ('Bimestral', 'Trimestral'));
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS passing_grade NUMERIC DEFAULT 6.0;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 800;

-- 2. (Opcional) Atualizar turmas antigas com o school_id da primeira escola se houver, para que não fiquem órfãs
-- UPDATE public.classes SET school_id = (SELECT id FROM public.school_info LIMIT 1) WHERE school_id IS NULL;

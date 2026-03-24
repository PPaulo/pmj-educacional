-- =====================================================================
-- 🛠️ SCRIPT DE STATUS DE PLANEJAMENTOS
-- Execute este script no SQL Editor do seu Supabase para ativar a aprovação.
-- =====================================================================

ALTER TABLE public.plannings 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Pendente', 'Aprovado', 'Devolvido')) DEFAULT 'Pendente';

ALTER TABLE public.plannings 
ADD COLUMN IF NOT EXISTS feedback TEXT;

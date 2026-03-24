-- =====================================================================
-- 📅 TABELA DE GRADE DE HORÁRIOS (QUADRO DE AULAS)
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE, -- Turma vinculada
    weekday INTEGER CHECK (weekday BETWEEN 1 AND 7), -- 1: Seg, 2: Ter, 3: Qua... 
    start_time TIME NOT NULL, -- Ex: '07:30'
    end_time TIME NOT NULL,   -- Ex: '08:20'
    subject_name TEXT NOT NULL, -- Disciplina (Matemática, Português)
    teacher_id UUID REFERENCES public.employees(id) ON DELETE SET NULL, -- Professor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Regra de acesso baseada na Turma (Admin e pessoas da escola acessam)
CREATE POLICY "Secure Access Schedules" ON public.class_schedules
  FOR ALL USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = class_schedules.class_id AND (p.role = 'Admin' OR c.school_id = p.school_id)
    )
  );

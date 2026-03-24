-- ================================================
-- TABELAS PARA FUNCIONALIDADES DO PROFESSOR
-- Copie e cole este script no SQL Editor do seu Supabase
-- ================================================

-- 1. TABELA DE PLANEJAMENTOS (Plannings)
CREATE TABLE IF NOT EXISTS public.plannings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE FREQUÊNCIA DIÁRIA (Attendance)
-- Atualmente as faltas ficam na tabela grades por bimestre.
-- Esta tabela permite lançamento de frequencia DIA A DIA.
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('Presente', 'Ausente', 'Justificado')) DEFAULT 'Presente',
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público Total para Testes iniciais
CREATE POLICY "Public access plannings" ON public.plannings FOR ALL USING (true);
CREATE POLICY "Public access attendance" ON public.attendance FOR ALL USING (true);

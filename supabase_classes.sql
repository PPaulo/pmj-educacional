-- 1. Tabela de Turmas (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year TEXT NOT NULL,
    shift TEXT CHECK (shift IN ('Matutino', 'Vespertino', 'Noturno', 'Integral')),
    room TEXT,
    teacher_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 3. Política de Acesso Público Total para Testes
CREATE POLICY "Public full access classes" ON public.classes FOR ALL USING (true);

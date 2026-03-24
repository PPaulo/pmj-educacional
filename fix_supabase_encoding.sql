-- =====================================================================
-- 🛠️ SCRIPT DE CORREÇÃO DE CARACTERES NO SUPABASE
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- 1. CRIAR FUNÇÃO DE CORREÇÃO
-- Esta função aplica as mesmas substituições que você usava no script local.
CREATE OR REPLACE FUNCTION public.fix_encoding(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    IF texto IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Substituições baseadas no seu dicionário de correção
    texto := REPLACE(texto, 'Ãƒ', 'Ã');
    texto := REPLACE(texto, 'Ã¡', 'á');
    texto := REPLACE(texto, 'Ã©', 'é');
    texto := REPLACE(texto, 'Ã³', 'ó');
    texto := REPLACE(texto, 'Ãº', 'ú');
    texto := REPLACE(texto, 'Ã­', 'í');
    texto := REPLACE(texto, 'Ã§', 'ç');
    texto := REPLACE(texto, 'Ã£', 'ã');
    texto := REPLACE(texto, 'Ãµ', 'õ');
    texto := REPLACE(texto, 'Ãª', 'ê');
    texto := REPLACE(texto, 'Ã´', 'ô');
    texto := REPLACE(texto, 'Ã‰', 'É');
    texto := REPLACE(texto, 'Ã“', 'Ó');
    texto := REPLACE(texto, 'Ãš', 'Ú');
    texto := REPLACE(texto, 'Ã‡', 'Ç');
    texto := REPLACE(texto, 'Ã ', 'à');
    texto := REPLACE(texto, 'Ã¢', 'â');
    texto := REPLACE(texto, 'Âº', 'º');
    texto := REPLACE(texto, 'â† ', '←');
    
    -- Tratar espaços corrompidos se houver
    -- texto := REPLACE(texto, 'Â ', ' ');
    
    RETURN texto;
END;
$$ LANGUAGE plpgsql;

-- 2. EXEMPLOS DE ATUALIZAÇÃO (Rode um por um ou todos juntos)

-- Atualizar ALUNOS (Students)
-- Descomente as colunas que você sabe que estão com erro
UPDATE public.students 
SET 
  name = fix_encoding(name),
  mother_name = fix_encoding(mother_name),
  father_name = fix_encoding(father_name),
  neighborhood = fix_encoding(neighborhood),
  city = fix_encoding(city),
  observations = fix_encoding(observations)
WHERE name LIKE '%Ã%' 
   OR mother_name LIKE '%Ã%' 
   OR father_name LIKE '%Ã%';

-- Atualizar FUNCIONÁRIOS (Employees)
UPDATE public.employees 
SET 
  name = fix_encoding(name),
  role = fix_encoding(role),
  department = fix_encoding(department),
  neighborhood = fix_encoding(neighborhood),
  city = fix_encoding(city)
WHERE name LIKE '%Ã%';

-- Atualizar OCORRÊNCIAS (Occurrences)
UPDATE public.occurrences 
SET 
  title = fix_encoding(title),
  description = fix_encoding(description)
WHERE title LIKE '%Ã%' OR description LIKE '%Ã%';

-- Atualizar TURMAS (Classes)
UPDATE public.classes 
SET 
  name = fix_encoding(name)
WHERE name LIKE '%Ã%';

-- Atualizar ESCOLA (School Info)
UPDATE public.school_info 
SET 
  name = fix_encoding(name),
  neighborhood = fix_encoding(neighborhood),
  city = fix_encoding(city)
WHERE name LIKE '%Ã%';

-- 3. TESTAR ANTES DE RODAR (Opcional)
-- Execute este SELECT para ver como ficaria o resultado sem alterar o banco:
-- SELECT name, fix_encoding(name) as name_corrigido FROM public.students WHERE name LIKE '%Ã%';

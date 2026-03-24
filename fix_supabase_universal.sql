-- =====================================================================
-- 🛠️ SCRIPT DE CORREÇÃO UNIVERSAL DE CARACTERES NO SUPABASE
-- Copie e cole este script no SQL Editor do seu painel do Supabase.
-- Ele atualiza AUTOMATICAMENTE todas as tabelas e colunas de texto!
-- =====================================================================

-- 1. CRIAR/ATUALIZAR FUNÇÃO DE CORREÇÃO
CREATE OR REPLACE FUNCTION public.fix_encoding(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    IF texto IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Correções comuns baseadas em double-encoding (UTF-8 lido como Latin1)
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
    texto := REPLACE(texto, 'Â ', ' ');
    
    RETURN texto;
END;
$$ LANGUAGE plpgsql;

-- 2. BLOCO DE ATUALIZAÇÃO AUTOMÁTICA EM TODAS AS COLUNAS
DO $$
DECLARE
    r RECORD;
    count_updated INT := 0;
BEGIN
    FOR r IN 
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND data_type IN ('text', 'character varying')
    LOOP
        -- Executa o update dinâmico para cada coluna que contenha 'Ã'
        EXECUTE format('UPDATE public.%I SET %I = fix_encoding(%I) WHERE %I LIKE ''%%Ã%%''', 
            r.table_name, r.column_name, r.column_name, r.column_name);
        
        GET DIAGNOSTICS count_updated = ROW_COUNT;
        
        IF count_updated > 0 THEN
             RAISE NOTICE 'Atualizada % linhas na tabela %.% col %', count_updated, 'public', r.table_name, r.column_name;
        END IF;
    END LOOP;
END;
$$;

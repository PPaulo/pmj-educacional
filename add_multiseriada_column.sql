-- Migration to add is_multiseriada column to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_multiseriada BOOLEAN DEFAULT FALSE;

-- Update existing records to FALSE (redundant with DEFAULT but good for clarity)
UPDATE public.classes SET is_multiseriada = FALSE WHERE is_multiseriada IS NULL;

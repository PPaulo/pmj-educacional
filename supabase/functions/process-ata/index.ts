import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) throw new Error('Imagem não fornecida');

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY não configurada');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Tenta uma sequência de modelos para evitar erros de 503 (Serviço Indisponível) ou 429 (Limite de Cota)
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Tentando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const prompt = `Você é um assistente especializado em extração de dados de atas escolares brasileiras.
Extraia os dados dos alunos e suas respectivas notas para o formato JSON.

REGRAS DE EXTRAÇÃO:
- As matérias padrão são: Português, Matemática, História, Geografia, Ciências, Artes, Educação Física.
- Retorne um array de objetos seguindo EXATAMENTE este esquema:
[{ 
  "name": "Nome Completo", 
  "status": "Aprovado" | "Reprovado" | "Transferido" | "Abandono", 
  "grades": { "Português": 8.5, "Matemática": 6.0 }, 
  "absences": 12 
}]`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: image.includes('base64,') ? image.split('base64,')[1] : image,
              mimeType: "image/jpeg"
            }
          }
        ]);

        const text = result.response.text().replace(/```json|```/g, "").trim();
        
        return new Response(text, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        console.warn(`Falha no modelo ${modelName}:`, err.message);
        lastError = err;
        // Se for erro de quota ou sobrecarga, tenta o próximo modelo
        if (err.message.includes('503') || err.message.includes('429') || err.message.includes('404')) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Todos os modelos de IA falharam por excesso de demanda');

  } catch (error: any) {
    console.error('Erro no processamento final:', error);
    return new Response(JSON.stringify({ 
      error: "O serviço de IA está temporariamente sobrecarregado. Por favor, tente novamente em alguns segundos.",
      detalhes: error.message 
    }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

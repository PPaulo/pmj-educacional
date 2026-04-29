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
    
    // Usando gemini-flash-latest que é o alias mais estável para cotas
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
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

  } catch (error: any) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      detalhes: error.stack 
    }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

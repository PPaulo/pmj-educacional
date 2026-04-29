import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured in Edge Function' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Iniciando processamento de imagem com Gemini...');

    // 2. Call Google Gemini 1.5 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um assistente especializado em extração de dados de atas escolares brasileiras de resultados finais. 
Extraia os dados dos alunos e suas respectivas notas para o formato JSON.

REGRAS DE EXTRAÇÃO:
- Se o campo de faltas for anual, use o valor total.
- As matérias padrão são: Português, Matemática, História, Geografia, Ciências, Artes, Educação Física.
- Retorne um array de objetos seguindo EXATAMENTE este esquema:
[{ 
  "name": "Nome Completo", 
  "status": "Aprovado" | "Reprovado" | "Transferido" | "Abandono", 
  "grades": { "Português": 8.5, "Matemática": 6.0 }, 
  "absences": 12 
}]`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: image
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do Gemini:', errorText);
      return new Response(JSON.stringify({ error: `Erro na API do Gemini: ${response.status} - ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Resposta do Gemini recebida com sucesso.');
    
    if (!result.candidates || result.candidates.length === 0) {
       console.error('Gemini retornou estrutura sem candidatos:', JSON.stringify(result));
       throw new Error('O Gemini não retornou nenhum resultado para esta imagem.');
    }

    let content = result.candidates[0].content.parts[0].text.trim();
    
    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) throw new Error('OPENAI_API_KEY não configurada no Supabase');

    console.log("Processando com OpenAI GPT-4o-mini...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Você é um assistente especializado em extração de dados de atas escolares brasileiras.
Extraia os dados dos alunos e suas respectivas notas para o formato JSON.

REGRAS DE EXTRAÇÃO:
- As matérias padrão são: Português, Matemática, História, Geografia, Ciências, Artes, Educação Física.
- Retorne um array de objetos seguindo EXATAMENTE este esquema:
[{ 
  "name": "Nome Completo", 
  "status": "Aprovado" | "Reprovado" | "Transferido" | "Abandono", 
  "grades": { "Português": 8.5, "Matemática": 6.0 }, 
  "absences": 12 
}]
Retorne APENAS o JSON puro, sem explicações.` 
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: `data:image/jpeg;base64,${image.includes('base64,') ? image.split('base64,')[1] : image}` 
                } 
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Erro na OpenAI: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tenta extrair o array de dentro do JSON retornado (OpenAI as vezes encapsula em um objeto)
    const parsed = JSON.parse(content);
    const finalArray = Array.isArray(parsed) ? parsed : (Object.values(parsed).find(v => Array.isArray(v)) || parsed);

    return new Response(JSON.stringify(finalArray), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro no processamento OpenAI:', error);
    return new Response(JSON.stringify({ 
      error: "Falha ao processar documento com OpenAI.",
      detalhes: error.message 
    }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

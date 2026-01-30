import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { messages } = await req.json();
        const apiKey = Deno.env.get('AI_API_KEY');

        if (!apiKey) {
            throw new Error('AI_API_KEY not set');
        }

        // Default to Grok (xAI) or OpenAI compatible endpoint
        const API_URL = 'https://api.x.ai/v1/chat/completions';
        // const API_URL = 'https://api.openai.com/v1/chat/completions';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'grok-2-latest', // or 'gpt-4o-mini' etc.
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('AI API Error:', data);
            throw new Error(data.error?.message || 'Failed to fetch from AI provider');
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

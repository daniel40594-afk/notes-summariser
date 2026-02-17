
import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarChunks } from '@/lib/rag';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';

// Reuse existing OpenRouter config
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { question, sessionId, workspaceId } = await req.json();

        if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

        // 1. Retrieve Context
        console.log(`[Chat API] Retrieval for: "${question}" (Workspace: ${workspaceId || 'All'})`);
        const results = await searchSimilarChunks(question, workspaceId, 5);

        const contextText = results.map(r => `[source: ${r.chunk.metadata.filename}]\n${r.chunk.content}`).join('\n\n');
        console.log(`[Chat API] Retrieved ${results.length} chunks.`);

        if (results.length === 0) {
            // Optional: If no docs, chat normally? Or warn?
            // User requirement: "If answer not found... respond 'Answer not found'"
            // We'll let the LLM decide based on context.
        }

        // 2. Construct Prompt
        const systemPrompt = `You are a document assistant. Answer only using the provided context.
        
Context:
${contextText || "No context found."}

Question:
${question}

If the answer is not found in the context, respond:
"Answer not found in the document."

Return clear and structured answers.`;

        // 3. Call OpenRouter
        const response = await openai.chat.completions.create({
            model: 'meta-llama/llama-3-8b-instruct', // User requested model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
            ],
            stream: true,
        });

        // 4. Stream Response
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

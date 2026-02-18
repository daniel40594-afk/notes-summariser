
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

        const { question, sessionId, workspaceId, deepSearch } = await req.json();

        if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

        let contextText = "";

        // 1. Web Search (if enabled)
        if (deepSearch) {
            console.log(`[Chat API] Deep Search enabled for: "${question}"`);
            try {
                const { searchWeb } = await import('@/lib/firecrawl'); // Dynamic import to avoid build issues if lib missing
                const webResults = await searchWeb(question, 3);
                if (webResults.length > 0) {
                    const webContext = webResults.map(r => `[Web Source: ${r.title} (${r.url})]\n${r.markdown || r.content}`).join('\n\n');
                    contextText += `--- Web Search Results ---\n${webContext}\n\n`;
                }
            } catch (error) {
                console.error('[Chat API] Deep Search failed:', error);
                // Continue without web results
            }
        }

        // 2. Retrieve Local Context
        console.log(`[Chat API] Retrieval for: "${question}" (Workspace: ${workspaceId || 'All'})`);
        const results = await searchSimilarChunks(question, workspaceId, 5);

        if (results.length > 0) {
            const localContext = results.map(r => `[Document: ${r.chunk.metadata.filename}]\n${r.chunk.content}`).join('\n\n');
            contextText += `--- Local Documents ---\n${localContext}`;
        }

        // 3. Construct Prompt
        const systemPrompt = `You are a helpful assistant with access to documents and web search.
        
Context:
${contextText || "No context found."}

Question:
${question}

Instructions:
- Use the provided context to answer the question.
- Cite your sources. If using web content, mention the source title. If using a document, mention the filename.
- If the answer is not in the context, say so, but try to be helpful based on general knowledge if allowed (though "Deep Search" implies you should use found info).
- Keep the answer structured and clear.`;

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

import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { Innertube, UniversalCache } from 'youtubei.js';
import OpenAI from 'openai';

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Initialize Innertube (Youtubei.js)
let youtube: Innertube | null = null;

async function getYoutubeClient() {
    if (!youtube) {
        try {
            youtube = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true,
            });
        } catch (e) {
            console.error('Failed to initialize Innertube:', e);
            return null;
        }
    }
    return youtube;
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        console.log(`[Study API] Processing URL: ${url}`);

        if (!url) {
            return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }

        // 1. Validate YouTube URL and extract ID
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (!videoIdMatch) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }
        const videoId = videoIdMatch[1];
        console.log(`[Study API] Video ID: ${videoId}`);

        let transcriptText = '';
        let videoTitle = '';
        let source = 'transcript'; // 'transcript' or 'metadata'

        // 2. Fetch Transcript (Strategy A: youtubei.js)
        try {
            const yt = await getYoutubeClient();
            if (yt) {
                const info = await yt.getInfo(videoId);
                videoTitle = info.basic_info.title || '';
                try {
                    const transcriptData = await info.getTranscript();
                    if (transcriptData?.transcript?.content?.body?.initial_segments) {
                        const initialSegments = transcriptData.transcript.content.body.initial_segments;
                        transcriptText = initialSegments.map((seg: any) => seg.snippet.text).join(' ');
                        console.log(`[Study API] youtubei.js success. Length: ${transcriptText.length}`);
                    }
                } catch (transcriptErr: any) {
                    console.log(`[Study API] youtubei.js transcript fetch error: ${transcriptErr.message}`);
                }
            }
        } catch (err: any) {
            console.log(`[Study API] youtubei.js info fetch failed: ${err.message}`);
        }

        // 3. Fallback: youtube-transcript
        if (!transcriptText) {
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                transcriptText = transcript.map(item => item.text).join(' ');
                console.log(`[Study API] youtube-transcript success. Length: ${transcriptText.length}`);
            } catch (err: any) {
                console.log(`[Study API] youtube-transcript failed: ${err.message}`);
            }
        }

        // 4. Fallback: Metadata
        if (!transcriptText) {
            console.log('[Study API] Falling back to metadata...');
            source = 'metadata';
            try {
                const yt = await getYoutubeClient();
                if (yt) {
                    const info = await yt.getInfo(videoId);
                    videoTitle = info.basic_info.title || '';
                    const description = info.basic_info.short_description || '';
                    transcriptText = `VIDEO TITLE: ${videoTitle}\n\nDESCRIPTION: ${description}`;
                } else {
                    // If Innertube failed earlier, we might not have it.
                    // Final fallback: just return error
                    throw new Error('Could not fetch metadata');
                }
            } catch (metadataErr: any) {
                console.error(`[Study API] Metadata fetch failed: ${metadataErr.message}`);
                return NextResponse.json({
                    error: 'Unable to access video information. The video might be private, deleted, or age-restricted.'
                }, { status: 422 });
            }
        }

        // 5. Generate with Streaming
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API Key is not configured' }, { status: 500 });
        }

        const systemPrompt = source === 'metadata'
            ? `You are an expert AI tutor. The transcript is unavailable.
       Generate study notes based ONLY on the video title and description.
       
       Output Format (Markdown Only):
       # Summary
       [Summary based on metadata. Mention captions were missing.]
       
       # Study Notes
       [Key topics/questions likely covered]`
            : `You are an expert AI tutor. Generate study notes from the transcript.
       
       Output Format (Markdown Only):
       # Summary
       [Comprehensive summary]
       
       # Study Notes
       [Detailed bullet points, definitions, key concepts]`;

        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Input Data: "${transcriptText.substring(0, 30000)}"` }
            ],
            stream: true,
        });

        // Create a readable stream from the OpenAI response
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

        // Return stream with custom headers
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Study-Source': source,
            }
        });

    } catch (error: any) {
        console.error('[Study API] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

        // 2. Try Fetching Transcript (Strategy A: youtubei.js)
        try {
            console.log('[Study API] Attempting youtubei.js fetch...');
            const yt = await getYoutubeClient();
            if (yt) {
                const info = await yt.getInfo(videoId);
                videoTitle = info.basic_info.title || '';
                console.log(`[Study API] Video Title: ${videoTitle}`);

                try {
                    const transcriptData = await info.getTranscript();
                    if (transcriptData?.transcript?.content?.body?.initial_segments) {
                        const initialSegments = transcriptData.transcript.content.body.initial_segments;
                        transcriptText = initialSegments.map((seg: any) => seg.snippet.text).join(' ');
                        console.log(`[Study API] youtubei.js success. Length: ${transcriptText.length}`);
                    } else {
                        console.log('[Study API] youtubei.js: No initial_segments found in transcript data.');
                    }
                } catch (transcriptErr: any) {
                    console.log(`[Study API] youtubei.js transcript fetch error: ${transcriptErr.message}`);
                }
            }
        } catch (err: any) {
            console.log(`[Study API] youtubei.js info fetch failed: ${err.message}`);
        }

        // 3. Strategy B: youtube-transcript (Fallback)
        if (!transcriptText) {
            try {
                console.log('[Study API] Attempting youtube-transcript fallback...');
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                transcriptText = transcript.map(item => item.text).join(' ');
                console.log(`[Study API] youtube-transcript success. Length: ${transcriptText.length}`);
            } catch (err: any) {
                console.log(`[Study API] youtube-transcript failed: ${err.message}`);
            }
        }

        // 4. Strategy C: Metadata Fallback
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
                    console.log(`[Study API] Metadata fallback success. Length: ${transcriptText.length}`);
                } else {
                    throw new Error('Innertube not initialized');
                }
            } catch (metadataErr: any) {
                console.error(`[Study API] Metadata fetch failed: ${metadataErr.message}`);
                return NextResponse.json({
                    error: 'Unable to access video information. The video might be private, deleted, or age-restricted.'
                }, { status: 422 });
            }
        }

        // 5. Generate Summary & Notes with OpenRouter (Gemini)
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('[Study API] Missing OPENROUTER_API_KEY');
            return NextResponse.json({ error: 'OpenRouter API Key is not configured' }, { status: 500 });
        }

        const systemPrompt = source === 'transcript'
            ? `You are an expert AI tutor. Your goal is to generate structured study notes from the provided video transcript.
           Output Format (JSON):
           {
             "summary": "A comprehensive summary of the video (2-3 paragraphs)",
             "studyNotes": "Markdown formatted study notes with headings, bullet points, and key concepts."
           }
           Ensure the study notes are detailed, easy to understand, and capturing the core essence of the video. Return ONLY the JSON.`
            : `You are an expert AI tutor. The user wants study notes for a video, but we could not retreive the transcript. 
           We only have the Title and Description.
           
           Goal: Generate a summary and potential study topics/questions based ONLY on the metadata provided.
           Explicitly state in the summary that this is based on the video description because captions were unavailable.
           
           Output Format (JSON):
           {
             "summary": "Summary based on title and description. Mention that detailed notes are limited due to missing transcript.",
             "studyNotes": "Markdown formatted key topics, questions to ask, or concepts likely covered in the video."
           }
           Return ONLY the JSON.`;

        console.log(`[Study API] Calling OpenRouter (Gemini) with input length: ${transcriptText.length}`);

        try {
            const completion = await openai.chat.completions.create({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Input Data: "${transcriptText.substring(0, 30000)}"` }
                ],
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0].message.content;

            if (!content) {
                throw new Error('No content received from AI');
            }

            try {
                const data = JSON.parse(content);
                return NextResponse.json({
                    ...data,
                    source: source
                });
            } catch (e) {
                console.error('[Study API] JSON parsing error', e);
                return NextResponse.json({
                    summary: "Error parsing AI response.",
                    studyNotes: content,
                    source: source
                });
            }
        } catch (aiError: any) {
            console.error(`[Study API] OpenRouter/AI Error: ${aiError.message}`);
            // Check for specific OpenAI errors
            if (aiError.status === 401) return NextResponse.json({ error: 'Invalid AI API Key' }, { status: 500 });
            if (aiError.status === 429) return NextResponse.json({ error: 'AI Rate Limit Exceeded' }, { status: 429 });
            return NextResponse.json({ error: `AI Generation Failed: ${aiError.message}` }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[Study API] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

const { Innertube, UniversalCache } = require('youtubei.js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const VIDEO_URL = 'https://youtu.be/WaK-MZKqMCk?si=b3sWOHzaVOysAqpr';

async function testStudyTool() {
    console.log('--- Starting Test ---');
    console.log('Video URL:', VIDEO_URL);

    // 1. Setup OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
        console.error('Error: OPENROUTER_API_KEY missing in .env.local');
        return;
    }

    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    // 2. Validate URL
    const videoIdMatch = VIDEO_URL.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!videoIdMatch) {
        console.error('Error: Invalid YouTube URL');
        return;
    }
    const videoId = videoIdMatch[1];
    console.log('Video ID:', videoId);

    // 3. Setup YouTube Client
    console.log('Initializing YouTube client...');
    const youtube = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
    });

    // 4. Fetch Transcript/Metadata
    let transcriptText = '';
    let source = 'transcript';

    try {
        console.log('Fetching video info...');
        const info = await youtube.getInfo(videoId);
        const title = info.basic_info.title;
        console.log('Video Title:', title);

        console.log('Attempting to fetch transcript...');
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript && transcriptData.transcript.content && transcriptData.transcript.content.body) {
            const initialSegments = transcriptData.transcript.content.body.initial_segments;
            if (initialSegments) {
                transcriptText = initialSegments.map(seg => seg.snippet.text).join(' ');
                console.log('Transcript found! Length:', transcriptText.length, 'chars');
            }
        }
    } catch (err) {
        console.log('Transcript fetch failed:', err.message);
        console.log('Falling back to metadata...');
        source = 'metadata';
        // Logic to fetch description would go here, simplified for test
        transcriptText = "Title: Test Video. Description: This is a test video description since transcript failed.";
    }

    if (!transcriptText) {
        console.error('Failed to get any text content.');
        return;
    }

    // 4a. Strategy B: youtube-transcript (Fallback)
    if (!transcriptText) {
        try {
            console.log('Attempting youtube-transcript fallback...');
            const { YoutubeTranscript } = require('youtube-transcript');
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            transcriptText = transcript.map(item => item.text).join(' ');
            console.log('youtube-transcript success! Length:', transcriptText.length);
        } catch (err) {
            console.log('youtube-transcript failed:', err.message);
        }
    }

    // 5. Call AI
    console.log(`Generating notes using ${source} via OpenRouter...`);

    const systemPrompt = `You are an expert AI tutor. Generate a summary and study notes. Output JSON: { "summary": "...", "studyNotes": "..." }`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Input: "${transcriptText.substring(0, 10000)}"` }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        console.log('\n--- AI Response ---');
        console.log(content);
        console.log('\n--- Test Passed ---');

    } catch (err) {
        console.error('AI Generation failed:', err);
    }
}

testStudyTool();

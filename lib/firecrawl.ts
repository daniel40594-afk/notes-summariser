
export interface FirecrawlSearchResult {
    url: string;
    title: string;
    markdown?: string;
    content?: string;
}

export const searchWeb = async (query: string, limit: number = 3): Promise<FirecrawlSearchResult[]> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.warn('FIRECRAWL_API_KEY is not set. Skipping web search.');
        return [];
    }

    try {
        console.log(`[Firecrawl] Searching for: "${query}"`);
        const response = await fetch('https://api.firecrawl.dev/v0/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query,
                searchOptions: {
                    limit
                },
                pageOptions: {
                    fetchPageContent: true // We need content for RAG
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Firecrawl] API Error: ${response.status} ${errorText}`);
            return [];
        }

        const data = await response.json();
        // Firecrawl v0 search response structure: { success: true, data: [ ... ] }
        if (!data.success || !data.data) {
            console.warn('[Firecrawl] No data returned.');
            return [];
        }

        return data.data.map((item: any) => ({
            url: item.url,
            title: item.title || item.metadata?.title || 'Web Result',
            markdown: item.markdown || item.content || ''
        }));

    } catch (error) {
        console.error('[Firecrawl] Request failed:', error);
        return [];
    }
};

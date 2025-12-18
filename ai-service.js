// ==================== //
// AI SERVICE           //
// ==================== //

class AIService {
    constructor() {
        this.apiKey = CONFIG.api.openai.apiKey;
        this.endpoint = CONFIG.api.openai.endpoint;
        this.model = CONFIG.api.openai.model;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
        CONFIG.api.openai.apiKey = key;
    }

    async enhanceDocumentation(markdown, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Please set it in settings.');
        }

        const prompt = this.buildEnhancementPrompt(markdown, options);

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a technical documentation expert. Enhance and improve documentation while maintaining accuracy and clarity.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI Enhancement Error:', error);
            throw error;
        }
    }

    buildEnhancementPrompt(markdown, options) {
        const { 
            improveStructure = true, 
            addExamples = true, 
            enhanceClarity = true,
            addTOC = false 
        } = options;

        let prompt = `Please enhance the following markdown documentation:\n\n${markdown}\n\n`;
        prompt += 'Enhancement requirements:\n';
        
        if (improveStructure) {
            prompt += '- Improve heading structure and organization\n';
        }
        if (addExamples) {
            prompt += '- Add relevant code examples where appropriate\n';
        }
        if (enhanceClarity) {
            prompt += '- Improve clarity and readability\n';
            prompt += '- Fix grammar and spelling\n';
        }
        if (addTOC) {
            prompt += '- Add a table of contents\n';
        }

        prompt += '\nReturn only the enhanced markdown, no explanations.';
        return prompt;
    }

    async generateSummary(markdown) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a technical writer. Create concise summaries of documentation.'
                        },
                        {
                            role: 'user',
                            content: `Summarize this documentation in 2-3 sentences:\n\n${markdown}`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Summary Generation Error:', error);
            throw error;
        }
    }

    async improveHeadings(markdown) {
        if (!this.apiKey) {
            return markdown; // Fallback to original
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You improve documentation headings to be more descriptive and SEO-friendly.'
                        },
                        {
                            role: 'user',
                            content: `Improve the headings in this markdown to be more descriptive:\n\n${markdown}\n\nReturn only the markdown with improved headings.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Heading Improvement Error:', error);
            return markdown;
        }
    }

    async translateContent(markdown, targetLanguage) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const languageName = CONFIG.languages[targetLanguage]?.name || targetLanguage;

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate technical documentation to ${languageName} while preserving markdown formatting and code blocks.`
                        },
                        {
                            role: 'user',
                            content: `Translate this documentation to ${languageName}:\n\n${markdown}\n\nKeep all markdown formatting, code blocks, and technical terms accurate.`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 3000
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Translation Error:', error);
            throw error;
        }
    }

    async generateSearchIndex(pages) {
        // Generate search-optimized metadata for pages
        const index = [];

        for (const page of pages) {
            const keywords = this.extractKeywords(page.content);
            const summary = page.content.substring(0, 200);

            index.push({
                id: page.id || slugify(page.title),
                title: page.title,
                summary: summary,
                keywords: keywords,
                content: page.content,
                sections: page.sections || []
            });
        }

        return index;
    }

    extractKeywords(text) {
        // Simple keyword extraction (can be enhanced with AI)
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);

        // Count frequency
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Get top keywords
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);
    }

    isConfigured() {
        return !!this.apiKey && this.apiKey.length > 0;
    }
}

// Initialize AI service
const aiService = new AIService();

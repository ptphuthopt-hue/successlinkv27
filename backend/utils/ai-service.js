const axios = require('axios');
const AIRouting = require('../models/AIRouting');
const AIProvider = require('../models/AIProvider');

class AIService {
    // Main generation entry point
    static async generateContent(type, context) {
        // 1. Get providers for this type in priority order
        const providers = await AIRouting.getProvidersForType(type);

        if (!providers || providers.length === 0) {
            throw new Error(`No AI providers configured for content type: ${type}`);
        }

        // 2. Try each provider in order
        let lastError = null;
        for (const provider of providers) {
            try {
                console.log(`🤖 Attempting generation for [${type}] using [${provider.display_name}]...`);

                const prompt = this.buildPrompt(type, context);
                const result = await this.callProvider(provider, prompt);

                // Track usage (approximate)
                await AIProvider.updateUsage(provider.id, result.usage?.total_tokens || 0, 0); // TODO: calc cost

                return result.content;
            } catch (error) {
                console.error(`❌ Provider [${provider.display_name}] failed:`, error.message);
                lastError = error;
                // Continue to next provider (fallback)
            }
        }

        throw new Error(`All providers failed for ${type}. Last error: ${lastError?.message}`);
    }

    // Call specific provider API
    static async callProvider(provider, prompt) {
        // Special Provider Mocks (for demo purposes)
        if (provider.model === 'canva-magic-media') {
            return this.mockCanvaResponse(prompt);
        }
        if (provider.model && provider.model.includes('banana')) {
            return this.mockBananaResponse(prompt);
        }

        // Handle different provider APIs
        // Most support OpenAI format (Groq, DeepSeek, OpenRouter, OpenAI)
        // Gemini supports it too via new endpoint, or we map explicitly

        const payload = {
            model: provider.model,
            messages: [
                { role: "system", content: "You are a helpful educational AI assistant. Output JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" } // Force JSON
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.api_key}`
        };

        // Special handling for different endpoints
        let url = provider.endpoint;

        // Gemini (Google AI Studio) specific adjustments if not using OpenAI compat
        if (url.includes('generativelanguage.googleapis.com')) {
            // TODO: Implement native Gemini format if needed, 
            // but mapped to OpenAI format is easier if using OpenRouter or compatible proxy
            // For direct Gemini API:
            return this.callGeminiNative(provider, prompt);
        }

        try {
            // Standard OpenAI-compatible call
            const response = await axios.post(url, payload, { headers });

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('Invalid API response structure from provider');
            }

            const content = response.data.choices[0].message.content;

            try {
                return { content: JSON.parse(content), usage: response.data.usage };
            } catch (e) {
                // Provide raw if json parse fails, but we expect JSON
                console.warn('AI response was not valid JSON, trying to repair...');
                // Simple repair or return raw
                return { content: content, usage: response.data.usage };
            }
        } catch (error) {
            console.error(`Provider Call Failed: ${error.message}`);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    // Mock Responses for Demo
    static mockCanvaResponse(prompt) {
        console.log('🎨 Generating Mock Canva Content...');
        if (prompt.includes('slide')) {
            return {
                content: [
                    { type: 'title', content: '<h1 style="color:#00C4CC">Welcome to Canva Design</h1><p>AI Generated Presentation</p>' },
                    { type: 'content', content: '<h2>Visual Excellence</h2><ul><li>Stunning layouts</li><li>Vibrant colors</li><li>Professional typography</li></ul>' },
                    { type: 'content', content: '<h2>Seamless Integration</h2><p>Designed with Canva magic logic.</p>' }
                ],
                usage: { total_tokens: 100 }
            };
        }
        return { content: {}, usage: { total_tokens: 0 } };
    }

    static mockBananaResponse(prompt) {
        console.log('🍌 Generating Mock Banana Content...');
        if (prompt.includes('infographic')) {
            return {
                content: {
                    url: 'https://via.placeholder.com/1200x2000/FFE135/000000?text=Banana+Pro+Infographic',
                    description: 'High-performance infographic generated by Banana Pro models.'
                },
                usage: { total_tokens: 50 }
            };
        }
        return { content: {}, usage: { total_tokens: 0 } };
    }

    static async callGeminiNative(provider, prompt) {
        const url = `${provider.endpoint}?key=${provider.api_key}`;
        const payload = {
            contents: [{
                parts: [{ text: prompt + "\n\nRespond with valid JSON." }]
            }]
        };

        const response = await axios.post(url, payload);
        const text = response.data.candidates[0].content.parts[0].text;

        // Clean markdown code blocks if present
        const cleanText = text.replace(/```json\n?|```/g, '');

        return {
            content: JSON.parse(cleanText),
            usage: { total_tokens: 0 } // Gemini usage metrics tricky
        };
    }

    // Builder for prompts based on type
    static buildPrompt(type, { title, level, subject }) {
        const base = `Create educational content for a lesson titled "${title}".
                      Target Audience: ${level || 'General'} level students.
                      Subject: ${subject || 'General'}.`;

        switch (type) {
            case 'slide':
                return `${base}
                        Generate 3-5 slides. 
                        Output JSON format:
                        [
                          { "type": "title", "content": "HTML string for title slide" },
                          { "type": "content", "content": "HTML string for content slide (use <ul>, <p>, <h2>)" }
                        ]
                        Do not include markdown formatting in JSON keys, only raw JSON.`;

            case 'quiz':
                return `${base}
                        Generate 5 multiple choice questions.
                        Output JSON format:
                        [
                          { 
                            "id": 1, 
                            "question": "Question text?", 
                            "options": [
                               { "id": "A", "text": "Option A", "correct": true },
                               { "id": "B", "text": "Option B", "correct": false }
                            ],
                            "explanation": "Explanation text"
                          }
                        ]`;

            case 'mindmap':
                return `${base}
                        Generate a mindmap structure.
                        Output JSON format:
                        {
                            "central": "${title}",
                            "branches": [
                                { "title": "Main Branch 1", "subbranches": ["Sub 1", "Sub 2"] }
                            ]
                        }`;

            case 'infographic':
                return `${base}
                        Generate an infographic description.
                        Output JSON format:
                        {
                            "url": "https://via.placeholder.com/1200x800?text=${encodeURIComponent(title)}",
                            "description": "Detailed text description of what the infographic should show..."
                        }`;

            default:
                return `${base} Generate content for ${type}. Output JSON.`;
        }
    }
}

module.exports = AIService;

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'mistral';

export const isAIConfigured = () => {
    return true; // Always true for local Ollama
};

const generate = async (prompt, system = '') => {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                system: system,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Ollama Generation Error:", error);
        throw error;
    }
};

const chat = async (messages) => {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messages,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error("Ollama Chat Error:", error);
        throw error;
    }
};

export const summarizeNote = async (content) => {
    const prompt = `Please provide a concise summary (2-3 lines) and then a detailed paragraph summary of the following note:\n\n${content}`;
    return generate(prompt, "You are a helpful AI assistant specialized in summarizing notes.");
};

export const extractKeyPoints = async (content) => {
    const prompt = `Extract the key points, action items, and important terms from the following note. Format the output with clear headings:\n\n${content}`;
    return generate(prompt, "You are a helpful AI assistant specialized in extracting key information.");
};

export const suggestImprovements = async (content) => {
    const prompt = `Analyze the following note and suggest improvements, missing points, or related concepts:\n\n${content}`;
    return generate(prompt, "You are a helpful AI assistant specialized in critical analysis and improvement.");
};

export const generateTags = async (content) => {
    const prompt = `Generate 3-5 relevant hashtags for the following note. Return only the hashtags separated by spaces (e.g. #React #JavaScript). Do not add any conversational text.\n\n${content}`;
    const text = await generate(prompt, "You are a tag generator. Output only hashtags.");
    const tags = text.match(/#[\w]+/g) || [];
    return tags;
};

export const chatWithNote = async (noteContent, chatHistory, userMessage) => {
    const systemMessage = {
        role: 'system',
        content: `You are an AI assistant helping with this note. Here is the note content context:\n\n${noteContent}\n\nAnswer questions based on this context.`
    };

    // Convert history to Ollama format if needed (it matches {role, content})
    const messages = [
        systemMessage,
        ...chatHistory,
        { role: 'user', content: userMessage }
    ];

    return chat(messages);
};

export const generateFlashcards = async (content) => {
    const prompt = `Generate 8 high-quality flashcards from the following note. Return ONLY a valid JSON array where each object has "front" (question/term) and "back" (answer/definition) properties. Do not use markdown formatting. \n\n${content}`;
    try {
        let text = await generate(prompt, "You are a JSON generator. Output only valid JSON array. No markdown.");
        // Robust cleanup
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return [];
    }
};

export const generateQuiz = async (content) => {
    const prompt = `Generate 5 multiple-choice questions from the following note. Return ONLY a valid JSON array where each object has "question", "options" (array of 4 strings), and "answer" (the correct string from options) properties. Do not use markdown formatting.\n\n${content}`;
    try {
        let text = await generate(prompt, "You are a JSON generator. Output only valid JSON array. No markdown.");
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating quiz:", error);
        return [];
    }
};

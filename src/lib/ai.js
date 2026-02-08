import { GoogleGenerativeAI } from "@google/generative-ai";
import useSettingsStore from "../store/settingsStore";

// --- Ollama Implementation ---
const ollamaGenerate = async (prompt, system, url, model) => {
    try {
        const response = await fetch(`${url}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'mistral',
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

const ollamaChat = async (messages, url, model) => {
    try {
        const response = await fetch(`${url}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'mistral',
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

// --- Gemini Implementation ---
const geminiGenerate = async (prompt, system, apiKey, modelName) => {
    if (!apiKey) throw new Error("API Key is required for Google Gemini");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

        // Gemini doesn't have a direct "system" parameter in the same way as Ollama's generate,
        // but can be prepended or passed as systemInstruction if available in the specific SDK version.
        // For simplicity with basic generateContent, we'll prepend.
        const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw error;
    }
};

const geminiChat = async (messages, apiKey, modelName) => {
    if (!apiKey) throw new Error("API Key is required for Google Gemini");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

        // Convert messages to Gemini format: { role: 'user' | 'model', parts: [{ text: ... }] }
        // Note: Gemini roles are 'user' and 'model'. System instructions are handled differently or prepended.

        let systemInstruction = "";
        const history = [];
        let lastUserMessage = "";

        for (const msg of messages) {
            if (msg.role === 'system') {
                // System message is special, we'll strip it and perhaps prepend to the first user message or handle via systemInstruction
                // For now, simpler to prepend to context
                systemInstruction += `${msg.content}\n`;
            } else if (msg.role === 'user' || msg.role === 'model') {
                history.push({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                });
            }
        }

        // The last message in 'messages' array from AIPanel is usually the new user message.
        // However, AIPanel calls chatWithNote which constructs [system, ...history, userMsg]
        // So history contains everything. We need to separate the "history" for startChat vs the "newMessage".

        // Actually, logic in AIPanel is:
        // const response = await chatWithNote(currentNote.content, historyForApi, userMsg);

        // Let's look at `chatWithNote` below. It builds the array.
        // We need to parse that array back for Gemini SDK's `startChat`.

        // Easier approach: Just use generateContent with the full transcript if the chat history is short,
        // OR use startChat. `startChat` is better for context.

        // Let's assume the LAST message is the new query, and the rest is history.
        const newMessage = history.pop();

        if (!newMessage) throw new Error("No message to send");

        const chat = model.startChat({
            history: history,
            // safetySettings...
        });

        // specific for system instruction if we want to be robust
        if (systemInstruction) {
            // We can't easily inject system instruction into `startChat` history in older SDKs without a dedicated param.
            // Best to just prepend it to the message or the first history item.
            // For 0.24.1 SDK, systemInstruction is supported in getGenerativeModel config.
        }

        const result = await chat.sendMessage(newMessage.parts[0].text);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error; // Propagate error to UI
    }
}


// --- Main Interface ---

const getSettings = () => {
    return useSettingsStore.getState();
};

export const generate = async (prompt, system = '') => {
    const { provider, apiKey, ollamaUrl, model } = getSettings();

    if (provider === 'gemini') {
        return geminiGenerate(prompt, system, apiKey, model);
    } else {
        return ollamaGenerate(prompt, system, ollamaUrl, model);
    }
};

export const chat = async (messages) => {
    const { provider, apiKey, ollamaUrl, model } = getSettings();

    if (provider === 'gemini') {
        return geminiChat(messages, apiKey, model);
    } else {
        return ollamaChat(messages, ollamaUrl, model);
    }
};


// --- Feature Functions ---

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
        content: `You are an AI assistant helping with this note. here is the note content context:\n\n${noteContent}\n\nAnswer questions based on this context. Be concise and helpful.`
    };

    const messages = [
        systemMessage,
        ...chatHistory,
        { role: 'user', content: userMessage }
    ];

    return chat(messages);
};

export const generateFlashcards = async (content) => {
    // Determine provider to adjust prompt slightly if needed (Gemini is better at JSON)
    const prompt = `Generate 8 high-quality flashcards from the following note. Return ONLY a valid JSON array where each object has "front" (question/term) and "back" (answer/definition) properties. Do not use markdown formatting. \n\n${content}`;

    try {
        let text = await generate(prompt, "You are a JSON generator. Output only valid JSON array. No markdown.");

        // Clean up markdown code blocks if present (Gemini sometimes adds them despite instructions)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw error;
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
        throw error;
    }
};

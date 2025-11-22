import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const models = response.data.models;
        console.log('Available Models:');
        models.forEach((model: any) => {
            // Filter for generateContent support
            if (model.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${model.name}`);
                console.log(`  Display Name: ${model.displayName}`);
                console.log(`  Description: ${model.description}`);
                console.log('---');
            }
        });
    } catch (error) {
        console.error('Error listing models:', error.response?.data || error.message);
    }
}

listModels();

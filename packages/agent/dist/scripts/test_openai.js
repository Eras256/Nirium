import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
async function testOpenAI() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        console.error(chalk.red('❌ OPENAI_API_KEY not found in .env.local'));
        return;
    }
    console.log(chalk.cyan('🔗 Testing OpenAI connectivity with key starting with:'), key.substring(0, 15) + '...');
    try {
        const res = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "Nirium Swarm Ready"' }],
            max_tokens: 10
        }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        console.log(chalk.green('✅ OpenAI Response:'), res.data.choices[0].message.content);
        console.log(chalk.green('🚀 OpenAI API is working correctly.'));
    }
    catch (error) {
        console.error(chalk.red('❌ OpenAI Test Failed:'), error.response?.data || error.message);
    }
}
testOpenAI();
//# sourceMappingURL=test_openai.js.map
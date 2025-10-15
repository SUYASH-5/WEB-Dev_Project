const axios = require('axios');
require('dotenv').config();

const runCode = async (source_code, language_id, input = '') => {
    try {
        const options = {
            method: 'POST',
            url: `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Host': process.env.JUDGE0_API_HOST,
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            },
            data: {
                source_code,
                language_id,
                stdin: input
            },
        };

        const response = await axios.request(options);
        return response.data;

    } catch (error) {
        console.error('Judge0 API error:', error.response?.data || error.message);
        throw new Error('Code execution failed');
    }
};

module.exports = { runCode };

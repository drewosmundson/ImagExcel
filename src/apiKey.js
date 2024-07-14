let apiKey = '';

async function setAPIKey() {
    apiKey = document.getElementById('apiKeyInput').value;
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    if (apiKey) {
        const isValid = await checkAPIKey(apiKey);
        if (isValid) {
            apiKeyStatus.innerText = ' ✓';
            apiKeyStatus.style.color = '#008A00';
        } else {
            apiKeyStatus.innerText = ' ✕';
            apiKeyStatus.style.color = '#FF0000';
            apiKey = '';
        }
    } else {
        apiKeyStatus.innerText = '';
    }
}

async function checkAPIKey(key) {
    const apiUrl = 'https://api.openai.com/v1/engines';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${key}` }
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking API key:', error);
        return false;
    }
}

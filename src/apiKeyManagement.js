// apiKeyManagement.js

let apiKey = ''; // Storing the API key globally to use in multiple functions

// Function to set and validate the API key provided by the user
async function setAPIKey() {
    apiKey = document.getElementById('apiKeyInput').value; // Retrieving the API key from the input field
    const apiKeyStatus = document.getElementById('apiKeyStatus'); // Element to display the API key status
    if (apiKey) { // Checking if the API key is not empty
        const isValid = await checkAPIKey(apiKey); // Validating the API key
        if (isValid) { // If the API key is valid
            apiKeyStatus.innerText = ' ✓';
            apiKeyStatus.style.color = '#008A00'; // Changing the color to green
        } else { // If the API key is invalid
            apiKeyStatus.innerText = ' ✕';
            apiKeyStatus.style.color = '#FF0000'; // Changing the color to red
            apiKey = ''; // Clearing the API key
        }
    } else {
        apiKeyStatus.innerText = ''; // Clearing the status text if the API key is empty
    }
}

// Function to check if the provided API key is valid by making a request to the API
async function checkAPIKey(key) {
    const apiUrl = 'https://api.openai.com/v1/engines'; // API endpoint for checking the key
    try {
        const response = await fetch(apiUrl, { // Making a GET request to the API
            method: 'GET',
            headers: { // Setting the Authorization header with the API key
                'Authorization': `Bearer ${key}`
            }
        });
        return response.ok; // Returning true if the response status is OK
    } catch (error) { // Handling any errors during the fetch operation
        console.error('Error checking API key:', error);
        return false; // Returning false if an error occurs
    }
}
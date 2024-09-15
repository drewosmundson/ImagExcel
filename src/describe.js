

function collectImagesFromLots() {
    const lots = document.querySelectorAll('[id^="lot"]');
    const imagesPerLot = [];

    lots.forEach(lot => {
        const lotImage = [];
        const images = lot.querySelectorAll('.preview-image');
        
        images.forEach(img => {
            lotImage.push({
                src: img.src,
                id: img.id
            });
        });

        if (lotImage.length > 0) {
            imagesPerLot.push(lotImage);
        }
    });

    return imagesPerLot;
}


document.getElementById('describeImagesButton').addEventListener('click', async () => {
    const descriptionSpinner = document.getElementById('descriptionSpinner');
    descriptionSpinner.style.display = 'inline-block'; // Show spinner

    if (!apiKey) {
        console.error('API key is not set');
        descriptionSpinner.style.display = 'none'; // Hide spinner
        alert('Error: API key is not set');
        return;
    }
    const templateFileInput = document.getElementById('templateFile');
    if (!templateFileInput || !templateFileInput.files[0]) {
        descriptionSpinner.style.display = 'none'; // Hide spinner
        alert("No template file selected");
        return;
    }

    const allLotImages = collectImagesFromLots();
    if (allLotImages.length === 0) {
        console.error('No photos uploaded');
        descriptionSpinner.style.display = 'none'; // Hide spinner
        alert('Please upload photos before generating descriptions');
        return;
    }
    console.log(allLotImages.length)
    const lotDescriptions = [];
    for (const lotImages of allLotImages) {
        console.log(lotImages.length)
        const descriptions = [];
        for (const imageData of lotImages) {
            // here there is an error here
            // all of the disctiptions get generated ont the first loop?? then go through again one at a time
            
            try {
                const description = await generateDescription(imageData);
                descriptions.push(description);
                console.log(`Description for ${imageData.id}:`, description);
            } catch (error) {
                console.error('Error generating description:', error);
                descriptions.push('Error generating description');
            }
        }
        try {
            const lotDescription = await describeLot(descriptions);
            lotDescriptions.push(lotDescription);
        } catch (error) {
            console.error('Error generating lot description:', error);
            lotDescriptions.push('Error generating lot description');
        } finally { 
            descriptionSpinner.style.display = 'none'; // Hide spinner
        }
    }

    exportDescriptions(lotDescriptions);
});

async function describeLot(imageDescriptions) {

    const prompt = 
        "This whole response should be 50 to 100 words and only one paragraph with no breaks." +
        "write a paragraph about the contents of each index in this array as a group" + 
        imageDescriptions + 
        "the first words in this response must be one of these 43 catagory options that corrispond the best to the object being described in the previous text"+
        "Antiques and Primitives"+
        "Baby and Children's Essentials"+
        "Bath/Health/Medical"+
        "Books/Stamps/Ephemera"+
        "Charity Auction Item"+
        "Clothing/Shoes/Accessories"+
        "Coins and Currency"+
        "Collectibles (Vintage/Rare/Unique)"+
        "Commercial and Industrial"+
        "Computers and Networking"+
        "Dolls and Bears"+
        "Electronics/TVs/Cameras"+
        "Fantasy/Gothic/Mythical"+
        "Fine Art"+
        "Firearms/Weaponry/Military"+
        "Furniture"+
        "Glass/China/Pottery"+
        "Heavy and Farm Equipment"+
        "Historical Artifacts"+
        "Holiday/Sewing/Crafts"+
        "Home Decor and Lighting"+
        "Housewares and Small Appliances"+
        "Jewelry and Watches"+
        "Large Appliances"+
        "Lawn and Garden"+
        "Luggage"+
        "Motor Vehicles/Collector Cars/Marine"+
        "Music/Movies/Video Games"+
        "Musical Instruments"+
        "Odds and Ends (Miscellaneous)"+
        "Office Furniture and Supplies"+
        "Outdoors and Sporting Goods"+
        "Pet Supplies"+
        "Precious Stones and Metals"+
        "Real Estate"+
        "Soft Goods and Textiles"+
        "Sports Memorabilia"+
        "Storage Units"+
        "Tools/Garage/Home Improvement"+
        "Toys and Hobbies"+
        "Trucks/Trailers/Utility"+
        "Wall Art/Mirrors/Clocks"
        
    const model = "gpt-4o"; // Ensure this is the correct model
    const message = {
        role: "user",
        content: [
            { 
                type: "text", 
                text: prompt
            },
            
        ],
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                model, 
                max_tokens: 1000, 
                messages: [message]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API response error:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const description = data.choices && data.choices.length > 0 ? data.choices[0].message.content : "Description not available.";
        return description;
    } catch (error) {
        console.error('Error generating description:', error);
        throw error;
    }
}

async function generateDescription(imageURL) {
    const promt = 
        "This whole response should be 50 to 150 words and only one paragraph with no breaks." +
        "Write a paragraph describing what is in the image. Use vivid and descriptive language for a detailed depiction," +
        "including any text, objects, and their arrangement. Provide context speculation in at least two sentences,"+
        "ensuring each sentence is complete before ending."
    const model = "gpt-4o"; 
    const message = {
        role: "user",
        content: [
            { 
                type: "text", 
                text: promt
            },
            { 
                type: "image_url", 
                image_url: {
                    "url": imageURL.src,
                    "detail": "low"
                },
            }
        ],
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                model, 
                max_tokens: 800, 
                messages: [message]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API response error:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const description = data.choices && data.choices.length > 0 ? data.choices[0].message.content : "Description not available.";
        return description;
    } catch (error) {
        console.error('Error generating description:', error);
        throw error;
    }
}
const templateFile = document.getElementById('templateFile').files[0];

// Function to load the template Excel file
function loadTemplateFile(file) {
    return new Promise((resolve, reject) => {
        if (!(file instanceof Blob)) {
            reject(new Error("Invalid file object"));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            resolve(workbook);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// Function to copy formatting from template to new workbook
function copyFormatting(templateWorkbook, newWorkbook) {
    templateWorkbook.SheetNames.forEach(sheetName => {
        const templateSheet = templateWorkbook.Sheets[sheetName];
        const newSheet = newWorkbook.Sheets[sheetName] || XLSX.utils.aoa_to_sheet([[]]);
        
        // Copy cell styles
        if (templateSheet['!cols']) newSheet['!cols'] = templateSheet['!cols'];
        if (templateSheet['!rows']) newSheet['!rows'] = templateSheet['!rows'];
        if (templateSheet['!merges']) newSheet['!merges'] = templateSheet['!merges'];
        
        // Copy individual cell formatting
        Object.keys(templateSheet).forEach(cell => {
            if (cell[0] !== '!') {
                if (!newSheet[cell]) newSheet[cell] = {};
                if (templateSheet[cell].s) newSheet[cell].s = templateSheet[cell].s;
            }
        });
        
        // Ensure the sheet is in the new workbook
        if (!newWorkbook.Sheets[sheetName]) {
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
        }
    });
}

// Main function to export descriptions with formatting
async function exportDescriptions(descriptions) {
    const checkedInput = document.querySelector('input[name="File"]:checked');
    const exportOption = checkedInput ? checkedInput.id : 'Excel'; // Default to 'Excel' if no option is checked

    if (exportOption === 'Excel') {
        try {
            // Get the template file
            const templateFileInput = document.getElementById('templateFile');

            const templateFile = templateFileInput.files[0];

            // Load the template workbook
            const workbook = await loadTemplateFile(templateFile);
            
            // Assume the first sheet is the one we want to modify
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Prepare the data to be added
            const data = descriptions.map((desc, index) => [index + 1, desc]);

            // Add the descriptions to the worksheet
            // Assuming you want to start from cell A2 (A1 might be a header)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "C2" });

            // Generate Excel file in the browser
            XLSX.writeFile(workbook, "ModifiedImageDescriptions.xlsx");
        } catch (error) {
            console.error("Error processing Excel file:", error);
            alert("Error: " + error.message); // Show error to user
        }
    } else {
        console.error("Unsupported export option");
        alert("Unsupported export option");
    }
}
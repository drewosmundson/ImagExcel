

function collectImagesFromLots() {
    const lots = document.querySelectorAll('[id^="lot"]');
    const imagesPerLot = [];

    lots.forEach(lot => {
        const lotImages = [];
        const images = lot.querySelectorAll('.preview-image');
        
        images.forEach(img => {
            lotImages.push({
                src: img.src,
                id: img.id
            });
        });

        if (lotImages.length > 0) {
            imagesPerLot.push(lotImages);
        }
    });

    return imagesPerLot;
}


document.getElementById('describeImagesButton').addEventListener('click', async () => {
    if (!apiKey) {
        console.error('API key is not set');
        alert('Error: API key is not set');
        return;
    }

    const allLotImages = collectImagesFromLots();
    
    if (allLotImages.length === 0) {
        console.error('No photos uploaded');
        alert('Please upload photos before generating descriptions');
        return;
    }
    const lotDescriptions = [];


    for (const lotImages of allLotImages) {
        const descriptions = [];
        for (const imageData of lotImages) {

          
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
        }
    }

    exportDescriptions(lotDescriptions);
});

async function describeLot(imageDescriptions) {
    const model = "gpt-4o"; // Ensure this is the correct model
    const message = {
        role: "user",
        content: [
            { 
                type: "text", 
                text: "This whole response should be 100 to 250 words and only one paragraph with no breaks. write a paragraph about the contents of each index in this array as a group" + imageDescriptions
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
    console.log('Image source:', imageURL);
    const model = "gpt-4o"; // Ensure this is the correct model
    const message = {
        role: "user",
        content: [
            { 
                type: "text", 
                text: "This whole response should be 100 to 250 words and only one paragraph with no breaks. Write a paragraph describing what is in the image. Use vivid and descriptive language for a detailed depiction, including any text, objects, and their arrangement. Provide context speculation in at least two sentences, ensuring each sentence is complete before ending."
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


// Function to export the generated descriptions to an Excel file or a PDF document
function exportDescriptions(descriptions) {
    const exportOption = document.querySelector('input[name="File"]:checked').id;
    const previewImages = document.querySelectorAll('.preview-image');


    if (exportOption === 'Excel') {
        // Existing Excel export logic
        const ws = XLSX.utils.json_to_sheet(descriptions.map((desc, index) => ({ Image: index + 1, Description: desc })), {header: ["Image", "Description"], skipHeader: true});
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Descriptions");
        XLSX.writeFile(wb, "ImageDescriptions.xlsx");

    } else if (exportOption === 'PDF') {
        const doc = new jspdf.jsPDF();
        let yPosition = 10; // Initial y-position for the first text/image
        doc.setFontSize(10); // Set the font size for the description text
        previewImages.forEach((imageElement, index) => {
            const imgData = imageElement.src; // Use the src attribute of the image element as the image data
            const desc = descriptions[index]; // Get the corresponding description

            // Ensure there's enough space for the current image and text block, otherwise add a new page
            if (yPosition + 30 > doc.internal.pageSize.height) { // Adjust 60 based on your image size
                doc.addPage();
                yPosition = 10; // Reset y-position for the new page
            }

            // Adding the image
            doc.addImage(imgData, 'JPEG', 10, yPosition, 50, 50); // Adjust dimensions as needed

            // Adding the description text below the image
            const textYPosition = yPosition + 55; // Adjust based on your image height
            let lines = doc.splitTextToSize(desc, 180); // Split the description text into lines

            doc.text(lines, 10, textYPosition);

            // Update yPosition for the next image and text block, adding a gap for readability
            yPosition += 60 + (lines.length * 10); // Adjust 60 based on your image size plus gap
        });

        doc.save("ImageDescriptions.pdf");
    }
}
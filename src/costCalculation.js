function updateTotalCost() {
    const costPerImageHighRes = 0.00765; // High-resolution vision task cost per image
    const costPerImageLowRes = 0.00085; // Low-resolution vision task cost per image
    const costPerMillionTokens = 10.00; // Cost per 1M tokens for text generation
    const tokensPerDescription = 800; // Estimated tokens for a 200-word description
    const costPerDescription = (tokensPerDescription / 1000000) * costPerMillionTokens; // Cost for generating the description
    
    const numberOfImages = processedFiles.size;
    const isLowResEnabled = document.getElementById('lowResOption').checked;
    const visionCostPerImage = isLowResEnabled ? costPerImageLowRes : costPerImageHighRes;
    
    const totalCostVision = numberOfImages * visionCostPerImage;
    const totalCostDescriptions = numberOfImages * costPerDescription;
    const totalCost = totalCostVision + totalCostDescriptions;

    document.getElementById('totalCost').innerText = totalCost.toFixed(2);
}

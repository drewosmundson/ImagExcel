

function createNewLotFieldset(lotNumber) {
    // Create a new fieldset
    const newFieldset = document.createElement('fieldset');
    newFieldset.id = `lot${lotNumber}`;
    
    // Create a label for the lot number
    const lotLabel = document.createElement('legend');
    lotLabel.textContent = `Lot ${lotNumber}`;
    newFieldset.appendChild(lotLabel);


    // Create a new input element
    const imageUpload = document.createElement('input');
    imageUpload.type = 'file'; // Set input type to file
    imageUpload.name = 'fileUpload'; // Set input name attribute
    imageUpload.id = 'fileUpload'; // Set input id attribute
    imageUpload.multiple = true; // Allow multiple file selections
    newFieldset.appendChild(imageUpload);



        // Create a new button element
    const clearButton = document.createElement('button');

    // Set attributes for the button element
    clearButton.textContent = 'Clear Images'; // Set button text
    clearButton.id = 'clearImagesButton'; // Set button id attribute

    // Attach event listener to the button to clear selected images
    clearButton.addEventListener('click', function() {
        const fileUpload = document.getElementById('fileUpload');
        fileUpload.value = ''; // Clear the value of the file upload input
        const preview = document.getElementById('preview');
        preview.innerHTML = ''; // Clear the preview area
    });

    // Append the button element to a container or specific parent element
   

    // Add content or elements to the new fieldset if needed
    document.getElementById('lotsContainer').appendChild(newFieldset);

}

// Function to handle the "New Lot" button click event
function createNewLot() {
    const lotsContainer = document.getElementById('lotsContainer');
    const currentLotCount = lotsContainer.children.length;
    const newLotNumber = currentLotCount + 1;
    createNewLotFieldset(newLotNumber);
}

// Event listener for the "New Lot" button
document.getElementById('newLotButton').addEventListener('click', createNewLot);
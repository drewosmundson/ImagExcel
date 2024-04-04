// imageHandling.js

let processedFiles = new Set(); // Global list to track files that have been added to the preview

// Adding an event listener to the file upload input to handle file selection
document.getElementById('fileUpload').addEventListener('change', handleFileSelect);

// Function to handle file selection and display image previews
function handleFileSelect(event) {
    const files = event.target.files; // Accessing the selected files
    const previewContainer = document.getElementById('preview'); // Container for image previews
    let fileReadPromises = [];

    for (const file of files) {
        const fileIdentifier = file.name + "-" + file.size; // Creating a unique identifier for the file
        if (!processedFiles.has(fileIdentifier)) {
            let promise = new Promise((resolve, reject) => {
                const reader = new FileReader(); // Creating a FileReader to read file data
                reader.onload = function(event) { // Handler for when file reading is complete
                    const imgElement = document.createElement('img'); // Creating an image element
                    imgElement.src = event.target.result; // Setting the image source to the file data
                    imgElement.classList.add('preview-image'); // Adding a class for styling
                    previewContainer.appendChild(imgElement); // Adding the image to the preview container
                    processedFiles.add(fileIdentifier); // Adding the file identifier to the set of processed files
                    resolve(); // Indicate this file is fully processed
                };
                reader.readAsDataURL(file); // Reading the file as a data URL to display as an image
            });
            fileReadPromises.push(promise);
        }
    }
    Promise.all(fileReadPromises).then(() => {
        updateTotalCost(); // Update the total cost once all files are processed
    });
}

// Function to clear the image previews from the screen and reset processed files list
function clearImages() {
    document.getElementById('preview').innerHTML = ''; // Clearing the inner HTML of the preview container
    processedFiles.clear(); // Resetting the list of processed files
    updateTotalCost();
}
// sending data to python


document.getElementById('convert-button').addEventListener('click', async () => {
    const fileInput = document.querySelectorAll('[id^="fileUpload"]');
    const files = [];


    fileInput.forEach(input => {
        for (let i = 0; i < input.files.length; i++) {
            files.push(input.files[i]);
        }
    });

    if (files.length > 0) {
        try {
            const imagesDataArray = [];

            for (const file of files) {
                const fileContent = await readFileAsDataURL(file);
                imagesDataArray.push(fileContent);
            }

            const jsonObject = { imagesData: imagesDataArray };
            document.getElementById('json-output').textContent = JSON.stringify(jsonObject, null, 2);
            window.ipcRenderer.send('run-python-script', jsonObject);
        } catch (error) {
            console.error('Error reading files:', error);
            alert('Failed to read files');
        }
    } else {
        alert('Please select at least one file');
    }
});

function readFileAsDataURL(file) {

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };


        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Reciving data from python

window.ipcRenderer.on('python-reply', (event, arg) => {
    console.log('Python replied with JSON:', arg);
    const outputElement = document.getElementById('json-output');
    outputElement.innerText = JSON.stringify(arg, null, 2);

    const lotsContainer = document.getElementById('lotsContainer');
    
    // Clear existing lots
    lotsContainer.innerHTML = '';

    // Create a new lot for each group of images
    arg.processed_images.forEach((group, index) => {
        const lotElement = document.createElement('fieldset');
        lotElement.id = `lot${index + 1}`;
        lotElement.innerHTML = `
            <legend>Lot ${index + 1}</legend>
            <div id="preview${index + 1}" class="image-preview"></div>
        `;
        lotsContainer.appendChild(lotElement);

        const previewElement = document.getElementById(`preview${index + 1}`);
        
        // Add images to the lot
        group.forEach((imageData, imgIndex) => {
            const imgElement = document.createElement('img');
            imgElement.src = imageData.image;
            imgElement.className = 'preview-image';
            imgElement.id = `image-${index}-${imgIndex}`; // Unique ID for each image
            imgElement.setAttribute('draggable', 'true');
            imgElement.style = 'margin: 5px; max-width: 100px; max-height: 100px;';
            previewElement.appendChild(imgElement);
        });
    });
    // Update lot count
    window.lotCount = arg.processed_images.length;
    enableDragDrop();
});

// Modify the createNewLot function to use the current lot count
function createNewLot() {
    window.lotCount++;
    const lotsContainer = document.getElementById('lotsContainer');
    const newLot = document.createElement('fieldset');
    newLot.id = `lot${window.lotCount}`;
    newLot.innerHTML = `
        <legend>Lot ${window.lotCount}</legend>
        <input type="file" id="fileUpload${window.lotCount}" multiple />
        <div id="preview${window.lotCount}" class="image-preview"></div>
    `;
    lotsContainer.appendChild(newLot);
    document.getElementById(`fileUpload${window.lotCount}`).addEventListener('change', handleFileSelect);
    makeImagesDraggable();
}

// Make sure to export the createNewLot function if it's used in other files
window.createNewLot = createNewLot;



// drag and drop functionallity


document.addEventListener('DOMContentLoaded', () => {
    enableDragDrop();
});

function enableDragDrop() {
    const lotsContainer = document.getElementById('lotsContainer');

    lotsContainer.addEventListener('dragstart', handleDragStart);
    lotsContainer.addEventListener('dragover', handleDragOver);
    lotsContainer.addEventListener('drop', handleDrop);
    lotsContainer.addEventListener('dragend', handleDragEnd);

    function handleDragStart(e) {
        if (e.target.classList.contains('preview-image')) {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.style.opacity = '0.5';
            console.log('Drag started:', e.target.id);
        }
    }

    function handleDragOver(e) {
        e.preventDefault(); // This is necessary to allow dropping
        if (e.target.classList.contains('image-preview') || e.target.closest('.image-preview')) {
            e.target.closest('.image-preview').classList.add('dragover');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const imagePreview = e.target.closest('.image-preview');
        if (imagePreview) {
            imagePreview.classList.remove('dragover');
            const data = e.dataTransfer.getData('text');
            const draggedElement = document.getElementById(data);
            if (draggedElement) {
                imagePreview.appendChild(draggedElement);
                draggedElement.style.opacity = '1';
                console.log('Dropped:', data, 'into', imagePreview.id);
            } else {
                console.error('Could not find dragged element:', data);
            }
        } else {
            console.error('Drop target is not a valid image preview');
        }
    }

    function handleDragEnd(e) {
        if (e.target.classList.contains('preview-image')) {
            e.target.style.opacity = '1';
        }
        document.querySelectorAll('.image-preview').forEach(preview => {
            preview.classList.remove('dragover');
        });
    }
}

function makeImagesDraggable() {
    const images = document.querySelectorAll('.preview-image');
    images.forEach((img, index) => {
        img.setAttribute('draggable', 'true');
        if (!img.id) {
            img.id = `image-${index}`;
        }
        console.log('Made draggable:', img.id);
    });
}

// Call this function after creating new lots or adding new images
function initializeDragDrop() {
    makeImagesDraggable();
    enableDragDrop();
    console.log('Drag and drop initialized');
}

// Initialize drag and drop
document.addEventListener('DOMContentLoaded', initializeDragDrop);

// Export the function for use in other files
window.initializeDragDrop = initializeDragDrop;
import sys
import json
import base64
import cv2
from pyzbar.pyzbar import decode
import numpy as np


def main():
    input_data = sys.stdin.read().strip()

    try:
        data = json.loads(input_data)
        images_data = data.get('imagesData', [])
        print(f"Received from Electron: {len(images_data)} images", file=sys.stderr)

        processed_images = [[]]  # Initialize with one empty list
        i = 0
        for image_data in images_data:
            header, encoded = image_data.split(",", 1)
            decoded_image = base64.b64decode(encoded)

            # Convert decoded image to numpy array
            np_image = np.frombuffer(decoded_image, dtype=np.uint8)
            image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

            barcode_detected = detect_barcode(image)

            # Re-encode image for the response
            _, buffer = cv2.imencode('.jpg', image)
            processed_image_data = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"

            if barcode_detected:
                i += 1
                if len(processed_images) <= i:
                    processed_images.append([])  # Create a new list for new group

            processed_images[i].append({
                'image': processed_image_data,
            })

        response = {
            'processed_images': processed_images
        }

        print(json.dumps(response))

    except json.JSONDecodeError:
        error_response = {
            'error': 'Invalid JSON received',
            'status': 'failure'
        }
        print(json.dumps(error_response))


def detect_barcode(image):
    # Decode the barcodes in the image
    barcodes = decode(image)

    # Check if any barcode is detected
    if barcodes:
        print("Barcode detected!", file=sys.stderr)
        return True
    else:
        print("No barcode detected.", file=sys.stderr)
        return False


if __name__ == "__main__":
    main()

from io import BytesIO
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from imagenet_labels import IMAGENET_LABELS

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


def predict(image_bytes: bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    inputs = processor(text=IMAGENET_LABELS, images=img, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1).squeeze().tolist()
    ranked = sorted(zip(IMAGENET_LABELS, probs), key=lambda x: -x[1])
    return {
        "label": ranked[0][0],
        "confidence": round(ranked[0][1], 4),
        "top_5": [{"label": l, "score": round(s, 4)} for l, s in ranked[:5]],
    }

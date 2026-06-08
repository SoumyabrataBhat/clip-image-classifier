import httpx
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from model import predict
from imagenet_labels import IMAGENET_LABELS

app = FastAPI(title="Image Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WIKIPEDIA_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/{label}"
HEADERS = {"User-Agent": "ImageClassifier/1.0 (https://github.com/user/image-classifier)"}


def describe(label: str) -> str | None:
    try:
        resp = httpx.get(
            WIKIPEDIA_URL.format(label=label.replace(" ", "_")),
            headers=HEADERS,
            timeout=5,
        )
        resp.raise_for_status()
        text = resp.json().get("extract", "")
        first_sentence = text.split(".")[0].strip()
        return first_sentence if first_sentence else None
    except Exception:
        return None


@app.get("/labels")
def get_labels():
    return {"labels": IMAGENET_LABELS}


@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    contents = await file.read()
    result = predict(contents)
    result["description"] = describe(result["label"])
    return result

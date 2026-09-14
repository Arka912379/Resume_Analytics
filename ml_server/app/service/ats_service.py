"""ATS model loading and prediction utilities."""

from functools import lru_cache
from pathlib import Path
import os
import pickle


DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / "ml_models" / "ats_model.pkl"


def _model_path() -> Path:
    """Allow deployments to override the model location with ATS_MODEL_PATH."""
    configured_path = os.getenv("ATS_MODEL_PATH")
    return Path(configured_path) if configured_path else DEFAULT_MODEL_PATH


@lru_cache(maxsize=1)
def load_ats_model():
    """Load the model once per process, rather than once per request."""
    model_path = _model_path()
    if not model_path.is_file():
        raise RuntimeError(
            f"ATS model file was not found at '{model_path}'. "
            "Add your .pkl file there or set ATS_MODEL_PATH."
        )

    try:
        with model_path.open("rb") as model_file:
            return pickle.load(model_file)
    except (OSError, pickle.UnpicklingError, EOFError) as error:
        raise RuntimeError(f"Could not load ATS model: {error}") from error


def calculate_ats_score(resume_text: str, job_description: str) -> float:
    """Return the first numeric score from a two-text-feature sklearn-style model."""
    model = load_ats_model()

    if not hasattr(model, "predict"):
        raise RuntimeError("The ATS model must provide a predict() method.")

    try:
        # One request is one model row: [resume_text, job_description].
        prediction = model.predict([[resume_text, job_description]])
        return float(prediction[0])
    except (TypeError, ValueError, IndexError, AttributeError) as error:
        raise RuntimeError(f"Could not generate ATS score: {error}") from error

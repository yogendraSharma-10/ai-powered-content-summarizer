import os
from transformers import pipeline
import logging

# Configure logging for the summarizer service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Summarizer:
    """
    A class to encapsulate text summarization logic using Hugging Face transformers.
    It leverages pre-trained models for abstractive summarization, providing
    functionality to generate concise summaries from longer texts.
    """

    def __init__(self, model_name: str = "sshleifer/distilbart-cnn-12-6"):
        """
        Initializes the Summarizer with a specified pre-trained model.

        The default model, "sshleifer/distilbart-cnn-12-6", is a distilled version
        of BART fine-tuned on CNN/DailyMail, known for good performance in summarization.

        Args:
            model_name (str): The name of the Hugging Face model to use for summarization.
                              This can be overridden by an environment variable `SUMMARIZER_MODEL_NAME`.
                              Defaults to "sshleifer/distilbart-cnn-12-6".
        """
        # Allow model name to be overridden by environment variable for flexibility in deployment
        self.model_name = os.getenv("SUMMARIZER_MODEL_NAME", model_name)
        self.summarization_pipeline = None
        self._load_model()

    def _load_model(self):
        """
        Loads the tokenizer and model for summarization using the Hugging Face pipeline.
        This method is called during the Summarizer's initialization.
        """
        try:
            logger.info(f"Attempting to load summarization model: {self.model_name}...")
            # Using a pipeline simplifies the process of tokenization, model inference, and decoding.
            # It automatically handles moving the model to GPU if available and configured.
            self.summarization_pipeline = pipeline(
                "summarization",
                model=self.model_name,
                tokenizer=self.model_name,
                # Optionally, specify device for GPU acceleration if available.
                # For production, consider setting this via an environment variable or config.
                # Example: device=0 if torch.cuda.is_available() else -1
            )
            logger.info(f"Summarization model '{self.model_name}' loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model '{self.model_name}': {e}")
            # Re-raise as a RuntimeError to indicate a critical setup failure
            raise RuntimeError(f"Could not load summarization model '{self.model_name}': {e}")

    def summarize_text(self, text: str, min_length: int = 50, max_length: int = 150) -> str:
        """
        Generates a concise summary for the given input text using the loaded NLP model.

        The summary length can be controlled by `min_length` and `max_length` parameters.
        The model will attempt to generate a summary within these bounds.

        Args:
            text (str): The input text to be summarized.
            min_length (int): The minimum length (in tokens) of the generated summary.
                              Defaults to 50.
            max_length (int): The maximum length (in tokens) of the generated summary.
                              Defaults to 150.

        Returns:
            str: The generated summary text.

        Raises:
            ValueError: If the input text is empty, not a string, or if length parameters are invalid.
            RuntimeError: If the summarization process fails due to an internal model error.
        """
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Input text must be a non-empty string.")
        if not isinstance(min_length, int) or not isinstance(max_length, int) or min_length <= 0 or max_length <= 0:
            raise ValueError("min_length and max_length must be positive integers.")
        if min_length > max_length:
            raise ValueError("min_length cannot be greater than max_length.")

        try:
            logger.info(f"Initiating summarization for text (min_length={min_length}, max_length={max_length}).")

            # The Hugging Face pipeline handles tokenization, model inference, and decoding.
            # `truncation=True` ensures that if the input text is too long for the model's
            # context window, it will be truncated gracefully.
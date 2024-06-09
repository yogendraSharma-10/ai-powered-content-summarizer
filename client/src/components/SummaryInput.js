import React, { useState } from 'react';

/**
 * SummaryInput Component
 *
 * This component provides the user interface for inputting text or a URL
 * to be summarized, along with options for the desired summary length.
 * It manages its own local state for the input value, input type, and
 * selected summary length, and calls a parent-provided callback function
 * upon submission.
 *
 * Props:
 * - onSubmitSummary: Function to call when the user submits the input.
 *                    It receives an object { content, type, length }.
 * - isLoading: Boolean indicating if a summary is currently being generated,
 *              used to disable the form elements.
 */
const SummaryInput = ({ onSubmitSummary, isLoading }) => {
  // State for the main input field (can be text or URL)
  const [inputValue, setInputValue] = useState('');
  // State to toggle between 'text' and 'url' input modes
  const [inputType, setInputType] = useState('text');
  // State for the selected summary length
  const [summaryLength, setSummaryLength] = useState('medium'); // Default to medium
  // State for displaying validation errors
  const [error, setError] = useState('');

  /**
   * Handles changes to the main input field (textarea or URL input).
   * @param {Object} e - The event object from the input change.
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError(''); // Clear error when user starts typing again
  };

  /**
   * Handles changes to the summary length selection.
   * @param {Object} e - The event object from the select change.
   */
  const handleLengthChange = (e) => {
    setSummaryLength(e.target.value);
  };

  /**
   * Handles toggling between 'text' and 'url' input modes.
   * Resets the input value and any errors when switching modes.
   * @param {string} type - The new input type ('text' or 'url').
   */
  const handleInputTypeChange = (type) => {
    setInputType(type);
    setInputValue(''); // Clear input when switching types
    setError('');      // Clear error when switching types
  };

  /**
   * Handles the form submission.
   * Performs basic validation and then calls the onSubmitSummary prop.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      setError(`Please enter ${inputType === 'text' ? 'some text' : 'a URL'} to summarize.`);
      return;
    }

    // Basic URL validation if inputType is 'url'
    if (inputType === 'url') {
      try {
        new URL(inputValue); // Attempt to create a URL object
      } catch (_) {
        setError('Please enter a valid URL.');
        return;
      }
    }

    setError(''); // Clear any previous errors

    // Call the parent component's submission handler
    onSubmitSummary({
      content: inputValue,
      type: inputType,
      length: summaryLength,
    });

    // Optionally clear the input after submission
    // setInputValue('');
  };

  return (
    <div className="summary-input-container card">
      <h2 className="card-title">Generate Summary</h2>
      <form onSubmit={handleSubmit} className="summary-form">
        <div className="input-type-toggle">
          <button
            type="button"
            className={`btn ${inputType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleInputTypeChange('text')}
            disabled={isLoading}
          >
            Summarize Text
          </button>
          <button
            type="button"
            className={`btn ${inputType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleInputTypeChange('url')}
            disabled={isLoading}
          >
            Summarize URL
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="summary-input" className="sr-only">
            {inputType === 'text' ? 'Enter text to summarize' : 'Enter URL to summarize'}
          </label>
          {inputType === 'text' ? (
            <textarea
              id="summary-input"
              className="form-control textarea-input"
              placeholder="Paste your text here..."
              value={inputValue}
              onChange={handleInputChange}
              rows="10"
              disabled={isLoading}
              aria-label="Text to summarize"
            ></textarea>
          ) : (
            <input
              type="url"
              id="summary-input"
              className="form-control text-input"
              placeholder="Paste your URL here (e.g., https://example.com/article)"
              value={inputValue}
              onChange={handleInputChange}
              disabled={isLoading}
              aria-label="URL to summarize"
            />
          )}
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="form-group summary-options">
          <label htmlFor="summary-length" className="label-text">Summary Length:</label>
          <select
            id="summary-length"
            className="form-control select-input"
            value={summaryLength}
            onChange={handleLengthChange}
            disabled={isLoading}
            aria-label="Select summary length"
          >
            <option value="short">Short (approx. 1-2 paragraphs)</option>
            <option value="medium">Medium (approx. 3-4 paragraphs)</option>
            <option value="long">Long (more detailed)</option>
            {/* Future enhancement: Add custom length option, e.g., percentage */}
            {/* <option value="custom">Custom (e.g., 25%)</option> */}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Summarizing...
            </>
          ) : (
            'Summarize Content'
          )}
        </button>
      </form>
    </div>
  );
};

export default SummaryInput;
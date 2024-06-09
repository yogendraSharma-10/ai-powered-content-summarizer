import React from 'react';
import PropTypes from 'prop-types';

/**
 * SummaryOutput Component
 *
 * Displays the generated summary, a loading indicator, an error message,
 * or a placeholder message based on the current state.
 *
 * @param {object} props - The component props.
 * @param {string} props.summary - The generated summary text.
 * @param {boolean} props.loading - Indicates if the summary is currently being generated.
 * @param {string|null} props.error - An error message if summary generation failed.
 */
const SummaryOutput = ({ summary, loading, error }) => {
  return (
    <div className="summary-output-container">
      {/* Display loading indicator when summary is being generated */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div> {/* CSS will define the spinner animation */}
          <p>Generating summary, please wait...</p>
        </div>
      )}

      {/* Display error message if an error occurred and not currently loading */}
      {error && !loading && (
        <div className="error-message">
          <h3>Error:</h3>
          <p>{error}</p>
          <p>Please check your input or try again later.</p>
          {/* In a microservice context, we might suggest checking related services */}
          <p className="microservice-hint">
            If issues persist, check the status of the NLP service or the main API gateway.
          </p>
        </div>
      )}

      {/* Display the summary if available, not loading, and no error */}
      {!loading && !error && summary && summary.trim() !== '' && (
        <div className="summary-content">
          <h3>Generated Summary:</h3>
          <p className="summary-text">{summary}</p>
          {/* Could add options here for sharing or further actions, e.g., "Share to Blog Platform" */}
        </div>
      )}

      {/* Display a placeholder message if nothing is happening */}
      {!loading && !error && (!summary || summary.trim() === '') && (
        <div className="placeholder-message">
          <p>Your concise summary will appear here.</p>
          <p>Enter text or a URL in the input field above and click "Summarize".</p>
        </div>
      )}
    </div>
  );
};

/**
 * Prop Types for SummaryOutput component.
 * Ensures that the props passed to this component are of the expected type.
 */
SummaryOutput.propTypes = {
  summary: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

/**
 * Default Props for SummaryOutput component.
 * Provides default values for props that are not explicitly passed.
 */
SummaryOutput.defaultProps = {
  summary: '',
  error: null,
};

export default SummaryOutput;
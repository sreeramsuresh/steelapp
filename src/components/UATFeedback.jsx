import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

const UATFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'bug',
    severity: 'medium',
    subject: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    page: window.location.pathname
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show in UAT environment
  if (import.meta.env.VITE_APP_ENV !== 'uat') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would submit to a feedback API
      const feedbackData = {
        ...feedback,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        user: 'UAT User' // Would get from auth context
      };

      console.log('UAT Feedback Submitted:', feedbackData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Thank you for your feedback! It has been submitted to the development team.');
      
      // Reset form
      setFeedback({
        type: 'bug',
        severity: 'medium',
        subject: '',
        description: '',
        steps: '',
        expected: '',
        actual: '',
        page: window.location.pathname
      });
      setIsOpen(false);
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="uat-feedback-button"
        title="Report Issue or Provide Feedback"
      >
        <MessageSquare size={20} />
        <span>UAT Feedback</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="uat-feedback-overlay">
          <div className="uat-feedback-modal">
            <div className="uat-feedback-header">
              <h3>UAT Feedback</h3>
              <button onClick={() => setIsOpen(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="uat-feedback-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={feedback.type}
                    onChange={(e) => setFeedback({...feedback, type: e.target.value})}
                    required
                  >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement</option>
                    <option value="question">Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={feedback.severity}
                    onChange={(e) => setFeedback({...feedback, severity: e.target.value})}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Current Page</label>
                <input
                  type="text"
                  value={feedback.page}
                  onChange={(e) => setFeedback({...feedback, page: e.target.value})}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={feedback.subject}
                  onChange={(e) => setFeedback({...feedback, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={feedback.description}
                  onChange={(e) => setFeedback({...feedback, description: e.target.value})}
                  placeholder="Detailed description of the issue or feedback"
                  rows={4}
                  required
                />
              </div>

              {feedback.type === 'bug' && (
                <>
                  <div className="form-group">
                    <label>Steps to Reproduce</label>
                    <textarea
                      value={feedback.steps}
                      onChange={(e) => setFeedback({...feedback, steps: e.target.value})}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expected Behavior</label>
                      <textarea
                        value={feedback.expected}
                        onChange={(e) => setFeedback({...feedback, expected: e.target.value})}
                        placeholder="What should happen?"
                        rows={2}
                      />
                    </div>

                    <div className="form-group">
                      <label>Actual Behavior</label>
                      <textarea
                        value={feedback.actual}
                        onChange={(e) => setFeedback({...feedback, actual: e.target.value})}
                        placeholder="What actually happened?"
                        rows={2}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .uat-feedback-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
          z-index: 1000;
          transition: all 0.2s;
        }

        .uat-feedback-button:hover {
          background: #e55a2e;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }

        .uat-feedback-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .uat-feedback-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .uat-feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .uat-feedback-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .close-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .uat-feedback-form {
          padding: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .form-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-actions button[type="button"] {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .form-actions button[type="button"]:hover {
          background: #e5e7eb;
        }

        .form-actions button[type="submit"] {
          background: #3b82f6;
          border: 1px solid #3b82f6;
          color: white;
        }

        .form-actions button[type="submit"]:hover:not(:disabled) {
          background: #2563eb;
        }

        .form-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .uat-feedback-button {
            bottom: 10px;
            right: 10px;
            padding: 10px 16px;
          }

          .uat-feedback-button span {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .uat-feedback-modal {
            margin: 10px;
            max-height: calc(100vh - 20px);
          }
        }
      `}</style>
    </>
  );
};

export default UATFeedback;
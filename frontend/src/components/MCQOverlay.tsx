import React, { useState } from 'react';
import axios from 'axios';
import './MCQOverlay.css';

interface MCQ {
  _id: string;
  conceptTitle: string;
  question: string;
  options: string[];
  correctAnswer: string;
  timestamp: number;
}

interface MCQOverlayProps {
  mcq: MCQ;
  videoId: string;
  onSubmit: (answer: string, isCorrect: boolean, replayTimestamp?: number) => void;
}

const MCQOverlay: React.FC<MCQOverlayProps> = ({ mcq, videoId, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
  }>({ show: false, correct: false, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (!feedback.show) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert('Please select an option');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Extract letter from option (e.g., "A. option text" -> "A")
      const answerLetter = selectedOption.charAt(0);

      const response = await axios.post(
        'http://localhost:5000/api/progress/mcq-answer',
        {
          videoId,
          mcqId: mcq._id,
          answer: answerLetter,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { correct, correctAnswer, shouldReplayFromTimestamp, attempts } = response.data;

      if (correct) {
        setFeedback({
          show: true,
          correct: true,
          message: `✅ Correct! Well done!`,
        });

        // Wait 2 seconds before continuing
        setTimeout(() => {
          onSubmit(answerLetter, true);
        }, 2000);
      } else {
        const correctOption = mcq.options.find((opt) => opt.startsWith(correctAnswer));
        setFeedback({
          show: true,
          correct: false,
          message: `❌ Incorrect. The correct answer is: ${correctOption}. The video will replay from this concept.`,
        });

        // Wait 3 seconds before replaying
        setTimeout(() => {
          onSubmit(answerLetter, false, shouldReplayFromTimestamp);
          setFeedback({ show: false, correct: false, message: '' });
          setSelectedOption('');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error submitting MCQ answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mcq-overlay">
      <div className="mcq-content">
        <div className="mcq-header">
          <h3>{mcq.conceptTitle}</h3>
        </div>

        <div className="mcq-question">
          <p>{mcq.question}</p>
        </div>

        <div className="mcq-options">
          {mcq.options.map((option, index) => (
            <div
              key={index}
              className={`mcq-option ${
                selectedOption === option ? 'selected' : ''
              } ${
                feedback.show && option.startsWith(mcq.correctAnswer)
                  ? 'correct-answer'
                  : ''
              } ${
                feedback.show &&
                selectedOption === option &&
                !option.startsWith(mcq.correctAnswer)
                  ? 'wrong-answer'
                  : ''
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>

        {feedback.show && (
          <div className={`mcq-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
            <p>{feedback.message}</p>
          </div>
        )}

        {!feedback.show && (
          <button
            className="mcq-submit-btn"
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQOverlay;

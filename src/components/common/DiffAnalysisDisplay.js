import React from 'react';
import styled from 'styled-components';
import { SmartTypingEvaluator } from '../utils/smartTypingEvaluator';

const DiffContainer = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 15px;
  line-height: 2;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  word-wrap: break-word;
  color: #e0e0e0;
  max-height: 600px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const CorrectWord = styled.span`
  color: #4caf50 !important;
  font-weight: 600;
  background-color: rgba(76, 175, 80, 0.15);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid rgba(76, 175, 80, 0.3);
`;

const OmittedWord = styled.span`
  background-color: rgba(244, 67, 54, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px dashed rgba(244, 67, 54, 0.6);
  display: inline-block;
  margin: 0 2px;
  color: #f44336;
`;

const IncorrectWord = styled.span`
  color: #f44336 !important;
  font-weight: 600;
  background-color: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  padding: 2px 5px;
  border-radius: 4px;
  margin: 0 2px;
`;

const OriginalStruck = styled.span`
  background-color: rgba(220, 53, 69, 0.1);
  padding: 1px 3px;
  border-radius: 2px;
  display: inline-block;
  opacity: 0.8;
  margin-right: 2px;
`;

const AddedWord = styled.span`
  color: #ff9800 !important;
  font-weight: 600;
  border: 2px solid rgba(255, 152, 0, 0.6);
  padding: 3px 8px;
  border-radius: 5px;
  background-color: rgba(255, 152, 0, 0.15);
  margin: 2px;
  display: inline-block;
`;

const DiffAnalysisDisplay = ({ originalText, typedText }) => {
  const evaluator = new SmartTypingEvaluator(originalText, typedText);
  const evaluation = evaluator.evaluate();
  
  // Create a map of original word positions to their status
  const originalWordStatus = new Map();
  
  // Build status map directly from word analysis
  let omissionCount = 0;
  let correctCount = 0;
  let spellingErrorCount = 0;
  
  // First, initialize all words as omitted (default state)
  evaluator.originalWords.forEach((word, index) => {
    originalWordStatus.set(index, {
      word: word,
      status: 'OMISSION',
      typedWord: null
    });
  });
  
  // Then update with actual analysis results
  evaluation.wordAnalysis.forEach((analysis, i) => {
    if (analysis.originalPosition >= 0 && analysis.originalPosition < evaluator.originalWords.length) {
      const currentStatus = originalWordStatus.get(analysis.originalPosition);
      
      if (analysis.status === 'OMISSION') {
        omissionCount++;
      } else if (analysis.status === 'CORRECT') {
        correctCount++;
        originalWordStatus.set(analysis.originalPosition, {
          word: analysis.originalWord,
          status: 'CORRECT',
          typedWord: analysis.typedWord
        });
      } else if (analysis.status === 'SPELLING_ERROR') {
        spellingErrorCount++;
        originalWordStatus.set(analysis.originalPosition, {
          word: analysis.originalWord,
          status: 'SPELLING_ERROR',
          typedWord: analysis.typedWord
        });
      }
    }
  });
  
  // Generate JSX elements for each word
  const renderWords = () => {
    const elements = [];
    
    evaluator.originalWords.forEach((originalWord, index) => {
      const wordStatus = originalWordStatus.get(index);
      
      switch (wordStatus.status) {
        case 'CORRECT':
          elements.push(
            <CorrectWord key={`correct-${index}`}>
              {wordStatus.typedWord}
            </CorrectWord>
          );
          elements.push(' ');
          break;

        case 'OMISSION':
          elements.push(
            <OmittedWord key={`omitted-${index}`}>
              {originalWord}
            </OmittedWord>
          );
          elements.push(' ');
          break;

        case 'SPELLING_ERROR':
          elements.push(
            <span key={`spelling-${index}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              margin: '0 2px'
            }}>
              <span style={{
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.15)',
                textDecoration: 'line-through',
                textDecorationColor: '#f44336',
                textDecorationThickness: '2px',
                padding: '2px 4px',
                borderRadius: '3px',
                fontWeight: '500'
              }}>
                {originalWord}
              </span>
              <span style={{
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                border: '1px solid rgba(244, 67, 54, 0.5)',
                padding: '2px 5px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                → {wordStatus.typedWord}
              </span>
            </span>
          );
          elements.push(' ');
          break;

        case 'ADDITION': // This case should ideally not be hit for original words
        case 'SUBSTITUTION': // This case should ideally not be hit for original words
        default:
          // All unmatched words should be treated as omitted
          elements.push(
            <OmittedWord key={`omitted-default-${index}`}>
              {originalWord}
            </OmittedWord>
          );
          elements.push(' ');
      }
    });
    
    // Add any extra words that were typed but not in original
    const addedWords = evaluation.wordAnalysis.filter(analysis => 
      analysis.status === 'ADDITION' && analysis.originalPosition === -1
    );
    
    if (addedWords.length > 0) {
      elements.push(<br key="br1" />);
      elements.push(<br key="br2" />);
      elements.push(
        <div key="extra-section" style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <strong key="extra-label" style={{ 
            color: '#ff9800', 
            fontSize: '0.95rem',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Extra words added:
          </strong>
          {addedWords.map((analysis, idx) => (
            <AddedWord key={`added-${idx}`}>
              + {analysis.typedWord}
            </AddedWord>
          ))}
        </div>
      );
    }
    
    return elements;
  };
  
  const renderedWords = renderWords();
  

  return (
    <DiffContainer>
      {renderedWords}
    </DiffContainer>
  );
};

export default DiffAnalysisDisplay;

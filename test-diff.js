// Test the DiffAnalysisDisplay component with obvious mistakes
const React = require('react');
const { SmartTypingEvaluator } = require('./src/components/utils/smartTypingEvaluator.js');

// Test case with obvious mistakes
const originalText = "The quick brown fox jumps over the lazy dog";
const typedText = "The brown fox jumps over lazy"; // Missing "quick", "the", "dog"

console.log('🧪 TESTING DIFF ANALYSIS WITH OBVIOUS MISTAKES\n');
console.log(`Original: "${originalText}"`);
console.log(`Typed: "${typedText}"`);
console.log('Expected: "quick", "the", "dog" should be marked as omitted (red strikethrough)\n');

// Test the evaluator
const evaluator = new SmartTypingEvaluator(originalText, typedText);
const result = evaluator.evaluate();

console.log('📊 EVALUATION RESULTS:');
console.log(`Full Mistakes: ${result.fullMistakes}`);
console.log(`Half Mistakes: ${result.halfMistakes}`);
console.log(`Accuracy: ${result.accuracy}%`);

console.log('\n🔍 WORD ANALYSIS:');
result.wordAnalysis.forEach((analysis, i) => {
  if (analysis.status === 'CORRECT') {
    console.log(`${i + 1}. ✅ "${analysis.typedWord}" -> "${analysis.originalWord}" (CORRECT)`);
  } else if (analysis.status === 'OMISSION') {
    console.log(`${i + 1}. ❌ [MISSING] -> "${analysis.originalWord}" (OMITTED - should be red strikethrough)`);
  } else {
    console.log(`${i + 1}. ⚠️ "${analysis.typedWord || 'N/A'}" -> "${analysis.originalWord || 'N/A'}" (${analysis.status})`);
  }
});

console.log('\n🎯 EXPECTED IN UI:');
console.log('- "The" should be GREEN (correct)');
console.log('- "quick" should be RED STRIKETHROUGH (omitted)');
console.log('- "brown" should be GREEN (correct)');
console.log('- "fox" should be GREEN (correct)');
console.log('- "jumps" should be GREEN (correct)');
console.log('- "over" should be GREEN (correct)');
console.log('- "the" should be RED STRIKETHROUGH (omitted)');
console.log('- "lazy" should be GREEN (correct)');
console.log('- "dog" should be RED STRIKETHROUGH (omitted)');

console.log('\n💡 If everything shows as green in the UI, there might be an issue with:');
console.log('1. The DiffAnalysisDisplay component rendering');
console.log('2. The word status mapping');
console.log('3. The CSS/styling of the strikethrough elements');

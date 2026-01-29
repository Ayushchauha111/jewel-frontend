// Simple test runner for exam calculators
// Can be run with: node runTests.js (if Node.js environment)
// Or imported in browser console

import { SSCCalculator, RailwayCalculator, StandardCalculator, getExamCalculator } from './examCalculators';

// Test data from user's example
const originalPassage = `The counsel strongly criticized the contention of the state of West Bengal that entry List one of 7th schedule restricts the parliament's legislative power and section six of the special police act restricts the central government's power also the constitutional courts are to be restricted from the same provisions is without foundation. Because the supreme court and the high courts are under obligation to protect the citizens and enforce their fundamental rights under articles 32 and 226 of the constitution respectively. It was further argued that the contention of the appellants that the courts by handing over the investigation to the CBI without the consent of the concerned state government violate the federal structure of the constitution, is misrepresented as it overlooks the basic fact that in a federal structure, it is the duty of the Courts to support the constitutional values and to enforce the limitations set out in the constitution. The learned counsel stated that the power of judicial review conferred on the supreme court and the high courts is a part of basic structure. Therefore, no limitation can be imposed on such power. The courts are discharging their duties under articles 32 or 226 as the case may be. Hence it is wrong to say that it is overriding the doctrine of separation of power. Though, undoubtedly, the constitution exhibits supremacy of parliament over state legislatures yet the principle of federal supremacy laid down in article of the constitution cannot be resorted to unless there is an irreconcilable direct conflict between the entries in the union and the state lists. Thus, there is no quarrel with the broad proposition that under the constitution there is a clear demarcation of legislative powers between the union and the states and they have to confine themselves within the field entrusted to them. It may also be borne in mind that the function of the lists is not to confer powers they merely demarcate the legislative field. But the issue`;

const typedPassage = `The counsel strongly criticized the contention of the state of West Bengal that entry List one of 7th schedule restricts the parliaments's legislative power and section six of the special police act restricts the central government's power also the constitutional courts are to be restricted from the same provisions is without foundation. Because the supreme court and the high courts are under obligatiojn to protect the citizens and enforce their fundamental rights under articles 32 and 226 of the constitution respectively. It was further argued that the contention of the appellants that the courts by handling over the investigation to the CBI without the consent of the concerned state government violate the federal structure of the constitutiton, is misrepresented as it overlooks the basic fact that in a federal structure, it is the duty of the Courts to support the constitutional values and to enforce the limitations set out in the constitution. The learned counsel stated that the power of judicial review conferred on the supreme court and the high courts is a part of basic structure. Therefore, no limitation can be imposed on such power. The courts are discharging their duties under articles 32 or 226 as the case may be. Hence it tis wrong to say that is is overriding the doctrine of seperation of power. Though, undoubtedly, the constitution exhibits supermacy of parliament over state legislatures yet the principle of federal supermacy laid down in article of the constitution cannot be resorted to unless there is an irreconcilable direct conflict between the entries in the union and the state lists. Thus, there is no quarrel with the broad proposition that under the constitution there is a clear demarcation of legislative powers between the union and the states and they have to confine themselves within the field entrusted to them. It may also be borne in mind that the function of the lists is not to confer powers they merely demarcate the legislative field. But the issue`;

function runTests() {
  console.log('🧪 Running Exam Calculator Tests...\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  const results = [];

  function test(name, fn) {
    try {
      const result = fn();
      if (result) {
        passed++;
        console.log(`✅ PASS: ${name}`);
        results.push({ name, status: 'PASS' });
      } else {
        failed++;
        console.log(`❌ FAIL: ${name}`);
        results.push({ name, status: 'FAIL' });
      }
    } catch (error) {
      failed++;
      console.log(`❌ FAIL: ${name} - Error: ${error.message}`);
      results.push({ name, status: 'FAIL', error: error.message });
    }
  }

  // Test 1: Spelling Error - "parliaments's" vs "parliament's"
  console.log('\n📝 Test 1: Spelling Error Detection');
  test('Should detect "parliaments\'s" as spelling error', () => {
    const calc = new SSCCalculator("parliament's", "parliaments's", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0;
  });

  // Test 2: Spelling Error - "obligatiojn" vs "obligation"
  test('Should detect "obligatiojn" as spelling error', () => {
    const calc = new SSCCalculator("obligation", "obligatiojn", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0;
  });

  // Test 3: Spelling Error - "constitutiton" vs "constitution"
  test('Should detect "constitutiton" as spelling error', () => {
    const calc = new SSCCalculator("constitution", "constitutiton", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0;
  });

  // Test 4: Spelling Error - "seperation" vs "separation"
  test('Should detect "seperation" as spelling error', () => {
    const calc = new SSCCalculator("separation", "seperation", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0;
  });

  // Test 5: Spelling Error - "supermacy" vs "supremacy"
  test('Should detect "supermacy" as spelling error', () => {
    const calc = new SSCCalculator("supremacy", "supermacy", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0;
  });

  // Test 6: Word Repetition
  console.log('\n🔄 Test 6: Word Repetition');
  test('Should detect word repetition "shall shall"', () => {
    const calc = new SSCCalculator("I shall be grateful.", "I shall shall be grateful.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0 && result.mistakeDetails.some(d => d.category === 'REPETITION');
  });

  // Test 7: Incomplete Word
  console.log('\n✂️ Test 7: Incomplete Word');
  test('Should detect incomplete word "import"', () => {
    const calc = new SSCCalculator("This is important.", "This is import.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0 && result.mistakeDetails.some(d => d.category === 'INCOMPLETE_WORD');
  });

  // Test 8: Word Omission
  console.log('\n⬇️ Test 8: Word Omission');
  test('Should detect omitted word', () => {
    const calc = new SSCCalculator("The quick brown fox jumps.", "The quick fox jumps.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0 && result.mistakeDetails.some(d => d.category === 'OMISSION');
  });

  // Test 9: Word Addition
  console.log('\n➕ Test 9: Word Addition');
  test('Should detect added word', () => {
    const calc = new SSCCalculator("The quick brown fox.", "The quick brown red fox.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.fullMistakes > 0 && result.mistakeDetails.some(d => d.category === 'ADDITION');
  });

  // Test 10: Spacing Error
  console.log('\n🔤 Test 10: Spacing Error');
  test('Should detect undesired space "h ave"', () => {
    const calc = new SSCCalculator("I have a dream.", "I h ave a dream.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.halfMistakes > 0;
  });

  // Test 11: Capitalization Error
  console.log('\n🔠 Test 11: Capitalization Error');
  test('Should detect capitalization error', () => {
    const calc = new SSCCalculator("Hello world.", "hello world.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.halfMistakes > 0 && result.mistakeDetails.some(d => d.category === 'WRONG_CAPITALISATION');
  });

  // Test 12: Punctuation Error
  console.log('\n📌 Test 12: Punctuation Error');
  test('Should detect missing comma', () => {
    const calc = new SSCCalculator("Hello, world.", "Hello world.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.halfMistakes > 0 && result.mistakeDetails.some(d => d.category === 'PUNCTUATION_ERROR');
  });

  // Test 13: Transposition Error
  console.log('\n🔄 Test 13: Transposition Error');
  test('Should detect transposition "hope I"', () => {
    const calc = new SSCCalculator("I hope you are well.", "hope I you are well.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.halfMistakes > 0 && result.mistakeDetails.some(d => d.category === 'TRANSPOSITION');
  });

  // Test 14: Error Percentage
  console.log('\n📊 Test 14: Error Percentage Calculation');
  test('Perfect typing should have 0% error', () => {
    const calc = new SSCCalculator("The quick brown fox.", "The quick brown fox.", 'UR', 'ENGLISH');
    const result = calc.calculate();
    return parseFloat(result.errorPercentage) === 0;
  });

  // Test 15: Real World Example
  console.log('\n🌍 Test 15: Real World Example');
  test('Should detect errors in real passage', () => {
    const calc = new SSCCalculator(originalPassage, typedPassage, 'UR', 'ENGLISH');
    const result = calc.calculate();
    console.log(`  Full Mistakes: ${result.fullMistakes}`);
    console.log(`  Half Mistakes: ${result.halfMistakes}`);
    console.log(`  Total Error Score: ${result.totalErrorScore}`);
    console.log(`  Error Percentage: ${result.errorPercentage}%`);
    console.log(`  Total Words Typed: ${result.totalWordsTyped || 'N/A'}`);
    return result.fullMistakes >= 2; // Should detect at least 2 obvious errors
  });

  // Test 16: Railway Calculator
  console.log('\n🚂 Test 16: Railway Calculator');
  test('Should meet minimum words requirement', () => {
    const original = "word ".repeat(300);
    const typed = original;
    const calc = new RailwayCalculator(original, typed, 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.meetsMinWordsRequirement === true;
  });

  test('Should apply 5% mistake reduction', () => {
    const original = "The quick brown fox. ".repeat(20);
    const typed = original.replace(/quick/g, 'quik');
    const calc = new RailwayCalculator(original, typed, 'UR', 'ENGLISH');
    const result = calc.calculate();
    return result.ignoredMistakes > 0 && result.finalCountOfMistakes < result.totalMistakes;
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  return {
    total: passed + failed,
    passed,
    failed,
    results
  };
}

// Export for use
export default runTests;

// Auto-run if in Node.js environment
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  // Node.js environment - would need proper setup
  console.log('Note: This file is designed for browser/React environment');
  console.log('Import and call runTests() in your React app or browser console');
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.runExamTests = runTests;
  console.log('✅ Test runner loaded. Run: runExamTests()');
}


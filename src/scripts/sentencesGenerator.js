import { CHINESE_MODE, ENGLISH_MODE } from "../constants/Constants";
import {
  ENGLISH_SENTENCES,
  CHINESE_SENTENCES,
} from "../constants/SentencesCollection";
import { randomIntFromRange } from "./randomUtils";

const sentencesGenerator = (sentencesCount, language, test) => {
  if (test.passage != null) {
    const segmenter = new Intl.Segmenter([], { granularity: 'word' });
    const segmentedText = segmenter.segment(test.passage);
    const words = [...segmentedText].filter(s => s.isWordLike).map(s => s.segment);
    const EnglishWordList = words.map(word => ({ key: word, val: word }));
    return EnglishWordList;
}else if (language === ENGLISH_MODE) {
    const EnglishSentencesList = [];
    for (let i = 0; i < sentencesCount; i++) {
      const rand = randomIntFromRange(0, 50);
      EnglishSentencesList.push(ENGLISH_SENTENCES[rand]);
    }
    return EnglishSentencesList;
  }
  if (language === CHINESE_MODE) {
    const ChinseseSentencesList = [];
    for (let i = 0; i < sentencesCount; i++) {
      const rand = randomIntFromRange(0, 55);
      ChinseseSentencesList.push(CHINESE_SENTENCES[rand]);
    }
    return ChinseseSentencesList;
  }
};

export { sentencesGenerator };

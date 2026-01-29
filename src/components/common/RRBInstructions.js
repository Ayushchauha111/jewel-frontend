import React, { useState } from 'react';
import styled from 'styled-components';

const InstructionContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f0f8ff;
  font-family: 'Arial', sans-serif;
`;

const HeaderContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-bottom: 3px solid #0066cc;
  padding: 0;
  margin: 0;
`;

const TopBar = styled.div`
  background: #ffffff;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
`;

const GovtLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const EmblemImg = styled.div`
  width: 50px;
  height: 50px;
  background: #0066cc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  
  &::after {
    content: 'T';
  }
`;

const HeaderTitle = styled.div`
  text-align: center;
  flex: 1;
`;

const MainTitle = styled.h1`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.2;
`;

const SubTitle = styled.h2`
  font-size: 14px;
  color: #666;
  margin: 2px 0 0 0;
  font-weight: normal;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  min-height: calc(100vh - 120px);
`;

const InstructionTitle = styled.h2`
  color: #0066cc;
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 10px;
`;

const LanguageSelector = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LanguageSelect = styled.select`
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const InstructionSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const InstructionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InstructionItem = styled.li`
  margin-bottom: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-left: 4px solid #0066cc;
  font-size: 14px;
  line-height: 1.6;
`;

const ImportantNote = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 5px;
  padding: 15px;
  margin: 20px 0;
  font-weight: bold;
  color: #856404;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid #ddd;
`;

const NavButton = styled.button`
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  
  &.primary {
    background: #0066cc;
    color: white;
    
    &:hover {
      background: #0052a3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
`;

const VersionInfo = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 12px;
  border-top: 1px solid #ddd;
  background: #f8f9fa;
`;

const TypogramInstructions = ({ onBeginTest, testName = "TYPING TEST" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState('English');

  const instructionsPage1 = {
    Hindi: {
      title: "टाइपिंग टेस्ट निर्देश - कृपया ध्यानपूर्वक पढ़ें",
      sections: [
        {
          title: "A. सामान्य निर्देश:",
          items: [
            "1. टाइपिंग टेस्ट की अवधि: आपके द्वारा चुने गए समय के अनुसार (आमतौर पर 1, 3, 5, या 10 मिनट)",
            "2. टेस्ट का प्रकार: टाइपिंग स्पीड और सटीकता टेस्ट",
            "3. आपको दिए गए पैसेज को बिल्कुल वैसा ही टाइप करना है जैसा दिखाया गया है।",
            "4. गलत टाइप किए गए अक्षरों के लिए सटीकता कम हो जाएगी।",
            "5. टाइपिंग शुरू करने के लिए टेक्स्ट बॉक्स में क्लिक करें और टाइप करना शुरू करें।",
            "6. भाषा: आप अंग्रेजी या हिंदी में टाइपिंग टेस्ट ले सकते हैं।",
            "7. समय समाप्त होने पर टेस्ट अपने आप समाप्त हो जाएगा।"
          ]
        }
      ]
    },
    English: {
      title: "Typing Test Instructions - Please read carefully",
      sections: [
        {
          title: "A. General Instructions:",
          items: [
            "1. Test Duration: Based on your selected time (typically 1, 3, 5, or 10 minutes)",
            "2. Test Type: Typing speed and accuracy assessment",
            "3. You need to type the given passage exactly as shown on the screen.",
            "4. Incorrect characters will reduce your accuracy score.",
            "5. Click on the text box and start typing to begin the test.",
            "6. Language: You can take typing tests in English or Hindi.",
            "7. The test will automatically end when time expires."
          ]
        }
      ]
    }
  };

  const instructionsPage2 = {
    Hindi: {
      title: "टाइपिंग टिप्स और महत्वपूर्ण बातें",
      sections: [
        {
          title: "B. टाइपिंग टिप्स:",
          items: [
            "• सही पोस्चर बनाए रखें - सीधे बैठें और कीबोर्ड को आरामदायक दूरी पर रखें",
            "• सभी उंगलियों का उपयोग करें - टच टाइपिंग तकनीक का प्रयोग करें",
            "• स्क्रीन को देखते रहें, कीबोर्ड को न देखें",
            "• गलतियों को तुरंत सुधारने की कोशिश करें",
            "• शांत रहें और अपनी गति बनाए रखें",
            "• नियमित अभ्यास से आपकी स्पीड और सटीकता में सुधार होगा",
            "• विराम चिह्नों और स्पेसिंग पर विशेष ध्यान दें"
          ]
        },
        {
          title: "C. स्कोरिंग सिस्टम:",
          items: [
            "• WPM (Words Per Minute): आपकी टाइपिंग स्पीड को मापता है",
            "• सटीकता: सही टाइप किए गए अक्षरों का प्रतिशत",
            "• गलत अक्षर लाल रंग में दिखाए जाएंगे",
            "• सही अक्षर हरे रंग में दिखाए जाएंगे",
            "• अभी तक न टाइप किए गए अक्षर ग्रे रंग में दिखेंगे"
          ]
        }
      ]
    },
    English: {
      title: "Typing Tips and Important Points",
      sections: [
        {
          title: "B. Typing Tips:",
          items: [
            "• Maintain proper posture - sit straight and keep keyboard at comfortable distance",
            "• Use all fingers - practice touch typing technique",
            "• Keep looking at the screen, don't look at the keyboard",
            "• Try to correct mistakes immediately",
            "• Stay calm and maintain your rhythm",
            "• Regular practice will improve your speed and accuracy",
            "• Pay special attention to punctuation and spacing"
          ]
        },
        {
          title: "C. Scoring System:",
          items: [
            "• WPM (Words Per Minute): Measures your typing speed",
            "• Accuracy: Percentage of correctly typed characters",
            "• Incorrect characters will be shown in red color",
            "• Correct characters will be shown in green color",
            "• Untyped characters will appear in gray color"
          ]
        }
      ]
    }
  };

  const currentInstructions = currentPage === 1 ? instructionsPage1[language] : instructionsPage2[language];

  const handleNext = () => {
    if (currentPage === 1) {
      setCurrentPage(2);
    } else {
      onBeginTest();
    }
  };

  const handlePrevious = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  return (
    <InstructionContainer>
      <HeaderContainer>
        <TopBar>
          <GovtLogo>
            <EmblemImg />
          </GovtLogo>
          <HeaderTitle>
            <MainTitle>TYPOGRAM - TYPING TEST PLATFORM</MainTitle>
            <SubTitle>Professional Typing Speed & Accuracy Assessment</SubTitle>
          </HeaderTitle>
          <NotificationIcon>!</NotificationIcon>
        </TopBar>
      </HeaderContainer>

      <ContentContainer>
        <LanguageSelector>
          <span>View in:</span>
          <LanguageSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </LanguageSelect>
        </LanguageSelector>

        <InstructionTitle>
          {currentPage === 1 ? "Instructions" : "Other Important Instructions"}
        </InstructionTitle>

        <InstructionSection>
          <SectionTitle>{currentInstructions.title}</SectionTitle>
          
          {currentInstructions.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && <SectionTitle>{section.title}</SectionTitle>}
              <InstructionList>
                {section.items.map((item, itemIndex) => (
                  <InstructionItem key={itemIndex}>
                    {item}
                  </InstructionItem>
                ))}
              </InstructionList>
            </div>
          ))}
        </InstructionSection>

        {currentPage === 2 && (
          <ImportantNote>
            टाइपिंग टेस्ट शुरू करने से पहले सभी निर्देशों को ध्यान से पढ़ें। नियमित अभ्यास से आपकी टाइपिंग स्किल में सुधार होगा।
            <br />
            Please read all instructions carefully before starting the typing test. Regular practice will improve your typing skills.
          </ImportantNote>
        )}

        <NavigationButtons>
          <NavButton 
            className="secondary" 
            onClick={handlePrevious}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </NavButton>
          
          <NavButton 
            className="primary" 
            onClick={handleNext}
          >
            {currentPage === 1 ? "Next →" : "I am ready to begin"}
          </NavButton>
        </NavigationButtons>
      </ContentContainer>

      <VersionInfo>
        Version - 17.07.00
      </VersionInfo>
    </InstructionContainer>
  );
};

export default TypogramInstructions;

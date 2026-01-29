// Text alignment helper to ensure passage and typing boxes have identical line wrapping

export const calculateTextDimensions = (text, font, fontSize, containerWidth, padding) => {
  // Create a temporary canvas to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${font}`;
  
  const availableWidth = containerWidth - (padding * 2);
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = context.measureText(testLine).width;
    
    if (testWidth <= availableWidth || currentLine === '') {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

export const formatTextWithConsistentWrapping = (text, containerWidth = 600, fontSize = 18, padding = 10) => {
  // Use a more reliable method for consistent wrapping
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  // Approximate character width based on font size (rough estimation)
  const avgCharWidth = fontSize * 0.6; // Approximate character width
  const availableWidth = containerWidth - (padding * 2);
  const maxCharsPerLine = Math.floor(availableWidth / avgCharWidth);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    if (testLine.length <= maxCharsPerLine || currentLine === '') {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
};

export const useTextAlignment = (text, containerRef) => {
  const [formattedText, setFormattedText] = React.useState(text);
  
  React.useEffect(() => {
    if (containerRef.current && text) {
      const containerWidth = containerRef.current.offsetWidth;
      const computedStyle = window.getComputedStyle(containerRef.current);
      const fontSize = parseInt(computedStyle.fontSize);
      const padding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);
      
      const formatted = formatTextWithConsistentWrapping(text, containerWidth, fontSize, padding);
      setFormattedText(formatted);
    }
  }, [text, containerRef]);
  
  return formattedText;
};

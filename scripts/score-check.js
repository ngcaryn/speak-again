function normalizeSpeechText(input, language) {
  const simplifiedMap = {
    幫: '帮',
    謝: '谢',
    藥: '药',
    醫: '医',
    臺: '台',
    覺: '觉',
    嗎: '吗',
    請: '请',
    聽: '听',
    說: '说',
    話: '话',
  };

  let text = input
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[.,!?;:'"()\[\]{}，。！？；：「」『』（）]/g, ' ')
    .trim();

  if (language.includes('zh')) {
    return text
      .split('')
      .map((char) => simplifiedMap[char] || char)
      .join('')
      .replace(/\s+/g, '');
  }

  return text.replace(/\s+/g, ' ');
}

function editDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(a, b, language) {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  if (language.includes('zh')) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  }

  const wordsA = a.split(' ').filter(Boolean);
  const wordsB = b.split(' ').filter(Boolean);
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = [...setA].filter((word) => setB.has(word)).length;
  const tokenScore = (2 * intersection) / (setA.size + setB.size || 1);

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const charScore = (longer.length - editDistance(longer, shorter)) / longer.length;

  return tokenScore * 0.55 + charScore * 0.45;
}

const testCases = [
  { target: 'Thank you', spoken: 'thank you', language: 'en' },
  { target: 'Thank you', spoken: 'thank u', language: 'en' },
  { target: 'Medicine', spoken: 'water', language: 'en' },
  { target: '幫助', spoken: '帮助', language: 'zh-TW' },
  { target: '謝謝', spoken: '谢谢', language: 'zh-TW' },
  { target: '藥物', spoken: '食物', language: 'zh-TW' },
  { target: '水', spoken: '', language: 'zh-CN' },
];

for (const testCase of testCases) {
  const normalizedTarget = normalizeSpeechText(testCase.target, testCase.language);
  const normalizedSpoken = normalizeSpeechText(testCase.spoken, testCase.language);
  const score = Math.round(similarity(normalizedTarget, normalizedSpoken, testCase.language) * 100);
  console.log(`${testCase.target} | ${testCase.spoken || '(empty)'} | ${testCase.language} => ${score}`);
}

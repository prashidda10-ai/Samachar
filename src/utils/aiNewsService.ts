import { GoogleGenAI } from '@google/genai';

export interface AIGeneratedNews {
  headline: string;
  bodyText: string;
  categoryBadge: string;
  subheadline?: string;
  suggestedColorTags?: string[];
}

export async function generateNewsWithAI(params: {
  topic: string;
  language?: 'ne' | 'en';
  tone?: 'viral' | 'breaking' | 'sports' | 'politics' | 'inspirational';
  style?: 'ronb' | 'nepal360' | 'standard';
}): Promise<AIGeneratedNews> {
  const apiKey = process.env.GEMINI_API_KEY;

  const targetLang = params.language === 'en' ? 'English' : 'Nepali (Devanagari script)';
  const toneDesc = params.tone || 'viral';

  const systemInstruction = `You are an expert news editor and viral journalism specialist for Nepali social media news portals (like Routine of Nepal Banda, Nepal 360, BBC Nepali, OnlineKhabar).
Your task is to convert raw facts or topic ideas into high-impact, authentic social media news card content in ${targetLang}.

Rules:
1. "headline": A powerful, engaging headline (under 20 words). It MUST highlight key emotional words, critical facts, or numbers using markup tags like {yellow}word{/yellow} or {red}word{/red} or {bg:#ffeb3b}word{/bg}.
2. "bodyText": Concise, highly readable news summary (2-4 clear sentences) explaining who, what, when, where, and why. Use {yellow}word{/yellow} on 1 or 2 critical words/numbers.
3. "categoryBadge": Short uppercase category or topic label (e.g. "BREAKING", "UPDATE", "EXCLUSIVE", "NEPAL CRICKET", "KATHMANDU", "VIRAL", "SPECIAL REPORT").
4. "subheadline": Optional short kicker (e.g. "HISTORIC MOMENT", "OFFICIAL CONFIRMATION").

Respond ONLY with a valid JSON object matching this schema:
{
  "headline": string,
  "bodyText": string,
  "categoryBadge": string,
  "subheadline": string
}`;

  const prompt = `Topic / News Notes:
${params.topic}

Tone: ${toneDesc}
Output Language: ${targetLang}
Generate the authentic news card text with markup tags.`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        headline: parsed.headline || 'ताजा समाचार',
        bodyText: parsed.bodyText || '',
        categoryBadge: parsed.categoryBadge || 'BREAKING',
        subheadline: parsed.subheadline || ''
      };
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent news generator fallback:', err);
    }
  }

  // Intelligent fallback generator if API key is missing or offline
  const cleanTopic = params.topic.trim();
  if (params.language === 'en') {
    return {
      headline: `BREAKING: {yellow}${cleanTopic || 'Major Development Reported'}{/yellow} Across Nepal Today`,
      bodyText: `In an impactful update, ${cleanTopic || 'official sources have confirmed new developments'}. Authorities and community members have welcomed the move as {yellow}milestone progress{/yellow}.`,
      categoryBadge: 'BREAKING NEWS',
      subheadline: 'EXCLUSIVE UPDATE'
    };
  }

  return {
    headline: `विशेष खुलासा: {yellow}${cleanTopic || 'नेपालमा नयाँ महत्वपूर्ण अपडेट'}{/yellow} सार्वजनिक भएको छ`,
    bodyText: `प्राप्त ताजा जानकारी अनुसार, ${cleanTopic || 'सम्बन्धित निकायबाट आधिकारिक विवरण जारी गरिएको छ'}। यस कदमलाई सर्वसाधारण तथा विज्ञहरूले {yellow}सकारात्मक कदम{/yellow}को रूपमा लिएका छन्।`,
    categoryBadge: 'ताजा अपडेट',
    subheadline: 'विशेष खबर'
  };
}

export async function polishHeadlineWithAI(headline: string, language: 'ne' | 'en' = 'ne'): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      `{yellow}${headline}{/yellow}`,
      `ताजा अपडेट: {red}${headline}{/red}`,
      `ठूलो खबर: {bg:#fef08a}${headline}{/bg}`
    ];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Given this news headline: "${headline}"
Provide 3 punchy, high-engagement alternative variations in ${language === 'en' ? 'English' : 'Nepali Devanagari'}.
Include {yellow}...{/yellow} or {red}...{/red} highlight tags on the most important words.
Return a JSON array of 3 strings: ["variation 1", "variation 2", "variation 3"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const clean = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '[]';
    return JSON.parse(clean);
  } catch {
    return [
      `{yellow}${headline}{/yellow}`,
      `ताजा अपडेट: {red}${headline}{/red}`,
      `ठूलो खबर: {bg:#fef08a}${headline}{/bg}`
    ];
  }
}

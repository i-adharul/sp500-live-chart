const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const generateInsight = async (stockData) => {
  if (!GEMINI_API_KEY || !genAI) {
    throw { name: 'ServiceUnavailable', message: 'AI service not configured. Please set GEMINI_API_KEY in environment variables.' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze the following stock data and provide a JSON response with the structure:
{
  "summary": "3-4 sentence descriptive analysis in Indonesian language (NO buy/sell recommendations)",
  "sentiment": "Bullish" or "Bearish" or "Neutral",
  "confidence": number between 0-100,
  "highlights": ["2-3 key points as strings"],
  "risk_note": "One risk note as string"
}

Stock Data:
Symbol: ${stockData.symbol}
Company: ${stockData.name}
Sector: ${stockData.sector}
Current Price: $${stockData.current_price}
Change: ${stockData.change_percent}%
52-Week High: $${stockData.week52_high}
52-Week Low: $${stockData.week52_low}
P/E Ratio: ${stockData.pe_ratio}
Market Cap: $${stockData.market_cap}M
Beta: ${stockData.beta}

Recent News Headlines:
${stockData.newsHeadlines ? stockData.newsHeadlines.join('\n') : 'No recent news available.'}

Price History (last 7 days):
${stockData.recentPrices ? stockData.recentPrices.map((p) => `${p.date}: $${p.close}`).join('\n') : 'No recent price data.'}

Respond ONLY with valid JSON, no markdown formatting, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insight = JSON.parse(cleanedText);

    return {
      summary: insight.summary,
      sentiment: insight.sentiment,
      confidence: insight.confidence,
      highlights: insight.highlights,
      risk_note: insight.risk_note,
    };
  } catch (error) {
    console.error('Gemini generateInsight error:', error.message);
    if (error.name === 'ServiceUnavailable') {
      throw error;
    }
    throw new Error('Failed to generate AI insight: ' + error.message);
  }
};

module.exports = {
  generateInsight,
};

const { Stock, Quote, Candle, News, AiInsight } = require('../models');
const finnhubService = require('../services/finnhubService');
const twelveDataService = require('../services/twelveDataService');
const geminiService = require('../services/geminiService');

class StockController {
  static async getAll(req, res, next) {
    try {
      const { sector } = req.query;

      const whereClause = {};
      if (sector && sector !== 'All') {
        whereClause.sector = sector;
      }

      const stocks = await Stock.findAll({
        where: whereClause,
        include: [
          {
            model: Quote,
            attributes: ['current_price', 'change', 'change_percent'],
          },
        ],
        order: [['symbol', 'ASC']],
      });

      const result = stocks.map((stock) => ({
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        price: stock.Quote ? stock.Quote.current_price : null,
        change: stock.Quote ? stock.Quote.change : null,
        change_percent: stock.Quote ? stock.Quote.change_percent : null,
      }));

      res.status(200).json({ stocks: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBySymbol(req, res, next) {
    try {
      const { symbol } = req.params;

      const stock = await Stock.findOne({
        where: { symbol: symbol.toUpperCase() },
        include: [
          {
            model: Quote,
            attributes: ['current_price', 'change', 'change_percent', 'high', 'low', 'open', 'previous_close'],
          },
        ],
      });

      if (!stock) {
        throw { name: 'NotFound', message: 'Stock not found.' };
      }

      res.status(200).json({
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        exchange: stock.exchange,
        country: stock.country,
        logo_url: stock.logo_url,
        market_cap: stock.market_cap,
        pe_ratio: stock.pe_ratio,
        week52_high: stock.week52_high,
        week52_low: stock.week52_low,
        beta: stock.beta,
        quote: stock.Quote
          ? {
              current_price: stock.Quote.current_price,
              change: stock.Quote.change,
              change_percent: stock.Quote.change_percent,
              high: stock.Quote.high,
              low: stock.Quote.low,
              open: stock.Quote.open,
              previous_close: stock.Quote.previous_close,
              fetched_at: stock.Quote.fetched_at,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const { symbol } = req.params;
      const { interval = '1day', range = '1m' } = req.query;

      const stock = await Stock.findOne({ where: { symbol: symbol.toUpperCase() } });
      if (!stock) {
        throw { name: 'NotFound', message: 'Stock not found.' };
      }

      let candles = await Candle.findAll({
        where: {
          stock_id: stock.id,
          interval,
        },
        order: [['datetime', 'ASC']],
      });

      if (candles.length === 0) {
        try {
          const twelveDataCandles = await twelveDataService.getTimeSeries(symbol.toUpperCase(), range);

          if (twelveDataCandles.length > 0) {
            const candleRecords = twelveDataCandles.map((c) => ({
              stock_id: stock.id,
              datetime: c.datetime,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
              volume: c.volume,
              interval,
            }));

            await Candle.bulkCreate(candleRecords, {
              ignoreDuplicates: true,
            });

            candles = await Candle.findAll({
              where: {
                stock_id: stock.id,
                interval,
              },
              order: [['datetime', 'ASC']],
            });
          }
        } catch (apiError) {
          console.error(`Failed to fetch from Twelve Data for ${symbol}:`, apiError.message);
        }
      }

      const result = candles.map((c) => ({
        datetime: c.datetime,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getNews(req, res, next) {
    try {
      const { symbol } = req.params;
      const { limit = 10 } = req.query;

      const stock = await Stock.findOne({ where: { symbol: symbol.toUpperCase() } });
      if (!stock) {
        throw { name: 'NotFound', message: 'Stock not found.' };
      }

      let news = await News.findAll({
        where: { stock_id: stock.id },
        order: [['published_at', 'DESC']],
        limit: parseInt(limit, 10),
      });

      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const needsRefresh = news.length === 0 || news[0].published_at < sixHoursAgo;

      if (needsRefresh) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          const finnhubNews = await finnhubService.getCompanyNews(symbol.toUpperCase(), weekAgo, today);

          if (finnhubNews.length > 0) {
            await News.destroy({ where: { stock_id: stock.id } });

            const newsRecords = finnhubNews.map((n) => ({
              stock_id: stock.id,
              headline: n.headline,
              summary: n.summary,
              source: n.source,
              url: n.url,
              image_url: n.image_url,
              published_at: n.published_at,
            }));

            await News.bulkCreate(newsRecords, {
              ignoreDuplicates: true,
            });

            news = await News.findAll({
              where: { stock_id: stock.id },
              order: [['published_at', 'DESC']],
              limit: parseInt(limit, 10),
            });
          }
        } catch (apiError) {
          console.error(`Failed to fetch news from Finnhub for ${symbol}:`, apiError.message);
        }
      }

      const result = news.map((n) => ({
        headline: n.headline,
        summary: n.summary,
        source: n.source,
        url: n.url,
        image_url: n.image_url,
        published_at: n.published_at,
      }));

      res.status(200).json({ articles: result });
    } catch (error) {
      next(error);
    }
  }

  static async getInsight(req, res, next) {
    try {
      const { symbol } = req.params;

      const stock = await Stock.findOne({ where: { symbol: symbol.toUpperCase() } });
      if (!stock) {
        throw { name: 'NotFound', message: 'Stock not found.' };
      }

      let insight = await AiInsight.findOne({
        where: { stock_id: stock.id },
        order: [['generated_at', 'DESC']],
      });

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const needsRefresh = !insight || insight.generated_at < oneDayAgo;

      if (needsRefresh) {
        try {
          const quote = await Quote.findOne({ where: { stock_id: stock.id } });
          const recentCandles = await Candle.findAll({
            where: { stock_id: stock.id, interval: '1day' },
            order: [['datetime', 'DESC']],
            limit: 7,
          });
          const recentNews = await News.findAll({
            where: { stock_id: stock.id },
            order: [['published_at', 'DESC']],
            limit: 5,
          });

          const stockData = {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            current_price: quote ? quote.current_price : null,
            change_percent: quote ? quote.change_percent : null,
            week52_high: stock.week52_high,
            week52_low: stock.week52_low,
            pe_ratio: stock.pe_ratio,
            market_cap: stock.market_cap,
            beta: stock.beta,
            newsHeadlines: recentNews.map((n) => n.headline),
            recentPrices: recentCandles.map((c) => ({
              date: c.datetime,
              close: c.close,
            })),
          };

          const generatedInsight = await geminiService.generateInsight(stockData);

          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          insight = await AiInsight.create({
            stock_id: stock.id,
            content: generatedInsight,
            generated_at: new Date(),
            expires_at: expiresAt,
          });
        } catch (apiError) {
          console.error(`Failed to generate AI insight for ${symbol}:`, apiError.message);
          if (apiError.name === 'ServiceUnavailable') {
            return next(apiError);
          }
        }
      }

      if (!insight) {
        throw { name: 'NotFound', message: 'AI insight not available.' };
      }

      res.status(200).json({
        summary: insight.content.summary,
        sentiment: insight.content.sentiment,
        confidence: insight.content.confidence,
        keyPoints: insight.content.highlights,
        risk_note: insight.content.risk_note,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { StockController };

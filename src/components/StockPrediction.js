const mockStockData = {
  "138SL": { ticker: "138SL", companyName: "138 Student Living", closingPrice: 3.50 },
  "ECL": { ticker: "ECL", companyName: "Express Catering Limited", closingPrice: 3.00 },
  // Add more stocks here
};

const StockPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const handleSymbolSubmit = (e) => {
    e.preventDefault();
    const upperSymbol = symbol.toUpperCase();
    const stockData = mockStockData[upperSymbol];
    
    if (stockData) {
      setMarketData(stockData);
      setError('');
    } else {
      setError('Stock not found. Please check the ticker symbol.');
      setMarketData(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!marketData) {
      setError('Please wait for market data to be loaded');
      return;
    }

    const newPrediction = {
      id: Date.now(),
      symbol: symbol,
      targetPrice: parseFloat(targetPrice),
      reasoning: reasoning,
      timestamp: new Date().toISOString(),
      currentPriceAtPrediction: marketData.closingPrice
    };
    
    setPredictions([...predictions, newPrediction]);
    setTargetPrice('');
    setReasoning('');
  };

  const calculatePriceChange = (prediction) => {
    const change = ((prediction.targetPrice - prediction.currentPriceAtPrediction) / prediction.currentPriceAtPrediction) * 100;
    return change.toFixed(2);
  };

  const calculateAggregates = () => {
    if (!marketData || predictions.length === 0) {
      return { average: marketData?.closingPrice || 0, bullish: 0, bearish: 0 };
    }
    
    const total = predictions.reduce((sum, pred) => sum + pred.targetPrice, 0);
    const average = total / predictions.length;
    const bullish = predictions.filter(p => p.targetPrice > marketData.closingPrice).length;
    const bearish = predictions.filter(p => p.targetPrice < marketData.closingPrice).length;
    
    return { average, bullish, bearish };
  };

  const { average, bullish, bearish } = calculateAggregates();
  const percentageChange = marketData ? 
    ((average - marketData.closingPrice) / marketData.closingPrice * 100).toFixed(2) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSymbolSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter JSE Ticker (e.g., 138SL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Load Stock
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>

        {marketData && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{marketData.companyName}</h1>
              <p className="text-gray-600">JSE: {marketData.ticker}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Current Market Price</div>
                <div className="text-2xl font-bold">${marketData.closingPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last Updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Average Target</div>
                <div className="text-2xl font-bold">
                  ${average.toFixed(2)}
                  <span className={`text-sm ml-2 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentageChange >= 0 ? '+' : ''}{percentageChange}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{predictions.length} Predictions</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Market Sentiment</div>
                <div className="flex justify-between mt-2">
                  <div>
                    <div className="text-green-600 font-bold">{bullish}</div>
                    <div className="text-xs text-gray-500">Bullish</div>
                  </div>
                  <div>
                    <div className="text-red-600 font-bold">{bearish}</div>
                    <div className="text-xs text-gray-500">Bearish</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Your 12-Month Target Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter target price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Analysis</label>
                <textarea
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Share your analysis and reasoning..."
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Submit Prediction
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Predictions</h3>
              {predictions.map((pred) => (
                <div key={pred.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">Target: ${pred.targetPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        Made on {new Date(pred.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      parseFloat(calculatePriceChange(pred)) >= 0 ? 
                      'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {calculatePriceChange(pred)}% {parseFloat(calculatePriceChange(pred)) >= 0 ? '↑' : '↓'}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{pred.reasoning}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Market price when predicted: ${pred.currentPriceAtPrediction.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!marketData && !error && (
          <div className="text-center py-8 text-gray-600">
            Enter a JSE ticker symbol to get started
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPrediction;

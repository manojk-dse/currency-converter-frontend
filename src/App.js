import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/currencies');
      if (!response.ok) throw new Error('Failed to fetch currencies');
      const data = await response.json();
      // Store the full currency objects
      setCurrencies(data);
    } catch (err) {
      setError('Failed to load currencies. Please try again later.');
    }
  };

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          fromCurrency: fromCurrency,
          toCurrency: toCurrency
        })
      });
      if (!response.ok) throw new Error('Conversion failed');
      const data = await response.json();
      if (data && data.currencyValues && data.currencyValues[toCurrency]) {
        const currencyValue = data.currencyValues[toCurrency];
        setResult({
          value: currencyValue.value.toFixed(2),
          lastUpdated: new Date(currencyValue.lastUpdated).toLocaleString()
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to convert currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="converter-container">
        <h1>Manoj's Gen AI Currency Converter</h1>
        
        <div className="converter-form">
          <div className="input-group">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="amount-input"
            />
          </div>

          <div className="currency-selectors">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>

            <span className="swap-icon">→</span>

            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConvert}
            className="convert-button"
            disabled={loading || !amount}
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {result && (
            <div className="result">
              <h2>Result:</h2>
              <p>{amount} {fromCurrency} = {result.value} {toCurrency}</p>
              <div className="timestamp">
                Rate last updated: {result.lastUpdated}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

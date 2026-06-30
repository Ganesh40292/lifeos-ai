import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import { financeInsightsService } from '@/services/financeInsightsService';

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  INR: { symbol: '₹', rate: 83.5 },
  JPY: { symbol: '¥', rate: 158.0 },
  CAD: { symbol: 'CA$', rate: 1.37 },
  AUD: { symbol: 'A$', rate: 1.50 },
};

const InsightsPanel = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('lifeos_currency') || 'USD';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveCurrency(localStorage.getItem('lifeos_currency') || 'USD');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const translateCurrencyText = (text) => {
    if (!text) return text;
    // Find ₹ or $ followed by digits (possibly containing decimal points) and translate it
    return text.replace(/[₹$](\d+(?:\.\d+)?)/g, (match, p1) => {
      const amountInUSD = parseFloat(p1);
      const active = CURRENCIES[activeCurrency] || CURRENCIES.USD;
      const converted = amountInUSD * active.rate;
      return `${active.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });
  };

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await financeInsightsService.getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load financial insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const totalInsightsCount = 
    (insights?.anomalyAlerts?.length || 0) + 
    (insights?.budgetWarnings?.length || 0) + 
    (insights?.savingTips?.length || 0);

  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Smart Financial Insights
          </span>
          <button 
            onClick={fetchInsights} 
            disabled={loading}
            className="text-gray-500 hover:text-white p-1 rounded transition-colors disabled:opacity-50"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
      hover
      className="h-full"
    >
      {loading ? (
        <div className="flex flex-col gap-3 py-6">
          <div className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />
        </div>
      ) : totalInsightsCount === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No insights generated for this month. Log more transactions or set budget limits to see updates!
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Anomaly Alerts */}
          {insights.anomalyAlerts && insights.anomalyAlerts.map((alert, i) => (
            <motion.div 
              key={`anomaly-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-red-200/90 leading-relaxed">
                {translateCurrencyText(alert)}
              </span>
            </motion.div>
          ))}

          {/* Budget Warnings */}
          {insights.budgetWarnings && insights.budgetWarnings.map((warning, i) => (
            <motion.div 
              key={`warning-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-amber-200/90 leading-relaxed">
                {translateCurrencyText(warning)}
              </span>
            </motion.div>
          ))}

          {/* Saving Tips */}
          {insights.savingTips && insights.savingTips.map((tip, i) => (
            <motion.div 
              key={`tip-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl"
            >
              <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-indigo-200/90 leading-relaxed">
                {translateCurrencyText(tip)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default InsightsPanel;

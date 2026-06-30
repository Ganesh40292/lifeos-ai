import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Sparkles, HelpCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const ForecastPanel = ({ transactions = [] }) => {
  const forecastData = useMemo(() => {
    // 1. Filter for expenses
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    if (expenses.length === 0) return null;

    // 2. Group by last 6 months
    const today = new Date();
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i));
      const monthEnd = endOfMonth(subMonths(today, i));
      const label = format(monthStart, 'MMM yyyy');

      const sum = expenses
        .filter(t => {
          const tDate = parseISO(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      monthsData.push({ x: 5 - i, label, amount: sum });
    }

    // 3. Linear Regression y = mx + c
    const n = monthsData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const d of monthsData) {
      sumX += d.x;
      sumY += d.amount;
      sumXY += d.x * d.amount;
      sumXX += d.x * d.x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Project next month (index = 6)
    const projectedAmount = Math.max(0, Math.round(slope * 6 + intercept));
    const isTrendingUp = slope > 0;
    const monthlyDelta = Math.abs(Math.round(slope));

    return {
      history: monthsData,
      projectedAmount,
      isTrendingUp,
      monthlyDelta,
      average: Math.round(sumY / n)
    };
  }, [transactions]);

  if (!forecastData || forecastData.history.reduce((sum, d) => sum + d.amount, 0) === 0) {
    return (
      <Card title="Financial Forecast" className="h-full flex items-center justify-center p-6 text-center text-text-faint text-xs">
        <div className="py-8">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-text-faint/60" />
          <span>Log expenses across multiple months to generate projection analysis.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Expense Forecasting & Projections">
      <div className="space-y-6">
        {/* Big Forecast Metric Card */}
        <div className="p-4 rounded-xl bg-bg-elevated border border-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Next Month Projected</span>
            <p className="text-2xl font-bold text-text">₹{forecastData.projectedAmount.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 text-xs">
              {forecastData.isTrendingUp ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-400 font-semibold">Trending Up</span>
                  <span className="text-text-faint">(+₹{forecastData.monthlyDelta.toLocaleString()}/mo)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-400 font-semibold">Trending Down</span>
                  <span className="text-text-faint">(-₹{forecastData.monthlyDelta.toLocaleString()}/mo)</span>
                </>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${forecastData.isTrendingUp ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Small Sparlines or list */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">Historical Spending & Forecast</span>
          <div className="space-y-2">
            {forecastData.history.map((h) => (
              <div key={h.label} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40">
                <span className="text-text-secondary">{h.label}</span>
                <span className="font-medium text-text">₹{h.amount.toLocaleString()}</span>
              </div>
            ))}
            {/* Projected Row */}
            <div className="flex items-center justify-between text-xs py-2 bg-primary-muted/10 border border-primary/20 rounded-lg px-2 mt-1">
              <span className="text-primary font-bold">Projected Forecast</span>
              <span className="font-bold text-primary">₹{forecastData.projectedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actionable Advice */}
        <div className="text-[11px] text-text-muted leading-relaxed bg-bg-hover/40 p-3 rounded-lg border border-border/50">
          {forecastData.isTrendingUp ? (
            <span>⚠️ Your expenses are on an upward trajectory. We recommend review of budget limits in high-spending categories to balance the trend.</span>
          ) : (
            <span>🎉 Excellent! Your linear expense curve is flattening or trending down. Maintain this saving threshold.</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ForecastPanel;

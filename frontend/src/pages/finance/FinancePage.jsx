import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertCircle,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  PieChart as PieIcon,
  ChevronRight,
  Download,
  Printer,
} from 'lucide-react';
import { exportUtils } from '@/utils/exportUtils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// Services & UI Components
import financeService from '@/services/financeService';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import InsightsPanel from '@/components/finance/InsightsPanel';
import ForecastPanel from '@/components/finance/ForecastPanel';

// Available transaction categories
const CATEGORIES = [
  'Food',
  'Rent',
  'Salary',
  'Utilities',
  'Leisure',
  'Transport',
  'Savings',
  'Other',
];

// Color palette for Pie Chart
const COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#6b7280', // Gray
];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const customTooltipStyle = {
  contentStyle: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderRadius: '8px',
    color: '#fafafa',
    fontSize: '12px',
  },
  itemStyle: {
    color: '#a1a1aa',
  },
  labelStyle: {
    fontWeight: 'bold',
    color: '#fafafa',
  },
};

const CURRENCIES = {
  USD: { label: 'USD ($)', symbol: '$', rate: 1.0 },
  EUR: { label: 'EUR (€)', symbol: '€', rate: 0.92 },
  GBP: { label: 'GBP (£)', symbol: '£', rate: 0.78 },
  INR: { label: 'INR (₹)', symbol: '₹', rate: 83.5 },
  JPY: { label: 'JPY (¥)', symbol: '¥', rate: 158.0 },
  CAD: { label: 'CAD (CA$)', symbol: 'CA$', rate: 1.37 },
  AUD: { label: 'AUD (A$)', symbol: 'A$', rate: 1.50 },
};

const FinancePage = () => {
  const { refreshUser } = useAuth();
  
  // Currency state
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('aetheria_currency') || 'USD';
  });

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    setActiveCurrency(val);
    localStorage.setItem('aetheria_currency', val);
    window.dispatchEvent(new Event('storage'));
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    const active = CURRENCIES[activeCurrency] || CURRENCIES.USD;
    const amt = val * active.rate;
    // Format JPY with zero decimals if preferred, or keep standard 2 decimals
    return `${active.symbol}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Page state
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'transaction' | 'budget' | 'goal' | 'contribute' | null
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form states
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: activeCurrency,
  });

  useEffect(() => {
    setTransactionForm((prev) => ({ ...prev, currency: activeCurrency }));
  }, [activeCurrency]);

  const [budgetForm, setBudgetForm] = useState({
    category: 'Food',
    limitAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
  });

  const [contributionAmount, setContributionAmount] = useState('');
  const [isAutoCategorized, setIsAutoCategorized] = useState(true);

  const handleDescriptionChange = (e) => {
    const desc = e.target.value;
    let nextCategory = transactionForm.category;

    if (isAutoCategorized) {
      const lower = desc.toLowerCase();
      if (transactionForm.type === 'INCOME') {
        if (lower.includes('salary') || lower.includes('payroll') || lower.includes('wage')) nextCategory = 'Salary';
        else if (lower.includes('dividend') || lower.includes('stock') || lower.includes('investment')) nextCategory = 'Savings';
        else nextCategory = 'Other';
      } else {
        if (lower.includes('zomato') || lower.includes('swiggy') || lower.includes('food') || 
            lower.includes('cafe') || lower.includes('restaurant') || lower.includes('starbucks') || 
            lower.includes('pizza') || lower.includes('burger') || lower.includes('dinner') || 
            lower.includes('lunch') || lower.includes('grocery') || lower.includes('groceries') ||
            lower.includes('supermarket') || lower.includes('kirana')) {
          nextCategory = 'Food';
        } else if (lower.includes('uber') || lower.includes('ola') || lower.includes('cab') || 
                   lower.includes('metro') || lower.includes('train') || lower.includes('bus') || 
                   lower.includes('petrol') || lower.includes('fuel') || lower.includes('diesel')) {
          nextCategory = 'Transport';
        } else if (lower.includes('rent') || lower.includes('apartment') || lower.includes('pg') || lower.includes('room')) {
          nextCategory = 'Rent';
        } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('youtube') || 
                   lower.includes('movie') || lower.includes('theatre') || lower.includes('concert') || 
                   lower.includes('game') || lower.includes('steam')) {
          nextCategory = 'Leisure';
        } else if (lower.includes('electricity') || lower.includes('water') || lower.includes('gas') || 
                   lower.includes('wifi') || lower.includes('broadband') || lower.includes('mobile') || 
                   lower.includes('phone') || lower.includes('recharge') || lower.includes('bill')) {
          nextCategory = 'Utilities';
        } else if (lower.includes('savings') || lower.includes('invest') || lower.includes('deposit')) {
          nextCategory = 'Savings';
        }
      }
    }

    setTransactionForm({
      ...transactionForm,
      description: desc,
      category: nextCategory
    });
  };

  const handleExportCSV = () => {
    if (!summary || !summary.transactions) return;
    exportUtils.downloadCSV(
      summary.transactions,
      ['Date', 'Amount', 'Type', 'Category', 'Description'],
      ['date', 'amount', 'type', 'category', 'description'],
      'transactions.csv'
    );
  };

  const handleExportPDF = () => {
    exportUtils.printToPDF('finance-page-content', 'Finance Manager Report');
  };

  // Load finance summary
  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const res = await financeService.getFinanceSummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  // --- Transaction handlers ---
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const rate = CURRENCIES[transactionForm.currency]?.rate || 1.0;
      const amountInUSD = parseFloat(transactionForm.amount) / rate;

      const payload = {
        ...transactionForm,
        amount: amountInUSD,
      };
      const res = await financeService.addTransaction(payload);
      if (res.success) {
        loadFinanceData();
        setActiveModal(null);
        refreshUser();
        // Reset form
        setTransactionForm({
          amount: '',
          type: 'EXPENSE',
          category: 'Food',
          description: '',
          date: new Date().toISOString().split('T')[0],
          currency: activeCurrency,
        });
        setIsAutoCategorized(true);
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await financeService.deleteTransaction(id);
      if (res.success) {
        loadFinanceData();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // --- Budget handlers ---
  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const activeRate = CURRENCIES[activeCurrency]?.rate || 1.0;
      const limitAmountInUSD = parseFloat(budgetForm.limitAmount) / activeRate;

      const payload = {
        ...budgetForm,
        limitAmount: limitAmountInUSD,
        month: parseInt(budgetForm.month),
        year: parseInt(budgetForm.year),
      };
      const res = await financeService.addOrUpdateBudget(payload);
      if (res.success) {
        loadFinanceData();
        setActiveModal(null);
        setBudgetForm({
          category: 'Food',
          limitAmount: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
      }
    } catch (err) {
      console.error('Failed to save budget:', err);
    }
  };

  // --- Savings Goal handlers ---
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const activeRate = CURRENCIES[activeCurrency]?.rate || 1.0;
      const targetAmountInUSD = parseFloat(goalForm.targetAmount) / activeRate;
      const currentAmountInUSD = parseFloat(goalForm.currentAmount || 0) / activeRate;

      const payload = {
        ...goalForm,
        targetAmount: targetAmountInUSD,
        currentAmount: currentAmountInUSD,
      };
      const res = await financeService.addSavingsGoal(payload);
      if (res.success) {
        loadFinanceData();
        setActiveModal(null);
        setGoalForm({
          name: '',
          targetAmount: '',
          currentAmount: '0',
          targetDate: '',
        });
      }
    } catch (err) {
      console.error('Failed to add savings goal:', err);
    }
  };

  const handleContributeGoal = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      const activeRate = CURRENCIES[activeCurrency]?.rate || 1.0;
      const contributionInUSD = parseFloat(contributionAmount) / activeRate;

      const res = await financeService.contributeToSavingsGoal(selectedGoal.id, contributionInUSD);
      if (res.success) {
        loadFinanceData();
        setActiveModal(null);
        setContributionAmount('');
        setSelectedGoal(null);
      }
    } catch (err) {
      console.error('Failed to contribute to goal:', err);
    }
  };

  // Prepare Recharts Data
  const pieChartData = useMemo(() => {
    if (!summary || !summary.categoryExpenses) return [];
    const activeRate = CURRENCIES[activeCurrency]?.rate || 1.0;
    return Object.entries(summary.categoryExpenses).map(([name, value]) => ({
      name,
      value: parseFloat(value) * activeRate,
    }));
  }, [summary, activeCurrency]);

  const barChartData = useMemo(() => {
    if (!summary || !summary.budgets) return [];
    const activeRate = CURRENCIES[activeCurrency]?.rate || 1.0;
    return summary.budgets.map((b) => ({
      name: b.category,
      Limit: parseFloat(b.limitAmount) * activeRate,
      Spent: parseFloat(b.spentAmount) * activeRate,
    }));
  }, [summary, activeCurrency]);

  if (loading && !summary) {
    return (
      <div className="page-container flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-36" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </Card>
          <Card>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id="finance-page-content"
      className="page-container flex flex-col gap-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            Finance Manager
          </h1>
          <p className="page-subtitle">
            Optimize your budget limits, monitor savings goals, and track dynamic transaction charts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Selector Dropdown */}
          <div className="flex items-center bg-bg-card border border-border px-3 py-2 rounded-xl text-xs font-semibold text-text shadow-sm hover:border-primary/30 transition-all">
            <span className="text-text-muted mr-1.5">Currency:</span>
            <select
              value={activeCurrency}
              onChange={handleCurrencyChange}
              className="bg-transparent border-none focus:outline-none text-text font-bold cursor-pointer"
            >
              {Object.entries(CURRENCIES).map(([code, cur]) => (
                <option key={code} value={code} className="bg-bg-card text-text">
                  {cur.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            title="Export CSV"
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            icon={<Printer className="w-4 h-4" />}
            onClick={handleExportPDF}
            title="Export PDF"
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            icon={<PiggyBank className="w-4 h-4" />}
            onClick={() => setActiveModal('goal')}
          >
            New Savings Goal
          </Button>
          <Button
            variant="secondary"
            icon={<AlertCircle className="w-4 h-4" />}
            onClick={() => setActiveModal('budget')}
          >
            Set Budget
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveModal('transaction')}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Metrics Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Total Balance
              </p>
              <h3 className="text-2xl font-bold text-text mt-1">
                {formatCurrency(summary?.netBalance)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-primary-muted/20 text-primary">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Income (This Month)
              </p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">
                +{formatCurrency(summary?.totalIncome)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Expenses (This Month)
              </p>
              <h3 className="text-2xl font-bold text-rose-500 mt-1">
                -{formatCurrency(summary?.totalExpenses)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Net Savings Rate
              </p>
              <h3 className="text-2xl font-bold text-text mt-1">
                {summary?.totalIncome > 0
                  ? (
                      ((summary.totalIncome - summary.totalExpenses) /
                        summary.totalIncome) *
                      100
                    ).toFixed(1) + '%'
                  : '0.0%'}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
              <PiggyBank className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </Card>
      </motion.div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Charts & Recent Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Charts Row */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in"
            variants={itemVariants}
          >
            {/* Category Pie Chart */}
            <Card title="Monthly Expenses by Category">
              {pieChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-text-faint">
                  <PieIcon className="w-8 h-8 mb-2" />
                  <p className="text-sm">No expenses logged for this month</p>
                </div>
              ) : (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...customTooltipStyle} formatter={(val) => [formatCurrency(val / (CURRENCIES[activeCurrency]?.rate || 1.0)), 'Amount']} />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Spent vs Budget Bar Chart */}
            <Card title="Budget Spent vs Limits">
              {barChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-text-faint">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">No budget limits configured</p>
                </div>
              ) : (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip {...customTooltipStyle} formatter={(val) => [formatCurrency(val / (CURRENCIES[activeCurrency]?.rate || 1.0)), '']} />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Limit" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Transactions Ledger */}
          <motion.div variants={itemVariants}>
            <Card title="Recent Transactions" action={
              <span className="text-xs text-text-secondary font-mono">
                Showing last 5 entries
              </span>
            }>
              {summary?.recentTransactions?.length === 0 ? (
                <div className="text-center py-10 text-text-faint">
                  <p className="text-sm">No transactions logged yet.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/60">
                  {summary?.recentTransactions?.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-3 hover:bg-bg-hover/30 px-2 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text">
                                {tx.description || tx.category}
                              </span>
                              <Badge variant={isIncome ? 'success' : 'danger'} size="sm">
                                {tx.category}
                              </Badge>
                            </div>
                            <span className="text-xs text-text-secondary font-mono">
                              {tx.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-bold ${isIncome ? 'text-emerald-500' : 'text-text'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 text-text-faint hover:text-danger hover:bg-danger/10 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

        </div>

        {/* Right Column: Budgets Tracker & Savings Goals */}
        <div className="flex flex-col gap-6">

          {/* Smart Insights Panel */}
          <motion.div variants={itemVariants}>
            <InsightsPanel />
          </motion.div>

          {/* Linear Regression Forecast Panel */}
          <motion.div variants={itemVariants}>
            <ForecastPanel transactions={summary?.transactions || []} />
          </motion.div>

          {/* Monthly Budgets Limits List */}
          <motion.div variants={itemVariants}>
            <Card title="Monthly Budgets">
              {summary?.budgets?.length === 0 ? (
                <div className="text-center py-6 text-text-faint">
                  <p className="text-sm">Set budget limits to track monthly limits.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {summary?.budgets?.map((b) => {
                    const pct = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
                    const isExceeded = pct >= 100;
                    const isWarning = pct >= 80 && pct < 100;

                    return (
                      <div key={b.id} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-text">{b.category}</span>
                          <div className="flex gap-1 items-center font-mono">
                            <span className={isExceeded ? 'text-rose-500 font-bold' : isWarning ? 'text-amber-500 font-bold' : 'text-text'}>
                              {formatCurrency(b.spentAmount)}
                            </span>
                            <span className="text-text-faint">/</span>
                            <span className="text-text-secondary">{formatCurrency(b.limitAmount)}</span>
                          </div>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className="w-full bg-border/40 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isExceeded ? 'bg-danger' : isWarning ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {isExceeded && (
                          <span className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> Exceeded limit bounds!
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Savings Goals Widgets */}
          <motion.div variants={itemVariants}>
            <Card title="Savings Goals">
              {summary?.savingsGoals?.length === 0 ? (
                <div className="text-center py-6 text-text-faint">
                  <p className="text-sm">Define savings targets to set goals.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {summary?.savingsGoals?.map((goal) => {
                    return (
                      <div key={goal.id} className="border border-border/50 rounded-xl p-3.5 bg-bg-elevated/40 hover:bg-bg-elevated/60 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-text">{goal.name}</h4>
                            <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-1 font-mono">
                              <Calendar className="w-3 h-3" /> Target: {goal.targetDate}
                            </span>
                          </div>
                          <Badge variant="primary" size="sm">
                            {goal.progressPercentage.toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs mt-3.5 font-mono">
                          <span className="text-text-secondary">Saved: {formatCurrency(goal.currentAmount)}</span>
                          <span className="text-text-faint">Goal: {formatCurrency(goal.targetAmount)}</span>
                        </div>

                        {/* Progress ring slider bar */}
                        <div className="w-full bg-border/40 rounded-full h-1.5 overflow-hidden mt-1.5">
                          <div
                            className="bg-accent h-full rounded-full transition-all duration-300"
                            style={{ width: `${goal.progressPercentage}%` }}
                          />
                        </div>

                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<DollarSign className="w-3 h-3" />}
                            onClick={() => {
                              setSelectedGoal(goal);
                              setActiveModal('contribute');
                            }}
                          >
                            Contribute
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

        </div>

      </div>

      {/* --- Interactive Modals --- */}
      <AnimatePresence>
        
        {/* 1. Add Transaction Modal */}
        {activeModal === 'transaction' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Log Financial Transaction"
          >
            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Type</label>
                  <select
                    className="w-full rounded-lg border border-border bg-bg-input px-3 py-2.5 text-sm text-text"
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                 <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary flex items-center justify-between">
                    <span>Category</span>
                    {isAutoCategorized && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold font-mono">
                        ⚡ AUTO
                      </span>
                    )}
                  </label>
                  <select
                    className="w-full rounded-lg border border-border bg-bg-input px-3 py-2.5 text-sm text-text"
                    value={transactionForm.category}
                    onChange={(e) => {
                      setTransactionForm({ ...transactionForm, category: e.target.value });
                      setIsAutoCategorized(false);
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    label={`Amount (${CURRENCIES[transactionForm.currency]?.symbol || '$'})`}
                    type="number"
                    step="0.01"
                    required
                    icon={<span className="text-xs font-bold text-text-muted">{CURRENCIES[transactionForm.currency]?.symbol || '$'}</span>}
                    placeholder="e.g. 15.50"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Currency</label>
                  <select
                    className="w-full rounded-lg border border-border bg-bg-input px-3 py-2.5 text-sm text-text"
                    value={transactionForm.currency}
                    onChange={(e) => setTransactionForm({ ...transactionForm, currency: e.target.value })}
                  >
                    {Object.entries(CURRENCIES).map(([code, cur]) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Description"
                type="text"
                icon={<FileText className="w-4 h-4" />}
                placeholder="e.g. Starbucks Coffee"
                value={transactionForm.description}
                onChange={handleDescriptionChange}
              />

              <Input
                label="Date"
                type="date"
                required
                icon={<Calendar className="w-4 h-4" />}
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* 2. Add Budget Modal */}
        {activeModal === 'budget' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Set Monthly Budget Limit"
          >
            <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Category</label>
                <select
                  className="w-full rounded-lg border border-border bg-bg-input px-3 py-2.5 text-sm text-text"
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c !== 'Salary' && c !== 'Savings').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <Input
                label={`Limit Amount (${CURRENCIES[activeCurrency]?.symbol || '$'})`}
                type="number"
                step="0.01"
                required
                icon={<span className="text-xs font-bold text-text-muted">{CURRENCIES[activeCurrency]?.symbol || '$'}</span>}
                placeholder="e.g. 500"
                value={budgetForm.limitAmount}
                onChange={(e) => setBudgetForm({ ...budgetForm, limitAmount: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Month"
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={budgetForm.month}
                  onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })}
                />
                <Input
                  label="Year"
                  type="number"
                  required
                  value={budgetForm.year}
                  onChange={(e) => setBudgetForm({ ...budgetForm, year: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Budget</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* 3. Add Savings Goal Modal */}
        {activeModal === 'goal' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Define Savings Goal Target"
          >
            <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
              <Input
                label="Goal Name"
                type="text"
                required
                icon={<PiggyBank className="w-4 h-4" />}
                placeholder="e.g. New Laptop"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Target Amount (${CURRENCIES[activeCurrency]?.symbol || '$'})`}
                  type="number"
                  step="0.01"
                  required
                  icon={<span className="text-xs font-bold text-text-muted">{CURRENCIES[activeCurrency]?.symbol || '$'}</span>}
                  placeholder="e.g. 1200"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                />
                <Input
                  label={`Initial Deposit (${CURRENCIES[activeCurrency]?.symbol || '$'})`}
                  type="number"
                  step="0.01"
                  icon={<span className="text-xs font-bold text-text-muted">{CURRENCIES[activeCurrency]?.symbol || '$'}</span>}
                  placeholder="Optional, default 0"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                />
              </div>

              <Input
                label="Target Date"
                type="date"
                required
                icon={<Calendar className="w-4 h-4" />}
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Goal</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* 4. Contribute Savings Goal Modal */}
        {activeModal === 'contribute' && (
          <Modal
            isOpen={true}
            onClose={() => {
              setActiveModal(null);
              setSelectedGoal(null);
            }}
            title={`Contribute to Savings: ${selectedGoal?.name}`}
          >
            <form onSubmit={handleContributeGoal} className="flex flex-col gap-4">
              <p className="text-xs text-text-secondary">
                This transaction will add the deposit amount to your goal and log an expense transaction under Category: **Savings**.
              </p>
              
              <Input
                label={`Contribution Amount (${CURRENCIES[activeCurrency]?.symbol || '$'})`}
                type="number"
                step="0.01"
                required
                icon={<span className="text-xs font-bold text-text-muted">{CURRENCIES[activeCurrency]?.symbol || '$'}</span>}
                placeholder="e.g. 100"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedGoal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">Deposit Funds</Button>
              </div>
            </form>
          </Modal>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

export default FinancePage;

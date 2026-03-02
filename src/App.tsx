import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  Calendar, 
  LogIn, 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  DollarSign,
  PieChart,
  MessageCircle,
  Plus,
  X,
  PlusCircle
} from 'lucide-react';
import { mockBackend, UserSettings, ComputeResult, StockData } from './services/mockBackend';

const STOCK_CODES = ["0056", "00878", "00919", "00953B", "00937B", "00933B", "QQQI", "CLOZ"];
const US_STOCKS = ["QQQI", "CLOZ"];

type Page = 'login' | 'home' | 'result';

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [username, setUsername] = useState('');
  const [stockData, setStockData] = useState<UserSettings>({});
  const [activeCodes, setActiveCodes] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const currentMonth = new Date().getMonth() + 1;

  const handleLogin = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setLoadingText('正在登入...');
    try {
      const data = await mockBackend.getUserSettings(username);
      setStockData(data);
      // Initialize active codes based on existing data
      const existingCodes = Object.keys(data).filter(code => data[code].lots && parseFloat(data[code].lots) > 0);
      setActiveCodes(existingCodes);
      setPage('home');
    } catch (error) {
      alert('登入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setLoading(true);
    setLoadingText('導向 LINE 登入...');
    const url = await mockBackend.getLineLoginUrl();
    window.location.href = url;
  };

  const handleQuery = async () => {
    setLoading(true);
    setLoadingText('正在計算股利...');
    try {
      // Only save and compute for active codes
      const filteredData: UserSettings = {};
      activeCodes.forEach(code => {
        if (stockData[code]) {
          filteredData[code] = stockData[code];
        }
      });
      
      await mockBackend.saveUserSettings(username, filteredData);
      const res = await mockBackend.computeDividends(filteredData);
      setResult(res);
      setPage('result');
    } catch (error) {
      alert('計算失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateStockField = (code: string, field: keyof StockData, value: string) => {
    setStockData(prev => ({
      ...prev,
      [code]: {
        ...prev[code] || { lots: '', price: '' },
        [field]: value
      }
    }));
  };

  const addStock = (code: string) => {
    if (!activeCodes.includes(code)) {
      setActiveCodes(prev => [...prev, code]);
    }
    setShowAddModal(false);
  };

  const removeStock = (code: string) => {
    setActiveCodes(prev => prev.filter(c => c !== code));
    // Optional: clear data for that code
    const newData = { ...stockData };
    delete newData[code];
    setStockData(newData);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-12 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {page === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4"
                >
                  <TrendingUp className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tight text-gradient">
                  {currentMonth}月股利查詢
                </h1>
                <p className="text-slate-400 text-lg">
                  智慧追蹤您的投資收益
                </p>
              </div>

              <div className="space-y-4">
                <div className="glass p-6 rounded-3xl space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                      帳號名稱
                    </label>
                    <input
                      type="text"
                      placeholder="輸入您的帳號"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    登入系統
                  </button>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-950 px-2 text-slate-500">或使用社交帳號</span>
                  </div>
                </div>

                <button
                  onClick={handleLineLogin}
                  className="w-full h-14 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  LINE 快速登入
                </button>
                
                <p className="text-center text-xs text-slate-500 leading-relaxed px-4">
                  首次使用可自由輸入帳號，系統將為您建立專屬持股清單。推薦使用 LINE 登入以獲得每日自動通知。
                </p>
              </div>
            </motion.div>
          )}

          {page === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setPage('login')}
                  className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gradient">持股資料設定</h2>
                <div className="w-10" />
              </div>

              <div className="space-y-4">
                <div className="glass-dark p-4 rounded-2xl border-indigo-500/20">
                  <p className="text-sm text-indigo-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    請輸入您的持有張數與平均成本
                  </p>
                </div>

                <div className="space-y-3">
                  {activeCodes.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <div className="p-4 rounded-full bg-white/5 text-slate-500">
                        <Wallet className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">尚未加入任何持股</p>
                    </div>
                  ) : (
                    activeCodes.map((code) => (
                      <motion.div 
                        key={code}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-5 rounded-3xl space-y-4 relative group"
                      >
                        <button 
                          onClick={() => removeStock(code)}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black tracking-tighter text-indigo-400">{code}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded-md mr-8">
                            {US_STOCKS.includes(code) ? '美股' : '台股'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 ml-1">持有{US_STOCKS.includes(code) ? '股數' : '張數'}</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={stockData[code]?.lots || ''}
                              onChange={(e) => updateStockField(code, 'lots', e.target.value)}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-3 text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 ml-1">平均成本</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={stockData[code]?.price || ''}
                              onChange={(e) => updateStockField(code, 'price', e.target.value)}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-3 text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-6 rounded-[2.5rem] border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-indigo-400 flex flex-col items-center justify-center gap-2 transition-all group"
                  >
                    <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">新增持股</span>
                  </button>
                </div>

                <button
                  onClick={handleQuery}
                  className="sticky bottom-6 w-full h-16 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <RefreshCw className="w-5 h-5" />
                  開始分析
                </button>
              </div>
            </motion.div>
          )}

          {page === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8 pb-20"
            >
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gradient">本月股利資訊</h2>
                <p className="text-xs text-slate-500 font-mono">更新時間: {result.updatedAt}</p>
              </div>

              {/* Summary Dashboard */}
              <div className="grid gap-4">
                <div className="glass-dark p-6 rounded-[2rem] border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Wallet className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">本月預估股利</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-5xl font-black font-mono tracking-tighter text-gold">
                        ${(Object.values(result.items) as any[]).reduce((acc, it) => acc + (it.amount || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-200/50 font-medium">
                        包含台股與美股換算總計
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-5 rounded-3xl border-emerald-500/20">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      總預估損益
                    </div>
                    <div className={`text-xl font-bold font-mono ${(Object.values(result.items) as any[]).reduce((acc, it) => acc + (it.profit || 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(Object.values(result.items) as any[]).reduce((acc, it) => acc + (it.profit || 0), 0) >= 0 ? '+' : ''}
                      {(Object.values(result.items) as any[]).reduce((acc, it) => acc + (it.profit || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                      (購入會有價差，故損益只能參考)
                    </div>
                  </div>
                  <div className="glass p-5 rounded-3xl border-indigo-500/20">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <PieChart className="w-3 h-3 text-indigo-400" />
                      持股總價值
                    </div>
                    <div className="text-xl font-bold font-mono text-indigo-300">
                      ${Math.round((Object.values(result.items) as any[]).reduce((acc, it) => acc + ((it.currentPrice || 0) * (it.qty || 0) * (it.fx || 1)), 0)).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-tight">
                      (購入會有價差，故損益只能參考)
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">詳細清單</h3>
                {STOCK_CODES.filter(code => result.items[code]).map((code) => {
                  const item = result.items[code];
                  const isProfit = item.profit >= 0;
                  
                  return (
                    <motion.div 
                      key={code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 rounded-3xl space-y-6 relative group overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">{code}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}{item.profit.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">損益</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs text-slate-500 font-medium">現價 / 成本</div>
                          <div className="text-sm font-mono text-slate-300">
                            {item.currentPrice} <span className="text-slate-600">/</span> {item.buyPrice}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">預估股利</div>
                          <div className="text-lg font-black text-gold font-mono">
                            ${item.amount.toLocaleString()}
                            {US_STOCKS.includes(code) && <span className="text-[10px] ml-1 text-amber-500/50">NTD</span>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">發放日期</div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {item.payDate}
                          </div>
                        </div>
                      </div>

                      {item.exDate && (
                        <div className="mt-4 p-2 bg-white/5 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            除權息日期: {item.exDate}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => setPage('home')}
                className="w-full h-14 glass hover:bg-white/10 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="w-5 h-5" />
                重新查詢
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md glass-dark rounded-[2.5rem] p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gradient">選擇股票</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {STOCK_CODES.map(code => {
                  const isAdded = activeCodes.includes(code);
                  return (
                    <button
                      key={code}
                      disabled={isAdded}
                      onClick={() => addStock(code)}
                      className={`h-16 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isAdded 
                        ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed' 
                        : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10'
                      }`}
                    >
                      <span className="text-lg font-black tracking-tighter">{code}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {US_STOCKS.includes(code) ? '美股' : '台股'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin-slow" />
              </div>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-lg font-bold text-gradient"
            >
              {loadingText}
            </motion.p>
            <p className="mt-2 text-xs text-slate-500 animate-pulse">
              系統正在處理大數據，請稍候...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}} />
    </div>
  );
}

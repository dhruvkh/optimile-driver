import React, { useState, useEffect } from 'react';
import { useDriverStore } from '../store/driverStore';
import { 
  Trophy, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  Star, 
  Clock, 
  PackageCheck, 
  AlertTriangle, 
  ThumbsUp, 
  DollarSign, 
  Calendar,
  RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';

// --- Types ---

interface DriverRanking {
  id: string;
  name: string;
  avatarUrl: string;
  rank: number;
  score: number;
  trips: number;
  trend: 'up' | 'down' | 'same';
  trendValue?: number;
  badge?: 'gold' | 'silver' | 'bronze' | 'star';
}

interface MyStats {
  score: number;
  trips: number;
  onTimePercentage: number;
  rating: number;
  earnings: number;
  bestMonth: boolean;
}

// --- Mock Data ---

const MOCK_RANKINGS: DriverRanking[] = [
  { id: 'd1', name: 'Rajesh Kumar', avatarUrl: 'https://i.pravatar.cc/150?u=d1', rank: 1, score: 2450, trips: 42, trend: 'up', trendValue: 2, badge: 'gold' },
  { id: 'd2', name: 'Vikram Singh', avatarUrl: 'https://i.pravatar.cc/150?u=d2', rank: 2, score: 2380, trips: 38, trend: 'same', badge: 'silver' },
  { id: 'd3', name: 'Amit Patel', avatarUrl: 'https://i.pravatar.cc/150?u=d3', rank: 3, score: 2150, trips: 35, trend: 'down', trendValue: 1, badge: 'bronze' },
  { id: 'd4', name: 'Suresh Yadav', avatarUrl: 'https://i.pravatar.cc/150?u=d4', rank: 4, score: 1980, trips: 31, trend: 'up', trendValue: 5 },
  { id: 'd5', name: 'Manoj Gupta', avatarUrl: 'https://i.pravatar.cc/150?u=d5', rank: 5, score: 1850, trips: 29, trend: 'same' },
  { id: 'd6', name: 'Rahul Sharma', avatarUrl: 'https://i.pravatar.cc/150?u=d6', rank: 6, score: 1720, trips: 28, trend: 'down', trendValue: 2 },
  { id: 'd7', name: 'Deepak Verma', avatarUrl: 'https://i.pravatar.cc/150?u=d7', rank: 7, score: 1650, trips: 25, trend: 'up', trendValue: 1 },
  { id: 'd8', name: 'Anil Kumar', avatarUrl: 'https://i.pravatar.cc/150?u=d8', rank: 8, score: 1590, trips: 24, trend: 'same' },
  { id: 'd9', name: 'Sunil Das', avatarUrl: 'https://i.pravatar.cc/150?u=d9', rank: 9, score: 1540, trips: 22, trend: 'down', trendValue: 3 },
  { id: 'd10', name: 'Ravi Teja', avatarUrl: 'https://i.pravatar.cc/150?u=d10', rank: 10, score: 1480, trips: 20, trend: 'up', trendValue: 4 },
  { id: 'd11', name: 'Kiran Rao', avatarUrl: 'https://i.pravatar.cc/150?u=d11', rank: 11, score: 1420, trips: 19, trend: 'same' },
  { id: 'd12', name: 'Arjun Reddy', avatarUrl: 'https://i.pravatar.cc/150?u=d12', rank: 12, score: 1350, trips: 18, trend: 'down', trendValue: 1 },
];

const MY_STATS_MOCK: MyStats = {
  score: 1850,
  trips: 29,
  onTimePercentage: 98,
  rating: 4.8,
  earnings: 45000,
  bestMonth: true,
};

// --- Components ---

const RankChangeIcon = ({ trend, value }: { trend: 'up' | 'down' | 'same', value?: number }) => {
  if (trend === 'up') return <div className="flex items-center text-emerald-400 text-xs font-bold"><TrendingUp className="w-3 h-3 mr-0.5" />{value}</div>;
  if (trend === 'down') return <div className="flex items-center text-rose-400 text-xs font-bold"><TrendingDown className="w-3 h-3 mr-0.5" />{value}</div>;
  return <div className="flex items-center text-gray-400 text-xs font-bold"><Minus className="w-3 h-3 mr-0.5" /></div>;
};

const ScoringRuleRow = ({ points, label, isNegative = false }: { points: number, label: string, isNegative?: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
    <span className="text-sm text-gray-300">{label}</span>
    <span className={clsx("font-mono font-bold", isNegative ? "text-rose-400" : "text-emerald-400")}>
      {isNegative ? '-' : '+'}{points} pts
    </span>
  </div>
);

export const LeaderboardScreen = () => {
  const { driverType, name: currentDriverName } = useDriverStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rankings, setRankings] = useState<DriverRanking[]>(MOCK_RANKINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.driver.getLeaderboard(timeframe);
      // Assuming API returns { rankings: DriverRanking[] }
      // If API is not ready, we keep MOCK_RANKINGS
      if (data && Array.isArray(data.rankings)) {
        setRankings(data.rankings);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  // Auto-refresh every 5 mins and on mount/timeframe change
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  // If not Own Fleet, show restricted access message
  if (driverType !== 'OWN_FLEET') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Leaderboard Unavailable</h2>
        <p className="text-gray-500">The driver leaderboard is currently only available for Own Fleet drivers.</p>
      </div>
    );
  }

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  
  // Find current user (mock matching by name or ID)
  // For demo purposes, let's assume the current user is "Manoj Gupta" (Rank 5)
  const currentUserId = 'd5'; 
  const currentUserRank = rankings.find(r => r.id === currentUserId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-amber-400">🏆</span> Driver Rankings
            </h1>
            <p className="text-blue-200/60 text-xs font-medium mt-1">
              Compete with the best, earn rewards!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className={clsx(
                "w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="w-5 h-5 text-blue-200" />
            </button>
            <button 
              onClick={() => setShowScoringModal(true)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Info className="w-5 h-5 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 max-w-xs mx-auto mb-6">
          <button 
            onClick={() => setTimeframe('week')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              timeframe === 'week' ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              timeframe === 'month' ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            This Month
          </button>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8 px-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-gray-300 overflow-hidden shadow-[0_0_15px_rgba(209,213,219,0.3)]">
                <img src={top3[1].avatarUrl} alt={top3[1].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
                #2
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-300 truncate w-20">{top3[1].name}</p>
              <p className="text-[10px] text-amber-400 font-mono">{top3[1].score} pts</p>
              <div className="mt-1 px-2 py-0.5 bg-gray-300/10 border border-gray-300/20 rounded text-[9px] text-gray-300">
                ₹1,000
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-6 z-10">
            <Crown className="w-8 h-8 text-amber-400 mb-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-bounce" />
            <div className="relative mb-2">
              <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                <img src={top3[0].avatarUrl} alt={top3[0].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-amber-500 text-black text-xs font-black px-3 py-1 rounded-full border-2 border-white shadow-lg">
                #1
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-sm font-bold text-white truncate w-28">{top3[0].name}</p>
              <p className="text-xs text-amber-400 font-mono font-bold">{top3[0].score} pts</p>
              <div className="mt-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[10px] text-amber-300 font-bold shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                ₹2,000 BONUS
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-orange-700 overflow-hidden shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                <img src={top3[2].avatarUrl} alt={top3[2].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
                #3
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-300 truncate w-20">{top3[2].name}</p>
              <p className="text-[10px] text-amber-400 font-mono">{top3[2].score} pts</p>
              <div className="mt-1 px-2 py-0.5 bg-orange-700/10 border border-orange-700/20 rounded text-[9px] text-orange-400">
                ₹500
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Rankings List */}
      <div className="bg-[#1e293b] rounded-t-3xl min-h-[500px] px-4 pt-6 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative z-0">
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-4 px-2">
          <span>DRIVER</span>
          <div className="flex gap-6">
            <span className="w-8 text-center">TRIPS</span>
            <span className="w-12 text-right">SCORE</span>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0f172a] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gray-700 rounded" />
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-700 rounded" />
                    <div className="w-12 h-3 bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-8 h-4 bg-gray-700 rounded" />
                  <div className="w-12 h-4 bg-gray-700 rounded" />
                </div>
              </div>
            ))
          ) : (
            rest.map((driver) => {
            const isCurrentUser = driver.id === currentUserId;
            return (
              <motion.div 
                key={driver.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  isCurrentUser 
                    ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-[#0f172a] border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "w-6 text-sm font-bold text-center",
                    isCurrentUser ? "text-amber-400" : "text-gray-500"
                  )}>
                    {driver.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10">
                    <img src={driver.avatarUrl} alt={driver.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className={clsx(
                      "text-sm font-bold",
                      isCurrentUser ? "text-amber-400" : "text-white"
                    )}>
                      {driver.name} {isCurrentUser && "(You)"}
                    </p>
                    <RankChangeIcon trend={driver.trend} value={driver.trendValue} />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm font-mono text-gray-400 w-8 text-center">{driver.trips}</span>
                  <span className="text-sm font-mono font-bold text-white w-12 text-right">{driver.score}</span>
                </div>
              </motion.div>
            );
          })
        )}
        </div>
      </div>

      {/* My Stats Card (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-8 z-20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300">My Performance ({timeframe === 'week' ? 'Week' : 'March'})</h3>
          {MY_STATS_MOCK.bestMonth && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-emerald-400" /> BEST MONTH
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
            <p className="text-[10px] text-gray-400 mb-1">SCORE</p>
            <p className="text-lg font-black text-amber-400">{MY_STATS_MOCK.score}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
            <p className="text-[10px] text-gray-400 mb-1">TRIPS</p>
            <p className="text-lg font-black text-white">{MY_STATS_MOCK.trips}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
            <p className="text-[10px] text-gray-400 mb-1">ON-TIME</p>
            <p className="text-lg font-black text-emerald-400">{MY_STATS_MOCK.onTimePercentage}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
            <p className="text-[10px] text-gray-400 mb-1">RATING</p>
            <p className="text-lg font-black text-white flex items-center justify-center gap-0.5">
              {MY_STATS_MOCK.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Scoring Modal */}
      <AnimatePresence>
        {showScoringModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-400" /> Scoring System
                </h3>
                <button 
                  onClick={() => setShowScoringModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-1">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">Points Earned</p>
                <ScoringRuleRow points={10} label="Trip completed on time" />
                <ScoringRuleRow points={5} label="POD uploaded < 2 hours" />
                <ScoringRuleRow points={15} label="Zero complaints (Monthly)" />
                <ScoringRuleRow points={3} label="5-star client rating" />
                
                <p className="text-xs text-gray-400 mt-6 mb-3 uppercase tracking-wider font-bold">Points Deducted</p>
                <ScoringRuleRow points={10} label="Delay > 4 hours (Driver fault)" isNegative />
                <ScoringRuleRow points={15} label="Customer complaint filed" isNegative />
                <ScoringRuleRow points={5} label="Issue reported" isNegative />
              </div>

              <div className="p-4 bg-[#0f172a] border-t border-white/10">
                <button 
                  onClick={() => setShowScoringModal(false)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardScreen;

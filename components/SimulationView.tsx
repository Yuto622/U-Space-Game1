
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SimulationPhase, SimulationResult } from '../types';
import { SAMPLE_TIERS } from '../constants';

interface SimulationViewProps {
  simulationData: SimulationResult | null;
  phase: SimulationPhase;
  onLaunchComplete: (score: number) => void;
  onRetry: () => void;
  onBackToLab: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ 
  simulationData, 
  phase, 
  onLaunchComplete, 
  onRetry,
  onBackToLab 
}) => {
  // --- Mini Game State ---
  const [cursorPos, setCursorPos] = useState(0); // 0 to 100
  const [direction, setDirection] = useState(1); // 1 or -1
  const [gameActive, setGameActive] = useState(false);
  const [gameResult, setGameResult] = useState<{score: number, message: string} | null>(null);
  const animationRef = useRef<number>(null);
  const TARGET_POS = 75; // The star position
  const TARGET_WIDTH = 15; // Tolerance

  // --- Log View State ---
  const [logIndex, setLogIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Mini Game Logic ---
  useEffect(() => {
    if (phase === 'GAME' && !gameActive && !gameResult) {
      setGameActive(true);
    }
  }, [phase, gameActive, gameResult]);

  const stopGame = useCallback(() => {
    if (!gameActive) return;
    setGameActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Calculate score based on distance from target
    const dist = Math.abs(cursorPos - TARGET_POS);
    let score = 0;
    let message = "";

    if (dist < 2) {
      score = 100;
      message = "PERFECT!! 軌道投入、完璧です！";
    } else if (dist < TARGET_WIDTH / 2) {
      score = 80;
      message = "GREAT! 良い軌道に乗りました。";
    } else if (dist < TARGET_WIDTH) {
      score = 50;
      message = "GOOD. なんとか修正可能な範囲です。";
    } else {
      score = 10;
      message = "BAD... 軌道がズレてしまいました。";
    }

    setGameResult({ score, message });
    
    // Proceed to loading after a short delay
    setTimeout(() => {
      onLaunchComplete(score);
    }, 2000);
  }, [gameActive, cursorPos, onLaunchComplete]);

  useEffect(() => {
    if (gameActive) {
      const animate = () => {
        setCursorPos(prev => {
          let next = prev + direction * 1.5; // Speed
          if (next >= 100) {
            next = 100;
            setDirection(-1);
          } else if (next <= 0) {
            next = 0;
            setDirection(1);
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameActive, direction]);

  // Keyboard support for stopping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'GAME' && gameActive) {
        stopGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gameActive, stopGame]);


  // --- Log View Logic ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logIndex]);

  useEffect(() => {
    if (phase === 'RESULT' && simulationData && logIndex < simulationData.missionLog.length) {
      const timer = setTimeout(() => {
        setLogIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, simulationData, logIndex]);

  // Helper to determine item based on score
  const getEarnedItem = (score: number) => {
     // Find the tier
     const tier = SAMPLE_TIERS.find(t => score <= t.maxScore) || SAMPLE_TIERS[SAMPLE_TIERS.length - 1];
     return tier;
  };


  // --- RENDER: GAME & LOADING PHASE (Unified) ---
  if (phase === 'GAME' || phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8 w-full max-w-5xl mx-auto px-4">
        
        {/* Monitor Frame */}
        <div className="relative bg-slate-300 p-2 md:p-4 rounded-3xl border-b-8 border-r-8 border-slate-400 shadow-2xl w-full">
          
          {/* Header Plate */}
          <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-slate-400 border-4 border-slate-300 px-6 py-1 md:px-8 md:py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
             <div className="flex items-center gap-2">
               <div className="w-1 h-1 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
               <h2 className="text-sm md:text-2xl font-black text-white tracking-widest drop-shadow-md">運用訓練場</h2>
               <div className="w-1 h-1 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
             </div>
          </div>

          {/* Screen */}
          <div className="bg-black rounded-xl overflow-hidden border-4 border-slate-600 shadow-inner relative h-[300px] md:h-[500px]">
            {/* Space Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900/40"></div>
            
            {/* Stars (CSS) */}
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>

            {/* Planet Earth */}
            <div className="absolute bottom-[-100px] md:bottom-[-200px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-500 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]"></div>
            </div>

            {/* Probe Model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce-slow z-10">
              <span className="text-6xl md:text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">🛰️</span>
            </div>

            {/* LOADING OVERLAY */}
            {phase === 'LOADING' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center animate-fade-in">
                 <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                 <div className="text-blue-400 font-mono text-lg md:text-xl animate-pulse">COMPUTING...</div>
              </div>
            )}

            {/* Timing Bar UI Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-20 md:right-20 bg-slate-900/80 backdrop-blur border border-slate-500 p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-2 md:gap-4 z-20">
               
               {/* Result Message Overlay */}
               {gameResult && phase !== 'LOADING' && (
                 <div className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-xl animate-fade-in-up whitespace-nowrap z-50">
                    <span className={`text-xl md:text-2xl font-black ${gameResult.score >= 80 ? 'text-red-500' : 'text-blue-600'}`}>
                      {gameResult.message}
                    </span>
                 </div>
               )}

               <div className="w-full h-8 md:h-12 bg-slate-800 rounded-full border-4 border-slate-600 relative overflow-hidden shadow-inner">
                 {/* Gradient Bar */}
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-400 to-red-500 opacity-80"></div>
                 
                 {/* Target Zone */}
                 <div 
                    className="absolute top-0 bottom-0 flex items-center justify-center"
                    style={{ left: `${TARGET_POS}%`, width: '40px', marginLeft: '-20px' }}
                 >
                    <div className="w-1 h-full bg-white/50 absolute"></div>
                    <span className="text-2xl md:text-3xl drop-shadow-md relative z-10 animate-pulse">⭐</span>
                 </div>
                 
                 {/* Cursor */}
                 <div 
                   className="absolute top-0 bottom-0 w-2 bg-white border-x border-black shadow-[0_0_10px_white]"
                   style={{ left: `${cursorPos}%`, transition: gameActive ? 'none' : 'left 0.1s ease-out' }}
                 ></div>
               </div>

               <div className="flex justify-between w-full text-white font-bold px-2 text-xs md:text-base">
                  <span>LAUNCH START</span>
                  <span className="text-pink-400 text-lg md:text-xl italic">MAX</span>
               </div>
            </div>

            {/* Top Right Logo */}
            <div className="absolute top-4 right-4 bg-blue-900 border-2 border-blue-400 px-2 py-1 md:px-4 skew-x-[-10deg] shadow-lg">
               <span className="font-black text-blue-200 text-sm md:text-xl italic skew-x-[10deg] inline-block">MMX</span>
            </div>

          </div>

          {/* Control Panel / Desk */}
          <div className="mt-4 flex flex-col md:flex-row items-end justify-between relative gap-4">
             {/* Back Button */}
             <button 
                onClick={onBackToLab}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 shadow-lg flex flex-col items-center shrink-0 w-full md:w-auto"
             >
                <span className="text-xs opacity-80">けんきゅうじょ</span>
                <span>研究所へもどる</span>
             </button>

             {/* Character Dialog */}
             <div className="w-full relative md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-0 md:max-w-xl z-30">
                <div className="bg-blue-900/95 border-2 border-blue-400 rounded-xl p-3 md:p-4 shadow-2xl text-white flex gap-3 md:gap-4 items-center">
                   <div className="flex-1">
                      <div className="flex justify-between text-[10px] md:text-xs text-blue-300 mb-1">
                        <span>GUIDANCE</span>
                        <span>TARGET: MARS</span>
                      </div>
                      <p className="text-sm md:text-lg font-bold leading-relaxed">
                        赤いバーを星のところで止めろ！
                        <span className="block text-xs md:text-sm text-yellow-300 mt-1 font-normal">(スペースキー または STOPボタン)</span>
                      </p>
                   </div>
                   <button 
                     onClick={stopGame}
                     disabled={!gameActive}
                     className={`
                       bg-red-500 text-white font-black text-sm md:text-xl px-4 py-3 md:px-6 md:py-4 rounded-full border-b-4 border-red-700 shadow-lg transition-transform
                       ${!gameActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                     `}
                   >
                     STOP!
                   </button>
                </div>
                {/* Pointer for Desktop */}
                <div className="hidden md:block w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-900 mx-auto"></div>
             </div>

             {/* Character Image */}
             <div className="hidden md:block w-32 shrink-0 relative top-2">
                <div className="w-24 h-24 bg-yellow-400 border-4 border-black rounded-lg flex items-center justify-center shadow-lg relative z-10 rotate-6 overflow-hidden">
                   <span className="text-6xl">🤖</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULT PHASE ---
  if (!simulationData) return null;
  const isFinished = logIndex >= simulationData.missionLog.length;
  const earnedItem = getEarnedItem(simulationData.score);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-200 pb-20 px-4">
      {/* Header Status */}
      <div className="text-center space-y-2 mt-8">
        <h2 className="text-3xl font-bold text-white">ミッションレポート</h2>
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
          isFinished 
            ? simulationData.success 
              ? 'bg-green-500/20 text-green-400 border border-green-500' 
              : 'bg-red-500/20 text-red-400 border border-red-500'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500'
        }`}>
          {isFinished 
            ? (simulationData.success ? 'MISSION COMPLETE' : 'MISSION FAILED') 
            : 'IN PROGRESS...'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Log View */}
        <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-space-900 p-3 border-b border-space-700 font-mono text-xs text-gray-400 flex justify-between">
            <span>SYSTEM_LOG</span>
            <span>CONN_ESTABLISHED</span>
          </div>
          <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto font-mono text-sm">
            {simulationData.missionLog.slice(0, logIndex).map((log, idx) => (
              <div key={idx} className="flex gap-3 animate-fade-in-up items-start">
                <span className="text-space-accent opacity-50 pt-1">[{String(idx + 1).padStart(2, '0')}]</span>
                <div className="flex flex-col">
                  {/* English Log */}
                  <span className="text-xs text-blue-300 font-mono tracking-tight mb-0.5">{log.en}</span>
                  {/* Japanese Log */}
                  <span className="text-gray-100">{log.ja}</span>
                </div>
              </div>
            ))}
            {isFinished && !simulationData.success && simulationData.failureReason && (
               <div className="flex gap-3 text-red-400 font-bold border-t border-red-900/50 pt-3 mt-2">
                 <span className="opacity-50 pt-1">[ERR]</span>
                 <div className="flex flex-col">
                    <span className="text-xs text-red-300 font-mono tracking-tight mb-0.5">{simulationData.failureReason.en}</span>
                    <span>{simulationData.failureReason.ja}</span>
                 </div>
               </div>
            )}
            {logIndex < simulationData.missionLog.length && (
              <div className="text-space-accent animate-pulse">_</div>
            )}
          </div>
        </div>

        {/* Results Panel (Only shows when finished) */}
        <div className={`transition-all duration-1000 ${isFinished ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          {isFinished && (
            <div className="space-y-6">
              
              {/* Special Success Visualization */}
              <div className="bg-black border-4 border-yellow-500 rounded-xl p-2 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative overflow-hidden">
                 {/* Shiny Background */}
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#1e293b_0deg,#0f172a_120deg,#1e293b_240deg,#0f172a_360deg)] animate-spin-slow opacity-50"></div>
                 <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent)]"></div>

                 {/* Characters */}
                 <span className="absolute left-2 top-10 text-4xl md:text-6xl animate-bounce-slow">🚀</span>
                 <span className="absolute right-2 top-10 text-4xl md:text-6xl animate-pulse">🛰️</span>

                 <div className="relative z-10 flex flex-col items-center py-6">
                    {/* Title */}
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm mb-4 tracking-tighter" style={{textShadow: '0 0 10px rgba(234,179,8,0.5)'}}>
                       {simulationData.success ? '大 成 功' : 'ミッション失敗'}
                    </div>

                    {/* Reward Item Box */}
                    {simulationData.success && (
                       <div className="bg-green-300/80 border-4 border-green-500 rounded-lg p-6 mb-4 shadow-lg animate-fade-in-up transform hover:scale-105 transition-transform duration-500 relative">
                          <span className="text-6xl md:text-8xl filter drop-shadow-2xl">{earnedItem.icon}</span>
                          <div className="absolute top-0 right-0 p-1">
                             <span className="text-yellow-200 text-xl">✨</span>
                          </div>
                       </div>
                    )}

                    {/* Reward Name */}
                    {simulationData.success && (
                       <div className="bg-blue-900/90 border border-blue-400 px-6 py-2 rounded-full text-white font-bold text-lg shadow-lg">
                          {earnedItem.name} をゲット！
                       </div>
                    )}
                    {!simulationData.success && (
                        <div className="text-gray-400 font-bold">次は成功させよう！</div>
                    )}
                 </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                <h4 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  エンジニアリング・フィードバック
                </h4>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-blue-300/80 font-mono leading-relaxed border-b border-blue-500/20 pb-2">
                    {simulationData.feedback.en}
                  </p>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {simulationData.feedback.ja}
                  </p>
                </div>
              </div>

              <div className="bg-space-900 border border-space-700 p-4 rounded-xl text-center">
                 <p className="text-sm text-yellow-400 font-bold mb-2">✨ ステージクリア特典 ✨</p>
                 <p className="text-xs text-gray-400">次のミッションが解放されました！</p>
              </div>

              <button 
                onClick={onRetry}
                className="w-full py-4 bg-space-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                設計を修正して再挑戦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

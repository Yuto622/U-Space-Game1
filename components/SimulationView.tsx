
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SimulationPhase, SimulationResult } from '../types';

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


  // --- RENDER: GAME PHASE ---
  if (phase === 'GAME') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4">
        
        {/* Monitor Frame */}
        <div className="relative bg-slate-300 p-4 rounded-3xl border-b-8 border-r-8 border-slate-400 shadow-2xl w-full">
          
          {/* Header Plate */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-400 border-4 border-slate-300 px-8 py-2 rounded-lg shadow-lg z-10">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
               <h2 className="text-xl md:text-2xl font-black text-white tracking-widest drop-shadow-md">運用訓練場</h2>
               <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
             </div>
          </div>

          {/* Screen */}
          <div className="bg-black rounded-xl overflow-hidden border-4 border-slate-600 shadow-inner relative h-[400px] md:h-[500px]">
            {/* Space Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900/40"></div>
            
            {/* Stars (CSS) */}
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>

            {/* Planet Earth */}
            <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]"></div>
               {/* Continents approximation */}
               <div className="absolute top-10 left-20 w-40 h-20 bg-green-500/30 rounded-full blur-xl"></div>
               <div className="absolute top-20 right-32 w-60 h-40 bg-green-600/20 rounded-full blur-xl"></div>
            </div>

            {/* Probe Model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce-slow z-10">
              🛰️
            </div>

            {/* Timing Bar UI Overlay */}
            <div className="absolute bottom-10 left-10 right-10 md:left-20 md:right-20 bg-slate-900/80 backdrop-blur border border-slate-500 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 z-20">
               
               {/* Result Message Overlay */}
               {gameResult && (
                 <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-xl shadow-xl animate-fade-in-up whitespace-nowrap z-50">
                    <span className={`text-2xl font-black ${gameResult.score >= 80 ? 'text-red-500' : 'text-blue-600'}`}>
                      {gameResult.message}
                    </span>
                 </div>
               )}

               <div className="w-full h-12 bg-slate-800 rounded-full border-4 border-slate-600 relative overflow-hidden shadow-inner">
                 {/* Gradient Bar */}
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-400 to-red-500 opacity-80"></div>
                 
                 {/* Target Zone */}
                 <div 
                    className="absolute top-0 bottom-0 flex items-center justify-center"
                    style={{ left: `${TARGET_POS}%`, width: '40px', marginLeft: '-20px' }}
                 >
                    <div className="w-1 h-full bg-white/50 absolute"></div>
                    <span className="text-3xl drop-shadow-md relative z-10 animate-pulse">⭐</span>
                 </div>
                 
                 {/* Cursor */}
                 <div 
                   className="absolute top-0 bottom-0 w-2 bg-white border-x border-black shadow-[0_0_10px_white]"
                   style={{ left: `${cursorPos}%`, transition: gameActive ? 'none' : 'left 0.1s ease-out' }}
                 ></div>
               </div>

               <div className="flex justify-between w-full text-white font-bold px-2">
                  <span>LAUNCH START</span>
                  <span className="text-pink-400 text-xl italic">MAX</span>
               </div>
            </div>

            {/* Top Right Logo */}
            <div className="absolute top-4 right-4 bg-blue-900 border-2 border-blue-400 px-4 py-1 skew-x-[-10deg] shadow-lg">
               <span className="font-black text-blue-200 text-xl italic skew-x-[10deg] inline-block">MMX</span>
            </div>

          </div>

          {/* Control Panel / Desk */}
          <div className="mt-4 flex items-end justify-between relative">
             {/* Back Button */}
             <button 
                onClick={onBackToLab}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 shadow-lg flex flex-col items-center shrink-0"
             >
                <span className="text-xs opacity-80">けんきゅうじょ</span>
                <span>研究所へもどる</span>
             </button>

             {/* Character Dialog */}
             <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-xl mx-4 z-30">
                <div className="bg-blue-900/95 border-2 border-blue-400 rounded-xl p-4 shadow-2xl text-white flex gap-4 items-center">
                   <div className="flex-1">
                      <div className="flex justify-between text-xs text-blue-300 mb-1">
                        <span>GUIDANCE</span>
                        <span>TARGET: MARS</span>
                      </div>
                      <p className="text-lg font-bold leading-relaxed">
                        赤いバー(棒)を星のところで止められれば火星まで到達できそうだよ！
                        <span className="block text-sm text-yellow-300 mt-1 font-normal">(スペースキー または クリック でストップ！)</span>
                      </p>
                   </div>
                   <button 
                     onClick={stopGame}
                     disabled={!gameActive}
                     className={`
                       bg-red-500 text-white font-black text-xl px-6 py-4 rounded-full border-b-4 border-red-700 shadow-lg transition-transform
                       ${!gameActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                     `}
                   >
                     STOP!
                   </button>
                </div>
                {/* Pointer */}
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-900 mx-auto"></div>
             </div>

             {/* Character Image */}
             <div className="hidden md:block w-32 shrink-0 relative top-2">
                <div className="w-24 h-24 bg-yellow-400 border-4 border-black rounded-lg flex items-center justify-center text-5xl shadow-lg relative z-10 rotate-6">
                   🤖
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: LOADING PHASE ---
  if (phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-pulse text-gray-200">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-4 border-space-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-space-accent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🚀</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-space-accent">通信確立中...</div>
          <div className="text-sm text-gray-500 mt-2">火星探査機からのデータを受信しています</div>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULT PHASE ---
  if (!simulationData) return null;
  const isFinished = logIndex >= simulationData.missionLog.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-200">
      {/* Header Status */}
      <div className="text-center space-y-2">
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
          <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto font-mono text-sm">
            {simulationData.missionLog.slice(0, logIndex).map((log, idx) => (
              <div key={idx} className="flex gap-3 animate-fade-in-up">
                <span className="text-space-accent opacity-50">[{String(idx + 1).padStart(2, '0')}]</span>
                <span className="text-gray-200">{log}</span>
              </div>
            ))}
            {isFinished && !simulationData.success && (
               <div className="flex gap-3 text-red-400 font-bold border-t border-red-900/50 pt-2 mt-2">
               <span className="opacity-50">[ERR]</span>
               <span>{simulationData.failureReason}</span>
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
              {/* Score Card */}
              <div className="bg-gradient-to-br from-space-800 to-space-900 p-6 rounded-xl border border-space-700 shadow-xl">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-gray-400">総合スコア</span>
                  <span className="text-5xl font-bold text-white">{simulationData.score}<span className="text-xl text-gray-500">/100</span></span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-space-900/50 rounded-lg">
                     <span className="text-gray-300">採取サンプル量</span>
                     <span className={`font-mono font-bold ${simulationData.sampleRetrieved > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
                       {simulationData.sampleRetrieved}g
                     </span>
                  </div>
                   <div className="flex justify-between items-center p-3 bg-space-900/50 rounded-lg">
                     <span className="text-gray-300">科学的価値</span>
                     <div className="w-32 bg-space-700 rounded-full h-2">
                       <div className="bg-purple-500 h-2 rounded-full" style={{width: `${simulationData.scientificValue}%`}}></div>
                     </div>
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                <h4 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  エンジニアリング・フィードバック
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {simulationData.feedback}
                </p>
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

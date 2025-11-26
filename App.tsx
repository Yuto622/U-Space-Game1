
import React, { useState, useEffect, useCallback } from 'react';
import { PartSelector } from './components/PartSelector';
import { MissionPlanner } from './components/MissionPlanner';
import { SimulationView } from './components/SimulationView';
import { Encyclopedia } from './components/Encyclopedia';
import { GameStep, MissionConfig, PartCategory, Part, FlightProfile, LandingMethod, SimulationResult, SimulationPhase } from './types';
import { runMissionSimulation } from './services/geminiService';
import { generateRandomizedParts } from './constants';

const DEFAULT_CONFIG: MissionConfig = {
  parts: {
    [PartCategory.PROPULSION]: null,
    [PartCategory.POWER]: null,
    [PartCategory.COMMUNICATION]: null,
    [PartCategory.SAMPLER]: null,
    [PartCategory.COMPUTER]: null,
  },
  flightProfile: FlightProfile.HOHMANN,
  landingMethod: LandingMethod.TOUCH_AND_GO,
};

const CATEGORY_ORDER = [
  PartCategory.PROPULSION,
  PartCategory.POWER,
  PartCategory.COMMUNICATION,
  PartCategory.SAMPLER,
  PartCategory.COMPUTER
];

function App() {
  const [currentStep, setCurrentStep] = useState<GameStep>('INTRO');
  const [config, setConfig] = useState<MissionConfig>(DEFAULT_CONFIG);
  
  // Game Data State (Generated once per session)
  const [partsCatalog, setPartsCatalog] = useState<Part[]>([]);

  // Simulation States
  const [simPhase, setSimPhase] = useState<SimulationPhase>('GAME');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  
  // Design Phase State
  const [activeCategory, setActiveCategory] = useState<PartCategory>(PartCategory.PROPULSION);

  // Initialize Parts on Mount
  useEffect(() => {
    // Generate fresh parts when the app loads
    setPartsCatalog(generateRandomizedParts());
  }, []);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('u-space-save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Do not restore parts to ensure consistency with new random catalog
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('u-space-save', JSON.stringify(config));
  }, [config]);

  const handlePartSelect = useCallback((part: Part) => {
    setConfig(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [part.category]: part
      }
    }));
  }, []);

  const getTotalStats = () => {
    const parts = Object.values(config.parts).filter((p): p is Part => p !== null);
    return {
      mass: parts.reduce((acc, p) => acc + p.mass, 0),
      cost: parts.reduce((acc, p) => acc + p.cost, 0),
      powerUse: parts.reduce((acc, p) => acc + (p.powerConsumption || 0), 0),
      powerGen: parts.reduce((acc, p) => acc + (p.powerGeneration || 0), 0),
    };
  };

  const isConfigComplete = () => {
    return Object.values(config.parts).every(p => p !== null);
  };

  const goToSimulation = () => {
    setCurrentStep('SIMULATE');
    setSimPhase('GAME'); // Reset to game start
    setSimulationResult(null);
  };

  const handleLaunchComplete = async (score: number) => {
    setSimPhase('LOADING');
    // Run API simulation with the launch score
    const result = await runMissionSimulation(config, score);
    setSimulationResult(result);
    setSimPhase('RESULT');
  };

  const restartGame = () => {
    // Regenerate parts for a new round
    setPartsCatalog(generateRandomizedParts());
    setConfig(DEFAULT_CONFIG);
    setCurrentStep('DESIGN');
  };

  const stats = getTotalStats();

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white ${currentStep === 'DESIGN' ? 'bg-slate-300' : 'bg-space-900 text-gray-200'}`}>
      
      {/* Universal Header (Hidden in Design Mode for Immersion, or styled differently) */}
      {currentStep !== 'DESIGN' && (
        <header className="sticky top-0 z-40 bg-space-900/80 backdrop-blur-md border-b border-space-700">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentStep('INTRO')}>
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
              <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">U-Space <span className="text-space-accent font-normal text-sm">Phobos Mission</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowEncyclopedia(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Intro Screen */}
      {currentStep === 'INTRO' && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-2">
              君も宇宙エンジニア
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              火星の衛星「フォボス」を目指して探査機を設計しよう。<br/>
              予算内で最強の探査機を作り、サンプルを持ち帰ることはできるか？
            </p>
            <button 
              onClick={() => {
                // Ensure fresh parts on start
                setPartsCatalog(generateRandomizedParts());
                setConfig(DEFAULT_CONFIG);
                setCurrentStep('DESIGN');
              }}
              className="px-8 py-4 bg-space-accent hover:bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              ミッション開始
            </button>
          </div>
        </main>
      )}

      {/* DESIGN STEP - HANGAR VIEW (Responsive) */}
      {currentStep === 'DESIGN' && (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-300 overflow-x-hidden">
          
          {/* Main Stage: Visualization & Navigation */}
          <div className="flex-1 relative flex flex-col bg-gradient-to-b from-slate-300 to-slate-400">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#475569 2px, transparent 2px)', backgroundSize: '40px 40px'}}></div>
            <div className="absolute bottom-0 w-full h-1/3 bg-slate-400 border-t border-slate-500 pointer-events-none"></div>

            {/* Header / Back Button */}
            <div className="relative z-10 flex justify-between items-start p-6">
               <div className="text-yellow-400 font-bold text-2xl drop-shadow-md tracking-wider flex items-center gap-2" style={{textShadow: '2px 2px 0px #000'}}>
                 <span>ステップ 1</span>
               </div>
               <button 
                  onClick={() => setCurrentStep('INTRO')}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 shadow-lg text-sm"
               >
                  研究所へもどる
               </button>
            </div>

            {/* Center Content: Stand & Slots */}
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-8 z-10">
              
              {/* The Stand */}
              <div className="relative flex flex-col items-center animate-bounce-slow transform scale-75 md:scale-100">
                <div className="w-64 h-64 bg-slate-800/80 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-2xl backdrop-blur relative overflow-hidden">
                  {config.parts[activeCategory] ? (
                    <span className="text-[10rem] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                      {config.parts[activeCategory]?.icon}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-8xl font-bold opacity-30">?</span>
                  )}
                </div>
                <div className="w-24 h-40 bg-slate-600 mt-[-20px]"></div>
                <div className="w-64 h-12 bg-slate-700 rounded-full mt-[-6px] shadow-lg"></div>
              </div>

              {/* Slots Navigation */}
              <div className="flex flex-wrap justify-center gap-3 px-4 max-w-3xl">
                 {/* Connecting Rod (Visual only, tricky to do responsively perfectly, simplified here) */}
                 
                 {CATEGORY_ORDER.map((cat, index) => {
                   const isFilled = !!config.parts[cat];
                   const isActive = activeCategory === cat;
                   return (
                     <div 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-4 rounded-lg cursor-pointer transition-all transform flex items-center justify-center relative
                        ${isActive 
                          ? 'bg-slate-800 border-red-500 -translate-y-2 shadow-xl scale-110 z-10' 
                          : 'bg-slate-700 border-slate-900 hover:scale-105'}
                      `}
                     >
                       {isFilled && (
                         <span className="text-2xl sm:text-3xl md:text-4xl">{config.parts[cat]?.icon}</span>
                       )}
                       {!isFilled && !isActive && (
                          <div className="w-full h-full flex items-center justify-center opacity-20 text-white font-bold text-xl">{index+1}</div>
                       )}
                       {isActive && (
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] md:text-xs font-bold px-2 py-1 rounded whitespace-nowrap shadow">
                           {cat}
                         </div>
                       )}
                     </div>
                   )
                 })}
              </div>
            </div>

            {/* Dialog Box (Flows at bottom on mobile, overlay on desktop) */}
            <div className="p-4 w-full max-w-4xl mx-auto lg:absolute lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2 z-20">
              <div className="bg-blue-900/95 border-2 border-blue-400 rounded-xl p-4 flex items-center gap-4 shadow-2xl text-white min-h-[100px]">
                {/* Character Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-lg border-4 border-white shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden">
                  <span className="text-4xl md:text-5xl">🤖</span>
                </div>
                
                {/* Text */}
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] md:text-xs text-blue-300 font-bold tracking-widest uppercase">SYSTEM MESSAGE</span>
                     <div className="flex gap-1">
                        {isConfigComplete() && (
                          <button 
                            onClick={() => setCurrentStep('PLAN')}
                            className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full animate-bounce shadow-lg flex items-center gap-1"
                          >
                            次へ <span>➡️</span>
                          </button>
                        )}
                     </div>
                   </div>
                   <p className="text-sm md:text-lg font-bold leading-relaxed drop-shadow-md">
                     {config.parts[activeCategory] 
                       ? `「${config.parts[activeCategory]?.name}」を装備したよ！`
                       : `${activeCategory}を選ぼう！`
                     }
                   </p>
                </div>
              </div>
            </div>
            
            {/* Forklift Decoration (Hidden on mobile) */}
            <div className="absolute bottom-32 left-8 z-0 hidden xl:block text-6xl transform scale-x-[-1] opacity-80">🚜</div>
          </div>

          {/* Right Panel: Part Selector */}
          <div className="w-full lg:w-96 bg-slate-200 border-t-4 lg:border-t-0 lg:border-l-4 border-slate-400 p-4 flex flex-col shadow-2xl z-30 lg:h-screen lg:sticky lg:top-0 h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b-2 border-slate-300 pb-2">
               <h3 className="text-xl font-black text-slate-700 uppercase tracking-tighter flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></span>
                 パーツ倉庫
               </h3>
               {/* Mobile Crane Icon */}
               <div className="w-8 h-8 rounded border-2 border-orange-600 bg-orange-400 flex items-center justify-center text-orange-900 font-bold">C</div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
               <PartSelector 
                  category={activeCategory}
                  selectedPartId={config.parts[activeCategory]?.id}
                  onSelect={handlePartSelect}
                  parts={partsCatalog} 
               />
            </div>
          </div>

        </div>
      )}

      {/* PLAN STEP */}
      {currentStep === 'PLAN' && (
         <main className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-fade-in text-gray-200">
           <MissionPlanner config={config} onChange={setConfig} />
           
           {/* Footer Action Bar for Plan Step */}
           <div className="fixed bottom-0 left-0 right-0 bg-space-900/90 backdrop-blur border-t border-space-700 p-4 z-50">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="grid grid-cols-4 gap-4 md:gap-8 w-full md:w-auto text-center md:text-left">
                   <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">総重量</div>
                    <div className="text-sm md:text-lg font-mono font-bold text-white">{stats.mass} kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">コスト</div>
                    <div className="text-sm md:text-lg font-mono font-bold text-white">${stats.cost}M</div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <button 
                    onClick={() => setCurrentStep('DESIGN')}
                    className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-gray-300 hover:text-white hover:bg-space-800 transition-colors"
                  >
                    &larr; 設計に戻る
                  </button>
                  <button 
                    onClick={goToSimulation}
                    className="flex-1 md:flex-none px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>🚀</span> ミッション実行！
                  </button>
                </div>
              </div>
            </div>
         </main>
      )}

      {/* SIMULATE STEP (GAME & RESULTS) */}
      {currentStep === 'SIMULATE' && (
        <div className="w-full h-full min-h-screen pt-4 bg-slate-200">
           <SimulationView 
              phase={simPhase}
              simulationData={simulationResult} 
              onLaunchComplete={handleLaunchComplete}
              onRetry={restartGame} 
              onBackToLab={() => setCurrentStep('DESIGN')}
           />
        </div>
      )}

      <Encyclopedia isOpen={showEncyclopedia} onClose={() => setShowEncyclopedia(false)} catalog={partsCatalog} />
    </div>
  );
}

export default App;

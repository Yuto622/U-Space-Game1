import React from 'react';
import { PARTS_CATALOG } from '../constants';
import { PartCategory } from '../types';

interface EncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Encyclopedia: React.FC<EncyclopediaProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-space-800 border border-space-700 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl flex flex-col shadow-2xl">
        
        <div className="flex justify-between items-center p-6 border-b border-space-700 bg-space-900">
          <h2 className="text-2xl font-bold text-space-accent">宇宙パーツ図鑑</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          
          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">フォボス探査について</h3>
            <p className="text-gray-300">
              火星の月「フォボス」は、火星ができた頃の物質や、火星から飛び散った物質が降り積もっていると考えられています。
              ここからサンプルを持ち帰る（サンプルリターン）ことで、惑星がどのように生まれたかの謎を解く鍵が見つかるかもしれません。
              しかし、地球から遠く離れた場所への往復は、通信の遅延、電力の確保、厳しい放射線環境など、多くの技術的課題があります。
            </p>
          </div>

          {Object.values(PartCategory).map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-bold text-blue-400 mb-4 border-l-4 border-blue-500 pl-3">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PARTS_CATALOG.filter(p => p.category === category).map(part => (
                  <div key={part.id} className="bg-space-700 p-4 rounded-lg border border-space-600">
                    <h4 className="font-bold text-white mb-1">{part.name}</h4>
                    <p className="text-sm text-gray-400 mb-3 min-h-[40px]">{part.description}</p>
                    <div className="text-xs space-y-1 text-gray-300">
                      <div className="flex justify-between"><span>重量:</span> <span>{part.mass} kg</span></div>
                      <div className="flex justify-between"><span>コスト:</span> <span>${part.cost}M</span></div>
                      <div className="flex justify-between"><span>信頼性:</span> <span className={part.reliability >= 95 ? "text-green-400" : "text-yellow-400"}>{part.reliability}%</span></div>
                      {part.powerConsumption && <div className="flex justify-between"><span>消費電力:</span> <span>{part.powerConsumption} W</span></div>}
                      {part.powerGeneration && <div className="flex justify-between"><span>発電量:</span> <span className="text-yellow-300">+{part.powerGeneration} W</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-space-700 bg-space-900 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-space-accent hover:bg-blue-600 text-white rounded font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

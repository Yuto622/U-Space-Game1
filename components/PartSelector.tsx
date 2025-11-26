
import React, { useMemo } from 'react';
import { Part, PartCategory } from '../types';

interface PartSelectorProps {
  category: PartCategory;
  selectedPartId: string | undefined;
  onSelect: (part: Part) => void;
  parts: Part[]; // Added parts prop
}

export const PartSelector: React.FC<PartSelectorProps> = ({ category, selectedPartId, onSelect, parts: allParts }) => {
  // Filter parts based on the passed catalog
  const parts = useMemo(() => allParts.filter(p => p.category === category), [category, allParts]);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {parts.map((part) => {
        const isSelected = selectedPartId === part.id;
        return (
          <div 
            key={part.id}
            onClick={() => onSelect(part)}
            className={`
              relative p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 shadow-md
              flex items-start gap-3
              ${isSelected 
                ? 'bg-yellow-100 border-yellow-500 transform scale-105 z-10' 
                : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'}
            `}
          >
            {/* Part Icon Box */}
            <div className={`
              w-14 h-14 flex items-center justify-center rounded-md border-2 shrink-0 mt-1 p-1
              ${isSelected ? 'bg-yellow-300 border-yellow-600' : 'bg-slate-100 border-slate-300'}
            `}>
              <span className="text-3xl filter drop-shadow-sm">{part.icon}</span>
            </div>

            {/* Part Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-sm leading-tight mb-1 ${isSelected ? 'text-black' : 'text-slate-700'}`}>
                {part.name}
              </h4>
              <div className="flex gap-2 text-xs text-slate-500 mb-1">
                <span className="font-mono bg-slate-200 px-1 rounded">Wt:{part.mass}</span>
                <span className="font-mono bg-slate-200 px-1 rounded">${part.cost}M</span>
              </div>
              <p className={`text-xs leading-snug ${isSelected ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                {part.description}
              </p>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute -right-1 -top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { FlightProfile, LandingMethod, MissionConfig } from '../types';
import { FLIGHT_PROFILES_INFO, LANDING_METHODS_INFO } from '../constants';

interface MissionPlannerProps {
  config: MissionConfig;
  onChange: (newConfig: MissionConfig) => void;
}

export const MissionPlanner: React.FC<MissionPlannerProps> = ({ config, onChange }) => {
  
  const handleProfileChange = (profile: FlightProfile) => {
    onChange({ ...config, flightProfile: profile });
  };

  const handleLandingChange = (method: LandingMethod) => {
    onChange({ ...config, landingMethod: method });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      
      {/* Flight Profile Section */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm">1</span>
          飛行ルートの選択
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(FlightProfile).map((profile) => (
            <div 
              key={profile}
              onClick={() => handleProfileChange(profile)}
              className={`
                cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[200px]
                ${config.flightProfile === profile 
                  ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'bg-space-800 border-space-700 hover:border-gray-500'}
              `}
            >
              <div>
                <h4 className="font-bold text-lg text-white mb-3">{profile}</h4>
                <p className="text-sm text-gray-400">{FLIGHT_PROFILES_INFO[profile]}</p>
              </div>
              {config.flightProfile === profile && (
                 <div className="mt-4 text-blue-400 text-sm font-bold flex items-center justify-end">
                   選択中 ✓
                 </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Landing Method Section */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-sm">2</span>
          サンプル採取・着陸方式
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(LandingMethod).map((method) => (
            <div 
              key={method}
              onClick={() => handleLandingChange(method)}
              className={`
                cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[200px]
                ${config.landingMethod === method 
                  ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'bg-space-800 border-space-700 hover:border-gray-500'}
              `}
            >
              <div>
                <h4 className="font-bold text-lg text-white mb-3">{method}</h4>
                <p className="text-sm text-gray-400">{LANDING_METHODS_INFO[method]}</p>
              </div>
              {config.landingMethod === method && (
                 <div className="mt-4 text-purple-400 text-sm font-bold flex items-center justify-end">
                   選択中 ✓
                 </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex gap-3 items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-300">
          <strong className="text-yellow-400 block mb-1">設計アドバイス</strong>
          選択したパーツとミッションプランの相性が重要です。例えば、イオンエンジンで「高速遷移」を選ぶと減速が間に合わず通過してしまうかもしれません。また、「完全着陸」には頑丈な機体（重量増）が必要です。
        </p>
      </div>
    </div>
  );
};

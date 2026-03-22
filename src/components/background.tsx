"use client";

import React from "react";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0f0c29] overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Nền gradient chính */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] opacity-90" />
      
      {/* Các khối sáng mờ chuyển động nhẹ nhàng bằng CSS (pulse) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-700/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 blur-[150px] animate-[pulse_12s_ease-in-out_infinite]" 
        style={{ animationDirection: 'alternate-reverse' }} 
      />
      <div 
        className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" 
        style={{ animationDelay: '2s' }} 
      />
    </div>
  );
}

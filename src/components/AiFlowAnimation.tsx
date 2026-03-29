import { ArrowRightLeft, ShieldCheck, FileText, Database } from "lucide-react";

export function AiFlowAnimation() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square md:aspect-video flex items-center justify-center pointer-events-none">
      {/* Central Hub */}
      <div className="relative z-10 animate-pulse bg-primary/20 p-8 rounded-full border border-primary/50 shadow-[0_0_80px_rgba(var(--primary),0.5)]">
        <ShieldCheck className="w-20 h-20 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),1)]" strokeWidth={1.5} />
      </div>

      {/* Orbiting / Flowing Data Paths */}
      <div className="absolute inset-0 flex items-center justify-center opacity-90">
        {/* Path 1 */}
        <div className="absolute w-[120%] h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rotate-[15deg]">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-12 rounded-full bg-blue-500/30 glass-card flex items-center justify-center animate-[flow-in_3.5s_ease-out_infinite] shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            <FileText className="w-6 h-6 text-blue-300" />
          </div>
        </div>

        {/* Path 2 */}
        <div className="absolute w-[120%] h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent rotate-[60deg]">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-12 rounded-full bg-purple-500/30 glass-card flex items-center justify-center animate-[flow-in_4s_ease-out_infinite_1s] shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            <ArrowRightLeft className="w-6 h-6 text-purple-300" />
          </div>
        </div>

        {/* Path 3 */}
        <div className="absolute w-[120%] h-[2px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent -rotate-[30deg]">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-12 h-12 rounded-full bg-pink-500/30 glass-card flex items-center justify-center animate-[flow-in-reverse_3s_ease-out_infinite_0.5s] shadow-[0_0_20px_rgba(236,72,153,0.6)]">
            <Database className="w-6 h-6 text-pink-300" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flow-in {
          0% { left: 5%; opacity: 0; transform: translateY(-50%) scale(0.6); }
          15% { opacity: 1; transform: translateY(-50%) scale(1.1); }
          75% { opacity: 1; left: 45%; transform: translateY(-50%) scale(1); }
          100% { left: 50%; opacity: 0; transform: translateY(-50%) scale(0.4); }
        }
        @keyframes flow-in-reverse {
          0% { right: 5%; opacity: 0; transform: translateY(-50%) scale(0.6); }
          15% { opacity: 1; transform: translateY(-50%) scale(1.1); }
          75% { opacity: 1; right: 45%; transform: translateY(-50%) scale(1); }
          100% { right: 50%; opacity: 0; transform: translateY(-50%) scale(0.4); }
        }
      `}</style>
    </div>
  );
}

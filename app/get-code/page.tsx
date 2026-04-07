"use client";

import React, { useState, Suspense } from 'react';
import { 
  Gift, 
  PartyPopper,
  Zap,
  Star,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function GetCodeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get('phone') || '';

  if (!phone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
         <div className="bg-red-50 p-6 rounded-full">
            <Gift className="w-12 h-12 text-red-500 opacity-20" />
         </div>
         <h1 className="text-xl font-bold text-slate-800 italic uppercase">Thiếu thông tin nhận quà</h1>
         <p className="text-slate-400 text-sm max-w-xs">Hệ thống không tìm thấy số điện thoại của bạn. Vui lòng quay lại khảo sát.</p>
         <button 
           onClick={() => router.push('/')}
           className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại khảo sát
          </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
       <LuckyWheel phone={phone} />
    </div>
  );
}

export default function GetCodePage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 flex flex-col relative overflow-x-hidden">
      
      {/* BACKGROUND ELEMENTS (Consistent with main.tsx) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_40%)]"></div>
        <div className="h-full w-full bg-size-[100px_100px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] opacity-[0.03]"></div>
      </div>

      {/* HEADER NAV */}
      <header className="w-full bg-linear-to-r from-blue-600 to-blue-800 p-6 text-white text-center relative z-20 shadow-xl overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-white/5 opacity-40"></div>
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-4xl mx-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href='/'}>
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Gift className="w-6 h-6 text-yellow-300" />
             </div>
             <div className="text-left hidden sm:block">
               <h1 className="text-base font-black tracking-tight leading-none">NHẬN QUÀ VIP</h1>
               <p className="text-[9px] font-bold text-blue-200 mt-0.5 tracking-widest leading-none uppercase">DEV PỒ MOBILE</p>
             </div>
          </div>

          <div className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1.5 rounded-xl font-black text-[10px] shadow-lg">
             <Star className="w-3 h-3 fill-blue-900" /> VIP MEMBER ONLY
          </div>
        </motion.div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center py-12">
        <Suspense fallback={<div className="animate-pulse text-blue-600 font-bold uppercase tracking-widest">Đang tải Vòng quay...</div>}>
           <GetCodeContent />
        </Suspense>
      </main>

      {/* FOOTER */}
      <footer className="w-full p-8 text-center shrink-0 relative z-20">
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
           &copy; 2024 DEV PỒ MOBILE PRODUCT &bull; PREMIUM SOLUTIONS
         </p>
      </footer>
    </div>
  );
}

// --- Lucky Wheel Component ---
function LuckyWheel({ phone }: { phone: string }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [prize, setPrize] = useState<{ text: string, code: string, value: number } | null>(null);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { id: 1, text: 'Voucher 200K', val: 200000, color: '#2563eb' },
    { id: 2, text: 'Voucher 500K', val: 500000, color: '#ef4444' },
    { id: 3, text: 'Voucher 250K', val: 250000, color: '#f59e0b' },
    { id: 4, text: 'Voucher 300K', val: 300000, color: '#7c3aed' },
    { id: 5, text: 'Voucher 400K', val: 400000, color: '#10b981' },
    { id: 6, text: 'Special Gift', val: 100000, color: '#db2777' },
  ];

  const spin = async () => {
    if (isSpinning || prize) return;
    setIsSpinning(true);

    const winIdx = Math.floor(Math.random() * prizes.length);
    const winPrize = prizes[winIdx];
    const sliceAngle = 360 / prizes.length;
    const spins = 12;
    const stopAngle = (spins * 360) + (360 - (winIdx * sliceAngle));

    setRotation(stopAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      setIsSending(true);

      const code = `DEVPO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      try {
        await fetch('/api/zalo/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, value: winPrize.val, code })
        });
      } catch (err) {
        console.error('Delivery failure:', err);
      } finally {
        setIsSending(false);
        setPrize({ text: winPrize.text, code, value: winPrize.val });
      }
    }, 4500);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-12"
      >
        <span className="text-[12px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest italic mb-4 inline-block">Gatcha Systems</span>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
          Vòng Quay <span className="text-blue-600 drop-shadow-sm">May Mắn</span>
        </h2>
        <p className="text-slate-400 text-sm font-black mt-4 uppercase tracking-[0.2em] opacity-80">Phone: {phone}</p>
      </motion.div>

      <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px] mb-16 flex items-center justify-center">
        {/* Pointer Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 sm:-mt-14 z-30 drop-shadow-[0_10px_20px_rgba(239,68,68,0.5)]">
           <svg width="60" height="60" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20 22L12 18L4 22L12 2Z" className="stroke-white stroke-0.5" />
           </svg>
        </div>

        {/* Outer Ring Ambient Glow */}
        <div className="absolute inset-[-40px] bg-blue-600/5 rounded-full blur-[80px] animate-pulse"></div>

        <div 
          className="w-full h-full rounded-full border-12 border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden transition-transform outline-none"
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transitionDuration: isSpinning ? '4.5s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.15, 0, 0, 1)' 
          }}
        >
          {prizes.map((p, index) => {
            const angle = index * (360 / prizes.length);
            return (
              <div 
                key={p.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 33%)',
                  backgroundColor: p.color,
                  transformOrigin: '50% 50%'
                }}
              />
            );
          })}
          
          {prizes.map((p, index) => {
             const angle = index * (360 / prizes.length) + (360 / prizes.length / 2);
             return (
                <div key={`text-${p.id}`} className="absolute w-full h-full flex items-start justify-center pt-10 sm:pt-14 font-black text-white text-[12px] sm:text-lg drop-shadow-md" style={{ transform: `rotate(${angle}deg)` }}>
                  <span className="w-32 text-center leading-tight -rotate-90 origin-bottom select-none uppercase tracking-widest">{p.text}</span>
                </div>
             )
          })}
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full border-6 border-slate-900 z-10 shadow-2xl flex items-center justify-center">
             <div className="text-center">
                <Gift className={cn("w-10 h-10 sm:w-14 sm:h-14 text-slate-900", isSpinning && "animate-bounce")} />
             </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm">
        {!prize ? (
          <button 
            onClick={spin} disabled={isSpinning || isSending}
            className={cn(
              "w-full py-6 sm:py-8 rounded-3xl font-black text-white text-xl transition-all shadow-[0_20px_40px_-5px_rgba(239,68,68,0.3)] active:scale-[1.02] uppercase tracking-[0.4em] relative overflow-hidden group",
              (isSpinning || isSending) ? "bg-slate-300 cursor-not-allowed" : "bg-linear-to-r from-red-500 to-red-600 hover:scale-[1.02]"
            )}
          >
            <span className="relative z-10">{isSpinning ? 'SPINNING...' : isSending ? 'DELIVERING...' : 'START SPIN'}</span>
            {!isSpinning && !isSending && (
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            )}
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full space-y-6"
          >
             <div className="bg-linear-to-br from-white to-slate-50 border-2 border-green-200 p-10 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-green-100/30 rotate-12 pointer-events-none">
                  <PartyPopper className="w-48 h-48 sm:w-64 sm:h-64"/>
               </div>
               
               <div className="relative z-10">
                 <p className="text-green-600 font-black uppercase tracking-[0.5em] text-[10px] mb-4">CONGRATULATIONS!</p>
                 <h3 className="text-5xl font-black text-slate-800 leading-none mb-8 tracking-tighter uppercase italic">{prize.text}</h3>
                 
                 <div className="p-8 bg-slate-900 rounded-3xl text-white font-mono flex flex-col relative group pointer-events-none group shadow-inner">
                    <span className="text-[10px] opacity-40 uppercase tracking-[0.4em] mb-2 font-bold select-none">Voucher Code (Zalo Locked)</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-[0.2em] text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]">{prize.code}</span>
                    <div className="absolute top-2 right-2 text-white/5"><Star className="w-12 h-12 fill-white"/></div>
                 </div>
                 
                 <p className="text-xs text-slate-400 mt-8 leading-relaxed font-bold max-w-xs mx-auto">
                   Mã ưu đãi đã được lưu trữ an toàn trong mục tin nhắn Zalo OA của bạn. Hãy đưa mã này cho nhân viên phục vụ để được giảm trừ trực tiếp.
                 </p>
               </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

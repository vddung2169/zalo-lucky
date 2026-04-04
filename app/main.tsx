"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  Gift, 
  Phone, 
  Smartphone, 
  Bell, 
  PartyPopper 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ZaloFollowButton from "@/components/ZaloFollowButton";

/**
 * Utility for tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Custom Zalo Icon as it's not available in lucide-react
 */
const ZaloIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={cn("w-5 h-5", className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.071 4.929C17.18 3.038 14.664 2 12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c2.664 0 5.18-1.038 7.071-2.929C21.038 17.18 22 14.664 22 12s-1.038-5.18-2.929-7.071zM12 19c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" />
    <path d="M11 11h2v4h-2zm0-4h2v2h-2z" />
  </svg>
);

interface FormData {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string[];
  phone: string;
}

interface FormErrors {
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  q4?: string | null;
  q5?: string | null;
  phone?: string | null;
}

type Step = 'survey' | 'follow' | 'wheel';

export default function App() {
  // Quản lý trạng thái màn hình
  const [step, setStep] = useState<Step>('survey');
  
  // Dữ liệu khảo sát
  const [formData, setFormData] = useState<FormData>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: [],
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Xử lý chọn đáp án 1 lựa chọn
  const handleRadioChange = (question: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [question]: value }));
    setErrors(prev => ({ ...prev, [question]: null }));
  };

  // Xử lý chọn đáp án nhiều lựa chọn (Câu 5)
  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const currentQ5 = prev.q5;
      if (currentQ5.includes(value)) {
        return { ...prev, q5: currentQ5.filter(item => item !== value) };
      } else {
        return { ...prev, q5: [...currentQ5, value] };
      }
    });
    setErrors(prev => ({ ...prev, q5: null }));
  };

  // Validate và Submit Khảo sát
  const handleSurveySubmit = () => {
    const newErrors: FormErrors = {};
    if (!formData.q1) newErrors.q1 = 'Vui lòng chọn dòng máy đang dùng';
    if (!formData.q2) newErrors.q2 = 'Vui lòng chọn thời gian dự kiến';
    if (!formData.q3.trim()) newErrors.q3 = 'Vui lòng nhập dòng máy quan tâm';
    if (!formData.q4) newErrors.q4 = 'Vui lòng đánh giá tần suất';
    if (formData.q5.length === 0) newErrors.q5 = 'Vui lòng chọn ít nhất 1 nội dung';
    
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    const isPotentialUserId = formData.phone.length > 10; // Simple check for potential User ID
    if (!formData.phone || (!phoneRegex.test(formData.phone) && !isPotentialUserId)) {
      newErrors.phone = 'Vui lòng nhập số điện thoại hoặc User ID hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('follow'); // Chuyển sang bước Zalo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Gift className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
          </motion.div>
          <h1 className="text-xl font-bold uppercase tracking-wide leading-tight">
            1 Phút Góp Ý<br/>Nhận Ngay Voucher 200K -500K
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {/* Màn hình 1: Khảo sát */}
          {step === 'survey' && (
            <motion.div 
              key="survey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-8"
            >
              <section className="space-y-6">
                <div className="border-b-2 border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600"/> PHẦN 1: NHU CẦU
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Giúp shop tư vấn tốt nhất cho bạn</p>
                </div>

                {/* Câu 1 */}
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Câu 1: Bạn đang sử dùng dòng máy nào?</label>
                  <div className="space-y-2">
                    {['iPhone 11 trở xuống', 'iPhone 12 / 13 Series', 'iPhone 14 / 15 Series', 'Đang dùng Android'].map((opt) => (
                      <label key={opt} className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.q1 === opt ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      )}>
                        <input type="radio" name="q1" checked={formData.q1 === opt} onChange={() => handleRadioChange('q1', opt)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.q1 && <p className="text-red-500 text-xs mt-1">{errors.q1}</p>}
                </div>

                {/* Câu 2 */}
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Câu 2: Thời gian dự kiến nâng cấp?</label>
                  <div className="space-y-2">
                    {['Trong tháng này', '2-3 tháng tới', 'Cuối năm nay', 'Chỉ xem tham khảo'].map((opt) => (
                      <label key={opt} className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.q2 === opt ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      )}>
                        <input type="radio" name="q2" checked={formData.q2 === opt} onChange={() => handleRadioChange('q2', opt)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.q2 && <p className="text-red-500 text-xs mt-1">{errors.q2}</p>}
                </div>

                {/* Câu 3 */}
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Câu 3: Dòng máy bạn quan tâm nhất?</label>
                  <input 
                    type="text" 
                    placeholder="VD: iPhone 15 Pro Max..." 
                    className={cn(
                      "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
                      errors.q3 ? 'border-red-500' : 'border-slate-300'
                    )}
                    value={formData.q3}
                    onChange={(e) => { setFormData({...formData, q3: e.target.value}); setErrors({...errors, q3: null}); }}
                  />
                  {errors.q3 && <p className="text-red-500 text-xs mt-1">{errors.q3}</p>}
                </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-slate-200">
                <div className="border-b-2 border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600"/> PHẦN 2: THÔNG BÁO
                  </h2>
                </div>

                {/* Câu 4 */}
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Câu 4: Tần suất gửi bảng giá hiện tại?</label>
                  <div className="space-y-2">
                    {['Rất tốt, cập nhật mỗi ngày', 'Hơi nhiều, nên giảm 2-3 lần/tuần', 'Chỉ gửi khi có ưu đãi lớn'].map((opt) => (
                      <label key={opt} className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.q4 === opt ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      )}>
                        <input type="radio" name="q4" checked={formData.q4 === opt} onChange={() => handleRadioChange('q4', opt)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.q4 && <p className="text-red-500 text-xs mt-1">{errors.q4}</p>}
                </div>

                {/* Câu 5 */}
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Câu 5: Nội dung muốn Admin chia sẻ thêm?</label>
                  <div className="space-y-2">
                    {['Video thực tế máy', 'Mẹo kiểm tra iPhone cũ', 'Deal phụ kiện 9k, 99k', 'Thu cũ đổi mới trợ giá'].map((opt) => (
                      <label key={opt} className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.q5.includes(opt) ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      )}>
                        <input type="checkbox" checked={formData.q5.includes(opt)} onChange={() => handleCheckboxChange(opt)} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.q5 && <p className="text-red-500 text-xs mt-1">{errors.q5}</p>}
                </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-slate-200">
                <div className="border-b-2 border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-blue-600"/> PHẦN 3: NHẬN QUÀ
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <label className="font-semibold text-sm">Số điện thoại Zalo nhận thưởng:</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nhập SĐT hoặc Zalo User ID..." 
                      className={cn(
                        "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium",
                        errors.phone ? 'border-red-500' : 'border-slate-300'
                      )}
                      value={formData.phone}
                      onChange={(e) => { setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: null}); }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Mẹo: Nhập <strong>Zalo User ID</strong> của bạn để test gửi tin nhắn thực tế.
                  </p>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </section>

              <button 
                onClick={handleSurveySubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
              >
                Tiếp tục & Nhận lượt quay <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Màn hình 2: Bắt buộc Quan Tâm Zalo OA */}
          {step === 'follow' && (
             <motion.div 
               key="follow"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-8 text-center space-y-6"
             >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Cảm ơn bạn!</h2>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                    Dữ liệu đã được ghi nhận. Vui lòng nhắn <strong className="text-blue-600">Quan tâm Zalo OA</strong> để nhận mã Voucher và quay thưởng nhé!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-8 bg-linear-to-b from-blue-50 to-white rounded-2xl border-2 border-blue-500/30 shadow-xl relative overflow-hidden text-center">
                      <ZaloFollowButton onFollowed={() => {
                        console.log('User followed successfully!');
                        setTimeout(() => setStep('wheel'), 1500);
                      }} />
                      <p className="text-[12px] text-blue-600 font-bold uppercase tracking-widest mt-2 animate-pulse">
                        Nhấn &quot;Quan tâm&quot; ngay để nhận quà!
                      </p>
                   </div>

                   <button 
                      onClick={() => setStep('wheel')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg group"
                   >
                      Tiếp tục nhận quà <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
                
                <p className="text-xs text-slate-400 italic">
                  *Mã giảm giá 200k sẽ được gửi tự động qua tin nhắn Zalo.
                </p>
             </motion.div>
          )}

          {/* Màn hình 3: Vòng Quay May Mắn */}
          {step === 'wheel' && <LuckyWheel formData={formData} />}
        </AnimatePresence>

      </div>
    </div>
  );
}

// --- Component Vòng Quay May Mắn ---
interface Prize {
  id: number;
  text: string;
  color: string;
}

interface UserPrize {
  value: number;
  code: string;
  text: string;
}

function LuckyWheel({ formData }: { formData: FormData }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prize, setPrize] = useState<UserPrize | null>(null);
  const [rotation, setRotation] = useState(0);

  const prizes: { id: number; text: string; color: string }[] = [
    { id: 1, text: 'Voucher 200K', color: '#3b82f6' },
    { id: 2, text: 'Voucher 500K', color: '#10b981' },
    { id: 3, text: 'Chúc may mắn', color: '#64748b' },
    { id: 4, text: 'Voucher 250K', color: '#f59e0b' },
    { id: 5, text: 'Voucher 400K', color: '#ec4899' },
    { id: 6, text: 'Voucher 300K', color: '#8b5cf6' },
  ];

  const spinWheel = () => {
    if (isSpinning || prize) return;
    setIsSpinning(true);

    // Randomize a prize index
    const targetPrizeIndex = Math.floor(Math.random() * prizes.length);
    const selectedPrize = prizes[targetPrizeIndex];

    const sliceAngle = 360 / prizes.length;
    const spins = 10; 
    const stopAngle = (spins * 360) + (360 - (targetPrizeIndex * sliceAngle));

    setRotation(stopAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      setIsSending(true);

      // Generate random voucher details
      const valueMatch = selectedPrize.text.match(/\d+/);
      const prizeValue = valueMatch ? parseInt(valueMatch[0]) * 1000 : 0;
      const voucherCode = `ZALO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Call Zalo API proxy
      try {
        const response = await fetch('/api/zalo/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            value: prizeValue,
            code: voucherCode
          })
        });
        const result = await response.json();
        if (!result.success) {
          setApiError(result.zalo_message || result.error);
        }
      } catch (err) {
        console.error('Failed to send prize via Zalo:', err);
        setApiError('Không thể kết nối đến máy chủ Zalo');
      } finally {
        setIsSending(false);
        setPrize({
          value: prizeValue,
          code: voucherCode,
          text: selectedPrize.text
        });
      }
    }, 4000);
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Vòng Quay May Mắn</h2>
      <p className="text-slate-500 mb-8 text-sm">Chúc <span className="text-blue-600 font-bold">{formData.phone}</span> may mắn!</p>

      <div className="relative w-72 h-72 mb-8">
        {/* Kim chỉ nam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-20">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20 22L12 18L4 22L12 2Z" className="drop-shadow-lg" />
           </svg>
        </div>

        {/* Bánh xe */}
        <div 
          className="w-full h-full rounded-full border-8 border-slate-800 shadow-2xl relative overflow-hidden transition-transform ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transitionDuration: isSpinning ? '4s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.15, 0, 0.15, 1)' 
          }}
        >
          {prizes.map((p, index) => {
            const rotationAngle = index * (360 / prizes.length);
            return (
              <div 
                key={p.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 33%)',
                  backgroundColor: p.color,
                  transformOrigin: '50% 50%'
                }}
              />
            );
          })}
          
          {prizes.map((p, index) => {
             const rotationAngle = index * (360 / prizes.length) + (360 / prizes.length / 2);
             return (
                <div 
                  key={`text-${p.id}`}
                  className="absolute w-full h-full flex items-start justify-center pt-8 font-bold text-white text-[10px] drop-shadow-lg"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <span className="w-20 text-center leading-tight -rotate-90 origin-bottom">{p.text}</span>
                </div>
             )
          })}
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full border-4 border-slate-800 z-10 shadow-inner flex items-center justify-center">
             <Gift className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {!prize ? (
        <button 
          onClick={spinWheel}
          disabled={isSpinning || isSending}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-xl",
            (isSpinning || isSending) ? "bg-slate-400" : "bg-red-500 hover:bg-red-600 active:scale-95 px-6"
          )}
        >
          {isSpinning ? 'Đang quay...' : isSending ? 'Đang gửi quà...' : 'QUAY NGAY'}
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-green-50 border-2 border-green-200 p-6 rounded-2xl text-center shadow-inner"
        >
           <PartyPopper className="w-12 h-12 text-green-600 mx-auto mb-3 animate-bounce" />
           <h3 className="text-green-800 font-bold text-xl">Chúc mừng bạn!</h3>
           <p className="text-green-700 font-medium mt-2">Phần thưởng: <span className="text-2xl text-red-600 font-black block mt-1">{prize.text}</span></p>
           
           {prize.value > 0 && (
             <div className="mt-4 p-3 bg-white rounded-lg border border-green-100 shadow-sm inline-block w-full">
               <p className="text-xs text-slate-500 mb-1">Mã ưu đãi của bạn:</p>
               <p className="text-lg font-mono font-bold text-blue-700 tracking-wider bg-blue-50 py-2 rounded border border-blue-100">{prize.code}</p>
             </div>
           )}

           <div className="mt-6 pt-4 border-t border-green-200 text-xs text-slate-500">
             Chi tiết quà tặng đã được gửi đến Zalo OA cho bạn.
           </div>

           {apiError && (
             <div className="mt-4 p-2 bg-red-50 border border-red-100 rounded text-[10px] text-red-600">
               <strong>Lưu ý (Dev):</strong> {apiError}
               <br/>
               <span className="opacity-70 italic text-[9px]">*Hãy đảm bảo bạn đã Quan tâm OA và nhập đúng User ID.</span>
             </div>
           )}
        </motion.div>
      )}
    </div>
  );
}
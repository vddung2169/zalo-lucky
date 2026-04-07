import React, { useState, useEffect } from 'react';
import { Menu, X, User, Gift, Trophy, Info, ChevronRight, Sparkles, XCircle, AlertCircle, Phone, Loader2 } from 'lucide-react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbxPpnTIFtZLvZqiLrsw2Ic2HRPIKda2jZbJkxSU07kh35q91ia7TuTWh-eL_TYghhLO/exec';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const [prizeName, setPrizeName] = useState('');
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isLoadingFingerprint, setIsLoadingFingerprint] = useState(true);

  // New Registration State
  const [step, setStep] = useState(1); // 1: Info, 2: Wheel
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validate Vietnamese Phone Number
  const validatePhone = (p: string) => /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(p);

  // Initialize FingerprintJS and check spin status
  useEffect(() => {
    const setFp = async () => {
      try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        const id = result.visitorId;
        setVisitorId(id);

        // Check if already spun in localStorage
        const storedSpinData = localStorage.getItem(`spin_record_${id}`);
        if (storedSpinData) {
          const data = JSON.parse(storedSpinData);
          setHasSpun(true);
          setPrizeName(data.prize);
          if (data.fullName) setFullName(data.fullName);
          setStep(2); // Skip registration if already spun
          // Briefly show prize if they revisit
          setShowPrize(true);
        }
      } catch (error) {
        console.error('Error loading fingerprint:', error);
      } finally {
        setIsLoadingFingerprint(false);
      }
    };

    setFp();
  }, []);

  // Xử lý submit thông tin cá nhân
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên!');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Số điện thoại không hợp lệ!');
      return;
    }

    setIsLoading(true);
    try {
      // Check if phone number already exists in Google Sheet
      const response = await fetch(GOOGLE_SHEET_API, {
          method: 'POST',
          headers: {
            // QUAN TRỌNG: Thêm header này để bypass lỗi CORS của Google
            'Content-Type': 'text/plain;charset=utf-8', 
          },
          body: JSON.stringify({ action: 'check', phone: phone })
        });
      const data = await response.json();

      if (data.exists) {
        setHasSpun(true);
        setPrizeName(data.prize || 'Quà tặng');
        if (data.fullName) setFullName(data.fullName);
        setStep(2);
        setShowPrize(true);
        setErrorMsg('Số điện thoại này đã tham gia quay thưởng!');

        // Save to localStorage if we have the visitorId
        if (visitorId) {
          localStorage.setItem(`spin_record_${visitorId}`, JSON.stringify({
            prize: data.prize || 'Quà tặng',
            fullName: data.fullName || fullName,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        setStep(2); // Go to Lucky Wheel
      }
    } catch (err) {
      console.error('Error checking registration:', err);
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const saveResultToSheet = async (prize: string) => {
    try {
      await fetch(GOOGLE_SHEET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({
          action: 'save',
          phone: phone,
          prize: prize,
        })
      });
    } catch (err) {
      console.error('Error saving result:', err);
    }
  };

  // Cấu hình các ô trên vòng quay
  const segments = [
    { id: 1, label: '100K VNĐ', color: '#0ea5e9' }, // Cyan
    { id: 2, label: '200K VNĐ', color: '#3b82f6' }, // Blue
    { id: 3, label: '300K VNĐ', color: '#8b5cf6' }, // Purple
    { id: 4, label: '100K VNĐ', color: '#0ea5e9' }, // Cyan
    { id: 5, label: '200K VNĐ', color: '#3b82f6' }, // Blue
    { id: 6, label: '300K VNĐ', color: '#8b5cf6' }, // Purple
    { id: 7, label: '100K VNĐ', color: '#0ea5e9' }, // Cyan
    { id: 8, label: '200K VNĐ', color: '#3b82f6' }, // Blue
    { id: 9, label: '300K VNĐ', color: '#8b5cf6' }, // Purple
    { id: 10, label: '500K VNĐ', color: '#f59e0b' }, // Yellow
  ];

const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowPrize(false);

    // 1. TẠO MẢNG CHỈ CHỨA CÁC Ô ĐƯỢC PHÉP TRÚNG
    // Giả sử mảng segments của bạn giống như ở trên, 500K có label là '500K VNĐ'
    const allowedSegments = segments.filter(seg => seg.label !== '500K VNĐ');
    
    // 2. CHỌN NGẪU NHIÊN TỪ MẢNG MỚI (Không có 500K)
    const randomAllowedSegmentIndex = Math.floor(Math.random() * allowedSegments.length);
    const chosenSegment = allowedSegments[randomAllowedSegmentIndex];

    // 3. TÌM LẠI INDEX CỦA Ô ĐÓ TRONG MẢNG GỐC (segments)
    // Cần index gốc để tính góc quay chính xác trên giao diện
    const targetIndexInOriginalSegments = segments.findIndex(seg => seg.id === chosenSegment.id);

    const spinMultiplier = 5; 
    const segmentAngle = 360 / segments.length;
    
    // 4. TÍNH GÓC QUAY DỰA TRÊN INDEX GỐC ĐÃ CHỌN
    // Chú ý: Vì vòng quay quay xuôi (cộng góc), mà mũi tên ở mốc 0 độ (trên cùng),
    // nên để ô mục tiêu (ở vị trí targetIndex) dừng đúng ở trên cùng,
    // ta cần quay thêm một góc sao cho phần bù của góc quay hiện tại % 360 
    // rơi vào đúng ô mục tiêu. Công thức dưới đây đảm bảo điều đó.
    
    // Góc cần quay (thêm vào) để dừng lại ở ô targetIndex:
    // (segments.length - targetIndex) * segmentAngle là góc tính từ mũi tên (0 độ) 
    // đi NGƯỢC chiều kim đồng hồ đến đúng vị trí của ô đó.
    const baseTargetAngle = (segments.length - targetIndexInOriginalSegments) * segmentAngle;
    
    // Để đẹp, ta cộng thêm nửa góc một ô (segmentAngle / 2) để mũi tên chỉ vào GIỮA ô
    // Trừ đi số dư hiện tại (rotation % 360) để tính đúng khoảng cách quay thực tế từ vị trí hiện tại
    let offsetFromCurrent = baseTargetAngle - (rotation % 360);
    
    // Đảm bảo offset luôn dương để vòng quay không bị giật lùi
    if (offsetFromCurrent < 0) {
        offsetFromCurrent += 360;
    }
    
    // Tổng góc quay = (Số vòng cố định * 360) + Góc cần bù thêm + Chỉnh vào giữa ô
    const targetAngle = (spinMultiplier * 360) + offsetFromCurrent - (segmentAngle / 2);

    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    // Tính toán lại index dựa trên góc thực tế (để check chéo)
    // Đoạn này thực ra không cần thiết nữa vì ta ĐÃ BIẾT KẾT QUẢ là chosenSegment
    // nhưng giữ lại để logic thống nhất.
    const calculatedPrizeIndex = (segments.length - Math.floor(((newRotation % 360) + (segmentAngle/2)) / segmentAngle)) % segments.length;

    setTimeout(() => {
      setIsSpinning(false);
      
      // Sử dụng always chosenSegment (chắc chắn không phải 500K)
      const prize = chosenSegment.label;
      
      setPrizeName(prize);
      setShowPrize(true);
      setHasSpun(true);

      // Save to Google Sheet
      saveResultToSheet(prize);

      // Save to localStorage
      if (visitorId) {
        localStorage.setItem(`spin_record_${visitorId}`, JSON.stringify({
          prize,
          fullName,
          timestamp: new Date().toISOString()
        }));
      }
    }, 5000); 
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-50 font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Tech Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[20%] bg-blue-500/5 rounded-full blur-[80px]"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzMCwgNTgsIDEzOCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] z-0"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-12">
        
        {step === 1 ? (
          /* STEP 1: REGISTRATION FORM */
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="text-center mb-8">
                 <div className="flex justify-center items-center gap-2 cursor-pointer mb-4">
            <img 
              src="/devpo_logo_white.png" 
              alt="DEV PỒ" 
              className="h-12 w-auto object-contain" 
            />
          </div>

                <p className="text-slate-400 text-sm md:text-base">Nhập thông tin để bắt đầu hành trình may mắn</p>
              </div>

              <form onSubmit={handleRegistration} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                    Họ và Tên
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                    Số Điện Thoại
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-white"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                    <AlertCircle size={16} />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>Tiếp Tục</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                <p className="text-xs text-slate-500">
                  Thông tin của bạn được bảo mật theo chính sách của <span className='font-bold'>DEV PỒ</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: LUCKY WHEEL */
          <>
            {/* Title Section */}
            <div className="text-center mb-10 md:mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
                <Sparkles size={16} />
                <span>Chào mừng {fullName}!</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Vòng Quay <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">May Mắn</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Quay ngay để nhận hàng ngàn phần quà giá trị và voucher khóa học từ DEV PỒ. 100% trúng thưởng!
              </p>
            </div>

            <div className="w-full">
              {/* VÒNG QUAY - Cột trái */}
              <div className="flex flex-col items-center justify-center">
                {/* Vòng quay Wrapper */}
                <div 
                  className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[480px] md:h-[480px] mb-10"
                  style={{
                    ['--dot-distance' as any]: 'calc(-1 * (100% / 2 - 10px))'
                  }}
                >
                  {/* Vòng sáng ngoài cùng */}
                  <div className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 blur-xl animate-pulse"></div>
                  
                  {/* Khung viền ngoài */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-[#0f172a] shadow-[0_0_40px_rgba(14,165,233,0.4)_inset,0_0_20px_rgba(14,165,233,0.5)] z-10 pointer-events-none"></div>
                  <div className="absolute inset-[10px] rounded-full border-2 border-cyan-500/50 z-10 pointer-events-none"></div>
                  
                  {/* Đèn viền (Dots) */}
                  <div className="absolute inset-1 rounded-full z-10 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(var(--dot-distance, -230px))`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Mũi tên chỉ (Phía trên cùng) */}
                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                    <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 50L0 15C0 15 8 0 20 0C32 0 40 15 40 15L20 50Z" fill="url(#paint0_linear)"/>
                      <path d="M20 48L2 15.5C2 15.5 9.5 2 20 2C30.5 2 38 15.5 38 15.5L20 48Z" fill="#e2e8f0"/>
                      <circle cx="20" cy="15" r="5" fill="#0f172a"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="20" y1="0" x2="20" y2="50" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#cbd5e1" />
                          <stop offset="1" stopColor="#64748b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* BẢN THÂN VÒNG QUAY */}
                  <div 
                    className="w-full h-full rounded-full overflow-hidden relative"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      background: `conic-gradient(${
                        segments.map((s, i) => {
                          const angle = 360 / segments.length;
                          return `${s.color} ${i * angle}deg ${(i + 1) * angle}deg`;
                        }).join(', ')
                      })`
                    }}
                  >
                    {[...Array(segments.length)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white/30 origin-bottom"
                        style={{ transform: `translateX(-50%) rotate(${i * (360 / segments.length)}deg)` }}
                      ></div>
                    ))}

                    {segments.map((segment, index) => {
                      const segmentAngle = 360 / segments.length;
                      const rotateAngle = index * segmentAngle + (segmentAngle / 2);
                      return (
                        <div
                          key={segment.id}
                          className="absolute top-0 left-1/2 w-[80px] md:w-[100px] h-1/2 origin-bottom flex items-start justify-center pt-6 sm:pt-8 md:pt-12"
                          style={{ transform: `translateX(-50%) rotate(${rotateAngle}deg)` }}
                        >
                          <span className="text-white font-black text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -rotate-90 origin-center whitespace-nowrap">
                            {segment.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút trung tâm vòng quay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-full z-20 border-[6px] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center">
                    <div className="w-10 h-10 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee_inset]"></div>
                  </div>
                </div>

                {/* Spin Error/Limit message */}
                {hasSpun && !isSpinning && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle size={18} />
                    <span>Bạn đã tham gia sự kiện này rồi!</span>
                  </div>
                )}

                {/* Nút QUAY NGAY */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || hasSpun || isLoadingFingerprint}
                  className={`
                    group relative px-12 py-4 md:px-16 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-black text-xl md:text-2xl uppercase tracking-widest text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300
                    ${(isSpinning || hasSpun || isLoadingFingerprint) ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 hover:shadow-[0_0_40px_rgba(14,165,233,0.6)] active:scale-95'}
                  `}
                >
                  <div className="cursor-pointer absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isLoadingFingerprint ? 'Đang kiểm tra...' : isSpinning ? 'Đang quay...' : hasSpun ? 'Đã quay!' : 'QUAY NGAY!'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Chat/Support Icon */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] z-50 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </button>

      {/* Prize Modal */}
      {showPrize && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-blue-500/50 rounded-2xl w-[90%] max-w-md p-6 relative shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPrize(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Gift size={40} className="text-cyan-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Chúc Mừng Bạn!</h2>
              <p className="text-slate-300 mb-6 font-medium">Chào {fullName}, bạn đã quay trúng:</p>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text text-4xl font-black mb-8 drop-shadow-lg">
                {prizeName}
              </div>
              <button 
                onClick={() => setShowPrize(false)}
                className="cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/25"
              >
                Nhận Quà Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
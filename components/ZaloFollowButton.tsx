'use client';

import { useEffect, useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface ZaloEventData {
  event: string;
  oa_id: string;
}

interface ZaloFollowButtonProps {
  oaId?: string;
  onFollowed?: () => void;
}

export function ZaloFollowButton({ oaId, onFollowed }: ZaloFollowButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const targetId = oaId || "4289073059490896771";


  useEffect(() => {
    // 1. Script Callback Setup
    (window as any).onZaloFollow = (data: ZaloEventData) => {
      console.log('[Zalo SDK] Follow Event:', data);
      if (data.event === 'followed' || data.event === 'click_followed') {
        if (onFollowed) onFollowed();
      }
    };

    const SCRIPT_ID = 'zalo-social-sdk';
    
    const runInit = () => {
      const zalo = (window as any).ZaloSocial;
      if (zalo && typeof zalo.init === 'function') {
        try {
          zalo.init();
          if (typeof zalo.parse === 'function') {
            zalo.parse();
          }
          console.log('[Zalo SDK] Init/Parse called');
        } catch (e) {
          console.error('[Zalo SDK] Error during init/parse:', e);
        }
      }
    };

    // 2. Inject or use existing script
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = "https://sp.zalo.me/plugins/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = runInit;
      document.body.appendChild(script);
    } else {
      // Script already exists (this component was mounted before or reload happened)
      if ((window as any).ZaloSocial) {
        runInit();
      } else {
        script.addEventListener('load', runInit);
      }
    }

    // 3. Robust retry loop (longer interval to prevent crashes)
    let count = 0;
    const itv = setInterval(() => {
      count++;
      runInit();
      
      if (containerRef.current?.querySelector('iframe')) {
        clearInterval(itv);
      }
      if (count > 5) clearInterval(itv);
    }, 2000);

    // 4. Fallback Detection
    const timer = setTimeout(() => {
      const container = document.getElementById('zalo-button-container');
      if (container && !container.querySelector('iframe')) {
         setIsBlocked(true);
      }
    }, 8000);

    return () => {
      clearInterval(itv);
      clearTimeout(timer);
      if (script) script.removeEventListener('load', runInit);
    };
  }, [onFollowed]);

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <div 
        ref={containerRef}
        id="zalo-button-container"
        className="min-h-[40px] flex justify-center items-center"
        dangerouslySetInnerHTML={{
          __html: `<div class="zalo-follow-only-button" data-oaid="${targetId}" data-callback="onZaloFollow"></div>`
        }}
      />
      
      {/* Nút dự phòng nếu SDK bị chặn ở tab ẩn danh / trình duyệt hạn chế */}
      <div className="mt-2 text-center">
        <a 
          href={`https://zalo.me/${targetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-500 hover:text-blue-600 underline flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          Bạn không thấy nút Quan tâm? Nhấn vào đây <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default ZaloFollowButton;
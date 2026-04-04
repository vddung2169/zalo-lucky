'use client';

import { useEffect, useState } from 'react';
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
  const [isBlocked, setIsBlocked] = useState(false);
  const targetId = oaId || "4289073059490896771";

  useEffect(() => {
    // 1. Setup Callback
    (window as any).onZaloFollow = (data: ZaloEventData) => {
      console.log('[Zalo SDK] Follow Event:', data);
      if (data.event === 'followed' || data.event === 'click_followed') {
        if (onFollowed) onFollowed();
      }
    };

    // 2. Initialize SDK
    if (typeof window !== 'undefined' && (window as any).ZaloSocial) {
      try {
        (window as any).ZaloSocial.init();
      } catch (e) {
        console.error('Zalo SDK init error', e);
      }
    }

    // 3. Fallback Trigger: Nếu sau 3s mà Iframe của Zalo không render (có thể do bị chặn)
    const timer = setTimeout(() => {
      const container = document.getElementById('zalo-button-container');
      if (container && container.innerHTML.trim() === '') {
         // Nếu trong container vẫn rỗng hoặc chỉ có div gốc, có thể SDK bị chặn
         setIsBlocked(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFollowed]);

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <div 
        id="zalo-button-container"
        className="min-h-[40px] flex justify-center items-center"
        /* 
           Isolating from React Fiber to prevent "Circular structure" error 
           when SDK attempts to process the DOM node.
        */
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
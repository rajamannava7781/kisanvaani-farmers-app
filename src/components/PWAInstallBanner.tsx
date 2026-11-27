import React, { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const PWAInstallButton: React.FC<{ label: string }> = ({ label }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[44px] rounded-xl bg-[#F59E0B] text-[#142316] px-3 py-1.5 text-sm font-extrabold flex items-center gap-1.5 shadow-sm active:scale-[0.97] transition-transform whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4" />
        <span>{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[44px] rounded-xl bg-[#F59E0B] text-[#142316] px-3 py-1.5 text-sm font-extrabold flex items-center gap-1.5 shadow-sm active:scale-[0.97] transition-transform whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{label}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#F9FBF7] p-6 shadow-xl border-2 border-[#1B5E20]/20">
              <h3 className="text-xl font-extrabold text-[#1B5E20]">
                Install KisanVaani
              </h3>
              <p className="mt-3 text-base font-medium text-[#142316] leading-relaxed">
                1. Tap the <strong>Share</strong> button in Safari at the bottom.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[52px] rounded-2xl bg-[#1B5E20] text-white font-bold text-lg"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC<{ message: string }> = ({ message }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="rounded-2xl bg-[#F59E0B] text-[#142316] px-4 py-3 font-bold text-sm flex items-center gap-2.5 shadow-sm"
    >
      <WifiOff className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

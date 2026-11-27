import React from 'react';

export const FarmerMascotIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#F9FBF7" />
    {/* Turban */}
    <path d="M14 27c0-11 8-19 18-19s18 8 18 19c-5-3-11-4-18-4s-13 1-18 4z" fill="#F59E0B" />
    <path d="M16 23c6-4 26-4 32 0" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="14" r="3.5" fill="#10B981" />
    {/* Face */}
    <circle cx="32" cy="34" r="13" fill="#D99B66" />
    {/* Eyes & Smile */}
    <circle cx="27" cy="33" r="1.8" fill="#1F2937" />
    <circle cx="37" cy="33" r="1.8" fill="#1F2937" />
    <path d="M26 38c2 2 10 2 12 0" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M27 40.5c2.5 2.5 7.5 2.5 10 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Shirt & Gamcha */}
    <path d="M16 56c2-8 8-11 16-11s14 3 16 11" fill="#1B5E20" />
    <path d="M24 46l8 9 8-9" fill="#F59E0B" />
  </svg>
);

export const CameraLeafIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="6" y="16" width="52" height="38" rx="12" fill="#FFFFFF" fillOpacity="0.18" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M22 16l4-7h12l4 7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="32" cy="35" r="12" fill="#F9FBF7" />
    {/* Leaf inside lens */}
    <path d="M32 43c-5-2-8-6-8-11 3.5.5 6.5 2.5 8 5.5 1.5-3 4.5-5 8-5.5 0 5-3 9-8 11z" fill="#1B5E20" />
    <circle cx="48" cy="24" r="2.8" fill="#F59E0B" />
  </svg>
);

export const MicVoiceIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="23" y="10" width="18" height="28" rx="9" fill="#1B5E20" />
    <rect x="27" y="14" width="10" height="14" rx="5" fill="#F9FBF7" fillOpacity="0.4" />
    <path d="M15 30c0 9.4 7.6 17 17 17s17-7.6 17-17" fill="none" stroke="#1B5E20" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 47v8M23 55h18" stroke="#1B5E20" strokeWidth="4" strokeLinecap="round" />
    <path d="M9 24c-2 4-2 8 0 12M55 24c2 4 2 8 0 12" stroke="#1B5E20" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const OrganicLeafIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#10B981" />
    <path d="M14 33c2-12 10-19 21-20-1 11-8 19-21 20z" fill="#FFFFFF" />
    <path d="M14 33c5-5 10-10 17-15" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const CulturalCareIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#F59E0B" />
    <circle cx="24" cy="18" r="6" fill="#FFFFFF" />
    <path d="M14 34c2-6 18-6 20 0" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M24 27v9M19 32h10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const ChemicalSprayerIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#EF4444" />
    <rect x="16" y="18" width="14" height="18" rx="4" fill="#FFFFFF" />
    <path d="M20 18v-4h6v4M30 22h5l3-3" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M23 24l-3 5h6l-3 4" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const PacketBottleIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect x="12" y="12" width="24" height="30" rx="5" fill="#F59E0B" />
    <rect x="18" y="6" width="12" height="6" rx="2" fill="#1B5E20" />
    <rect x="16" y="20" width="16" height="14" rx="2" fill="#FFFFFF" />
    <path d="M24 23v8M20 27h8" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const TankSprayerIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect x="13" y="14" width="20" height="26" rx="6" fill="#1B5E20" />
    <rect x="18" y="8" width="10" height="6" rx="2" fill="#F59E0B" />
    <path d="M33 20h5v14" stroke="#1B5E20" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="17" y="21" width="12" height="11" rx="2" fill="#F9FBF7" />
    <path d="M19 27h8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

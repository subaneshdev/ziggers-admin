import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ShieldCheck,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  X,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { 
  formatCurrency, 
  formatDate, 
  formatISTTimestamp,
  formatAadhaarNumber, 
  cleanAadhaarDigits, 
  isValidAadhaarNumber, 
  normalizeImageUrl 
} from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const KycDetailScreen: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [extractedAadhaar, setExtractedAadhaar] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  
  // Fullscreen Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);

  // Zoom & Rotation states
  const [frontCardState, setFrontCardState] = useState({ zoom: 1, rotation: 0 });
  const [backCardState, setBackCardState] = useState({ zoom: 1, rotation: 0 });
  const [selfieCardState, setSelfieCardState] = useState({ zoom: 1, rotation: 0 });

  const { data: detail, isLoading } = useQuery({
    queryKey: ['kycDetail', userId],
    queryFn: () => adminApi.fetchKycDetail(userId),
    enabled: !!userId,
    staleTime: 10000,
  });

  useEffect(() => {
    if (detail?.aadhaarNumber) {
      const digits = cleanAadhaarDigits(detail.aadhaarNumber);
      if (digits.length === 12) {
        setExtractedAadhaar(formatAadhaarNumber(digits));
      }
    }
  }, [detail?.aadhaarNumber]);

  const cleanDigits = useMemo(() => cleanAadhaarDigits(extractedAadhaar), [extractedAadhaar]);
  const isAadhaarValid = cleanDigits.length === 12;

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtractedAadhaar(formatAadhaarNumber(e.target.value));
  };

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!isAadhaarValid) throw new Error('A valid 12-digit Aadhaar number is required for approval.');
      return adminApi.approveKyc(userId, detail?.roleType || 'worker', cleanDigits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('KYC Approved', `Profile ${detail?.name || userId} marked as APPROVED with Aadhaar ${formatAadhaarNumber(cleanDigits)}.`);
    },
    onError: (err: any) => error('Approval Failed', err.message || 'Could not approve KYC.'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!rejectionReason.trim()) throw new Error('Please enter a rejection reason.');
      return adminApi.rejectKyc(userId, rejectionReason.trim(), detail?.roleType || 'worker');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsRejectModalOpen(false);
      setRejectionReason('');
      success('KYC Rejected', `Profile ${detail?.name || userId} marked as REJECTED.`);
    },
    onError: (err: any) => error('Rejection Failed', err.message || 'Could not reject KYC.'),
  });

  const presetReasons = [
    'Aadhaar back photo is blurry and unreadable. Please re-upload a clear photo.',
    'Aadhaar front photo is unreadable or cut off. Please re-upload clear full card.',
    'Live camera selfie does not match the photo on Aadhaar card.',
    'Invalid document or photocopy uploaded. Original ID proof required.',
    'Name on Aadhaar does not match registered profile name.',
  ];

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-[#F0EBE1] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
          <div className="h-64 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl font-poppins text-xs text-[#2C221E] pb-12">
      {/* Top Action & User Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={() => navigate('/admin/kyc/queue')}
            className="p-2.5 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] transition-colors border border-[#EBE4D8] shrink-0"
            title="Back to Verification Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#2C221E] truncate">{detail.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] font-numeric border border-[#C69432]/30 uppercase font-bold">
                {detail.hasBothRoles ? 'WORKER & EMPLOYER' : detail.roleType}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                  detail.kycStatus === 'APPROVED'
                    ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                    : detail.kycStatus === 'PENDING'
                    ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                    : detail.kycStatus === 'NOT_STARTED'
                    ? 'bg-[#665C54]/15 text-[#665C54] border-[#665C54]/30'
                    : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                }`}
              >
                {detail.kycStatus === 'NOT_STARTED' ? 'KYC NOT STARTED' : detail.kycStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#665C54] font-numeric mt-1 break-all sm:break-normal">
              ID: {detail.userId} • Registered: {formatDate(detail.submittedAt)}
              {detail.updatedAt && detail.updatedAt !== detail.submittedAt ? ` • Updated: ${formatDate(detail.updatedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/admin/kyc/review')}
            className="px-3.5 py-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] font-bold text-xs transition-colors border border-[#EBE4D8]"
          >
            Review Carousel Queue
          </button>
          {detail.kycStatus !== 'APPROVED' && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || !isAadhaarValid}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors inline-flex items-center space-x-1.5 shadow-sm ${
                isAadhaarValid && !approveMutation.isPending
                  ? 'bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white cursor-pointer'
                  : 'bg-[#0F8B5F]/40 text-white/70 cursor-not-allowed'
              }`}
              title={!isAadhaarValid ? 'Enter 12-digit Aadhaar number before approving' : 'Approve KYC'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve KYC</span>
            </button>
          )}
          {detail.kycStatus !== 'REJECTED' && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={rejectMutation.isPending}
              className="px-3.5 py-2 rounded-xl bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-bold text-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Real Supabase User Details Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Contact Details</span>
            <Phone className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-sm font-bold text-[#2C221E]">{detail.phone}</div>
          <div className="text-[11px] text-[#665C54] truncate flex items-center space-x-1">
            <Mail className="w-3 h-3 text-[#8C827A] shrink-0" />
            <span className="truncate">{detail.email}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Profile Names & Role</span>
            <User className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-xs font-bold text-[#2C221E] truncate">
            Worker: {detail.workerName || 'Not Set'}
          </div>
          <div className="text-[11px] text-[#665C54] truncate">
            Employer: {detail.employerName || detail.businessName || 'Not Set'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Wallet & Trust Score</span>
            <Wallet className="w-3.5 h-3.5 text-[#0F8B5F]" />
          </div>
          <div className="text-sm font-bold text-[#0F8B5F]">
            {formatCurrency(detail.walletBalance || 0)} <span className="text-[10px] text-[#665C54] font-normal">(Escrow: {formatCurrency(detail.amountInEscrow || 0)})</span>
          </div>
          <div className="text-[11px] text-[#2C221E] font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69432]" />
            <span>Trust Score: {detail.trustScore ?? 100}/100 • Completed: {detail.completedOrders ?? 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Location & Referral</span>
            <MapPin className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-xs font-bold text-[#2C221E] truncate">
            {detail.city || detail.state ? [detail.city, detail.state].filter(Boolean).join(', ') : 'Location Not Set'}
          </div>
          <div className="text-[11px] text-[#665C54] truncate">
            Ref Code: <strong className="text-[#C69432]">{detail.referralCode || detail.workerReferralCode || 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Visual Proofs (Side-by-Side Zoom View) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#C69432]" />
            <span>Visual Proofs Inspection (Front, Back & Live Camera Selfie)</span>
          </h3>
          <span className="text-[11px] text-[#665C54]">Double-click any card to expand fullscreen</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Front */}
          <div className="rounded-2xl bg-[#FFFFFF] border-2 border-[#C69432]/40 shadow-sm overflow-hidden flex flex-col">
            <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#2C221E]">Card 1: Aadhaar Front</span>
                <span className="text-[9px] text-[#C69432] font-semibold block">Extract 12-Digit Number</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setFrontCardState((s) => ({ ...s, zoom: Math.min(3, s.zoom + 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setFrontCardState((s) => ({ ...s, zoom: Math.max(0.8, s.zoom - 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setFrontCardState((s) => ({ ...s, rotation: (s.rotation + 90) % 360 }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    const norm = normalizeImageUrl(detail.aadhaarFrontUrl);
                    if (norm) setLightboxImage({ url: norm, title: `${detail.name} - Aadhaar Front` });
                  }}
                  className="p-1 rounded bg-[#2C221E] text-white"
                  title="Lightbox"
                >
                  <Maximize2 className="w-3 h-3 text-[#C69432]" />
                </button>
              </div>
            </div>

            <div className="relative h-64 bg-[#1A1614] flex items-center justify-center overflow-hidden">
              {normalizeImageUrl(detail.aadhaarFrontUrl) ? (
                <img
                  src={normalizeImageUrl(detail.aadhaarFrontUrl)}
                  alt="Aadhaar Front"
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${frontCardState.zoom}) rotate(${frontCardState.rotation}deg)` }}
                />
              ) : (
                <div className="text-[#8C827A] text-center p-4">
                  <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No Front Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Back */}
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#2C221E]">Card 2: Aadhaar Back</span>
                <span className="text-[9px] text-[#665C54] block">Address Verification</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setBackCardState((s) => ({ ...s, zoom: Math.min(3, s.zoom + 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setBackCardState((s) => ({ ...s, zoom: Math.max(0.8, s.zoom - 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setBackCardState((s) => ({ ...s, rotation: (s.rotation + 90) % 360 }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    const norm = normalizeImageUrl(detail.aadhaarBackUrl);
                    if (norm) setLightboxImage({ url: norm, title: `${detail.name} - Aadhaar Back` });
                  }}
                  className="p-1 rounded bg-[#2C221E] text-white"
                  title="Lightbox"
                >
                  <Maximize2 className="w-3 h-3 text-[#C69432]" />
                </button>
              </div>
            </div>

            <div className="relative h-64 bg-[#1A1614] flex items-center justify-center overflow-hidden">
              {normalizeImageUrl(detail.aadhaarBackUrl) ? (
                <img
                  src={normalizeImageUrl(detail.aadhaarBackUrl)}
                  alt="Aadhaar Back"
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${backCardState.zoom}) rotate(${backCardState.rotation}deg)` }}
                />
              ) : (
                <div className="text-[#8C827A] text-center p-4">
                  <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No Back Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Selfie */}
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-sm overflow-hidden flex flex-col">
            <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#2C221E]">Card 3: Camera Selfie</span>
                <span className="text-[9px] text-[#0F8B5F] font-semibold block">Face Match</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelfieCardState((s) => ({ ...s, zoom: Math.min(3, s.zoom + 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelfieCardState((s) => ({ ...s, zoom: Math.max(0.8, s.zoom - 0.2) }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelfieCardState((s) => ({ ...s, rotation: (s.rotation + 90) % 360 }))}
                  className="p-1 rounded bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8]"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    const norm = normalizeImageUrl(detail.selfieUrl);
                    if (norm) setLightboxImage({ url: norm, title: `${detail.name} - Camera Selfie` });
                  }}
                  className="p-1 rounded bg-[#2C221E] text-white"
                  title="Lightbox"
                >
                  <Maximize2 className="w-3 h-3 text-[#C69432]" />
                </button>
              </div>
            </div>

            <div className="relative h-64 bg-[#1A1614] flex items-center justify-center overflow-hidden">
              {normalizeImageUrl(detail.selfieUrl) ? (
                <img
                  src={normalizeImageUrl(detail.selfieUrl)}
                  alt="Camera Selfie"
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${selfieCardState.zoom}) rotate(${selfieCardState.rotation}deg)` }}
                />
              ) : (
                <div className="text-[#8C827A] text-center p-4">
                  <User className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No Camera Selfie</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 12-Digit Aadhaar Extraction Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#EBE4D8] shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-[#2C221E] uppercase tracking-wider">
              Extracted 12-Digit Aadhaar Number (XXXX XXXX XXXX)
            </span>
            <span className={`text-[11px] font-numeric font-bold ${isAadhaarValid ? 'text-[#0F8B5F]' : 'text-[#D97706]'}`}>
              {isAadhaarValid ? '✓ Valid 12-Digit Format' : `Entered: ${cleanDigits.length} / 12 Digits`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={extractedAadhaar}
              onChange={handleAadhaarChange}
              maxLength={14}
              placeholder="e.g. 5421 8901 2345"
              className={`flex-1 bg-[#F8F5EE] border-2 rounded-xl px-4 py-2.5 text-base font-mono font-bold tracking-widest text-[#2C221E] focus:outline-none transition-all ${
                isAadhaarValid
                  ? 'border-[#0F8B5F] bg-[#0F8B5F]/5'
                  : cleanDigits.length > 0
                  ? 'border-[#D97706]'
                  : 'border-[#EBE4D8]'
              }`}
            />
            {detail.kycStatus !== 'APPROVED' && (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={!isAadhaarValid || approveMutation.isPending}
                className={`py-2.5 px-5 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-all ${
                  isAadhaarValid && !approveMutation.isPending
                    ? 'bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white'
                    : 'bg-[#0F8B5F]/40 text-white/70 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Government DB & Supabase Profile Field Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
            <h3 className="text-sm font-bold text-[#2C221E] mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
              <span>Supabase Profile & Identity Verification Breakdown</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#C69432] font-numeric border-b border-[#EBE4D8] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Primary Profile Value</th>
                    <th className="py-2.5 px-3">Verification / Role Metadata</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]">
                  {detail.fieldComparison.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F0EBE1]/50">
                      <td className="py-3 px-3 font-semibold text-[#2C221E]">{row.field}</td>
                      <td className="py-3 px-3 font-numeric text-[#5C524B]">{row.submittedValue}</td>
                      <td className="py-3 px-3 font-numeric text-[#C69432]">{row.governmentDbValue}</td>
                      <td className="py-3 px-3 text-center">
                        {row.isMatching ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#0F8B5F]/15 text-[#0F8B5F] font-numeric border border-[#0F8B5F]/30 font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#665C54]/15 text-[#665C54] font-numeric border border-[#665C54]/30 font-bold">
                            NOT SET
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Didit Liveness AI Status & Verified Bank Account */}
        <div className="space-y-6">
          {/* Didit Liveness AI Integration Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C69432]" />
                <span>Didit Liveness AI Status</span>
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-numeric border font-bold ${
                  detail.diditStatus === 'VERIFIED'
                    ? 'bg-[#0F8B5F]/10 text-[#0F8B5F] border-[#0F8B5F]/20'
                    : detail.diditStatus === 'PENDING_MANUAL_REVIEW'
                    ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20'
                    : 'bg-[#665C54]/10 text-[#665C54] border-[#665C54]/20'
                }`}
              >
                {detail.diditStatus === 'NOT_STARTED' ? 'KYC NOT STARTED' : detail.diditStatus}
              </span>
            </div>

            <div className="space-y-3 font-numeric">
              <div>
                <div className="flex justify-between text-xs text-[#665C54] mb-1">
                  <span>Verification Confidence</span>
                  <span className="font-bold text-[#2C221E]">{detail.diditConfidence}%</span>
                </div>
                <div className="w-full bg-[#F0EBE1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F8B5F] h-full transition-all duration-500"
                    style={{ width: `${detail.diditConfidence}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <span className="text-[10px] text-[#665C54] block">ID Protocol</span>
                  <span className="text-xs font-extrabold text-[#2C221E]">{detail.idType || 'Not Submitted'}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <span className="text-[10px] text-[#665C54] block">Passive Liveness</span>
                  <span className={`text-xs font-extrabold ${detail.diditLivenessPassed ? 'text-[#0F8B5F]' : 'text-[#665C54]'}`}>
                    {detail.diditLivenessPassed ? 'VERIFIED' : 'NOT STARTED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-1">
              <span className="text-[10px] font-bold text-[#C69432] uppercase">Database Notes:</span>
              <p className="text-xs text-[#2C221E] font-numeric leading-relaxed">{detail.notes}</p>
            </div>
          </div>

          {/* Verified Bank & RazorpayX Account Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#0F8B5F]" />
              <span>Bank, UPI & RazorpayX Account</span>
            </h3>

            <div className="space-y-2.5 font-numeric text-xs">
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">Bank / Provider</span>
                <span className="font-bold text-[#2C221E] text-right">{detail.bankName}</span>
              </div>

              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">Account / UPI</span>
                <span className="font-bold text-[#2C221E] text-right">{detail.accountNumber}</span>
              </div>

              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">IFSC Verification</span>
                <span className="font-bold text-[#0F8B5F] text-right">{detail.ifscCode}</span>
              </div>

              {detail.razorpayAccountId && (
                <div className="flex justify-between pt-1 gap-2">
                  <span className="text-[#665C54]">RazorpayX Account ID</span>
                  <span className="font-bold text-[#0F8B5F] text-right font-mono">{detail.razorpayAccountId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C221E]/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl border border-[#EBE4D8] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <div className="flex items-center space-x-2 text-[#DC2626]">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#2C221E]">Reject KYC Verification</h3>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="p-1 rounded-lg text-[#8C827A] hover:text-[#2C221E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#665C54]">
              Provide a clear reason for rejecting <strong className="text-[#2C221E]">{detail.name}</strong>.
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#665C54] uppercase">Quick Reasons:</span>
              <div className="flex flex-wrap gap-1.5">
                {presetReasons.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setRejectionReason(r)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8]"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Aadhaar back photo is blurry and unreadable. Please re-upload a clear photo."
              className="w-full bg-[#F8F5EE] border border-[#EBE4D8] rounded-xl p-3 text-xs text-[#2C221E] focus:outline-none focus:border-[#DC2626]"
            />

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EBE4D8]">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white font-bold text-xs"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md p-4 select-none">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <span className="font-bold text-sm tracking-wide">{lightboxImage.title}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLightboxZoom((z) => Math.min(4, z + 0.25))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Open in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                title="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-full max-w-full object-contain transition-transform duration-150 cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  User, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Eye,
  FileText,
  Copy,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { 
  formatISTTimestamp, 
  formatAadhaarNumber, 
  cleanAadhaarDigits, 
  isValidAadhaarNumber, 
  normalizeImageUrl 
} from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { ManualKycQueueItem } from '../../types/admin';

type QueueFilterTab = 'PENDING' | 'WITH_DOCS' | 'APPROVED' | 'ALL';

interface ImageCardState {
  zoom: number;
  rotation: number;
}

export const ManualKycReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<QueueFilterTab>('PENDING');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [extractedAadhaar, setExtractedAadhaar] = useState<string>('');
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  
  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  
  // Fullscreen Lightbox modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);

  // Zoom & rotation state for the 3 side-by-side cards
  const [frontCardState, setFrontCardState] = useState<ImageCardState>({ zoom: 1, rotation: 0 });
  const [backCardState, setBackCardState] = useState<ImageCardState>({ zoom: 1, rotation: 0 });
  const [selfieCardState, setSelfieCardState] = useState<ImageCardState>({ zoom: 1, rotation: 0 });

  // Query queue items
  const { data: queue = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['manualKycQueue', activeTab],
    queryFn: () => adminApi.fetchManualKycQueue(activeTab),
    staleTime: 30000,
  });

  // Current applicant
  const currentApplicant: ManualKycQueueItem | undefined = queue[currentIndex];

  // Reset extraction and zoom state whenever current applicant or queue changes
  useEffect(() => {
    if (currentApplicant) {
      // Auto-prefill if already saved in database
      const existingDigits = cleanAadhaarDigits(currentApplicant.idCardNumber);
      if (existingDigits.length === 12) {
        setExtractedAadhaar(formatAadhaarNumber(existingDigits));
      } else {
        setExtractedAadhaar('');
      }
    } else {
      setExtractedAadhaar('');
    }
    setFrontCardState({ zoom: 1, rotation: 0 });
    setBackCardState({ zoom: 1, rotation: 0 });
    setSelfieCardState({ zoom: 1, rotation: 0 });
    setRejectionReason('');
  }, [currentApplicant?.id, currentIndex]);

  // Keep index in safe range when activeTab or queue changes
  useEffect(() => {
    if (currentIndex >= queue.length && queue.length > 0) {
      setCurrentIndex(queue.length - 1);
    }
  }, [queue.length, currentIndex]);

  // Clean digits and validation
  const cleanDigits = useMemo(() => cleanAadhaarDigits(extractedAadhaar), [extractedAadhaar]);
  const isAadhaarValid = cleanDigits.length === 12;

  // Handle Aadhaar text change with auto-formatting
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatAadhaarNumber(rawVal);
    setExtractedAadhaar(formatted);
  };

  // Quick navigation
  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Copy User ID
  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  // Approval Mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!currentApplicant) throw new Error('No applicant selected');
      if (!isAadhaarValid) throw new Error('Valid 12-digit Aadhaar number required.');
      return adminApi.adjudicateManualKyc({
        userId: currentApplicant.id,
        status: 'approved',
        extractedAadhaarNumber: cleanDigits,
        role: currentApplicant.role,
        adminId: 'admin_console',
      });
    },
    onSuccess: () => {
      success('KYC Approved', `Profile ${currentApplicant?.fullName} successfully verified with Aadhaar ${formatAadhaarNumber(cleanDigits)}.`);
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['kycDetail'] });
      refetch();
      // Auto move to next or stay
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev);
      }
    },
    onError: (err: any) => {
      error('Approval Failed', err.message || 'Could not approve KYC.');
    },
  });

  // Rejection Mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!currentApplicant) throw new Error('No applicant selected');
      if (!rejectionReason.trim()) throw new Error('Rejection reason is required.');
      return adminApi.adjudicateManualKyc({
        userId: currentApplicant.id,
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        role: currentApplicant.role,
        adminId: 'admin_console',
      });
    },
    onSuccess: () => {
      success('KYC Rejected', `Application for ${currentApplicant?.fullName} rejected with reason: "${rejectionReason.trim()}".`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['kycDetail'] });
      refetch();
    },
    onError: (err: any) => {
      error('Rejection Failed', err.message || 'Could not reject KYC.');
    },
  });

  // Preset rejection reasons
  const presetReasons = [
    'Aadhaar back photo is blurry and unreadable. Please re-upload a clear photo.',
    'Aadhaar front photo is unreadable or cut off. Please re-upload clear full card.',
    'Live camera selfie does not match the photo on Aadhaar card.',
    'Invalid document or photocopy uploaded. Original ID proof required.',
    'Name on Aadhaar does not match registered profile name.',
    '12-digit Aadhaar number is obscured or unreadable.'
  ];

  // Helper card zoom/rotate controls
  const handleCardZoom = (card: 'front' | 'back' | 'selfie', delta: number) => {
    const setter = card === 'front' ? setFrontCardState : card === 'back' ? setBackCardState : setSelfieCardState;
    setter((prev) => ({
      ...prev,
      zoom: Math.max(0.8, Math.min(3.0, Number((prev.zoom + delta).toFixed(1)))),
    }));
  };

  const handleCardRotate = (card: 'front' | 'back' | 'selfie') => {
    const setter = card === 'front' ? setFrontCardState : card === 'back' ? setBackCardState : setSelfieCardState;
    setter((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleCardReset = (card: 'front' | 'back' | 'selfie') => {
    const setter = card === 'front' ? setFrontCardState : card === 'back' ? setBackCardState : setSelfieCardState;
    setter({ zoom: 1, rotation: 0 });
  };

  const openLightbox = (url?: string | null, title: string = 'ID Document') => {
    const norm = normalizeImageUrl(url);
    if (!norm) {
      warning('Document Missing', 'No image file uploaded for this document.');
      return;
    }
    setLightboxImage({ url: norm, title });
    setLightboxZoom(1);
    setLightboxRotation(0);
  };

  return (
    <div className="space-y-4 font-poppins text-xs text-[#2C221E] pb-10">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#C69432]/10 text-[#C69432]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-[#2C221E] tracking-tight">
              Manual KYC Review & Aadhaar Extraction Queue
            </h1>
          </div>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Inspect side-by-side Aadhaar front, back, and live camera selfie proofs, extract the 12-digit Aadhaar number, and adjudicate verified identities.
          </p>
        </div>

        {/* View Switcher / Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#F0EBE1] p-1 rounded-xl flex items-center space-x-1 border border-[#EBE4D8]">
            <button
              onClick={() => { setActiveTab('PENDING'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Pending Queue {activeTab === 'PENDING' && !isLoading && `(${queue.length})`}
            </button>
            <button
              onClick={() => { setActiveTab('WITH_DOCS'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'WITH_DOCS'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Uploaded ID Proofs {activeTab === 'WITH_DOCS' && !isLoading && `(${queue.length})`}
            </button>
            <button
              onClick={() => { setActiveTab('APPROVED'); setCurrentIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Approved History
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] transition-colors"
            title="Refresh Queue from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#C69432]' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/admin/kyc/queue')}
            className="px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F0EBE1] text-[#2C221E] border border-[#EBE4D8] font-bold text-xs inline-flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#C69432]" />
            <span>Table Directory</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] flex flex-col items-center justify-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-[#C69432] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C827A]">Loading KYC review queue from Supabase...</span>
        </div>
      ) : queue.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0F8B5F]/10 flex items-center justify-center text-[#0F8B5F]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#2C221E]">
            {activeTab === 'PENDING' ? 'Pending Review Queue is Empty' : 'No Profiles Found'}
          </h3>
          <p className="text-xs text-[#665C54] max-w-md">
            {activeTab === 'PENDING' ? (
              <>
                All KYC submissions in <code className="bg-[#F0EBE1] px-1 py-0.5 rounded text-[#2C221E]">in_review</code> and <code className="bg-[#F0EBE1] px-1 py-0.5 rounded text-[#2C221E]">pending</code> have been adjudicated.
                Switch to the <strong>"Uploaded ID Proofs"</strong> tab to inspect existing users who uploaded documents.
              </>
            ) : (
              'No users matched this filter. Adjust tab selection.'
            )}
          </p>
          {activeTab === 'PENDING' && (
            <button
              onClick={() => setActiveTab('WITH_DOCS')}
              className="mt-2 px-4 py-2 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>View Uploaded ID Proofs</span>
              <ArrowRight className="w-4 h-4 text-[#C69432]" />
            </button>
          )}
        </div>
      ) : currentApplicant ? (
        <div className="space-y-4">
          {/* Queue Navigator & Applicant Identity Card */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Applicant Details */}
            <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#2C221E] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {currentApplicant.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#2C221E] truncate">
                    {currentApplicant.fullName}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                    currentApplicant.role === 'worker'
                      ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                      : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/30'
                  }`}>
                    {currentApplicant.role === 'worker' ? 'Worker' : 'Employer'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                    currentApplicant.kycStatus === 'approved'
                      ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                      : currentApplicant.kycStatus === 'rejected'
                      ? 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                      : 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                  }`}>
                    Status: {currentApplicant.kycStatus || 'pending'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-[#665C54] font-numeric mt-1">
                  <span className="flex items-center space-x-1 text-[#2C221E] font-semibold">
                    <Phone className="w-3 h-3 text-[#C69432]" />
                    <span>{currentApplicant.mobile}</span>
                  </span>

                  <span>•</span>

                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#8C827A]" />
                    <span>Submitted: {formatISTTimestamp(currentApplicant.kycSubmittedAt || currentApplicant.createdAt)}</span>
                  </span>

                  <span>•</span>

                  <button
                    onClick={() => handleCopyUserId(currentApplicant.id)}
                    className="inline-flex items-center space-x-1 text-[#8C827A] hover:text-[#2C221E] transition-colors"
                    title="Click to copy full User UUID"
                  >
                    <span>ID: {currentApplicant.id.slice(0, 8)}...</span>
                    {isCopiedId ? <Check className="w-3 h-3 text-[#0F8B5F]" /> : <Copy className="w-3 h-3" />}
                  </button>

                  {currentApplicant.businessName && (
                    <>
                      <span>•</span>
                      <span className="text-[#C69432] font-semibold">Biz: {currentApplicant.businessName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#EBE4D8]">
              <span className="text-xs font-numeric font-bold text-[#665C54] mr-1">
                Applicant <strong className="text-[#2C221E]">{currentIndex + 1}</strong> of <strong className="text-[#2C221E]">{queue.length}</strong>
              </span>

              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] disabled:opacity-40 text-[#2C221E] border border-[#EBE4D8] transition-colors"
                title="Previous Applicant"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= queue.length - 1}
                className="p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] disabled:opacity-40 text-[#2C221E] border border-[#EBE4D8] transition-colors"
                title="Next Applicant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Visual Proofs: Side-by-Side Zoom View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Aadhaar Card (Front Photo) */}
            <div className="rounded-2xl bg-[#FFFFFF] border-2 border-[#C69432]/40 shadow-[0_4px_20px_rgba(44,34,30,0.04)] overflow-hidden flex flex-col">
              <div className="p-3 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C69432]" />
                    <span className="font-bold text-xs text-[#2C221E]">Card 1: Aadhaar Front Photo</span>
                  </div>
                  <span className="text-[10px] text-[#C69432] font-semibold block mt-0.5">
                    Extract 12-Digit Aadhaar Here
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCardZoom('front', 0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardZoom('front', -0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardRotate('front')}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openLightbox(currentApplicant.idCardFrontUrl, `${currentApplicant.fullName} - Aadhaar Front`)}
                    className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                  </button>
                </div>
              </div>

              {/* Image Viewport */}
              <div className="relative h-72 sm:h-80 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                {normalizeImageUrl(currentApplicant.idCardFrontUrl) ? (
                  <img
                    src={normalizeImageUrl(currentApplicant.idCardFrontUrl)}
                    alt="Aadhaar Front Photo"
                    className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `scale(${frontCardState.zoom}) rotate(${frontCardState.rotation}deg)`,
                    }}
                    onDoubleClick={() => openLightbox(currentApplicant.idCardFrontUrl, `${currentApplicant.fullName} - Aadhaar Front`)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                    <FileText className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-semibold text-xs text-white">No Front Photo Uploaded</span>
                    <span className="text-[10px] mt-1">Applicant has not uploaded front ID proof</span>
                  </div>
                )}
                {frontCardState.zoom !== 1 || frontCardState.rotation !== 0 ? (
                  <button
                    onClick={() => handleCardReset('front')}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 hover:bg-black text-white text-[10px] font-numeric"
                  >
                    Reset View
                  </button>
                ) : null}
              </div>
            </div>

            {/* Card 2: Aadhaar Card (Back Photo) */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.04)] overflow-hidden flex flex-col">
              <div className="p-3 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8C827A]" />
                    <span className="font-bold text-xs text-[#2C221E]">Card 2: Aadhaar Back Photo</span>
                  </div>
                  <span className="text-[10px] text-[#665C54] block mt-0.5">
                    Address & Barcode Verification
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCardZoom('back', 0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardZoom('back', -0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardRotate('back')}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openLightbox(currentApplicant.idCardBackUrl, `${currentApplicant.fullName} - Aadhaar Back`)}
                    className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                  </button>
                </div>
              </div>

              {/* Image Viewport */}
              <div className="relative h-72 sm:h-80 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                {normalizeImageUrl(currentApplicant.idCardBackUrl) ? (
                  <img
                    src={normalizeImageUrl(currentApplicant.idCardBackUrl)}
                    alt="Aadhaar Back Photo"
                    className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `scale(${backCardState.zoom}) rotate(${backCardState.rotation}deg)`,
                    }}
                    onDoubleClick={() => openLightbox(currentApplicant.idCardBackUrl, `${currentApplicant.fullName} - Aadhaar Back`)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                    <FileText className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-semibold text-xs text-white">No Back Photo Uploaded</span>
                    <span className="text-[10px] mt-1">Applicant has not provided back photo</span>
                  </div>
                )}
                {backCardState.zoom !== 1 || backCardState.rotation !== 0 ? (
                  <button
                    onClick={() => handleCardReset('back')}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 hover:bg-black text-white text-[10px] font-numeric"
                  >
                    Reset View
                  </button>
                ) : null}
              </div>
            </div>

            {/* Card 3: Live Camera Selfie Photo */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.04)] overflow-hidden flex flex-col">
              <div className="p-3 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0F8B5F]" />
                    <span className="font-bold text-xs text-[#2C221E]">Card 3: Live Camera Selfie</span>
                  </div>
                  <span className="text-[10px] text-[#0F8B5F] font-semibold block mt-0.5">
                    Face Match Verification
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCardZoom('selfie', 0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardZoom('selfie', -0.2)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCardRotate('selfie')}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E]"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openLightbox(currentApplicant.selfieUrl, `${currentApplicant.fullName} - Live Selfie`)}
                    className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                  </button>
                </div>
              </div>

              {/* Image Viewport */}
              <div className="relative h-72 sm:h-80 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                {normalizeImageUrl(currentApplicant.selfieUrl) ? (
                  <img
                    src={normalizeImageUrl(currentApplicant.selfieUrl)}
                    alt="Live Camera Selfie Photo"
                    className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `scale(${selfieCardState.zoom}) rotate(${selfieCardState.rotation}deg)`,
                    }}
                    onDoubleClick={() => openLightbox(currentApplicant.selfieUrl, `${currentApplicant.fullName} - Live Selfie`)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                    <User className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-semibold text-xs text-white">No Live Selfie Uploaded</span>
                    <span className="text-[10px] mt-1">Applicant has not completed camera selfie</span>
                  </div>
                )}
                {selfieCardState.zoom !== 1 || selfieCardState.rotation !== 0 ? (
                  <button
                    onClick={() => handleCardReset('selfie')}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 hover:bg-black text-white text-[10px] font-numeric"
                  >
                    Reset View
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Aadhaar Data Extraction Panel & Adjudication Action Bar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE4D8] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#C69432]" />
                  <span>Aadhaar 12-Digit Data Extraction & Verification</span>
                </h3>
                <p className="text-[11px] text-[#665C54] mt-0.5">
                  Read the 12-digit number from Card 1 (Front Photo) and enter it below. The system validates the exact format before unlocking the "Approve KYC" action.
                </p>
              </div>

              {currentApplicant.rejectionReason && (
                <div className="text-[11px] text-[#DC2626] bg-[#DC2626]/10 px-3 py-1.5 rounded-xl border border-[#DC2626]/20">
                  <strong>Previous Rejection:</strong> {currentApplicant.rejectionReason}
                </div>
              )}
            </div>

            {/* Input Form & Verification Badge */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 space-y-1.5">
                <label className="text-[11px] font-bold text-[#2C221E] uppercase tracking-wider block">
                  Extracted 12-Digit Aadhaar Number (e.g. XXXX XXXX XXXX)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={extractedAadhaar}
                    onChange={handleAadhaarChange}
                    maxLength={14} // 12 digits + 2 spaces
                    placeholder="e.g. 5421 8901 2345"
                    className={`w-full bg-[#F8F5EE] border-2 rounded-xl px-4 py-3 text-base sm:text-lg font-mono font-bold tracking-widest text-[#2C221E] placeholder-[#8C827A] focus:outline-none transition-all ${
                      isAadhaarValid
                        ? 'border-[#0F8B5F] bg-[#0F8B5F]/5 shadow-sm'
                        : cleanDigits.length > 0
                        ? 'border-[#D97706]'
                        : 'border-[#EBE4D8] focus:border-[#C69432]'
                    }`}
                  />
                  {extractedAadhaar && (
                    <button
                      onClick={() => setExtractedAadhaar('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8C827A] hover:text-[#2C221E]"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-numeric">
                  <div className="flex items-center space-x-1.5">
                    {isAadhaarValid ? (
                      <span className="text-[#0F8B5F] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid 12-Digit Aadhaar format ready for database adjudication</span>
                      </span>
                    ) : cleanDigits.length > 0 ? (
                      <span className="text-[#D97706] font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Entered {cleanDigits.length} / 12 digits (Need {12 - cleanDigits.length} more)</span>
                      </span>
                    ) : (
                      <span className="text-[#8C827A]">
                        Required for verification (reads from Aadhaar Front Card)
                      </span>
                    )}
                  </div>

                  <span className="text-[#8C827A]">
                    {cleanDigits.length} / 12 Digits
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-5 flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 md:pt-0">
                {/* APPROVE KYC Button */}
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={!isAadhaarValid || approveMutation.isPending}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center space-x-2 transition-all shadow-sm ${
                    isAadhaarValid && !approveMutation.isPending
                      ? 'bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white cursor-pointer active:scale-[0.98]'
                      : 'bg-[#0F8B5F]/30 text-white/70 cursor-not-allowed'
                  }`}
                  title={!isAadhaarValid ? 'Enter a valid 12-digit Aadhaar number before approving' : 'Approve KYC'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approveMutation.isPending ? 'Updating...' : 'APPROVE KYC'}</span>
                </button>

                {/* REJECT KYC Button */}
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={rejectMutation.isPending}
                  className="py-3 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center space-x-2 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 transition-all shrink-0"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT KYC</span>
                </button>

                {/* Skip / Next */}
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= queue.length - 1}
                  className="py-3 px-3 rounded-xl font-semibold text-xs inline-flex items-center justify-center bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] disabled:opacity-40 transition-colors"
                  title="Skip to Next Applicant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Rejection Reason Modal */}
      {isRejectModalOpen && currentApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C221E]/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl border border-[#EBE4D8] shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <div className="flex items-center space-x-2 text-[#DC2626]">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#2C221E]">Reject KYC Submission</h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-[#8C827A] hover:text-[#2C221E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#665C54]">
              You are rejecting verification for <strong className="text-[#2C221E]">{currentApplicant.fullName}</strong> ({currentApplicant.mobile}). Please specify a clear rejection reason to notify the applicant.
            </p>

            {/* Quick Reason Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#665C54] uppercase">Quick Reasons:</span>
              <div className="flex flex-wrap gap-1.5">
                {presetReasons.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] text-left transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#2C221E] uppercase">
                Rejection Note / Feedback to User:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Aadhaar back photo is blurry and unreadable. Please re-upload a clear photo."
                className="w-full bg-[#F8F5EE] border border-[#EBE4D8] rounded-xl p-3 text-xs text-[#2C221E] focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EBE4D8]">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white font-bold text-xs transition-colors"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm & Reject KYC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md p-4 select-none">
          {/* Top Bar */}
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

          {/* Fullscreen Body */}
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

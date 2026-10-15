import React, { useState, useMemo } from 'react';
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
  X,
  Calendar,
  Layers,
  CheckSquare
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
  panX: number;
  panY: number;
}

const INITIAL_IMAGE_STATE: ImageCardState = {
  zoom: 1,
  rotation: 0,
  panX: 0,
  panY: 0,
};

export const ManualKycReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error, warning, info } = useToast();

  const [activeTab, setActiveTab] = useState<QueueFilterTab>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(15); // default 15s live polling
  
  // Inspection Dialog / Modal State
  const [reviewingApplicant, setReviewingApplicant] = useState<ManualKycQueueItem | null>(null);
  const [extractedAadhaar, setExtractedAadhaar] = useState<string>('');
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  
  // Rejection modal state inside the dialog
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  
  // Fullscreen Lightbox modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);

  // Zoom, rotation, & pan state for the 3 side-by-side cards inside the inspection dialog
  const [frontCardState, setFrontCardState] = useState<ImageCardState>(INITIAL_IMAGE_STATE);
  const [selfieCardState, setSelfieCardState] = useState<ImageCardState>(INITIAL_IMAGE_STATE);
  const [backCardState, setBackCardState] = useState<ImageCardState>(INITIAL_IMAGE_STATE);

  // Query queue items from Supabase & Backend
  const { data: queue = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['manualKycQueue', activeTab],
    queryFn: () => adminApi.fetchManualKycQueue(activeTab),
    staleTime: 10000,
    refetchInterval: autoRefreshSecs > 0 ? autoRefreshSecs * 1000 : false,
  });

  // Calculate total pending manual reviews
  const pendingCount = useMemo(() => {
    return queue.filter((i) => {
      const k = String(i.kycStatus || '').toLowerCase();
      const wk = String(i.workerKycStatus || '').toLowerCase();
      const ek = String(i.employerKycStatus || '').toLowerCase();
      return k === 'pending' || k === 'in_review' || wk === 'pending' || wk === 'in_review' || ek === 'pending' || ek === 'in_review';
    }).length;
  }, [queue]);

  // Filter queue by search query
  const filteredQueue = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return queue;
    return queue.filter((item) => 
      item.fullName.toLowerCase().includes(q) ||
      (item.legalName && item.legalName.toLowerCase().includes(q)) ||
      item.mobile.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.idCardNumber && item.idCardNumber.includes(q))
    );
  }, [queue, searchQuery]);

  // Current reviewing applicant index in filtered queue
  const currentReviewIndex = useMemo(() => {
    if (!reviewingApplicant) return -1;
    return filteredQueue.findIndex((item) => item.id === reviewingApplicant.id);
  }, [filteredQueue, reviewingApplicant]);

  // When opening review dialog for an applicant, initialize extraction and reset card controls
  const handleOpenReview = (applicant: ManualKycQueueItem) => {
    setReviewingApplicant(applicant);
    const existingDigits = cleanAadhaarDigits(applicant.idCardNumber);
    if (existingDigits.length === 12) {
      setExtractedAadhaar(formatAadhaarNumber(existingDigits));
    } else {
      setExtractedAadhaar('');
    }
    setFrontCardState(INITIAL_IMAGE_STATE);
    setSelfieCardState(INITIAL_IMAGE_STATE);
    setBackCardState(INITIAL_IMAGE_STATE);
    setRejectionReason('');
    setIsRejectModalOpen(false);
  };

  const handleCloseReview = () => {
    setReviewingApplicant(null);
    setExtractedAadhaar('');
    setIsRejectModalOpen(false);
  };

  // Navigate inside review dialog (Next / Prev applicant)
  const handleNextInQueue = () => {
    if (currentReviewIndex >= 0 && currentReviewIndex < filteredQueue.length - 1) {
      handleOpenReview(filteredQueue[currentReviewIndex + 1]);
    }
  };

  const handlePrevInQueue = () => {
    if (currentReviewIndex > 0) {
      handleOpenReview(filteredQueue[currentReviewIndex - 1]);
    }
  };

  // Clean digits and validation
  const cleanDigits = useMemo(() => cleanAadhaarDigits(extractedAadhaar), [extractedAadhaar]);
  const isAadhaarValid = cleanDigits.length === 12;

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtractedAadhaar(formatAadhaarNumber(e.target.value));
  };

  // Copy User ID
  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  // Approval Mutation with Optimistic UI updates
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!reviewingApplicant) throw new Error('No applicant selected');
      if (!isAadhaarValid) throw new Error('Valid 12-digit Aadhaar number required.');
      return adminApi.adjudicateManualKyc({
        userId: reviewingApplicant.id,
        status: 'approved',
        extractedAadhaarNumber: cleanDigits,
        role: reviewingApplicant.role,
        adminId: 'admin_console',
      });
    },
    onMutate: async () => {
      if (!reviewingApplicant) return;
      const targetId = reviewingApplicant.id;
      // Optimistically update React Query cache
      queryClient.setQueryData<ManualKycQueueItem[]>(['manualKycQueue', activeTab], (old = []) => {
        if (activeTab === 'PENDING') {
          return old.filter((item) => item.id !== targetId);
        }
        return old.map((item) => 
          item.id === targetId 
            ? { ...item, kycStatus: 'approved', idCardNumber: cleanDigits, idType: 'aadhaar' } 
            : item
        );
      });
    },
    onSuccess: () => {
      success('KYC Approved & Verified', `Profile ${reviewingApplicant?.fullName} successfully verified with Aadhaar ${formatAadhaarNumber(cleanDigits)}.`);
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['kycDetail'] });
      refetch();
      
      // Auto move to next applicant or close if queue is finished
      if (currentReviewIndex >= 0 && currentReviewIndex < filteredQueue.length - 1) {
        handleOpenReview(filteredQueue[currentReviewIndex + 1]);
      } else {
        handleCloseReview();
      }
    },
    onError: (err: any) => {
      error('Approval Failed', err.message || 'Could not approve KYC.');
      refetch();
    },
  });

  // Rejection Mutation with Optimistic UI updates
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!reviewingApplicant) throw new Error('No applicant selected');
      if (!rejectionReason.trim()) throw new Error('Rejection reason is required.');
      return adminApi.adjudicateManualKyc({
        userId: reviewingApplicant.id,
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        role: reviewingApplicant.role,
        adminId: 'admin_console',
      });
    },
    onMutate: async () => {
      if (!reviewingApplicant) return;
      const targetId = reviewingApplicant.id;
      // Optimistically update React Query cache
      queryClient.setQueryData<ManualKycQueueItem[]>(['manualKycQueue', activeTab], (old = []) => {
        if (activeTab === 'PENDING') {
          return old.filter((item) => item.id !== targetId);
        }
        return old.map((item) => 
          item.id === targetId 
            ? { ...item, kycStatus: 'rejected', rejectionReason: rejectionReason.trim() } 
            : item
        );
      });
    },
    onSuccess: () => {
      success('KYC Rejected', `Application for ${reviewingApplicant?.fullName} marked as rejected.`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['manualKycQueue'] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['kycDetail'] });
      refetch();

      if (currentReviewIndex >= 0 && currentReviewIndex < filteredQueue.length - 1) {
        handleOpenReview(filteredQueue[currentReviewIndex + 1]);
      } else {
        handleCloseReview();
      }
    },
    onError: (err: any) => {
      error('Rejection Failed', err.message || 'Could not reject KYC.');
      refetch();
    },
  });

  const presetReasons = [
    'Aadhaar back photo is blurry and unreadable. Please re-upload a clear photo.',
    'Aadhaar front photo is unreadable or cut off. Please re-upload clear full card.',
    'Live camera selfie does not match the photo on Aadhaar card.',
    'Invalid document or photocopy uploaded. Original ID proof required.',
    'Name on Aadhaar does not match registered profile name.',
    '12-digit Aadhaar number is obscured or unreadable.'
  ];

  const handleCardZoom = (card: 'front' | 'selfie' | 'back', delta: number) => {
    const setter = card === 'front' ? setFrontCardState : card === 'selfie' ? setSelfieCardState : setBackCardState;
    setter((prev) => ({
      ...prev,
      zoom: Math.max(0.8, Math.min(3.5, Number((prev.zoom + delta).toFixed(1)))),
    }));
  };

  const handleCardRotate = (card: 'front' | 'selfie' | 'back') => {
    const setter = card === 'front' ? setFrontCardState : card === 'selfie' ? setSelfieCardState : setBackCardState;
    setter((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleCardReset = (card: 'front' | 'selfie' | 'back') => {
    const setter = card === 'front' ? setFrontCardState : card === 'selfie' ? setSelfieCardState : setBackCardState;
    setter(INITIAL_IMAGE_STATE);
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
      {/* 1. Header & Live Queue Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#C69432]/10 text-[#C69432]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-[#2C221E] tracking-tight">
              Manual KYC Adjudication Dashboard
            </h1>

            {/* Badge displaying total pending manual reviews */}
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30 font-numeric font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              <span>{pendingCount} Pending Manual Reviews</span>
            </span>
          </div>

          <p className="text-[11px] text-[#665C54] mt-1">
            Inspect uploaded ID documents, compare live selfie against Aadhaar front photo, extract the 12-digit Aadhaar number, and adjudicate applications.
          </p>
        </div>

        {/* Top Controls: Filter Tabs, Auto-Refresh Toggle, Search & Manual Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Tabs */}
          <div className="bg-[#F0EBE1] p-1 rounded-xl flex items-center space-x-1 border border-[#EBE4D8]">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Pending Queue {activeTab === 'PENDING' && !isLoading && `(${queue.length})`}
            </button>
            <button
              onClick={() => setActiveTab('WITH_DOCS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'WITH_DOCS'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Uploaded ID Proofs {activeTab === 'WITH_DOCS' && !isLoading && `(${queue.length})`}
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-[#2C221E] text-white shadow-sm'
                  : 'text-[#665C54] hover:text-[#2C221E]'
              }`}
            >
              Approved History
            </button>
          </div>

          {/* Auto-Refresh Toggle */}
          <div className="flex items-center space-x-1 bg-[#F0EBE1] px-2 py-1 rounded-xl border border-[#EBE4D8]">
            <span className="text-[10px] text-[#665C54] font-bold uppercase tracking-wider mr-1 hidden sm:inline">
              Auto:
            </span>
            {[0, 15, 30].map((secs) => (
              <button
                key={secs}
                onClick={() => setAutoRefreshSecs(secs)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold font-numeric transition-colors ${
                  autoRefreshSecs === secs
                    ? 'bg-[#2C221E] text-white shadow-xs'
                    : 'text-[#665C54] hover:text-[#2C221E]'
                }`}
              >
                {secs === 0 ? 'Off' : `${secs}s`}
              </button>
            ))}
            {autoRefreshSecs > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B5F] animate-pulse ml-1" title="Live Auto-Refresh Active" />
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal name, mobile..."
              className="bg-[#F8F5EE] border border-[#EBE4D8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432]"
            />
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] transition-colors"
            title="Refresh KYC Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#C69432]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Pending KYC Table View */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] flex flex-col items-center justify-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-[#C69432] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C827A]">Loading manual KYC verification queue...</span>
        </div>
      ) : filteredQueue.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0F8B5F]/10 flex items-center justify-center text-[#0F8B5F]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#2C221E]">
            {activeTab === 'PENDING' ? 'No Pending Manual KYC Reviews' : 'No Profiles Found'}
          </h3>
          <p className="text-xs text-[#665C54] max-w-md">
            {activeTab === 'PENDING' ? (
              <>
                All manual document KYC submissions have been adjudicated.
                Instant Message Central verifications are automatically handled without manual review.
              </>
            ) : (
              'No users matched your search criteria.'
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
      ) : (
        /* Pending Queue Table */
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase font-numeric border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-center">Visual Proofs</th>
                  <th className="py-3 px-4 text-center">Aadhaar Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {filteredQueue.map((item) => {
                  const hasFront = Boolean(normalizeImageUrl(item.idCardFrontUrl));
                  const hasBack = Boolean(normalizeImageUrl(item.idCardBackUrl));
                  const hasSelfie = Boolean(normalizeImageUrl(item.selfieUrl));
                  const has12Digits = Boolean(item.idCardNumber && cleanAadhaarDigits(item.idCardNumber).length === 12);

                  return (
                    <tr key={item.id} className="hover:bg-[#F0EBE1]/50 transition-colors group">
                      {/* User Name & Legal Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#2C221E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#2C221E] group-hover:text-[#C69432] transition-colors block">
                              {item.fullName}
                            </span>
                            {item.legalName && item.legalName !== item.fullName && (
                              <span className="text-[10px] text-[#665C54] block">
                                Legal: {item.legalName}
                              </span>
                            )}
                            <span className="text-[10px] text-[#8C827A] font-numeric font-normal">
                              ID: {item.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-4 font-numeric font-semibold text-[#2C221E]">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[#C69432] shrink-0" />
                          <span>{item.mobile}</span>
                        </div>
                      </td>

                      {/* Role (Worker / Employer) */}
                      <td className="py-3 px-4 font-numeric">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          item.role === 'worker'
                            ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                            : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/30'
                        }`}>
                          {item.role === 'worker' ? 'Worker' : 'Employer'}
                        </span>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3 px-4 font-numeric text-[#665C54] whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#8C827A] shrink-0" />
                          <span>{formatISTTimestamp(item.kycSubmittedAt || item.createdAt)}</span>
                        </div>
                      </td>

                      {/* Visual Proofs Indicators */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 font-numeric text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              hasFront ? 'bg-[#0F8B5F]/15 text-[#0F8B5F]' : 'bg-[#DC2626]/10 text-[#DC2626]'
                            }`}
                            title={hasFront ? 'Front Photo Available' : 'Missing Front Photo'}
                          >
                            Front {hasFront ? '✓' : '✗'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              hasSelfie ? 'bg-[#0F8B5F]/15 text-[#0F8B5F]' : 'bg-[#665C54]/15 text-[#665C54]'
                            }`}
                            title={hasSelfie ? 'Live Selfie Available' : 'No Live Selfie'}
                          >
                            Selfie {hasSelfie ? '✓' : '—'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              hasBack ? 'bg-[#0F8B5F]/15 text-[#0F8B5F]' : 'bg-[#665C54]/15 text-[#665C54]'
                            }`}
                            title={hasBack ? 'Back Photo Available' : 'No Back Photo'}
                          >
                            Back {hasBack ? '✓' : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Aadhaar Status */}
                      <td className="py-3 px-4 text-center">
                        {has12Digits ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-[#0F8B5F] bg-[#0F8B5F]/10 px-2.5 py-0.5 rounded-full border border-[#0F8B5F]/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{formatAadhaarNumber(item.idCardNumber)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#D97706] font-semibold bg-[#D97706]/10 px-2.5 py-0.5 rounded-full border border-[#D97706]/20">
                            Pending Extraction
                          </span>
                        )}
                      </td>

                      {/* Action Button: Review Documents */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C69432]" />
                          <span>Review Documents</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-[#F8F5EE] border-t border-[#EBE4D8] flex items-center justify-between text-xs text-[#665C54] font-numeric">
            <span>Showing <strong>{filteredQueue.length}</strong> manual submissions in queue</span>
            <span>Click <strong>"Review Documents"</strong> to inspect photos & extract Aadhaar</span>
          </div>
        </div>
      )}

      {/* 3. Document Review Modal / Drawer */}
      {reviewingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C221E]/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] w-full max-w-6xl rounded-3xl border border-[#EBE4D8] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FFFFFF] border-b border-[#EBE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {reviewingApplicant.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-[#2C221E] truncate">
                      {reviewingApplicant.fullName}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                      reviewingApplicant.role === 'worker'
                        ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                        : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/30'
                    }`}>
                      {reviewingApplicant.role === 'worker' ? 'Worker' : 'Employer'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30">
                      Status: {reviewingApplicant.kycStatus || 'pending'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-[#665C54] font-numeric mt-0.5">
                    <span className="font-semibold text-[#2C221E]">{reviewingApplicant.mobile}</span>
                    <span>•</span>
                    <span>Submitted: {formatISTTimestamp(reviewingApplicant.kycSubmittedAt || reviewingApplicant.createdAt)}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopyUserId(reviewingApplicant.id)}
                      className="inline-flex items-center space-x-1 text-[#8C827A] hover:text-[#2C221E]"
                    >
                      <span>ID: {reviewingApplicant.id.slice(0, 8)}...</span>
                      {isCopiedId ? <Check className="w-3 h-3 text-[#0F8B5F]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stepper Navigation & Close */}
              <div className="flex items-center space-x-2 shrink-0">
                {currentReviewIndex >= 0 && (
                  <div className="flex items-center space-x-1 font-numeric text-xs font-bold text-[#665C54] mr-2">
                    <button
                      onClick={handlePrevInQueue}
                      disabled={currentReviewIndex === 0}
                      className="p-1.5 rounded-lg bg-[#F0EBE1] hover:bg-[#EBE4D8] disabled:opacity-40 text-[#2C221E]"
                      title="Previous Applicant"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-1 text-[#2C221E]">
                      {currentReviewIndex + 1} of {filteredQueue.length}
                    </span>
                    <button
                      onClick={handleNextInQueue}
                      disabled={currentReviewIndex >= filteredQueue.length - 1}
                      className="p-1.5 rounded-lg bg-[#F0EBE1] hover:bg-[#EBE4D8] disabled:opacity-40 text-[#2C221E]"
                      title="Next Applicant"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCloseReview}
                  className="p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] transition-colors"
                  title="Close Review Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable inspection view */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* User Info Section: Legal Name, DOB, Gender, Mobile, Role, and Submitted Timestamp */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <div className="flex items-center space-x-1.5 mb-2.5 pb-2 border-b border-[#EBE4D8]">
                  <User className="w-4 h-4 text-[#C69432]" />
                  <span className="text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                    Applicant Information
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Legal Name</span>
                    <span className="font-bold text-[#2C221E] truncate block">
                      {reviewingApplicant.legalName || reviewingApplicant.fullName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Date of Birth</span>
                    <span className="font-semibold font-numeric text-[#2C221E] block">
                      {reviewingApplicant.dob || 'Not Provided'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Gender</span>
                    <span className="font-semibold text-[#2C221E] block">
                      {reviewingApplicant.gender ? reviewingApplicant.gender.toUpperCase() : 'Not Provided'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Mobile Number</span>
                    <span className="font-semibold font-numeric text-[#2C221E] block">
                      {reviewingApplicant.mobile}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Selected Role</span>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mt-0.5 border ${
                      reviewingApplicant.role === 'worker'
                        ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                        : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/30'
                    }`}>
                      {reviewingApplicant.role === 'worker' ? 'Worker' : 'Employer'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Submitted Timestamp</span>
                    <span className="font-semibold font-numeric text-[#665C54] block">
                      {formatISTTimestamp(reviewingApplicant.kycSubmittedAt || reviewingApplicant.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Photo Comparison:
                  Card 1: Aadhaar Front
                  Card 3: Live Selfie placed directly next to Aadhaar front photo for face match visual check
                  Card 2: Aadhaar Back
              */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: Aadhaar Card (Front Photo) */}
                <div className="rounded-2xl bg-[#FFFFFF] border-2 border-[#C69432]/60 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C69432]" />
                        <span className="font-bold text-xs text-[#2C221E]">Card 1: Aadhaar Front</span>
                      </div>
                      <span className="text-[10px] text-[#C69432] font-semibold block mt-0.5">
                        Read 12-Digit Number Here
                      </span>
                    </div>

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
                        onClick={() => openLightbox(reviewingApplicant.idCardFrontUrl, `${reviewingApplicant.fullName} - Aadhaar Front`)}
                        className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                        title="Fullscreen Lightbox"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                      </button>
                    </div>
                  </div>

                  <div className="relative h-64 sm:h-72 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                    {normalizeImageUrl(reviewingApplicant.idCardFrontUrl) ? (
                      <img
                        src={normalizeImageUrl(reviewingApplicant.idCardFrontUrl)}
                        alt="Aadhaar Front Photo"
                        className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab"
                        style={{
                          transform: `scale(${frontCardState.zoom}) rotate(${frontCardState.rotation}deg)`,
                        }}
                        onDoubleClick={() => openLightbox(reviewingApplicant.idCardFrontUrl, `${reviewingApplicant.fullName} - Aadhaar Front`)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                        <FileText className="w-8 h-8 mb-1.5 opacity-50" />
                        <span className="font-semibold text-xs text-white">No Front Photo Uploaded</span>
                        <span className="text-[10px] mt-0.5">Missing document</span>
                      </div>
                    )}
                    {(frontCardState.zoom !== 1 || frontCardState.rotation !== 0) && (
                      <button
                        onClick={() => handleCardReset('front')}
                        className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* CARD 3: Live Camera Selfie Photo (Placed directly next to Card 1 for instant Face Match!) */}
                <div className="rounded-2xl bg-[#FFFFFF] border-2 border-[#0F8B5F]/60 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B5F]" />
                        <span className="font-bold text-xs text-[#2C221E]">Card 3: Live Selfie</span>
                      </div>
                      <span className="text-[10px] text-[#0F8B5F] font-semibold block mt-0.5">
                        Face Match Visual Check
                      </span>
                    </div>

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
                        onClick={() => openLightbox(reviewingApplicant.selfieUrl, `${reviewingApplicant.fullName} - Camera Selfie`)}
                        className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                        title="Fullscreen Lightbox"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                      </button>
                    </div>
                  </div>

                  <div className="relative h-64 sm:h-72 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                    {normalizeImageUrl(reviewingApplicant.selfieUrl) ? (
                      <img
                        src={normalizeImageUrl(reviewingApplicant.selfieUrl)}
                        alt="Camera Selfie"
                        className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab"
                        style={{
                          transform: `scale(${selfieCardState.zoom}) rotate(${selfieCardState.rotation}deg)`,
                        }}
                        onDoubleClick={() => openLightbox(reviewingApplicant.selfieUrl, `${reviewingApplicant.fullName} - Camera Selfie`)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                        <User className="w-8 h-8 mb-1.5 opacity-50" />
                        <span className="font-semibold text-xs text-white">No Live Selfie Uploaded</span>
                        <span className="text-[10px] mt-0.5">Missing camera selfie</span>
                      </div>
                    )}
                    {(selfieCardState.zoom !== 1 || selfieCardState.rotation !== 0) && (
                      <button
                        onClick={() => handleCardReset('selfie')}
                        className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* CARD 2: Aadhaar Card (Back Photo) */}
                <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-sm overflow-hidden flex flex-col">
                  <div className="p-2.5 bg-[#F8F5EE] border-b border-[#EBE4D8] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C827A]" />
                        <span className="font-bold text-xs text-[#2C221E]">Card 2: Aadhaar Back</span>
                      </div>
                      <span className="text-[10px] text-[#665C54] block mt-0.5">
                        Address & Barcode
                      </span>
                    </div>

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
                        onClick={() => openLightbox(reviewingApplicant.idCardBackUrl, `${reviewingApplicant.fullName} - Aadhaar Back`)}
                        className="p-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white"
                        title="Fullscreen Lightbox"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C69432]" />
                      </button>
                    </div>
                  </div>

                  <div className="relative h-64 sm:h-72 bg-[#1A1614] flex items-center justify-center overflow-hidden select-none">
                    {normalizeImageUrl(reviewingApplicant.idCardBackUrl) ? (
                      <img
                        src={normalizeImageUrl(reviewingApplicant.idCardBackUrl)}
                        alt="Aadhaar Back Photo"
                        className="max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab"
                        style={{
                          transform: `scale(${backCardState.zoom}) rotate(${backCardState.rotation}deg)`,
                        }}
                        onDoubleClick={() => openLightbox(reviewingApplicant.idCardBackUrl, `${reviewingApplicant.fullName} - Aadhaar Back`)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-[#8C827A]">
                        <FileText className="w-8 h-8 mb-1.5 opacity-50" />
                        <span className="font-semibold text-xs text-white">No Back Photo Uploaded</span>
                        <span className="text-[10px] mt-0.5">Missing back photo</span>
                      </div>
                    )}
                    {(backCardState.zoom !== 1 || backCardState.rotation !== 0) && (
                      <button
                        onClick={() => handleCardReset('back')}
                        className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px]"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Extraction Input & Adjudication Action Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F5EE] border-2 border-[#EBE4D8] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#C69432]" />
                    <span className="text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                      Extracted 12-Digit Aadhaar Number (XXXX XXXX XXXX)
                    </span>
                  </div>
                  <span className={`text-[11px] font-numeric font-bold ${isAadhaarValid ? 'text-[#0F8B5F]' : 'text-[#D97706]'}`}>
                    {isAadhaarValid ? '✓ Valid 12-Digit Aadhaar (Ready to Approve & Verify)' : `Entered: ${cleanDigits.length} / 12 Digits`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-7 relative">
                    <input
                      type="text"
                      value={extractedAadhaar}
                      onChange={handleAadhaarChange}
                      maxLength={14}
                      placeholder="e.g. 5421 8901 2345"
                      className={`w-full bg-[#FFFFFF] border-2 rounded-xl px-4 py-2.5 text-base sm:text-lg font-mono font-bold tracking-widest text-[#2C221E] placeholder-[#8C827A] focus:outline-none transition-all ${
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#2C221E]"
                        title="Clear"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-5 flex items-center gap-2">
                    {/* APPROVE & VERIFY BUTTON */}
                    <button
                      onClick={() => approveMutation.mutate()}
                      disabled={!isAadhaarValid || approveMutation.isPending}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                        isAadhaarValid && !approveMutation.isPending
                          ? 'bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white cursor-pointer active:scale-95'
                          : 'bg-[#0F8B5F]/35 text-white/70 cursor-not-allowed'
                      }`}
                      title={!isAadhaarValid ? 'Enter 12-digit Aadhaar number to approve' : 'Approve & Verify'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{approveMutation.isPending ? 'Verifying...' : 'Approve & Verify'}</span>
                    </button>

                    {/* REJECT BUTTON */}
                    <button
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={rejectMutation.isPending}
                      className="py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center space-x-1.5 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rejection Confirmation Modal */}
      {isRejectModalOpen && reviewingApplicant && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#2C221E]/60 backdrop-blur-xs p-4">
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
              You are rejecting verification for <strong className="text-[#2C221E]">{reviewingApplicant.fullName}</strong> ({reviewingApplicant.mobile}). Please specify a clear rejection reason.
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
                Rejection Note / Feedback to Applicant:
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

      {/* 5. Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-70 flex flex-col bg-black/95 backdrop-blur-md p-4 select-none">
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
              className="max-h-full max-w-full object-contain transition-transform duration-150 cursor-grab"
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

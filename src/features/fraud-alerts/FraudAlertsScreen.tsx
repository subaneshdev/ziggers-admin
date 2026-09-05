import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  Globe, 
  Smartphone, 
  Clock, 
  Flag, 
  UserX, 
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { FraudAlert, RiskSeverity } from '../../types/admin';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const FraudAlertsScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | RiskSeverity>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<{ alert: FraudAlert; action: 'FLAG' | 'SUSPEND' } | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['fraudAlerts'],
    queryFn: () => adminApi.fetchFraudAlerts(),
  });

  const flagMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.flagUser(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fraudAlerts'] });
      success('User Flagged', `Account ${variables.userId} flagged.`);
      setSelectedAlert(null);
      setActionReason('');
    },
    onError: () => error('Flag Failed', 'Could not flag user.'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.suspendAccount(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fraudAlerts'] });
      success('Account Suspended', `Account ${variables.userId} suspended.`);
      setSelectedAlert(null);
      setActionReason('');
    },
    onError: () => error('Suspension Failed', 'Could not suspend account.'),
  });

  const filteredAlerts = alerts.filter(
    (a) => severityFilter === 'ALL' || a.severity === severityFilter
  );

  const handleConfirmAction = () => {
    if (!selectedAlert) return;
    const reason = actionReason || `${selectedAlert.alert.alertType} violation.`;
    if (selectedAlert.action === 'FLAG') {
      flagMutation.mutate({ userId: selectedAlert.alert.userId, reason });
    } else {
      suspendMutation.mutate({ userId: selectedAlert.alert.userId, reason });
    }
  };

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Automated Fraud & Risk Monitoring
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Real-time telemetry tracking for GPS spoofing, speed anomalies, and duplicate device hashes ({alerts.length} alerts)
          </p>
        </div>
      </div>

      {/* Severity Filter Buttons */}
      <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <span className="text-[11px] text-[#665C54] font-semibold uppercase ml-1">Severity:</span>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
              severityFilter === sev
                ? 'bg-[#2C221E] text-white border border-[#2C221E]'
                : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
          <CheckCircle2 className="w-10 h-10 text-[#0F8B5F] mb-2" />
          <h3 className="text-sm font-bold text-[#2C221E]">No Active Risk Alerts</h3>
          <p className="text-xs text-[#665C54] mt-0.5">System telemetry reports clean device integrity.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE4D8] pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert
                    className={`w-5 h-5 shrink-0 ${
                      alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                        ? 'text-[#DC2626]'
                        : alert.severity === 'MEDIUM'
                        ? 'text-[#D97706]'
                        : 'text-[#2563EB]'
                    }`}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#2C221E]">{alert.alertType.replace(/_/g, ' ')}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-numeric font-bold border ${
                          alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                            ? 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                            : alert.severity === 'MEDIUM'
                            ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                            : 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30'
                        }`}
                      >
                        {alert.severity} • SCORE {alert.riskScore}/100
                      </span>
                    </div>
                    <span className="text-[11px] text-[#665C54] font-numeric">
                      Target User: <strong className="text-[#2C221E]">{alert.userName}</strong> ({alert.userId})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAlert({ alert, action: 'FLAG' })}
                    className="px-3 py-1.5 rounded-lg bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] text-xs font-semibold transition-colors flex items-center space-x-1 min-h-[32px]"
                  >
                    <Flag className="w-3.5 h-3.5 text-[#C69432]" />
                    <span>Flag Account</span>
                  </button>
                  <button
                    onClick={() => setSelectedAlert({ alert, action: 'SUSPEND' })}
                    className="px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors flex items-center space-x-1 min-h-[32px]"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </button>
                </div>
              </div>

              {/* Alert Description & Telemetry Metadata */}
              <p className="text-xs text-[#2C221E] leading-relaxed">{alert.details}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-numeric text-[#665C54]">
                <div className="flex items-center space-x-1.5 bg-[#F8F5EE] px-2.5 py-1 rounded-md border border-[#EBE4D8]">
                  <Globe className="w-3.5 h-3.5 text-[#C69432]" />
                  <span>IP: {alert.ipAddress}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F8F5EE] px-2.5 py-1 rounded-md border border-[#EBE4D8]">
                  <Smartphone className="w-3.5 h-3.5 text-[#C69432]" />
                  <span className="truncate">Device: {alert.deviceId}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F8F5EE] px-2.5 py-1 rounded-md border border-[#EBE4D8]">
                  <Clock className="w-3.5 h-3.5 text-[#8C827A]" />
                  <span>Time: {formatDate(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedAlert && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          onConfirm={handleConfirmAction}
          title={selectedAlert.action === 'SUSPEND' ? 'Suspend User Account' : 'Flag Account for Surveillance'}
          description={`Execute enforcement action on ${selectedAlert.alert.userName} (${selectedAlert.alert.userId}).`}
          consequenceText={
            selectedAlert.action === 'SUSPEND'
              ? 'This will immediately revoke active JWT tokens, freeze wallet withdrawal capabilities, and cancel active bids.'
              : 'The account will be tagged with a risk flag.'
          }
          confirmButtonText={selectedAlert.action === 'SUSPEND' ? 'Execute Account Suspension' : 'Confirm Risk Flag'}
          variant="danger"
          isLoading={flagMutation.isPending || suspendMutation.isPending}
        />
      )}
    </div>
  );
};

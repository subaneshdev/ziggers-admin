import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Power, 
  Eye
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { Organization, NewOrgPayload } from '../../types/admin';
import { formatCompactCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const OrganizationAdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToggleOrg, setSelectedToggleOrg] = useState<Organization | null>(null);

  // New Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgTaxId, setNewOrgTaxId] = useState('');
  const [newOrgTier, setNewOrgTier] = useState<'ENTERPRISE' | 'GROWTH' | 'BASIC'>('ENTERPRISE');

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => adminApi.fetchOrganizations(),
  });

  const createOrgMutation = useMutation({
    mutationFn: (payload: NewOrgPayload) => adminApi.createOrganization(payload),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      success('Organization Created', `Onboarded ${newOrg.name}.`);
      setIsAddModalOpen(false);
      setNewOrgName('');
      setNewOrgEmail('');
      setNewOrgPhone('');
      setNewOrgTaxId('');
    },
    onError: () => error('Creation Failed', 'Could not register organization.'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ orgId, active }: { orgId: string; active: boolean }) =>
      adminApi.toggleOrgStatus(orgId, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      success(
        'Status Updated',
        `Organization ${variables.orgId} is now ${variables.active ? 'Active' : 'Suspended'}.`
      );
      setSelectedToggleOrg(null);
    },
    onError: () => error('Update Failed', 'Could not toggle organization status.'),
  });

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orgId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate({
      name: newOrgName,
      contactEmail: newOrgEmail,
      contactPhone: newOrgPhone,
      taxId: newOrgTaxId,
      tier: newOrgTier,
    });
  };

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            B2B Enterprise Client Accounts
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Manage corporate accounts, workforce groups, enterprise contracts, and active status ({orgs.length} clients)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-colors border border-[#EBE4D8] min-h-[38px] shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#C69432]" />
          <span>Onboard Corporate Org</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company name, billing email, org ID..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Orgs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map((org) => (
            <div
              key={org.orgId}
              className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#EBE4D8]"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-[#2C221E]">{org.name}</h3>
                      <span className="text-[10px] font-numeric text-[#C69432] font-semibold">{org.orgId}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.2 rounded font-numeric font-bold border ${
                      org.active
                        ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                        : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                    }`}
                  >
                    {org.active ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EBE4D8] text-center font-numeric">
                  <div className="p-2 rounded-lg bg-[#F8F5EE] border border-[#EBE4D8]">
                    <span className="text-[10px] text-[#665C54] block">Members</span>
                    <span className="text-xs font-bold text-[#2C221E]">{org.memberCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F5EE] border border-[#EBE4D8]">
                    <span className="text-[10px] text-[#665C54] block">Active Zigs</span>
                    <span className="text-xs font-bold text-[#C69432]">{org.activeZigsCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F8F5EE] border border-[#EBE4D8]">
                    <span className="text-[10px] text-[#665C54] block">Total Spend</span>
                    <span className="text-xs font-bold text-[#0F8B5F]">
                      {formatCompactCurrency(org.totalSpend)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EBE4D8] flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/admin/organizations/${org.orgId}`)}
                  className="flex-1 py-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 min-h-[32px]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C69432]" />
                  <span>Inspect Details</span>
                </button>

                <button
                  onClick={() => setSelectedToggleOrg(org)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    org.active
                      ? 'bg-[#DC2626]/15 hover:bg-[#DC2626]/30 text-[#DC2626] border-[#DC2626]/30'
                      : 'bg-[#0F8B5F]/15 hover:bg-[#0F8B5F]/30 text-[#0F8B5F] border-[#0F8B5F]/30'
                  }`}
                  title={org.active ? 'Suspend Account' : 'Activate Account'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Org Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#C69432]" />
              <span>Onboard Corporate Organization</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Apex Logistics India Pvt Ltd"
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">Billing Email</label>
                  <input
                    type="email"
                    required
                    value={newOrgEmail}
                    onChange={(e) => setNewOrgEmail(e.target.value)}
                    placeholder="billing@apex.in"
                    className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newOrgPhone}
                    onChange={(e) => setNewOrgPhone(e.target.value)}
                    placeholder="+91 80 4455 6677"
                    className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">GSTIN Tax ID</label>
                  <input
                    type="text"
                    required
                    value={newOrgTaxId}
                    onChange={(e) => setNewOrgTaxId(e.target.value)}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] font-numeric focus:outline-none focus:border-[#C69432]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">Account Tier</label>
                  <select
                    value={newOrgTier}
                    onChange={(e) => setNewOrgTier(e.target.value as any)}
                    className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
                  >
                    <option value="ENTERPRISE">ENTERPRISE</option>
                    <option value="GROWTH">GROWTH</option>
                    <option value="BASIC">BASIC</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F0EBE1] text-xs font-semibold text-[#665C54] hover:text-[#2C221E] border border-[#EBE4D8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrgMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-xs font-bold text-white shadow-sm"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Active Status Toggle */}
      {selectedToggleOrg && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setSelectedToggleOrg(null)}
          onConfirm={() =>
            toggleStatusMutation.mutate({
              orgId: selectedToggleOrg.orgId,
              active: !selectedToggleOrg.active,
            })
          }
          title={selectedToggleOrg.active ? 'Suspend Corporate Account' : 'Activate Corporate Account'}
          description={`Change status for ${selectedToggleOrg.name}.`}
          consequenceText={
            selectedToggleOrg.active
              ? 'This will immediately pause all active enterprise zigs and restrict member postings.'
              : 'Enterprise members will regain full posting privileges.'
          }
          confirmButtonText={selectedToggleOrg.active ? 'Deactivate Org' : 'Activate Org'}
          variant={selectedToggleOrg.active ? 'danger' : 'primary'}
          isLoading={toggleStatusMutation.isPending}
        />
      )}
    </div>
  );
};

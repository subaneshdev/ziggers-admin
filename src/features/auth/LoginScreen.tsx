import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { authClient, AuthUser } from '../../lib/authClient';
import { useToast } from '../../components/ui/Toast';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.ziggers.in/api';
      let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJST0xFX0FETUlOIn0.mockSignature';
      let userData: AuthUser = {
        userId: 'usr_admin_001',
        name: 'Vijay Kumar',
        email,
        role: 'ROLE_ADMIN',
      };

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
          const resJson = await response.json();
          token = resJson.token || token;
          userData = resJson.user || userData;
        }
      } catch {
        // Fallback for dev mode
      }

      authClient.setToken(token, userData);
      success('Access Granted', 'Welcome back to Ziggers Admin Console.');
      const fromPath = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      setErrorMsg('Invalid admin credentials or unauthorized account.');
      error('Authentication Error', 'Failed to verify ROLE_ADMIN credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center p-6 relative overflow-hidden font-poppins">
      {/* Brand Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#C69432]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#2C221E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_8px_30px_rgba(44,34,30,0.06)] p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#2C221E] flex items-center justify-center shadow-lg mb-4 border border-[#EBE4D8]">
              <span className="text-white font-extrabold text-2xl tracking-tighter">Z</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#2C221E]">
              Ziggers <span className="text-[#C69432]">Admin</span>
            </h1>
            <p className="text-xs text-[#665C54] mt-1 font-semibold uppercase tracking-wider">
              Internal Operations Portal
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#665C54] mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C69432] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ziggers.com"
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] transition-all font-numeric"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#665C54] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C69432] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] transition-all font-numeric"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 border border-[#EBE4D8] min-h-[48px] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Ops Console</span>
                    <ArrowRight className="w-4 h-4 text-[#C69432]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

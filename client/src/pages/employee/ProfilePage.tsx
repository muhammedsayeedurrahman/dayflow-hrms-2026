import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Building, Briefcase, Calendar, Lock, Check, FileText, Camera, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { employeeAPI, payrollAPI, api } from '../../services/api';
import { formatDisplayDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [payroll, setPayroll] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await employeeAPI.getProfile();
      const empData = profileRes.data.data;
      setProfile(empData);
      setPhone(empData.phone || '');
      setAddress(empData.address || '');
      setProfilePicture(empData.profilePicture || '');

      // Parallel fetch for payroll and documents
      const [payrollRes, docsRes] = await Promise.all([
        payrollAPI.getMyPayroll().catch(() => ({ data: { data: null } })),
        api.get(`/documents/${empData.id}`).catch(() => ({ data: { data: [] } })),
      ]);

      setPayroll(payrollRes.data.data);
      setDocuments(docsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await employeeAPI.updateProfile({
        phone,
        address,
        profilePicture,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile updates.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Profile Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={profilePicture || defaultAvatar}
              alt={profile?.fullName}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
            />
            <label className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = () => setProfilePicture(reader.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{profile?.fullName}</h1>
              <Badge variant="indigo">{profile?.employmentType || 'Full-time'}</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {profile?.designation || 'Employee'} • {profile?.department || 'Operations'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Employee ID: {profile?.user?.employeeId || user?.employeeId}</p>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Editable fields</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1">
            <Lock className="h-3 w-3 text-slate-400" />
            <span>Read-only HR fields</span>
          </span>
        </div>
      </div>

      {/* Main Profile Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Editable & Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information (Editable) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal Contact Information</h3>
                <p className="text-xs text-slate-500">Employee editable details</p>
              </div>
              <Badge variant="success">Editable</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Work Email (Read Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.user?.email || user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <span>{isSaving ? 'Saving...' : 'Save Profile Updates'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Job & Organization Details (Read Only) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Job & Employment Details</h3>
                <p className="text-xs text-slate-500">Managed exclusively by HR Administration</p>
              </div>
              <Badge variant="neutral">
                <Lock className="h-3 w-3 mr-1" />
                Read-Only
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Department</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{profile?.department || 'Operations'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Designation</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{profile?.designation || 'Staff'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Employment Type</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{profile?.employmentType || 'Full-time'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Date of Joining</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{formatDisplayDate(profile?.joiningDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Salary Structure & Documents */}
        <div className="space-y-6">
          {/* Salary Structure Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Salary Breakdown</h3>
              <Lock className="h-4 w-4 text-slate-400" />
            </div>

            {payroll ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-slate-900">₹{payroll.basicSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>HRA</span>
                  <span className="font-semibold text-slate-900">₹{(payroll.hra || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Conveyance</span>
                  <span className="font-semibold text-slate-900">₹{(payroll.transportAllowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Medical Allowance</span>
                  <span className="font-semibold text-slate-900">₹{(payroll.medicalAllowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Other Allowances</span>
                  <span className="font-semibold text-slate-900">₹{(payroll.otherAllowances || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span>Deductions (PF + Tax)</span>
                  <span className="font-semibold">
                    -₹{((payroll.providentFund || 0) + (payroll.tax || 0) + (payroll.otherDeductions || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-indigo-600">
                  <span>Net Monthly Pay</span>
                  <span>₹{payroll.netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 text-center">No compensation structure assigned yet.</p>
            )}
          </div>

          {/* HR Documents Repository */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">HR Documents</h3>
            <div className="space-y-2.5">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/api/documents/download/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs hover:border-indigo-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;

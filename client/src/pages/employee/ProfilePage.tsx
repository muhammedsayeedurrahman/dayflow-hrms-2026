import React, { useState } from 'react';
import { User, Phone, MapPin, Building, Briefcase, Calendar, Lock, Check, FileText, Camera, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { employees, updateProfile } = useHRMSStore();

  const currentEmp = employees.find((e) => e.employeeId === user?.employeeId || e.id === user?.id) || employees[0];

  const [phone, setPhone] = useState(currentEmp.phone);
  const [address, setAddress] = useState(currentEmp.address);
  const [avatarUrl, setAvatarUrl] = useState(currentEmp.avatarUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(currentEmp.employeeId, { phone, address, avatarUrl });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Profile Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={currentEmp.fullName}
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
                    reader.onload = () => setAvatarUrl(reader.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{currentEmp.fullName}</h1>
              <Badge variant="indigo">{currentEmp.employmentType}</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {currentEmp.designation} • {currentEmp.department}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Employee ID: {currentEmp.employeeId}</p>
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
                  value={currentEmp.email}
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
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <span>Save Profile Updates</span>
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
                <span className="text-sm font-bold text-slate-800 mt-1 block">{currentEmp.department}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Designation</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{currentEmp.designation}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Reporting Manager</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{currentEmp.managerName}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block">Date of Joining</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{currentEmp.joiningDate}</span>
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

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Basic Salary</span>
                <span className="font-semibold text-slate-900">₹{currentEmp.salary.basic.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>HRA</span>
                <span className="font-semibold text-slate-900">₹{currentEmp.salary.hra.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Special Allowance</span>
                <span className="font-semibold text-slate-900">₹{currentEmp.salary.specialAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span>PF & Tax Deductions</span>
                <span className="font-semibold">
                  -₹{(currentEmp.salary.pfDeduction + currentEmp.salary.taxDeduction).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-indigo-600">
                <span>Net Monthly Pay</span>
                <span>₹{currentEmp.salary.netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* HR Documents Repository */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">HR Documents</h3>
            <div className="space-y-2.5">
              {currentEmp.documents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No documents uploaded yet.</p>
              ) : (
                currentEmp.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                  </div>
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

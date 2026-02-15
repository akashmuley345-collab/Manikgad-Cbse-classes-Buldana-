
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, School, Phone, Plus, Trash2, Save, Upload, CheckCircle2, Info } from 'lucide-react';
import { SchoolProfile, User } from '../types';
import { storageService } from '../services/storageService';

interface SettingsProps {
  user: User;
  schoolProfile: SchoolProfile;
  onUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, schoolProfile, onUpdate }) => {
  const [profile, setProfile] = useState<SchoolProfile>(schoolProfile);
  const [newContact, setNewContact] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleAddContact = () => {
    if (newContact && !profile.contactNumbers.includes(newContact)) {
      setProfile({
        ...profile,
        contactNumbers: [...profile.contactNumbers, newContact]
      });
      setNewContact('');
    }
  };

  const handleRemoveContact = (index: number) => {
    const updated = profile.contactNumbers.filter((_, i) => i !== index);
    setProfile({ ...profile, contactNumbers: updated });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Logo file is too large. Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      storageService.saveSchoolProfile(profile);
      onUpdate();
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Admin Settings
          </h2>
          <p className="text-gray-500 mt-1">Configure your institution's public profile and branding.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Class Identity Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Class Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institution Name</label>
                <input 
                  required
                  type="text"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900 transition-all"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  placeholder="e.g. Manikgad CBSE Classes"
                />
              </div>

              <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                  This name will appear on the dashboard, student portal, and all generated official documents like fee receipts and test papers.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Official Logo</label>
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] group hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                <div className="w-32 h-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} className="w-full h-full object-contain p-2" alt="Preview" />
                  ) : (
                    <School className="w-12 h-12 text-gray-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Logo
                  </button>
                  {profile.logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setProfile({...profile, logoUrl: undefined})}
                      className="px-4 py-2 bg-white text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Numbers Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Support Contacts</h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="tel"
                  placeholder="Enter phone number..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900 transition-all"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                />
              </div>
              <button 
                type="button"
                onClick={handleAddContact}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Number
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.contactNumbers.map((no, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold text-gray-700">{no}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveContact(idx)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {profile.contactNumbers.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No contact numbers added</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="sticky bottom-8 z-10 flex justify-center">
          <button 
            type="submit"
            disabled={isSaving}
            className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Upload className="w-6 h-6 animate-bounce" /> : <Save className="w-6 h-6" />}
            {isSaving ? 'Processing Changes...' : 'Save All Global Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

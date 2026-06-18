'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building,
    Bell,
    Lock,
    CreditCard,
    Save,
    Image as ImageIcon,
    Mail,
    Shield,
    LogOut,
    Globe,
    Sliders,
    Loader2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAiCruiter } from '../../hooks/use-aicruiter';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

// --- Tab Components ---

const ProfileSettings = ({
    theme,
    fullName,
    setFullName,
    email,
    role,
    setRole
}: any) => {
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return (name.charAt(0) + (name.charAt(1) || '')).toUpperCase();
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white dark:ring-zinc-800">
                        {getInitials(fullName || 'Recruiter')}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon size={24} className="text-white" />
                    </div>
                </div>
                <div>
                    <h3 className={cn("text-lg font-bold", theme === 'light' ? "text-black" : "text-white")}>Profile Picture</h3>
                    <p className={cn("text-sm mb-3", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                        PNG, JPG up to 5MB
                    </p>
                    <button className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        theme === 'light' ? "border-gray-200 hover:bg-gray-50 text-black" : "border-zinc-700 hover:bg-zinc-800 text-white"
                    )}>
                        Upload New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Email Address</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                            type="email"
                            value={email}
                            disabled
                            className={cn(
                                "w-full pl-11 pr-4 py-3 rounded-xl border outline-none opacity-60 cursor-not-allowed",
                                theme === 'light' ? "bg-gray-50 border-gray-200 text-black" : "bg-zinc-900 border-zinc-800 text-white"
                            )}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Job Title</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Phone Number</label>
                    <input
                        type="tel"
                        defaultValue="+1 (555) 000-0000"
                        disabled
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none opacity-60 cursor-not-allowed",
                            theme === 'light' ? "bg-gray-50 border-gray-200 text-black" : "bg-zinc-900 border-zinc-800 text-white"
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Bio</label>
                <textarea
                    rows={4}
                    defaultValue="Experienced recruiter screening premium talent using automated AI agents."
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none",
                        theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                    )}
                />
            </div>
        </div>
    );
};

const CompanySettings = ({
    theme,
    companyName,
    setCompanyName,
    website,
    setWebsite
}: any) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Company Name</label>
                <div className="relative">
                    <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={cn(
                            "w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Website</label>
                <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className={cn(
                            "w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Branding Color</label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    defaultValue="#7950F2"
                    className="w-12 h-12 rounded-xl cursor-pointer border-0 p-1 bg-transparent"
                />
                <span className={cn("text-sm", theme === 'light' ? "text-gray-600" : "text-gray-400")}>Select your primary brand color for emails and candidate portals.</span>
            </div>
        </div>
    </div>
);

const NotificationSettings = ({ 
    theme, 
    toggles, 
    setToggles 
}: { 
    theme: string; 
    toggles: {
        email_new_candidate: boolean;
        email_interview_complete: boolean;
        push_updates: boolean;
        marketing: boolean;
    };
    setToggles: React.Dispatch<React.SetStateAction<{
        email_new_candidate: boolean;
        email_interview_complete: boolean;
        push_updates: boolean;
        marketing: boolean;
    }>>;
}) => {

    const Toggle = ({ checked, onChange, label, desc }: any) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div>
                <h4 className={cn("font-medium", theme === 'light' ? "text-black" : "text-white")}>{label}</h4>
                <p className={cn("text-sm", theme === 'light' ? "text-gray-500" : "text-gray-400")}>{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    checked ? "bg-purple-600" : (theme === 'light' ? "bg-gray-200" : "bg-zinc-700")
                )}
            >
                <div className={cn(
                    "w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-sm",
                    checked ? "left-6" : "left-1"
                )} />
            </button>
        </div>
    );

    return (
        <div className="space-y-2 animate-fade-in-up">
            <Toggle
                checked={toggles.email_new_candidate}
                onChange={(v: boolean) => setToggles({ ...toggles, email_new_candidate: v })}
                label="New Candidate Alert"
                desc="Get emailed when a new candidate applies or is matched."
            />
            <Toggle
                checked={toggles.email_interview_complete}
                onChange={(v: boolean) => setToggles({ ...toggles, email_interview_complete: v })}
                label="Interview Completion"
                desc="Receive a summary report when an AI interview finishes."
            />
            <Toggle
                checked={toggles.push_updates}
                onChange={(v: boolean) => setToggles({ ...toggles, push_updates: v })}
                label="Push Notifications"
                desc="Get browser notifications for real-time updates."
            />
            <Toggle
                checked={toggles.marketing}
                onChange={(v: boolean) => setToggles({ ...toggles, marketing: v })}
                label="Product Updates"
                desc="Receive news about new AIcruiter features."
            />
        </div>
    );
};

const SecuritySettings = ({ theme }: { theme: string }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-4">
            <h3 className={cn("text-lg font-bold", theme === 'light' ? "text-black" : "text-white")}>Change Password</h3>
            <div className="space-y-2">
                <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Current Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                        theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>New Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-300")}>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
                            theme === 'light' ? "bg-white border-gray-200 text-black" : "bg-black border-zinc-800 text-white"
                        )}
                    />
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={cn("font-bold flex items-center gap-2", theme === 'light' ? "text-black" : "text-white")}>
                        <Shield size={18} className="text-purple-500" />
                        Two-Factor Authentication
                    </h4>
                    <p className={cn("text-sm mt-1", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                        Add an extra layer of security to your account.
                    </p>
                </div>
                <button className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                    theme === 'light' ? "border-gray-200 hover:bg-gray-50 text-black" : "border-zinc-700 hover:bg-zinc-800 text-white"
                )}>
                    Enable 2FA
                </button>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---

export const SettingsPage = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');
    const { user, updateProfile } = useAiCruiter();

    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        email_new_candidate: true,
        email_interview_complete: true,
        push_updates: false,
        marketing: false
    });

    // Sync state with loaded user values
    useEffect(() => {
        if (user && user.id) {
            setFullName(prev => prev === user.name ? prev : (user.name || ''));
            setRole(prev => prev === user.role ? prev : (user.role || ''));
            setCompanyName(prev => prev === user.company ? prev : (user.company || ''));
            setWebsite(prev => prev === user.website ? prev : (user.website || ''));
            if (user.notificationSettings) {
                try {
                    const parsed = JSON.parse(user.notificationSettings);
                    setNotificationSettings(prev => {
                        const keys = Object.keys(parsed) as Array<keyof typeof prev>;
                        const changed = keys.some(k => prev[k] !== parsed[k]);
                        if (changed) {
                            return { ...prev, ...parsed };
                        }
                        return prev;
                    });
                } catch (e) {
                    console.error("Failed to parse notification settings:", e);
                }
            }
        }
    }, [user]);

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'company', label: 'Company', icon: Building },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(fullName, companyName, role, website, JSON.stringify(notificationSettings));
            toast.success("Settings saved successfully");
        } catch (error: any) {
            console.error("Failed to save settings:", error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 font-sans max-w-5xl mx-auto pb-10">

            {/* Header */}
            <div>
                <h1 className={cn("text-4xl font-bold tracking-tight mb-2", theme === 'light' ? "text-black" : "text-white")}>
                    Settings
                </h1>
                <p className={cn("text-lg", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                    Manage your account preferences and company details.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? (theme === 'light' ? "bg-black text-white shadow-lg" : "bg-white text-black shadow-lg")
                                    : (theme === 'light' ? "bg-transparent text-gray-500 hover:bg-gray-100" : "bg-transparent text-gray-400 hover:bg-white/5")
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* content Area */}
                <div className={cn(
                    "flex-1 p-6 md:p-8 rounded-3xl border shadow-sm min-h-[500px] relative",
                    theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-white/5"
                )}>
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className={cn("text-xl font-bold capitalize", theme === 'light' ? "text-black" : "text-white")}>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors shadow-md shadow-green-500/20 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    <div className="max-w-2xl">
                        {activeTab === 'profile' && (
                            <ProfileSettings
                                theme={theme}
                                fullName={fullName}
                                setFullName={setFullName}
                                email={user?.email || ''}
                                role={role}
                                setRole={setRole}
                            />
                        )}
                        {activeTab === 'company' && (
                            <CompanySettings
                                theme={theme}
                                companyName={companyName}
                                setCompanyName={setCompanyName}
                                website={website}
                                setWebsite={setWebsite}
                            />
                        )}
                         {activeTab === 'notifications' && (
                            <NotificationSettings 
                                theme={theme} 
                                toggles={notificationSettings} 
                                setToggles={setNotificationSettings} 
                            />
                        )}
                        {activeTab === 'security' && <SecuritySettings theme={theme} />}
                        {activeTab === 'billing' && (
                            <div className="text-center py-20 animate-fade-in-up">
                                <CreditCard size={48} className="mx-auto mb-4 text-purple-500 opacity-50" />
                                <h3 className={cn("text-lg font-bold mb-2", theme === 'light' ? "text-black" : "text-white")}>Premium Plan</h3>
                                <p className={cn("text-sm max-w-xs mx-auto", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                                    Manage your subscription and payment methods securely via Stripe.
                                </p>
                                <button className="mt-6 px-6 py-2 rounded-full border border-purple-500 text-purple-500 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                    Manage Subscription
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

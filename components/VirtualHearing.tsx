
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, Shirt, Volume2, Camera, X, AlertCircle, Eye, RefreshCw, Mic, Loader2, CheckCircle2, ScanFace, Lock, AlertTriangle, UserX, Ban, Users, Activity, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { raqeebAI } from '../lib/gemini';

interface VirtualHearingProps {
  onClose: () => void;
  caseId: string;
}

type SessionPhase = 'verification' | 'active';
type ScenarioType = 'normal' | 'no_face' | 'bad_attire' | 'multiple_faces' | 'rapid_movement';

export const VirtualHearing: React.FC<VirtualHearingProps> = ({ onClose, caseId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [phase, setPhase] = useState<SessionPhase>('verification');
  
  // Verification States
  const [verificationStatus, setVerificationStatus] = useState({
    scanning: true,
    identity: false,
    attire: false,
    environment: false,
    ready: false
  });

  // Active Session States
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('normal');
  const [aiReport, setAiReport] = useState<any>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [floatingAlert, setFloatingAlert] = useState<{title: string, msg: string, type: 'warning' | 'security'} | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Camera access denied");
      }
    }
    startCamera();
    
    // Start Verification Process immediately
    performVerification();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // --- VERIFICATION LOGIC ---
  const performVerification = async () => {
    // Reset states
    setVerificationStatus({ scanning: true, identity: false, attire: false, environment: false, ready: false });
    
    setTimeout(() => setVerificationStatus(prev => ({ ...prev, identity: true })), 1500);
    setTimeout(() => setVerificationStatus(prev => ({ ...prev, attire: true })), 3000);
    setTimeout(() => setVerificationStatus(prev => ({ ...prev, environment: true })), 4500);

    const result = await raqeebAI.verifySessionEntry();
    
    if (result.identityMatch && result.dressCodeValid) {
        setTimeout(() => {
            setVerificationStatus({
                scanning: false,
                identity: true,
                attire: true,
                environment: true,
                ready: true
            });
        }, 5000);
    }
  };

  const startSession = () => {
      setPhase('active');
      triggerScenario('normal');
  };

  const forceReverification = () => {
      setPhase('verification');
      setAiReport(null);
      setFloatingAlert(null);
      performVerification();
  };

  // --- ACTIVE MONITORING LOGIC (SCENARIO BASED) ---
  const triggerScenario = async (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setIsScanningActive(true);
    setFloatingAlert(null); // Clear previous alerts

    // Call Gemini
    const report = await raqeebAI.monitorHearing(scenario);
    setAiReport(report);
    setIsScanningActive(false);

    // Handle Floating Alerts based on result
    if (report.status === 'SECURITY_ALERT') {
        setFloatingAlert({ title: 'خرق أمني', msg: report.recommendation, type: 'security' });
    } else if (report.status === 'BEHAVIOR_ALERT') {
        setFloatingAlert({ title: 'سلوك غير مستقر', msg: report.recommendation, type: 'warning' });
    } else if (report.status === 'WARNING') {
        setFloatingAlert({ title: 'مخالفة بروتوكول', msg: report.recommendation, type: 'warning' });
    }
  };

  // Helper to determine status color/icon (NO EMOJIS)
  const getStatusUI = (status: string) => {
      if (status === 'PASS') return { color: 'text-brand-accent', bg: 'bg-brand-accent', icon: CheckCircle2, text: 'مسموح' };
      if (status === 'FAIL') return { color: 'text-red-500', bg: 'bg-red-500', icon: Ban, text: 'مخالفة' };
      return { color: 'text-gray-400', bg: 'bg-gray-400', icon: Loader2, text: 'جاري التحقق...' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      dir="rtl"
      className="fixed inset-0 z-[150] bg-brand-dark flex flex-col font-changa overflow-hidden"
    >
      {/* 
          Top Header - Styled to match Dashboard 
          Using flex-col in parent ensures this doesn't overlap the video 
      */}
      <div className="h-24 px-8 bg-brand-dark/95 border-b border-white/5 flex items-center justify-between shrink-0 relative z-20 shadow-xl">
        
        {/* Right Side: Title & Status */}
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl transition-all duration-500 ${
              aiReport?.status === 'SECURITY_ALERT' ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 
              (phase === 'verification' ? 'bg-brand-primary border-brand-accent/20 text-brand-accent' : 'bg-brand-accent text-brand-primary border-brand-accent')
          }`}>
             {phase === 'verification' ? <ScanFace size={28} /> : (aiReport?.status === 'SECURITY_ALERT' ? <AlertTriangle size={28}/> : <ShieldCheck size={28} />)}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight mb-1">
                {phase === 'verification' ? 'بوابة التحقق الذكي' : 'الدرع الرقابي'}
            </h2>
            <div className="flex items-center gap-3 text-xs font-bold text-brand-offwhite/50">
                 <span className="bg-white/5 px-2 py-1 rounded-md text-brand-accent font-mono tracking-wider">{caseId}</span>
                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                 <span>{phase === 'verification' ? 'فحص ما قبل الدخول' : 'حماية نشطة للجلسة'}</span>
            </div>
          </div>
        </div>
        
        {/* Left Side: Controls */}
        <div className="flex items-center gap-4">
            {/* Force Re-verify Button (Active Phase Only) */}
            {phase === 'active' && (
                <button 
                    onClick={forceReverification}
                    className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl flex items-center gap-2 transition-all font-bold text-sm group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>طرد وإعادة تحقق</span>
                </button>
            )}

            <div className="w-px h-10 bg-white/10 mx-2"></div>

            <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-500/20 text-brand-offwhite/50 hover:text-red-400 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition-all"
                title="إغلاق النافذة"
            >
              <X size={24} />
            </button>
        </div>
      </div>

      {/* Main Content Area: Video + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative bg-black">
        
        {/* Video Feed (Right Side in RTL) */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`h-full w-full object-cover transition-all duration-1000 ${phase === 'verification' && verificationStatus.ready ? 'grayscale-0' : 'grayscale-[0.2]'}`} 
            />

            {/* --- ALERTS & OVERLAYS --- */}
            {phase === 'active' && (
                <>
                    {/* CRITICAL: NO FACE */}
                    {aiReport?.status === 'CRITICAL' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                className="text-center p-12"
                            >
                                <UserX size={100} className="mx-auto text-red-500 mb-8 animate-bounce" />
                                <h1 className="text-5xl font-black text-red-500 mb-4 tracking-tighter">غياب الطرف عن الجلسة</h1>
                                <p className="text-2xl text-white font-bold mb-8">يرجى العودة أمام الكاميرا فوراً لاستئناف الجلسة</p>
                            </motion.div>
                        </div>
                    )}

                    {/* FLOATING ALERTS (Top Left relative to video container) */}
                    <AnimatePresence>
                        {floatingAlert && (
                            <motion.div 
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                className={`absolute top-8 left-8 z-40 p-6 rounded-2xl shadow-2xl border-r-4 backdrop-blur-xl flex items-start gap-4 max-w-sm ${
                                    floatingAlert.type === 'security' 
                                    ? 'bg-red-950/90 border-red-500' 
                                    : 'bg-yellow-950/90 border-yellow-500'
                                }`}
                            >
                                <div className={`p-3 rounded-full ${
                                    floatingAlert.type === 'security' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                    {floatingAlert.type === 'security' ? <Users size={24}/> : <Activity size={24}/>}
                                </div>
                                <div>
                                    <h4 className={`text-xl font-black mb-2 ${
                                        floatingAlert.type === 'security' ? 'text-red-500' : 'text-yellow-500'
                                    }`}>
                                        {floatingAlert.title}
                                    </h4>
                                    <p className="text-white text-base font-medium leading-relaxed">
                                        {floatingAlert.msg}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* BOUNDING BOX */}
                    {aiReport?.faceDetected && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`relative w-[400px] h-[500px] rounded-[3rem] border-4 transition-colors duration-300 ${
                                    aiReport.status === 'SECURITY_ALERT' ? 'border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.4)]' : 
                                    (aiReport.status === 'BEHAVIOR_ALERT' || aiReport.status === 'WARNING' ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 'border-brand-accent/50')
                                }`}
                            />
                        </div>
                    )}
                </>
            )}

            {/* VERIFICATION OVERLAY */}
            {phase === 'verification' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="relative w-80 h-80 rounded-full border-2 border-dashed border-brand-accent/30 flex items-center justify-center overflow-hidden">
                        <motion.div 
                            animate={{ top: ['-10%', '110%'] }} 
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-2 bg-brand-accent/50 blur-md shadow-[0_0_20px_#C6DB68]"
                        />
                        <div className="absolute bottom-10 text-center w-full">
                            <p className="text-brand-accent text-sm font-black tracking-widest uppercase animate-pulse">
                                {verificationStatus.ready ? 'تم التحقق' : 'جاري المسح...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar (Left Side in RTL) */}
        <div className="w-[450px] bg-brand-dark/95 border-r border-white/5 p-8 flex flex-col relative z-20 backdrop-blur-xl">
            
            {/* 1. VERIFICATION SIDEBAR */}
            {phase === 'verification' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                     <h3 className="text-brand-accent text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                        <Lock size={16}/> متطلبات الدخول
                    </h3>
                    <div className="space-y-4 flex-1">
                        {['التحقق البيومتري', 'الزي الرسمي', 'استقرار المكان'].map((item, i) => (
                             <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <span className="font-bold text-white text-lg">{item}</span>
                                {verificationStatus.ready ? 
                                    <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center"><CheckCircle2 size={18} /></div> 
                                    : 
                                    <Loader2 className="animate-spin text-brand-offwhite/30" size={20} />
                                }
                             </div>
                        ))}
                    </div>
                    <button 
                        onClick={startSession}
                        disabled={!verificationStatus.ready}
                        className={`mt-6 w-full py-5 font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                            verificationStatus.ready ? 'bg-brand-accent text-brand-primary hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(198,219,104,0.4)]' : 'bg-white/5 text-brand-offwhite/30 cursor-not-allowed'
                        }`}
                    >
                        {verificationStatus.ready ? 'الدخول للقاعة القضائية' : 'جاري الفحص الآلي...'}
                    </button>
                </motion.div>
            )}

            {/* 2. ACTIVE SESSION SIDEBAR */}
            {phase === 'active' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                    <h3 className="text-brand-accent text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
                        <Activity size={16} /> حالة الجلسة الحية
                    </h3>
                    
                    <div className="space-y-4 flex-1">
                        {/* Status Cards */}
                        {[
                            { label: 'الهوية البيومترية', status: aiReport?.identityStatus, icon: UserCheck },
                            { label: 'البروتوكول الرسمي', status: aiReport?.attireStatus, icon: Shirt },
                            { label: 'الأمن البيئي', status: aiReport?.envStatus, icon: ShieldCheck }
                        ].map((item, i) => {
                             const ui = getStatusUI(item.status);
                             return (
                                <div key={i} className="group p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl bg-white/5 ${item.status === 'FAIL' ? 'text-red-500' : 'text-brand-offwhite'}`}>
                                            <item.icon size={22} />
                                        </div>
                                        <span className="text-lg font-bold text-white">{item.label}</span>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg font-black text-sm flex items-center gap-2 ${item.status === 'FAIL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : (item.status === 'PASS' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'bg-white/5 text-gray-500')}`}>
                                        <ui.icon size={14} />
                                        {ui.text}
                                    </div>
                                </div>
                             )
                        })}
                        
                        {/* Live Log Area */}
                        <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 h-48 overflow-y-auto no-scrollbar relative font-mono text-sm">
                            <p className="text-[10px] text-brand-offwhite/30 uppercase mb-4 sticky top-0 bg-black/0 backdrop-blur-sm">سجل النظام (System Log)</p>
                            <div className="space-y-4">
                                <div className="flex gap-3 text-brand-accent/70">
                                    <span className="opacity-50">10:00:01</span>
                                    <span>بدء المراقبة النشطة...</span>
                                </div>
                                <div className="flex gap-3 text-brand-offwhite/50">
                                    <span className="opacity-30">10:00:05</span>
                                    <span>تم تأكيد الهوية (98%)</span>
                                </div>
                                {aiReport?.status !== 'OK' && (
                                    <div className="flex gap-3 text-red-400 animate-pulse font-bold">
                                        <span className="opacity-50">10:01:22</span>
                                        <span>{aiReport?.recommendation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="mt-4 pt-6 border-t border-white/10">
                        <p className="text-[10px] text-brand-offwhite/20 uppercase tracking-widest mb-4 text-center">أدوات المحاكاة (للمطورين)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => triggerScenario('normal')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${currentScenario === 'normal' ? 'bg-brand-accent text-brand-primary border-brand-accent' : 'bg-white/5 text-brand-offwhite/50 border-transparent hover:bg-white/10'}`}>استقرار</button>
                            <button onClick={() => triggerScenario('rapid_movement')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${currentScenario === 'rapid_movement' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-white/5 text-brand-offwhite/50 border-transparent hover:bg-white/10'}`}>حركة مريبة</button>
                            <button onClick={() => triggerScenario('multiple_faces')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${currentScenario === 'multiple_faces' ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-white/5 text-brand-offwhite/50 border-transparent hover:bg-white/10'}`}>دخول دخيل</button>
                            <button onClick={() => triggerScenario('no_face')} className={`py-3 rounded-xl text-xs font-bold border transition-all ${currentScenario === 'no_face' ? 'bg-red-900/40 text-red-400 border-red-500/50' : 'bg-white/5 text-brand-offwhite/50 border-transparent hover:bg-white/10'}`}>اختفاء</button>
                        </div>
                    </div>
                 </motion.div>
            )}

        </div>
      </div>
    </motion.div>
  );
};

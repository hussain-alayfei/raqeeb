
import React, { useEffect, useState } from 'react';
import { Play, Zap, Cpu, ArrowLeft, ShieldCheck, Scale, Monitor, Fingerprint, LogIn, BrainCircuit, Activity, QrCode, Loader2, Key, ChevronDown, CheckCircle2, AlertTriangle, FileText, UserPlus, FileCheck, XCircle, MoreVertical, Eye, Sparkles, X, LayoutDashboard, Clock, AlertOctagon, CheckSquare, RefreshCw, Send, Search, Filter, Edit3, ArrowRight, Gavel, Calendar, FileCheck2, ScrollText, AlertCircle, Briefcase, Building2, User, FilePlus, LogOut, Lock, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal } from './components/TextReveal';
import { AnimatedButton } from './components/AnimatedButton';
import { SpotlightCard } from './components/SpotlightCard';
import { CardRotator } from './components/CardRotator';
import { Header } from './components/Header';
import { VirtualHearing } from './components/VirtualHearing';
import { CARDS } from './constants';
import { useInView } from './hooks/useInView';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { raqeebAI } from './lib/gemini';

// --- Types ---
type ViewState = 'dashboard' | 'review' | 'filing_animation';
type JudgeViewState = 'dashboard' | 'case_file';
type AppMode = 'landing' | 'workspace';

// --- MOCK DATA GENERATOR ---
const generateEmployeeCases = () => Array.from({ length: 50 }).map((_, i) => ({
  id: `4405-${1200 + i}`,
  type: [
    'إلغاء قرار فصل تعسفي', 'صرف مستحقات نهاية خدمة', 'تظلم من تقييم أداء وظيفي', 'منازعة عقد توريد', 'طلب تعويض عن خطأ طبي',
    'إلغاء قرار نزع ملكية', 'تسوية وضع وظيفي', 'بدل عدوى وضرر', 'اعتراض على مخالفة تجارية', 'إلغاء قرار نقل تأديبي'
  ][i % 10],
  entity: [
    'وزارة التعليم', 'وزارة الصحة', 'الهيئة الملكية', 'أمانة منطقة الرياض', 'مستشفى الملك فهد',
    'وزارة الشؤون البلدية', 'المؤسسة العامة للتدريب', 'وزارة الموارد البشرية', 'وزارة التجارة', 'الجمارك السعودية'
  ][i % 10],
  status: i % 7 === 0 ? 'invalid' : (i % 5 === 0 ? 'warning' : 'valid'), // Mix of statuses
  docs: i % 4 === 0 ? 'missing' : 'complete',
  date: `1445/08/${10 + (i % 20)}`,
  plaintiff: [
    'سعود بن محمد العتيبي', 'نورة بنت خالد السديري', 'عبدالله بن فهد الجبر', 'شركة البنيان للمقاولات', 'فاطمة بنت علي الزهراني',
    'صالح بن إبراهيم الغامدي', 'محمد بن يحيى الشهري', 'د. عمر بن عبدالعزيز', 'مؤسسة الأفق الواسع', 'فهد بن ناصر الدوسري'
  ][i % 10] + (i > 9 ? ` (${i})` : '')
}));

const generateJudgeCases = () => Array.from({ length: 20 }).map((_, i) => ({
  id: `4402-${900 + i}`,
  type: [
    'إلغاء قرار إداري', 'تعويض عقد إداري', 'تأديب موظف عام', 'منازعة ضريبية', 'بدل مناطق نائية', 'إلغاء رخصة تجارية'
  ][i % 6],
  status: i % 3 === 0 ? 'incomplete' : 'ready',
  date: `1445/09/${20 + (i % 10)}`,
  time: `${8 + (i % 5)}:${i % 2 === 0 ? '00' : '30'} ${i < 4 ? 'ص' : 'م'}`,
  parties: [
    'عبدالله الفهد vs وزارة الموارد', 'شركة الإعمار vs الأمانة', 'النيابة العامة vs (س.ع)', 'بنك الجزيرة vs الزكاة', 'مجموعة معلمين vs التعليم', 'مطاعم القمة vs البلدية'
  ][i % 6]
}));


// --- COMPONENT: SYSTEM TABS SWITCHER WITH BACK BUTTON ---
const SystemSwitcher: React.FC<{ 
    activeSystem: 'employee' | 'judge'; 
    onChange: (s: 'employee' | 'judge') => void;
    onExit: () => void;
}> = ({ activeSystem, onChange, onExit }) => (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3">
        {/* Back / Exit Button */}
        <button 
            onClick={onExit}
            className="w-12 h-12 bg-brand-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-brand-offwhite/50 hover:text-red-400 hover:border-red-400/30 transition-all shadow-2xl group"
            title="خروج للصفحة الرئيسية"
        >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
        </button>

        {/* Tabs */}
        <div className="bg-brand-dark/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1 shadow-2xl">
            <button 
                onClick={() => onChange('employee')}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeSystem === 'employee' ? 'bg-brand-accent text-brand-primary shadow-lg' : 'text-brand-offwhite/50 hover:bg-white/5'}`}
            >
                <Briefcase size={18} />
                مسار الموظف (2-5)
            </button>
            <button 
                onClick={() => onChange('judge')}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeSystem === 'judge' ? 'bg-brand-primary text-brand-accent border border-brand-accent/20 shadow-lg' : 'text-brand-offwhite/50 hover:bg-white/5'}`}
            >
                <Gavel size={18} />
                مسار القاضي (6-7)
            </button>
        </div>
    </div>
);


// --- COMPONENT: EMPLOYEE SYSTEM ---
const EmployeeSystem: React.FC = () => {
    const [view, setView] = useState<ViewState>('dashboard');
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [filingStep, setFilingStep] = useState(0);
    const [cases] = useState(generateEmployeeCases());

    const handleReview = (c: any) => {
        setSelectedCase(c);
        setView('review');
    };

    const handleApprove = () => {
        setView('filing_animation');
        let step = 0;
        const interval = setInterval(() => {
            step++;
            setFilingStep(step);
            if (step >= 4) {
                clearInterval(interval);
            }
        }, 1500);
    };

    return (
        <div className="pt-24 h-screen flex flex-col bg-[#051110] text-brand-offwhite font-almarai overflow-hidden">
            <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-brand-dark/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center text-brand-primary shadow-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">لوحة الموظف المختص</h1>
                        <p className="text-brand-offwhite/50 text-sm">إدارة الوارد والمراجعة الأولية</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                    <div className="text-left">
                        <p className="font-bold text-white">أ. محمد العتيبي</p>
                        <p className="text-xs text-brand-offwhite/50">باحث قضايا - الدرجة السابعة</p>
                    </div>
                    <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center border border-brand-accent text-brand-accent">م</div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10">
                <AnimatePresence mode="wait">
                    {view === 'dashboard' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="dashboard" className="space-y-8 max-w-[1800px] mx-auto">
                            <div className="grid grid-cols-4 gap-6">
                                <div className="bg-brand-dark border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-brand-accent/30 transition-all">
                                    <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent"><Clock size={32}/></div>
                                    <div><p className="text-brand-offwhite/50 font-bold mb-1">الوارد اليوم</p><p className="text-4xl font-black text-white">50</p></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-brand-accent/30 transition-all">
                                    <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary"><Activity size={32}/></div>
                                    <div><p className="text-brand-offwhite/50 font-bold mb-1">تحت المعالجة</p><p className="text-4xl font-black text-white">12</p></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-brand-accent/30 transition-all">
                                    <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-accent/20"><CheckSquare size={32}/></div>
                                    <div><p className="text-brand-offwhite/50 font-bold mb-1">تمت المراجعة</p><p className="text-4xl font-black text-brand-accent">85</p></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-brand-accent/30 transition-all">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500"><AlertTriangle size={32}/></div>
                                    <div><p className="text-brand-offwhite/50 font-bold mb-1">تنبيهات رقيب</p><p className="text-4xl font-black text-white">05</p></div>
                                </div>
                            </div>
                            <div className="bg-brand-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#081614]">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-3"><FileText className="text-brand-accent"/>قائمة المهام</h3>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10 flex items-center gap-2"><Filter size={18}/> تصفية</button>
                                        <div className="relative"><Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-offwhite/30"/><input type="text" placeholder="بحث برقم الدعوى..." className="pl-4 pr-12 py-2 bg-white/5 rounded-xl border border-white/5 focus:border-brand-accent/50 outline-none text-white w-64"/></div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto max-h-[600px] no-scrollbar">
                                    <table className="w-full text-right relative">
                                        <thead className="bg-[#081614] text-brand-offwhite/60 font-bold text-lg sticky top-0 z-10 shadow-md">
                                            <tr>
                                                <th className="p-6 pr-8">رقم الدعوى</th>
                                                <th className="p-6">المدعي</th>
                                                <th className="p-6">الجهة المدعى عليها</th>
                                                <th className="p-6">نوع الدعوى</th>
                                                <th className="p-6">حالة الاختصاص (AI)</th>
                                                <th className="p-6">المستندات</th>
                                                <th className="p-6 pl-8">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-lg font-medium">
                                            {cases.map((c, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-6 pr-8 font-mono text-brand-accent">{c.id}</td>
                                                    <td className="p-6 text-white">{c.plaintiff}</td>
                                                    <td className="p-6 text-brand-offwhite/70">{c.entity}</td>
                                                    <td className="p-6 font-bold">{c.type}</td>
                                                    <td className="p-6">
                                                        {c.status === 'valid' && <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-lg text-sm font-black border border-brand-accent/20"><CheckCircle2 size={14}/> صحيح</span>}
                                                        {c.status === 'warning' && <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm font-black border border-yellow-500/20"><AlertTriangle size={14}/> يحتاج مراجعة</span>}
                                                        {c.status === 'invalid' && <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-sm font-black border border-red-500/20"><XCircle size={14}/> غير مختص</span>}
                                                    </td>
                                                    <td className="p-6">{c.docs === 'complete' ? <span className="text-brand-secondary font-bold text-sm">مكتملة</span> : <span className="text-red-400 font-bold text-sm">ناقصة</span>}</td>
                                                    <td className="p-6 pl-8">
                                                        <button onClick={() => handleReview(c)} className="px-6 py-2 bg-brand-primary border border-brand-accent/20 text-brand-offwhite hover:bg-brand-accent hover:text-brand-primary font-black rounded-xl transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">مراجعة</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {view === 'review' && selectedCase && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key="review" className="h-full flex flex-col max-w-[1800px] mx-auto">
                            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-brand-offwhite/50 hover:text-white mb-6 w-fit"><ArrowRight size={20}/> عودة للقائمة</button>
                            <div className="grid grid-cols-12 gap-8 flex-1">
                                <div className="col-span-3 bg-brand-dark border border-white/10 rounded-[32px] p-8 flex flex-col shadow-xl">
                                    <h3 className="text-brand-accent font-black text-xl mb-6 uppercase tracking-wider flex items-center gap-2"><FileText size={20}/> ملخص الدعوى</h3>
                                    <div className="space-y-8 flex-1">
                                        <div><label className="text-brand-offwhite/40 text-xs font-bold block mb-2">رقم الدعوى</label><p className="text-2xl font-mono text-white">{selectedCase.id}</p></div>
                                        <div><label className="text-brand-offwhite/40 text-xs font-bold block mb-2">موضوع الدعوى</label><p className="text-xl font-bold text-white leading-relaxed">{selectedCase.type}</p></div>
                                        <div><label className="text-brand-offwhite/40 text-xs font-bold block mb-2">المدعي</label><p className="text-lg text-white bg-white/5 p-3 rounded-xl">{selectedCase.plaintiff}</p></div>
                                        <div><label className="text-brand-offwhite/40 text-xs font-bold block mb-2">الجهة المدعى عليها</label><p className="text-lg text-white bg-white/5 p-3 rounded-xl">{selectedCase.entity}</p></div>
                                    </div>
                                </div>
                                <div className="col-span-6 flex flex-col gap-6">
                                    <div className="bg-[#081614] border-2 border-brand-accent/10 rounded-[32px] p-8 flex-1 relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-accent/5 rounded-bl-[100px] pointer-events-none"></div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary"><BrainCircuit size={20}/></div>
                                            <h3 className="text-2xl font-black text-white">نتائج الفحص الذكي (Raqeeb Engine)</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-brand-primary/20 border border-brand-accent/30 rounded-3xl p-6 hover:bg-brand-primary/30 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-xl font-black text-white">الاختصاص الولائي</h4>
                                                    <span className="px-3 py-1 bg-brand-accent text-brand-primary rounded-lg text-sm font-black">منعقد</span>
                                                </div>
                                                <p className="text-brand-offwhite/80">تم التحقق من صفة المدعى عليه ({selectedCase.entity}) ومطابقتها للمادة 13.</p>
                                            </div>
                                            <div className="bg-brand-primary/20 border border-brand-accent/30 rounded-3xl p-6 hover:bg-brand-primary/30 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-xl font-black text-white">الاختصاص النوعي</h4>
                                                    <span className="px-3 py-1 bg-brand-primary text-brand-accent border border-brand-accent/30 rounded-lg text-sm font-black">إدارية ثالثة</span>
                                                </div>
                                                <p className="text-brand-offwhite/80">الدعوى تتعلق بالحقوق الوظيفية (الخدمة المدنية) وهي من اختصاص الدوائر الإدارية.</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 bg-brand-dark border border-white/10 p-4 rounded-xl flex gap-3">
                                            <Edit3 className="text-brand-offwhite/50" size={20}/>
                                            <input type="text" defaultValue="ملاحظة النظام: تاريخ القرار يقع ضمن مهلة الـ 60 يوماً للتظلم." className="bg-transparent w-full text-brand-offwhite/60 outline-none text-sm"/>
                                        </div>
                                    </div>
                                    <div className="bg-brand-dark border-t border-white/10 p-6 rounded-[32px] flex items-center justify-between gap-4 shadow-xl">
                                        <button className="flex-1 p-4 rounded-2xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all font-black text-brand-offwhite flex flex-col items-center gap-2">
                                            <RefreshCw size={24}/> إرجاع الدعوى
                                        </button>
                                        <button className="flex-1 p-4 rounded-2xl border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-500 transition-all font-black text-brand-offwhite flex flex-col items-center gap-2">
                                            <Edit3 size={24}/> تعديل الاختصاص
                                        </button>
                                        <button onClick={handleApprove} className="flex-[2] p-4 rounded-2xl bg-brand-accent text-brand-primary hover:scale-[1.02] transition-all font-black text-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(198,219,104,0.2)]">
                                            <CheckCircle2 size={28}/> اعتماد وقيد الدعوى
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-3 bg-brand-dark border border-white/10 rounded-[32px] p-8 shadow-xl">
                                    <h3 className="text-brand-accent font-black text-xl mb-6 uppercase tracking-wider flex items-center gap-2"><FileCheck2 size={20}/> المستندات</h3>
                                    <div className="space-y-4">
                                        {['لائحة الدعوى', 'القرار الإداري', 'الهوية الوطنية', 'السجل التجاري', 'وكالة شرعية'].map((d, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-brand-offwhite/50"/>
                                                    <span className="text-sm font-bold">{d}</span>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center"><CheckCircle2 size={12}/></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/10">
                                        <p className="text-yellow-500 text-xs font-bold flex gap-2"><AlertTriangle size={14}/> السجل التجاري مطلوب فقط للشركات</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {view === 'filing_animation' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center flex-col">
                            <div className="relative w-full max-w-2xl bg-brand-dark border border-white/10 rounded-[40px] p-16 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                                {filingStep < 4 ? (
                                    <>
                                        <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                            <Loader2 size={48} className="text-brand-accent animate-spin"/>
                                        </div>
                                        <h2 className="text-4xl font-black text-white mb-4 animate-pulse">جاري معالجة القيد الآلي...</h2>
                                        <div className="space-y-4 max-w-md mx-auto">
                                            <div className={`flex items-center gap-4 transition-all ${filingStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${filingStep >= 1 ? 'bg-brand-accent text-brand-primary' : 'bg-white/10'}`}>{filingStep >= 1 ? <CheckCircle2 size={16}/> : '1'}</div>
                                                <span className="text-lg font-bold">إنشاء رقم القضية في النظام الشامل</span>
                                            </div>
                                            <div className={`flex items-center gap-4 transition-all ${filingStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${filingStep >= 2 ? 'bg-brand-accent text-brand-primary' : 'bg-white/10'}`}>{filingStep >= 2 ? <CheckCircle2 size={16}/> : '2'}</div>
                                                <span className="text-lg font-bold">تخصيص الدائرة والقاضي (خوارزمية التوزيع)</span>
                                            </div>
                                            <div className={`flex items-center gap-4 transition-all ${filingStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${filingStep >= 3 ? 'bg-brand-accent text-brand-primary' : 'bg-white/10'}`}>{filingStep >= 3 ? <CheckCircle2 size={16}/> : '3'}</div>
                                                <span className="text-lg font-bold">جدولة موعد الجلسة الأولى</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                        <div className="w-32 h-32 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(198,219,104,0.4)]">
                                            <CheckCircle2 size={64} className="text-brand-primary"/>
                                        </div>
                                        <h2 className="text-4xl font-black text-white mb-2">تم قيد الدعوى بنجاح</h2>
                                        <p className="text-xl text-brand-offwhite/60 mb-8">تم إحالة الملف للقاضي المختص</p>
                                        <div className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/5">
                                            <div className="flex justify-between gap-12 text-lg">
                                                <div><span className="block text-xs text-brand-offwhite/40 mb-1">رقم القضية</span><span className="font-mono font-bold text-brand-accent">4405-1201</span></div>
                                                <div><span className="block text-xs text-brand-offwhite/40 mb-1">الدائرة</span><span className="font-bold text-white">الإدارية الثالثة</span></div>
                                                <div><span className="block text-xs text-brand-offwhite/40 mb-1">القاضي</span><span className="font-bold text-white">أحمد المنصور</span></div>
                                            </div>
                                        </div>
                                        <button onClick={() => setView('dashboard')} className="px-10 py-4 bg-brand-primary text-brand-offwhite border border-brand-accent/20 rounded-2xl hover:bg-brand-accent hover:text-brand-primary font-black transition-all">عودة للرئيسية</button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// --- COMPONENT: JUDGE SYSTEM ---
const JudgeSystem: React.FC = () => {
    const [view, setView] = useState<JudgeViewState>('dashboard');
    const [activeTab, setActiveTab] = useState('summary');
    const [cases] = useState(generateJudgeCases());
    const [showHearing, setShowHearing] = useState(false);

    return (
        <div className="pt-24 h-screen flex flex-col bg-[#051110] text-brand-offwhite font-almarai overflow-hidden">
             <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-brand-dark/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary border border-brand-accent rounded-xl flex items-center justify-center text-brand-accent shadow-lg">
                        <Gavel size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">مكتب القاضي الرقمي</h1>
                        <p className="text-brand-offwhite/50 text-sm">الدائرة الإدارية الثالثة - استئناف</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                    <div className="text-left">
                        <p className="font-bold text-white">فضيلة القاضي أحمد المنصور</p>
                        <p className="text-xs text-brand-offwhite/50">رئيس الدائرة</p>
                    </div>
                    <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary font-black text-lg">ق</div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10">
                <AnimatePresence mode="wait">
                    {view === 'dashboard' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="judge-dash" className="max-w-[1800px] mx-auto space-y-10">
                            <div className="grid grid-cols-4 gap-6">
                                <div className="bg-brand-dark border border-white/10 p-8 rounded-[32px] flex items-center justify-between shadow-lg">
                                    <div><p className="text-brand-offwhite/50 font-bold mb-2">جلسات اليوم</p><p className="text-5xl font-black text-white">06</p></div>
                                    <div className="w-20 h-20 bg-brand-accent/10 rounded-3xl flex items-center justify-center text-brand-accent"><Calendar size={40}/></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-8 rounded-[32px] flex items-center justify-between shadow-lg">
                                    <div><p className="text-brand-offwhite/50 font-bold mb-2">دعاوى جديدة</p><p className="text-5xl font-black text-white">02</p></div>
                                    <div className="w-20 h-20 bg-brand-secondary/10 rounded-3xl flex items-center justify-center text-brand-secondary"><FilePlus size={40}/></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-8 rounded-[32px] flex items-center justify-between shadow-lg">
                                    <div><p className="text-brand-offwhite/50 font-bold mb-2">للنطق بالحكم</p><p className="text-5xl font-black text-brand-accent">01</p></div>
                                    <div className="w-20 h-20 bg-brand-primary/20 border border-brand-accent/20 rounded-3xl flex items-center justify-center text-brand-primary"><Gavel size={40}/></div>
                                </div>
                                <div className="bg-brand-dark border border-white/10 p-8 rounded-[32px] flex items-center justify-between shadow-lg">
                                    <div><p className="text-brand-offwhite/50 font-bold mb-2">تنبيهات إجرائية</p><p className="text-5xl font-black text-red-400">01</p></div>
                                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-400"><AlertCircle size={40}/></div>
                                </div>
                            </div>
                            <div className="bg-brand-dark border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                                <div className="p-10 border-b border-white/10 bg-[#081614]"><h3 className="text-3xl font-black text-white">جدول الجلسات والقضايا</h3></div>
                                <div className="overflow-x-auto max-h-[600px] no-scrollbar">
                                    <table className="w-full text-right relative">
                                        <thead className="bg-[#081614] text-brand-offwhite/60 font-bold text-xl sticky top-0 z-10 shadow-md">
                                            <tr>
                                                <th className="p-8 pr-10">رقم الدعوى</th>
                                                <th className="p-8">أطراف الدعوى</th>
                                                <th className="p-8">موضوع الدعوى</th>
                                                <th className="p-8">موعد الجلسة</th>
                                                <th className="p-8">حالة الملف</th>
                                                <th className="p-8 pl-10">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-xl font-medium">
                                            {cases.map((c, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-8 pr-10 font-mono text-brand-accent">{c.id}</td>
                                                    <td className="p-8 text-white text-base">{c.parties}</td>
                                                    <td className="p-8 font-bold">{c.type}</td>
                                                    <td className="p-8 font-mono text-brand-offwhite/70">{c.time}</td>
                                                    <td className="p-8">
                                                        {c.status === 'ready' ? 
                                                            <span className="px-4 py-2 bg-brand-accent/10 text-brand-accent rounded-xl text-sm font-black border border-brand-accent/20 flex items-center gap-2 w-fit"><CheckCircle2 size={16}/> مكتمل إجرائياً</span> : 
                                                            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-sm font-black border border-yellow-500/20 flex items-center gap-2 w-fit"><Clock size={16}/> تحت استكمال النواقص</span>
                                                        }
                                                    </td>
                                                    <td className="p-8 pl-10">
                                                        <button onClick={() => setView('case_file')} className="px-8 py-3 bg-brand-offwhite text-brand-primary font-black rounded-2xl hover:bg-white transition-all shadow-lg flex items-center gap-2">
                                                            <ArrowLeft size={20} /> فتح القضية
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {view === 'case_file' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key="case-file" className="h-full flex flex-col max-w-[1800px] mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-brand-offwhite/50 hover:text-white text-lg font-bold"><ArrowRight size={24}/> عودة للجدول</button>
                                <div className="flex gap-4">
                                    {['summary', 'audit', 'docs', 'alerts', 'hearing'].map((tab) => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${activeTab === tab ? 'bg-brand-accent text-brand-primary shadow-xl scale-105' : 'bg-brand-dark border border-white/10 text-brand-offwhite hover:bg-white/5'}`}
                                        >
                                            {tab === 'summary' && <><FileText size={20}/> ملخص القضية</>}
                                            {tab === 'audit' && <><ShieldCheck size={20}/> التحقق الإجرائي</>}
                                            {tab === 'docs' && <><ScrollText size={20}/> المستندات</>}
                                            {tab === 'alerts' && <><AlertCircle size={20}/> تنبيهات رقيب</>}
                                            {tab === 'hearing' && <><Monitor size={20}/> الجلسة الافتراضية</>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 bg-brand-dark border border-white/10 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent via-brand-primary to-brand-accent opacity-50"></div>
                                {activeTab === 'summary' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-4xl font-black text-white mb-4">إلغاء قرار إنهاء خدمات تعسفي</h2>
                                                <p className="text-2xl font-mono text-brand-accent">4402-0988</p>
                                            </div>
                                            <div className="text-left bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
                                                <p className="text-brand-offwhite/50 font-bold mb-1">تاريخ القيد</p>
                                                <p className="text-xl font-bold text-white">1445/08/12</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="bg-[#081614] p-8 rounded-[32px] border border-brand-accent/10">
                                                <h3 className="text-brand-accent font-black text-xl mb-6 uppercase tracking-wider">أطراف الدعوى</h3>
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><User className="text-brand-offwhite"/></div>
                                                        <div><p className="text-brand-offwhite/50 text-sm font-bold">المدعي</p><p className="text-xl font-bold text-white">عبدالله بن صالح الفهد</p></div>
                                                    </div>
                                                    <div className="w-px h-10 bg-white/10 ml-6"></div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><Building2 className="text-brand-offwhite"/></div>
                                                        <div><p className="text-brand-offwhite/50 text-sm font-bold">المدعى عليه</p><p className="text-xl font-bold text-white">وزارة الموارد البشرية</p></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-[#081614] p-8 rounded-[32px] border border-brand-accent/10">
                                                <h3 className="text-brand-accent font-black text-xl mb-6 uppercase tracking-wider">الطلبات النهائية</h3>
                                                <ul className="space-y-4">
                                                    <li className="flex items-start gap-3 text-lg font-medium text-white"><div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center mt-1 text-sm font-black">1</div> إلغاء القرار الإداري رقم (332/ق) وتاريخ 1445/07/01</li>
                                                    <li className="flex items-start gap-3 text-lg font-medium text-white"><div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center mt-1 text-sm font-black">2</div> التعويض المادي بمبلغ 50,000 ريال عن الضرر</li>
                                                    <li className="flex items-start gap-3 text-lg font-medium text-white"><div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center mt-1 text-sm font-black">3</div> احتساب الخدمة بأثر رجعي</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'audit' && (
                                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                         <div className="bg-brand-primary/20 border border-brand-accent/30 rounded-3xl p-10 flex items-center gap-8 mb-10">
                                             <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary shadow-2xl"><ShieldCheck size={40}/></div>
                                             <div>
                                                 <h3 className="text-3xl font-black text-white mb-2">تم التحقق بواسطة رقيب (AI Audit)</h3>
                                                 <p className="text-xl text-brand-offwhite/70">الملف نظيف إجرائياً وجاهز للنظر القضائي.</p>
                                             </div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-8">
                                             <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                                 <h4 className="text-brand-offwhite/50 font-bold mb-4">الاختصاص الولائي</h4>
                                                 <div className="text-2xl font-black text-brand-accent flex items-center gap-3"><CheckCircle2/> منعقد</div>
                                                 <p className="mt-2 text-brand-offwhite/60">المدعى عليه جهة حكومية (نظام المرافعات م13).</p>
                                             </div>
                                             <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                                 <h4 className="text-brand-offwhite/50 font-bold mb-4">الاختصاص النوعي</h4>
                                                 <div className="text-2xl font-black text-brand-accent flex items-center gap-3"><CheckCircle2/> صحيح</div>
                                                 <p className="mt-2 text-brand-offwhite/60">الدعوى وظيفية (حقوق خدمة مدنية).</p>
                                             </div>
                                         </div>
                                     </div>
                                )}
                                {activeTab === 'docs' && (
                                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-4 gap-6">
                                         {['لائحة الدعوى.pdf', 'القرار الإداري.pdf', 'بطاقة الهوية.jpg', 'مشهد راتب.pdf', 'وكالة.pdf'].map((doc, i) => (
                                             <div key={i} className="group aspect-[3/4] bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-6 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
                                                 <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                 <FileText size={48} className="text-brand-offwhite/30 group-hover:text-brand-accent transition-colors"/>
                                                 <span className="font-bold text-lg text-white relative z-10">{doc}</span>
                                             </div>
                                         ))}
                                     </div>
                                )}
                                {activeTab === 'alerts' && (
                                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                         <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-3xl flex gap-6">
                                             <div className="p-4 bg-yellow-500/20 rounded-2xl h-fit"><AlertTriangle className="text-yellow-500" size={32}/></div>
                                             <div>
                                                 <h4 className="text-2xl font-black text-yellow-500 mb-2">تنبيه إجرائي (شكلي)</h4>
                                                 <p className="text-xl text-brand-offwhite/80 leading-relaxed">تاريخ القرار الإداري المرفق (1445/01/01) قريب من حد التقادم (5 سنوات). يرجى التحقق من تواريخ التظلم.</p>
                                             </div>
                                         </div>
                                         <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl flex gap-6">
                                             <div className="p-4 bg-blue-500/20 rounded-2xl h-fit"><Clock className="text-blue-400" size={32}/></div>
                                             <div>
                                                 <h4 className="text-2xl font-black text-blue-400 mb-2">تذكير بالمواعيد</h4>
                                                 <p className="text-xl text-brand-offwhite/80 leading-relaxed">المهلة الممنوحة للجهة للرد على اللائحة تنتهي خلال 3 أيام عمل.</p>
                                             </div>
                                         </div>
                                     </div>
                                )}
                                {activeTab === 'hearing' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col items-center justify-center p-12 text-center">
                                         <div className="bg-brand-primary/20 p-8 rounded-full mb-8 relative">
                                            <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-ping opacity-20"></div>
                                            <ScanFace size={64} className="text-brand-accent" />
                                         </div>
                                         <h2 className="text-4xl font-black text-white mb-4">بوابة التحقق الرقمي</h2>
                                         <p className="text-xl text-brand-offwhite/60 max-w-2xl leading-relaxed mb-12">
                                            يتطلب النظام إجراء فحص بيومتري ومراجعة آلية للزي الرسمي وبيئة الاتصال قبل السماح للأطراف بالدخول للقاعة القضائية.
                                         </p>
                                         <button 
                                            onClick={() => setShowHearing(true)}
                                            className="px-12 py-5 bg-brand-accent text-brand-primary text-xl font-black rounded-3xl hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,219,104,0.3)] transition-all flex items-center gap-4"
                                         >
                                            <Eye size={28} />
                                            تشغيل الماسح الذكي
                                         </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                    {showHearing && (
                        <VirtualHearing 
                            caseId="4402-0988" 
                            onClose={() => setShowHearing(false)} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- COMPONENT: LOGIN / LANDING PAGE ---
const LandingPage: React.FC<{ onLogin: (type: 'employee' | 'judge') => void }> = ({ onLogin }) => {
    const { t, dir } = useLanguage();
    const [loginMethod, setLoginMethod] = useState<'nafath' | 'internal'>('nafath');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authStep, setAuthStep] = useState(0); // 0: Idle, 1: Nafath Waiting, 2: Smart Routing

    const handleNafathLogin = () => {
        setIsAuthenticating(true);
        setAuthStep(1);
        
        // Simulation of Nafath -> Smart Routing
        setTimeout(() => {
            setAuthStep(2);
            setTimeout(() => {
                // Default to Employee for Nafath demo (or random)
                onLogin('employee');
            }, 2500);
        }, 3000);
    };

    const handleInternalLogin = (type: 'employee' | 'judge') => {
        setIsAuthenticating(true);
        setAuthStep(2);
        setTimeout(() => {
            onLogin(type);
        }, 2000);
    };
    
    return (
        <div className="relative min-h-screen flex flex-col font-almarai bg-[#051110] overflow-hidden selection:bg-brand-accent selection:text-brand-primary">
             {/* Official Background Pattern */}
             <div className="absolute inset-0 z-0 opacity-10" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6DB68' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }} />
             
             {/* Hero Glow */}
             <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-primary/30 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative z-20 px-10 py-8 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-primary border border-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent shadow-lg">
                        <Scale size={28} />
                     </div>
                     <div>
                         <h1 className="text-xl font-bold text-white tracking-wide">ديوان المظالم</h1>
                         <p className="text-xs text-brand-accent/70 font-light">المملكة العربية السعودية</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     <span className="text-sm font-medium text-brand-offwhite/80">النظام متصل وآمن</span>
                 </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
                
                {/* Main Login Container */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md bg-brand-dark/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 shadow-2xl relative overflow-hidden"
                >
                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-50"></div>

                    {/* Authenticating Overlay */}
                    <AnimatePresence>
                        {isAuthenticating && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-[#051110]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                            >
                                <div className="w-24 h-24 relative mb-8">
                                    <div className="absolute inset-0 border-4 border-brand-accent/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Fingerprint size={40} className="text-brand-accent animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {authStep === 1 ? t('login.nafath_waiting') : t('portal.routing')}
                                </h3>
                                <p className="text-brand-offwhite/50 text-sm">{t('login.processing')}</p>
                                
                                {authStep === 1 && (
                                    <div className="mt-8 px-6 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 animate-pulse">
                                        <div className="w-10 h-10 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent font-bold">42</div>
                                        <div className="text-right">
                                            <p className="text-xs text-brand-offwhite/50">رقم التحقق</p>
                                            <p className="text-sm font-bold text-white">يرجى تأكيده في تطبيق نفاذ</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Content */}
                    <div className="p-8 pb-6">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-white mb-2">{t('portal.system_name')}</h2>
                            <p className="text-brand-offwhite/50 text-sm">{t('portal.system_desc')}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
                            <button 
                                onClick={() => setLoginMethod('nafath')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${loginMethod === 'nafath' ? 'bg-brand-accent text-brand-primary shadow-lg' : 'text-brand-offwhite/50 hover:text-white'}`}
                            >
                                نفاذ (أفراد/موظفين)
                            </button>
                            <button 
                                onClick={() => setLoginMethod('internal')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${loginMethod === 'internal' ? 'bg-brand-primary text-brand-accent border border-brand-accent/20' : 'text-brand-offwhite/50 hover:text-white'}`}
                            >
                                الدخول الداخلي
                            </button>
                        </div>

                        {/* Nafath Panel */}
                        {loginMethod === 'nafath' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-4">
                                    <div className="bg-brand-primary/20 border border-brand-accent/10 rounded-2xl p-6 text-center">
                                        <Fingerprint size={48} className="text-brand-accent mx-auto mb-4 opacity-80" />
                                        <p className="text-brand-offwhite/70 text-sm leading-relaxed mb-6">
                                            سجل الدخول بأمان عبر النفاذ الوطني الموحد باستخدام الهوية الرقمية.
                                        </p>
                                        <button 
                                            onClick={handleNafathLogin}
                                            className="w-full py-4 bg-brand-accent text-brand-primary font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-accent/10"
                                        >
                                            <span>تسجيل الدخول عبر نفاذ</span>
                                            <ArrowLeft size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-brand-offwhite/30 uppercase tracking-widest mt-4">
                                        <Lock size={10} />
                                        <span>Secure Unified Access</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Internal Panel */}
                        {loginMethod === 'internal' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-offwhite/50 block pr-1">{t('login.internal_id')}</label>
                                        <div className="relative">
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-left focus:border-brand-accent/50 focus:bg-white/10 outline-none transition-all" dir="ltr" />
                                            <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-offwhite/30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-offwhite/50 block pr-1">{t('login.internal_pass')}</label>
                                        <div className="relative">
                                            <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-left focus:border-brand-accent/50 focus:bg-white/10 outline-none transition-all" dir="ltr" />
                                            <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-offwhite/30" />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleInternalLogin('employee')}
                                            className="py-3 bg-brand-primary border border-brand-accent/20 text-brand-accent font-bold rounded-xl hover:bg-brand-accent hover:text-brand-primary transition-all text-sm"
                                        >
                                            {t('portal.sim_staff')}
                                        </button>
                                        <button 
                                            onClick={() => handleInternalLogin('judge')}
                                            className="py-3 bg-brand-primary border border-brand-accent/20 text-brand-accent font-bold rounded-xl hover:bg-brand-accent hover:text-brand-primary transition-all text-sm"
                                        >
                                            {t('portal.sim_judge')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Slogan */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
                    className="mt-12 text-center"
                >
                    <p className="text-brand-accent/60 font-black text-lg tracking-[0.2em]">{t('portal.slogan')}</p>
                </motion.div>
            </div>
            
             <footer className="py-6 text-center border-t border-white/5 text-brand-offwhite/20 text-xs relative z-10">
                <p>{t('footer.rights')}</p>
            </footer>
        </div>
    )
}

// --- APP CONTENT COMPONENT ---
const AppContent: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('landing');
    const [activeSystem, setActiveSystem] = useState<'employee' | 'judge'>('employee');

    const handleLogin = (type: 'employee' | 'judge') => {
        setActiveSystem(type);
        setMode('workspace');
    };

    return (
        <div className="relative min-h-screen bg-[#051110]">
            <AnimatePresence mode="wait">
                {mode === 'landing' ? (
                     <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}>
                        <LandingPage onLogin={handleLogin} />
                     </motion.div>
                ) : (
                    <motion.div key="workspace" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <SystemSwitcher activeSystem={activeSystem} onChange={setActiveSystem} onExit={() => setMode('landing')} />
                        <AnimatePresence mode="wait">
                            {activeSystem === 'employee' ? (
                                <motion.div key="emp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <EmployeeSystem />
                                </motion.div>
                            ) : (
                                <motion.div key="jud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <JudgeSystem />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- APP ROOT ---
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;

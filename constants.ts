
import { CardItem, LogoItem, TestimonialItem } from './types';

export const CARDS: CardItem[] = [
  {
    id: '1',
    title: 'واجهة ذكية',
    description: 'رسوم متحركة سلسة تستجيب لكل تفاعل بدون أي تأخير.',
    image: 'https://images.unsplash.com/photo-1589210339058-df3a395b93c6?auto=format&fit=crop&q=80&w=800',
    tags: ['واجهة المستخدم', 'حركة']
  },
  {
    id: '2',
    title: 'تكامل الذكاء الاصطناعي',
    description: 'ذكاء مدمج يكيف التخطيط بناءً على سلوك المستخدم.',
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800',
    tags: ['ذكاء اصطناعي', 'ذكي']
  },
  {
    id: '3',
    title: 'تصميم متكيف',
    description: 'تخطيطات تتدفق مثل الماء عبر أبعاد أي جهاز.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    tags: ['متجاوب', 'حديث']
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'أحمد القحطاني',
    role: 'مستشار قانوني',
    company: 'العدل الرقمي',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    text: "الرسوم المتحركة والواجهات في رقيب مذهلة حقاً، لقد غيرت طريقة تعاملنا مع البيانات القضائية."
  },
  {
    id: 't2',
    name: 'سارة المنصور',
    role: 'رئيسة قسم التقنية',
    company: 'أبكس ديجيتال',
    avatar: 'https://i.pravatar.cc/150?u=sara',
    text: "تكامل سلس وأداء فائق السرعة. رقيب يمثل نقلة نوعية في تجربة المستخدم للمنظومات الحكومية."
  },
  {
    id: 't3',
    name: 'فهد العتيبي',
    role: 'قاضي إداري',
    company: 'ديوان المظالم',
    avatar: 'https://i.pravatar.cc/150?u=fahad',
    text: "رأينا زيادة ملحوظة في سرعة إنجاز القضايا منذ اعتماد أنماط التدقيق الذكي في رقيب."
  }
];

export const LOGOS: LogoItem[] = [
  { id: 'l1', name: 'أكمي', url: '#' },
  { id: 'l2', name: 'عالمي', url: '#' },
  { id: 'l3', name: 'نيكسوس', url: '#' },
  { id: 'l4', name: 'إيكو', url: '#' },
  { id: 'l5', name: 'فيرتكس', url: '#' },
  { id: 'l6', name: 'أفق', url: '#' },
  { id: 'l7', name: 'زينيث', url: '#' },
];

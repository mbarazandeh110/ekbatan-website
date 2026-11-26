export interface TeamMember {
  slug: string;
  name: string;
  initials: string;
  colorClass: string;
  hoverClass: string;
  headline: string;
  bio: string;
  linkedin: string;
}

export const teamMembers: TeamMember[] = [
  {
    slug: 'mahdi-barazandeh',
    name: 'مهدی برازنده',
    initials: 'MLB',
    colorClass: 'text-cyan-400 bg-cyan-900/50 border-cyan-800',
    hoverClass: 'group-hover:text-cyan-300',
    headline: 'SRE | Focus on Kubernetes, CDN & Reliability',
    bio: 'معمار زیرساخت ابری، کوبرنتیز، CDN و مهندسی پایداری (SRE) با تمرکز بر کلاسترهای Bare-Metal و شبکه‌های پرترافیک.',
    linkedin: 'https://www.linkedin.com/in/mahdi-barazandeh/',
  },
  {
    slug: 'yasin-porkar',
    name: 'یاسین پرکار',
    initials: 'YP',
    colorClass: 'text-indigo-400 bg-indigo-900/50 border-indigo-800',
    hoverClass: 'group-hover:text-indigo-300',
    headline: 'SRE, K8S, Ceph | SRE Manager',
    bio: 'مدیر SRE و متخصص استوریج‌های توزیع‌شده Ceph، کلاسترهای کوبرنتیز سازمانی و معماری High Availability.',
    linkedin: 'https://www.linkedin.com/in/yasinporkar/',
  },
  {
    slug: 'reza-najjar',
    name: 'رضا نجار',
    initials: 'RN',
    colorClass: 'text-indigo-400 bg-indigo-900/50 border-indigo-800',
    hoverClass: 'group-hover:text-indigo-300',
    headline: 'SRE Engineer',
    bio: 'مهندس SRE با تمرکز بر مشاهده‌پذیری (Observability)، اتوماسیون زیرساخت و پایداری بارهای کاری Production.',
    linkedin: 'https://www.linkedin.com/in/reza-najjar-0337a5132/',
  },
  {
    slug: 'ali-lotfi',
    name: 'علی لطفی',
    initials: 'AL',
    colorClass: 'text-emerald-400 bg-emerald-900/50 border-emerald-800',
    hoverClass: 'group-hover:text-emerald-300',
    headline: 'Software Architecture Consultant & Data Specialist | Microservices & Data Lakehouse',
    bio: 'مشاور معماری نرم‌افزار و متخصص سیستم‌های کلان‌داده، میکروسرویس‌ها و پلتفرم‌های Data Lakehouse.',
    linkedin: 'https://www.linkedin.com/in/csalilotfi/',
  },
  {
    slug: 'hossein-eyvazi',
    name: 'حسین عیوضی',
    initials: 'HE',
    colorClass: 'text-fuchsia-400 bg-fuchsia-900/50 border-fuchsia-800',
    hoverClass: 'group-hover:text-fuchsia-300',
    headline: 'AI and Data Engineer',
    bio: 'مهندس داده و هوش مصنوعی با تمرکز بر زیرساخت‌های MLOps، سروینگ مدل‌های LLM و پردازش توزیع‌شده.',
    linkedin: 'https://www.linkedin.com/in/hossein-eyvazi-7908231b8/',
  },
];

export function getTeamMemberBySlug(slug?: string): TeamMember | undefined {
  if (!slug) return undefined;
  return teamMembers.find((member) => member.slug === slug);
}

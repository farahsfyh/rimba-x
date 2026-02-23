declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';
    export interface IconProps extends SVGProps<SVGSVGElement> {
        size?: string | number;
        color?: string;
        strokeWidth?: string | number;
    }
    export type Icon = FC<IconProps>;

    // Navigation & Layout
    export const LayoutDashboard: Icon;
    export const Menu: Icon;
    export const X: Icon;
    export const ChevronLeft: Icon;
    export const ChevronRight: Icon;
    export const ArrowRight: Icon;
    export const LogOut: Icon;

    // Content & Files
    export const FileText: Icon;
    export const BookOpen: Icon;
    export const Upload: Icon;

    // AI & Learning
    export const Brain: Icon;
    export const Sparkles: Icon;
    export const Zap: Icon;
    export const MessageSquare: Icon;
    export const Mic: Icon;

    // Stats & Progress
    export const BarChart3: Icon;
    export const Trophy: Icon;
    export const Flame: Icon;
    export const Clock2: Icon;
    export const CheckCircle2: Icon;

    // Users & Social
    export const Users: Icon;
    export const GraduationCap: Icon;
    export const Globe: Icon;

    // Settings & Help
    export const Settings: Icon;
    export const CircleHelp: Icon;
}

declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';
    export interface IconProps extends SVGProps<SVGSVGElement> {
        size?: string | number;
        color?: string;
        strokeWidth?: string | number;
    }
    export type Icon = FC<IconProps>;
    export const LayoutDashboard: Icon;
    export const FileText: Icon;
    export const Brain: Icon;
    export const Mic: Icon;
    export const ArrowRight: Icon;
    export const MessageSquare: Icon;
    export const Sparkles: Icon;
    export const CheckCircle2: Icon;
    export const Menu: Icon;
    export const X: Icon;
    export const LogOut: Icon;
    export const BookOpen: Icon;
    export const BarChart3: Icon;
}

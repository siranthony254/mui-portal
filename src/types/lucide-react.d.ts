declare module 'lucide-react' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

  type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & RefAttributes<SVGSVGElement>
  type Icon = ForwardRefExoticComponent<IconProps>

  export const ArrowLeft: Icon
  export const Award: Icon
  export const BarChart2: Icon
  export const Bell: Icon
  export const BookOpen: Icon
  export const CheckCircle: Icon
  export const ChevronDown: Icon
  export const ChevronRight: Icon
  export const Circle: Icon
  export const ClipboardList: Icon
  export const Clock: Icon
  export const ExternalLink: Icon
  export const FileImage: Icon
  export const FileText: Icon
  export const Flag: Icon
  export const Globe: Icon
  export const Headphones: Icon
  export const LayoutDashboard: Icon
  export const Lightbulb: Icon
  export const Lock: Icon
  export const LogOut: Icon
  export const MessageSquare: Icon
  export const Mic2: Icon
  export const Play: Icon
  export const Plus: Icon
  export const Search: Icon
  export const Send: Icon
  export const Settings: Icon
  export const Star: Icon
  export const UserCheck: Icon
  export const Users: Icon
}

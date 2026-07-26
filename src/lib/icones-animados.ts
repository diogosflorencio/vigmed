import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  CloudUpload,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  Filter,
  FolderOpen,
  HardDrive,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  Newspaper,
  Pencil,
  Pin,
  Plus,
  Save,
  Search,
  Send,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { IconHandle } from '@animateicons/react'
import {
  ActivityIcon,
  BellRingIcon,
  BookOpenIcon,
  BookOpenTextIcon,
  BoxesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleCheckBigIcon,
  CircleCheckIcon,
  ClipboardIcon,
  CloudUploadIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FolderOpenIcon,
  GlobeIcon,
  LayersIcon,
  LayoutGridIcon,
  LockIcon,
  LogoutIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoonIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunIcon,
  Trash2Icon,
  UploadIcon,
  UserIcon,
  UserPenIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from '@animateicons/react/lucide'
import {
  Dashboard01Icon,
  Dashboard02Icon,
  Menu01Icon,
  NotificationIcon,
  SearchIcon as SearchHugeIcon,
  Settings01Icon,
} from '@animateicons/react/huge'

/** Identificadores de ícones usados no projeto */
export type NomeIcone =
  | 'layout-dashboard'
  | 'building'
  | 'users'
  | 'file-text'
  | 'megaphone'
  | 'newspaper'
  | 'shield'
  | 'user'
  | 'menu'
  | 'x'
  | 'logout'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'upload'
  | 'cloud-upload'
  | 'check-circle'
  | 'clipboard-check'
  | 'mail'
  | 'search'
  | 'plus'
  | 'download'
  | 'message'
  | 'send'
  | 'trash'
  | 'pin'
  | 'folder-open'
  | 'chart-bar'
  | 'external-link'
  | 'user-plus'
  | 'activity'
  | 'moon'
  | 'sun'
  | 'sparkles'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-right'
  | 'arrow-left'
  | 'file-check'
  | 'clock'
  | 'filter'
  | 'pencil'
  | 'hard-drive'
  | 'monitor'
  | 'save'

export type FonteIconeAnimado = 'lucide' | 'huge'

export interface PropsIconeBase {
  size?: number
  className?: string
  color?: string
  isAnimated?: boolean
  duration?: number
}

export type ComponenteIconeAnimado = ForwardRefExoticComponent<PropsIconeBase & RefAttributes<IconHandle>>

export interface EntradaIconeAnimado {
  fonte: FonteIconeAnimado
  componente: ComponenteIconeAnimado
}

/** Mapa completo: @animateicons/react (lucide + huge) - sem animação manual */
export const ICONES_ANIMADOS: Record<NomeIcone, EntradaIconeAnimado> = {
  'layout-dashboard': { fonte: 'huge', componente: Dashboard01Icon },
  building: { fonte: 'lucide', componente: BoxesIcon },
  users: { fonte: 'lucide', componente: UsersIcon },
  'file-text': { fonte: 'lucide', componente: BookOpenTextIcon },
  megaphone: { fonte: 'lucide', componente: BellRingIcon },
  newspaper: { fonte: 'lucide', componente: BookOpenIcon },
  shield: { fonte: 'lucide', componente: ShieldCheckIcon },
  user: { fonte: 'lucide', componente: UserIcon },
  menu: { fonte: 'huge', componente: Menu01Icon },
  x: { fonte: 'lucide', componente: XIcon },
  logout: { fonte: 'lucide', componente: LogoutIcon },
  lock: { fonte: 'lucide', componente: LockIcon },
  eye: { fonte: 'lucide', componente: EyeIcon },
  'eye-off': { fonte: 'lucide', componente: EyeOffIcon },
  upload: { fonte: 'lucide', componente: UploadIcon },
  'cloud-upload': { fonte: 'lucide', componente: CloudUploadIcon },
  'check-circle': { fonte: 'lucide', componente: CircleCheckIcon },
  'clipboard-check': { fonte: 'lucide', componente: ClipboardIcon },
  mail: { fonte: 'lucide', componente: MailIcon },
  search: { fonte: 'huge', componente: SearchHugeIcon },
  plus: { fonte: 'lucide', componente: PlusIcon },
  download: { fonte: 'lucide', componente: DownloadIcon },
  message: { fonte: 'lucide', componente: MessageCircleIcon },
  send: { fonte: 'lucide', componente: SendIcon },
  trash: { fonte: 'lucide', componente: Trash2Icon },
  pin: { fonte: 'lucide', componente: MapPinIcon },
  'folder-open': { fonte: 'lucide', componente: FolderOpenIcon },
  'chart-bar': { fonte: 'lucide', componente: ChartBarIcon },
  'external-link': { fonte: 'lucide', componente: ExternalLinkIcon },
  'user-plus': { fonte: 'lucide', componente: UserPlusIcon },
  activity: { fonte: 'lucide', componente: ActivityIcon },
  moon: { fonte: 'lucide', componente: MoonIcon },
  sun: { fonte: 'lucide', componente: SunIcon },
  sparkles: { fonte: 'lucide', componente: SparklesIcon },
  'chevron-down': { fonte: 'lucide', componente: ChevronDownIcon },
  'chevron-up': { fonte: 'lucide', componente: ChevronUpIcon },
  'arrow-right': { fonte: 'lucide', componente: ChevronRightIcon },
  'arrow-left': { fonte: 'lucide', componente: ChevronLeftIcon },
  'file-check': { fonte: 'lucide', componente: CircleCheckBigIcon },
  clock: { fonte: 'lucide', componente: ActivityIcon },
  filter: { fonte: 'lucide', componente: SlidersHorizontalIcon },
  pencil: { fonte: 'lucide', componente: UserPenIcon },
  'hard-drive': { fonte: 'lucide', componente: LayersIcon },
  monitor: { fonte: 'huge', componente: Dashboard02Icon },
  save: { fonte: 'lucide', componente: ClipboardIcon },
}

/** Fallback estático lucide - só quando animação desligada ou reduced motion */
export const ICONES_ESTATICOS: Record<NomeIcone, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  building: Building2,
  users: Users,
  'file-text': FileText,
  megaphone: Megaphone,
  newspaper: Newspaper,
  shield: Shield,
  user: User,
  menu: Menu,
  x: X,
  logout: LogOut,
  lock: Lock,
  eye: Eye,
  'eye-off': EyeOff,
  upload: Upload,
  'cloud-upload': CloudUpload,
  'check-circle': CheckCircle2,
  'clipboard-check': ClipboardCheck,
  mail: Mail,
  search: Search,
  plus: Plus,
  download: Download,
  message: MessageSquare,
  send: Send,
  trash: Trash2,
  pin: Pin,
  'folder-open': FolderOpen,
  'chart-bar': BarChart3,
  'external-link': ExternalLink,
  'user-plus': UserPlus,
  activity: Activity,
  moon: Moon,
  sun: Sun,
  sparkles: Sparkles,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'file-check': FileCheck2,
  clock: Clock,
  filter: Filter,
  pencil: Pencil,
  'hard-drive': HardDrive,
  monitor: Monitor,
  save: Save,
}

/** Ícones extras usados só no dock (configurações etc.) */
export const ICONE_ANIMADO_CONFIGURACOES: EntradaIconeAnimado = {
  fonte: 'huge',
  componente: Settings01Icon,
}

export const ICONE_ANIMADO_NOTIFICACAO: EntradaIconeAnimado = {
  fonte: 'huge',
  componente: NotificationIcon,
}

export const ICONE_ANIMADO_GLOBO: EntradaIconeAnimado = {
  fonte: 'lucide',
  componente: GlobeIcon,
}

export const ICONE_ANIMADO_GRID: EntradaIconeAnimado = {
  fonte: 'lucide',
  componente: LayoutGridIcon,
}

export const ICONE_ANIMADO_SETTINGS_LUCIDE: EntradaIconeAnimado = {
  fonte: 'lucide',
  componente: SettingsIcon,
}

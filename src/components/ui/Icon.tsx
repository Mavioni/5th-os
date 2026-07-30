import React from 'react';
import {
  Search,
  Plus,
  X,
  Minus,
  Maximize2,
  Check,
  ArrowRight,
  Folder,
  FolderOpen,
  File,
  FileText,
  Terminal,
  Calendar,
  Clock,
  Settings,
  Users,
  User,
  Bell,
  Inbox,
  Sparkles,
  Grid3X3,
  Command,
  Menu,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Dot,
  Link,
  Cpu,
  Home,
  Trash2,
  HardDrive,
  Download,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  Power,
  Lock,
  LogOut,
  RefreshCw,
  Star,
  Camera,
  Image,
  Music,
  Mail,
  Globe,
  Package,
  Shield,
  Gamepad2,
  PenTool,
  Wrench,
  BookOpen,
  Monitor,
  Droplet,
  Eye,
  Activity,
  Bluetooth,
  Send,
  Mic,
  Info,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

// Re-export all icons so components can import from here
export { Search, Plus, X, Minus, Maximize2, Check, ArrowRight, Folder,
  FolderOpen, File, FileText, Terminal, Calendar, Clock, Settings, Users,
  User, Bell, Inbox, Sparkles, Grid3X3, Command, Menu, ChevronRight,
  ChevronDown, MoreHorizontal, Play, Pause, SkipForward, SkipBack, Dot,
  Link, Cpu, Home, Trash2, HardDrive, Download, Wifi, Volume2, VolumeX,
  Battery, Power, Lock, LogOut, RefreshCw, Star, Camera, Image, Music,
  Mail, Globe, Package, Shield, Gamepad2, PenTool, Wrench, BookOpen,
  Monitor, Droplet, Eye, Activity, Bluetooth, Send, Mic, Info,
  CheckCircle2, AlertCircle };

export type IconName = keyof typeof import('lucide-react');

// Map app icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Search, Plus, X: X, Close: X, Minus, Maximize: Maximize2, Check,
  Arrow: ArrowRight, Folder, FolderOpen, File, FileText, Terminal,
  Calendar, Clock, Settings, Users, User, Bell, Inbox, Sparkles,
  Grid: Grid3X3, Command, Menu, Chevron: ChevronRight,
  ChevronDn: ChevronDown, More: MoreHorizontal, Play, Pause,
  Skip: SkipForward, SkipBack, Dot, Link, Cpu, Home, Trash: Trash2,
  HardDrive, Download, Wifi, Volume: Volume2, VolumeX, Battery, Power,
  Lock, LogOut, Refresh: RefreshCw, Star, Camera, Image, Music, Mail,
  Globe, Package, Shield, Gamepad: Gamepad2, PenTool, Wrench, BookOpen,
  Monitor, Droplet, Eye, Activity, Bluetooth, Send, Mic, Info,
  CheckCircle: CheckCircle2, AlertCircle,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 18, className, style }: IconProps) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) {
    return <File size={size} className={className} style={style} />;
  }
  return <LucideIcon size={size} className={className} style={style} strokeWidth={1.5} />;
}

// Default export for easy importing
export default Icon;

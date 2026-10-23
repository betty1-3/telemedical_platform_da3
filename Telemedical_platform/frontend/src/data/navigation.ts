import {
  Building2Icon,
  CalendarClockIcon,
  CreditCardIcon,
  FileTextIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  PillIcon,
  StethoscopeIcon,
  UsersIcon } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the top bar under the page title. */
  subtitle: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
{
  label: 'Overview',
  items: [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    subtitle: 'Live operational summary across the hospital network'
  }]

},
{
  label: 'Care records',
  items: [
  { to: '/patients', label: 'Patients', icon: UsersIcon, subtitle: 'Patient registry, contact details and clinical history' },
  { to: '/doctors', label: 'Doctors', icon: StethoscopeIcon, subtitle: 'Practitioner registry, credentials and hospital affiliations' },
  { to: '/hospitals', label: 'Hospitals', icon: Building2Icon, subtitle: 'Facilities, locations and attached practitioners' },
  { to: '/consultations', label: 'Consultations', icon: CalendarClockIcon, subtitle: 'Scheduled, completed and cancelled appointments' }]

},
{
  label: 'Clinical & billing',
  items: [
  { to: '/prescriptions', label: 'Prescriptions', icon: FileTextIcon, subtitle: 'Issued prescriptions with medicines and tests' },
  { to: '/medicines', label: 'Medicines', icon: PillIcon, subtitle: 'Formulary of drugs, tablets, syrups and injections' },
  { to: '/tests', label: 'Tests', icon: FlaskConicalIcon, subtitle: 'Diagnostic test catalogue' },
  { to: '/payments', label: 'Payments', icon: CreditCardIcon, subtitle: 'Consultation billing and settlement records' }]

}];


export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export function findNavItem(pathname: string): NavItem {
  const exact = navItems.find((item) => item.to === pathname);
  if (exact) return exact;
  const nested = navItems.find((item) => item.to !== '/' && pathname.startsWith(item.to));
  return nested ?? navItems[0];
}
'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { Menu, ChevronRight, Terminal, Smartphone } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  customBreadcrumbs?: Breadcrumb[];
}

export function AppLayout({ children, noPadding, customBreadcrumbs }: AppLayoutProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!pathname.includes('/edit') && !pathname.endsWith('/new'));

  // Simple breadcrumb logic based on pathname
  let defaultBreadcrumbs: Breadcrumb[] = [
    { label: 'Route 53', href: '/dashboard' }
  ];
  if (pathname.includes('/hosted-zones')) {
    defaultBreadcrumbs.push({ label: 'Hosted zones', href: '/hosted-zones' });
    const parts = pathname.split('/');
    if (parts.length > 2 && parts[2] !== 'new') {
      defaultBreadcrumbs.push({ label: parts[2], href: `/hosted-zones/${parts[2]}` });
    } else if (parts.length > 2 && parts[2] === 'new') {
      defaultBreadcrumbs.push({ label: 'Create hosted zone' });
    }
  } else if (pathname.includes('/dashboard')) {
    defaultBreadcrumbs.push({ label: 'Dashboard' });
  }

  const breadcrumbsToUse = customBreadcrumbs || defaultBreadcrumbs;

  return (
    <div className={styles.container}>
      <TopBar />
      <div className={styles.secondaryHeader}>
        <button 
          className={styles.hamburgerBtn} 
          aria-label="Menu"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <div className={`${styles.hamburgerCircle} ${isSidebarOpen ? styles.hamburgerCircleOpen : ''}`}>
            <svg width="14" height="11" viewBox="0 0 14 11" fill={isSidebarOpen ? "#ffffff" : (theme === 'dark' ? "#eaeded" : "#16191f")} xmlns="http://www.w3.org/2000/svg">
              <rect width="14" height="2.2" />
              <rect y="4.4" width="14" height="2.2" />
              <rect y="8.8" width="14" height="2.2" />
            </svg>
          </div>
        </button>
        <div className={styles.breadcrumbs}>
          {breadcrumbsToUse.map((crumb, idx) => {
            let className = styles.crumb;
            if (idx === 0) className = styles.crumbService;
            else if (idx === breadcrumbsToUse.length - 1) className = styles.crumbActive;
            
            return (
              <React.Fragment key={idx}>
                {crumb.href && idx < breadcrumbsToUse.length - 1 ? (
                  <Link href={crumb.href} className={className}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={className}>
                    {crumb.label}
                  </span>
                )}
                {idx < breadcrumbsToUse.length - 1 && <ChevronRight size={18} strokeWidth={1.5} className={styles.crumbSeparator} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className={styles.mainWrapper}>
        {isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />}
        <main className={`${styles.content} ${noPadding ? styles.noPadding : ''}`}>
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
      <footer className={styles.globalFooter}>
        <div className={styles.footerLeft}>
          <button className={styles.footerBtn} disabled><Terminal size={14} strokeWidth={1.5} /> CloudShell</button>
          <button className={styles.footerBtn} disabled>Feedback</button>
          <button className={styles.footerBtn} disabled><Smartphone size={14} strokeWidth={1.5} /> Console Mobile App</button>
        </div>
        <div className={styles.footerRight}>
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
          <a href="#" className={styles.footerLink}>Privacy</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Cookie preferences</a>
        </div>
      </footer>
    </div>
  );
}

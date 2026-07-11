'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { Menu, Terminal, MessageSquare, Smartphone, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';

type LinkItem = { name: string; href: string; disabled?: boolean; isNew?: boolean };
type Section = { title: string; links?: LinkItem[]; href?: string; disabled?: boolean };

const SECTIONS: Section[] = [
  {
    title: 'Route 53',
    links: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Hosted zones', href: '/hosted-zones' },
      { name: 'Health checks', href: '/health-checks' },
      { name: 'Profiles', href: '/profiles' }
    ]
  },
  {
    title: 'Global Resolver',
    links: [
      { name: 'Global resolvers', href: '/resolver', isNew: true },
      { name: 'Shared DNS views', href: '#', disabled: true, isNew: true }
    ]
  },
  {
    title: 'VPC Resolver',
    links: [
      { name: 'VPCs', href: '#', disabled: true },
      { name: 'Inbound endpoints', href: '#', disabled: true },
      { name: 'Outbound endpoints', href: '#', disabled: true },
      { name: 'Rules', href: '#', disabled: true },
      { name: 'Query logging', href: '#', disabled: true },
      { name: 'Outposts', href: '#', disabled: true }
    ]
  },
  {
    title: 'Domains',
    links: [
      { name: 'Registered domains', href: '#', disabled: true },
      { name: 'Requests', href: '#', disabled: true }
    ]
  },
  {
    title: 'IP-based routing',
    links: [
      { name: 'CIDR collections', href: '#', disabled: true }
    ]
  },
  {
    title: 'Traffic flow',
    links: [
      { name: 'Traffic policies', href: '/traffic-policies' },
      { name: 'Policy records', href: '#', disabled: true }
    ]
  },
  {
    title: 'DNS Firewall',
    href: '#',
    disabled: true
  },
  {
    title: 'Application Recovery Controller',
    href: '#',
    disabled: true
  }
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  // Manage expanded state for each section
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Global Resolver': true,
    'VPC Resolver': true,
    'Domains': true,
    'IP-based routing': true,
    'Traffic flow': true
  });

  const toggleSection = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.navGroup}>
        {SECTIONS.map((section, idx) => (
          <div key={idx} className={styles.section}>
            {section.href ? (
              <div className={styles.singleLinkWrap}>
                {section.disabled ? (
                  <span className={`${styles.sectionTitle} ${styles.disabled}`}>
                    {section.title}
                  </span>
                ) : (
                  <Link 
                    href={section.href} 
                    className={`${styles.sectionTitle} ${isActive(section.href) ? styles.active : ''}`}
                  >
                    {section.title}
                  </Link>
                )}
              </div>
            ) : (
              <>
                {section.title === 'Route 53' ? (
                  <div className={styles.sectionHeaderNoCollapse}>
                    {section.title}
                    {onClose && (
                      <button className={styles.closeSidebarBtn} onClick={onClose} aria-label="Close sidebar">
                        <ChevronLeft size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.sectionHeader} onClick={() => toggleSection(section.title)}>
                    <div className={styles.collapseIcon}>
                      {expanded[section.title] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    {section.title}
                  </div>
                )}
                
                {section.links && (section.title === 'Route 53' || expanded[section.title]) && (
                  <ul className={styles.linkList}>
                    {section.links.map((link, lidx) => (
                      <li key={lidx}>
                        {link.disabled ? (
                          <span className={`${styles.linkItem} ${styles.disabled}`}>
                            {link.name} {link.isNew && <span className={styles.newBadge}>New</span>}
                          </span>
                        ) : (
                          <Link 
                            href={link.href}
                            className={`${styles.linkItem} ${isActive(link.href) ? styles.active : ''}`}
                          >
                            {link.name} {link.isNew && <span className={styles.newBadge}>New</span>}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {idx < SECTIONS.length - 1 && section.title !== 'Route 53' && <hr className={styles.divider} />}
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

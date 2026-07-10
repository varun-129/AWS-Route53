'use client';

import React from 'react';
import styles from './TopBar.module.css';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { LogOut, Moon, Sun, Globe, User, Search, Bell, Settings, HelpCircle, Terminal, Grip } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.topBar}>
      <div className={styles.logoContainer}>
        <div className={styles.awsTextLogo}>
          <img src="/aws.svg" alt="AWS" height="18" style={{ marginTop: '2px' }} />
        </div>
        
        <div className={styles.logoSeparator} />
        
        <div className={styles.awsQLogo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="url(#q-gradient)" />
            <path d="M12 6L17.5 9V14.5L12 17.5L6.5 14.5V9L12 6Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="12" cy="11.5" r="1.5" fill="white" />
            <path d="M12 11.5L17.5 14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="q-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0a2a7a" />
                <stop offset="0.4" stopColor="#4338CA" />
                <stop offset="1" stopColor="#6d1b9b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        

        
        <div className={styles.logoSeparator} />

        <div className={styles.servicesGrid}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#EAEAEA" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
            <rect x="9.75" y="2" width="4.5" height="4.5" rx="1" />
            <rect x="17.5" y="2" width="4.5" height="4.5" rx="1" />
            <rect x="2" y="9.75" width="4.5" height="4.5" rx="1" />
            <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1" />
            <rect x="17.5" y="9.75" width="4.5" height="4.5" rx="1" />
            <rect x="2" y="17.5" width="4.5" height="4.5" rx="1" />
            <rect x="9.75" y="17.5" width="4.5" height="4.5" rx="1" />
            <rect x="17.5" y="17.5" width="4.5" height="4.5" rx="1" />
          </svg>
        </div>
      </div>
      
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search for services, features, blogs, docs, and more"
            disabled
          />
          <span className={styles.searchShortcut}>[Option+S]</span>
        </div>
      </div>

      <div className={styles.navContainer}>

        <button className={styles.iconBtn} aria-label="Settings placeholder" disabled>
          <Settings size={16} />
        </button>
        
        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        
        {user ? (
          <>
            <div className={styles.navDropdown} aria-disabled="true">
              <Globe size={16} className={styles.dropdownIcon} />
              <span className={styles.navItemText}>Global</span>
              <span className={styles.dropdownArrow}>▼</span>
            </div>
            <div className={styles.navDropdown} aria-disabled="true">
              <span className={styles.userInitials}>{user.username.substring(0,2).toUpperCase()}</span>
              <span className={styles.navItemText}>{user.username}</span>
              <span className={styles.dropdownArrow}>▼</span>
            </div>
            <button className={styles.logoutBtn} onClick={() => logout()} aria-label="Logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <div className={styles.navItem}>Not signed in</div>
        )}
      </div>
    </header>
  );
}

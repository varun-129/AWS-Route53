/* eslint-disable */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FormField } from '@/components/ui/FormField';
import styles from './Login.module.css';
import { Loader2, Globe } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login({ username, password });
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Globe size={48} color="#ff9900" strokeWidth={1.5} />
          </div>
          <h2>Sign in</h2>
          <p>to AWS Route53 Clone</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Username" id="username" required>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </FormField>
          <FormField label="Password" id="password" required>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </FormField>
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className={styles.mockCredentials}>
          <span>Mock Username - admin</span>
          <span>Mock Password - admin123</span>
        </div>
      </div>
    </div>
  );
}

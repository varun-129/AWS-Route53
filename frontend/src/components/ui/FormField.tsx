import React, { ReactNode } from 'react';
import styles from './FormField.module.css';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  id?: string;
  description?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, id, description, error, children, required }: FormFieldProps) {
  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      {description && <div className={styles.description}>{description}</div>}
      <div className={styles.inputWrapper}>
        {children}
      </div>
      {error && (
        <div className={styles.error}>
          <AlertCircle size={14} className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

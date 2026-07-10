import React, { useState } from 'react';
import styles from './EditRecordForm.module.css';
import { DNSRecord, api } from '@/lib/api';
import { ChevronRight, Settings as SettingsIcon, ChevronDown } from 'lucide-react';

interface EditRecordFormProps {
  record: DNSRecord;
  zoneId: number;
  onCancel: () => void;
  onSave: () => void;
  domainName?: string;
}

export function EditRecordForm({ record, zoneId, onCancel, onSave, domainName = 'varun12.com' }: EditRecordFormProps) {
  const [name, setName] = useState(record.name);
  const [type, setType] = useState(record.type);
  const [ttl, setTtl] = useState(record.ttl);
  const [value, setValue] = useState(record.value);
  const [isAlias, setIsAlias] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AWS typically strips the domain from the input if it ends with it
  // But since we just want to mimic the structure, we can show the input and suffix
  const nameSuffix = `.${domainName}`;
  const displayInputName = name.endsWith(nameSuffix) 
    ? name.substring(0, name.length - nameSuffix.length)
    : name;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') setName(domainName);
    else setName(`${val}${nameSuffix}`);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.updateDnsRecord(zoneId, record.id, { name, type, ttl, value });
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save record');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Edit record</h2>
        <div className={styles.headerIcons}>
          <button className={styles.iconBtn} aria-label="Settings">
            <SettingsIcon size={16} />
          </button>
          <div className={styles.iconDivider}></div>
          <button className={styles.iconBtn} onClick={onCancel} aria-label="Close drawer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className={styles.content}>
        {error && <div className={styles.errorText}>{error}</div>}
        
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Record name</span>
            <span className={styles.infoLink}>Info</span>
          </div>
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              className={styles.input} 
              value={displayInputName}
              onChange={handleNameChange}
              disabled={isSubmitting}
            />
            <span style={{color: 'var(--text-secondary)', fontSize: '14px'}}>{nameSuffix}</span>
          </div>
          <div className={styles.description}>Keep blank to create a record for the root domain.</div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Record type</span>
            <span className={styles.infoLink}>Info</span>
          </div>
          <div className={styles.selectWrapper}>
            <select 
              className={styles.select} 
              value={type} 
              onChange={e => setType(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="A">A - Routes traffic to an IPv4 address and some...</option>
              <option value="AAAA">AAAA - Routes traffic to an IPv6 address...</option>
              <option value="CNAME">CNAME - Routes traffic to another domain...</option>
              <option value="MX">MX - Specifies mail servers...</option>
              <option value="TXT">TXT - Text record...</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div 
            className={`${styles.aliasToggle} ${isAlias ? styles.active : ''}`}
            onClick={() => setIsAlias(!isAlias)}
          >
            <div className={styles.toggleTrack}>
              <div className={styles.toggleThumb}></div>
            </div>
            <span className={styles.toggleLabel}>Alias</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Value</span>
            <span className={styles.infoLink}>Info</span>
          </div>
          <textarea 
            className={styles.textarea} 
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={isSubmitting}
          />
          <div className={styles.description}>Enter multiple values on separate lines.</div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>TTL (seconds)</span>
            <span className={styles.infoLink}>Info</span>
          </div>
          <div className={styles.ttlRow}>
            <input 
              type="number" 
              className={`${styles.input} ${styles.ttlInput}`} 
              value={ttl}
              onChange={e => setTtl(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />
            <button className={styles.ttlBtn} onClick={() => setTtl(60)}>1m</button>
            <button className={styles.ttlBtn} onClick={() => setTtl(3600)}>1h</button>
            <button className={styles.ttlBtn} onClick={() => setTtl(86400)}>1d</button>
          </div>
          <div className={styles.description}>Recommended values: 60 to 172800 (two days)</div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Routing policy</span>
            <span className={styles.infoLink}>Info</span>
          </div>
          <div className={styles.selectWrapper}>
            <select className={styles.select} disabled={isSubmitting}>
              <option value="Simple">Simple routing</option>
            </select>
            <ChevronDown size={14} className={styles.selectArrow} />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

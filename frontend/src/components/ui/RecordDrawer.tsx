import React, { useState, useEffect } from 'react';
import styles from './RecordDrawer.module.css';
import { DNSRecord } from '@/lib/api';
import { ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { EditRecordForm } from './EditRecordForm';

interface RecordDrawerProps {
  record: DNSRecord | null;
  zoneId: number;
  onClose: () => void;
  onRecordUpdated?: () => void;
  domainName?: string;
}

export function RecordDrawer({ record, zoneId, onClose, onRecordUpdated, domainName }: RecordDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Reset editing state if the selected record changes
  useEffect(() => {
    setIsEditing(false);
  }, [record?.id]);

  if (isEditing && record) {
    return (
      <div className={styles.drawerContainer}>
        <EditRecordForm 
          record={record} 
          zoneId={zoneId} 
          onCancel={() => setIsEditing(false)} 
          onSave={() => {
            setIsEditing(false);
            if (onRecordUpdated) onRecordUpdated();
          }}
          domainName={domainName}
        />
      </div>
    );
  }

  return (
    <div className={styles.drawerContainer}>
      <div className={styles.drawerHeader}>
        <h2 className={styles.title}>Record details</h2>
        <div className={styles.headerIcons}>
          <button className={styles.iconBtn} aria-label="Settings">
            <SettingsIcon size={16} />
          </button>
          <div className={styles.iconDivider}></div>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close drawer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className={styles.drawerContent}>
        {!record ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>0 records selected</p>
            <p className={styles.emptyDesc}>Select a record to see its details</p>
          </div>
        ) : (
          <div className={styles.recordDetails}>
            <div className={styles.drawerActions}>
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setIsEditing(true)}
              >
                Edit record
              </button>
            </div>
            <div className={styles.detailGroup}>
              <label>Record name</label>
              <div className={styles.valueWithIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.copyIcon}>
                  <path d="M5 5H13V13H5V5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 11H2V2H11V3" stroke="currentColor" strokeWidth="1.5"/>
                </svg> {record.name}
              </div>
            </div>
            <div className={styles.detailGroup}>
              <label>Record type</label>
              <div className={styles.value}>{record.type}</div>
            </div>
            <div className={styles.detailGroup}>
              <label>Value</label>
              <div className={styles.valueWithIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.copyIcon}>
                  <path d="M5 5H13V13H5V5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 11H2V2H11V3" stroke="currentColor" strokeWidth="1.5"/>
                </svg> {record.value}
              </div>
            </div>
            <div className={styles.detailGroup}>
              <label>Alias</label>
              <div className={styles.value}>No</div>
            </div>
            <div className={styles.detailGroup}>
              <label>TTL (seconds)</label>
              <div className={styles.value}>{record.ttl}</div>
            </div>
            <div className={styles.detailGroup}>
              <label>Routing policy</label>
              <div className={styles.value}>Simple</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

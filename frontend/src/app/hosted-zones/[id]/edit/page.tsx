/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { api, HostedZoneType } from '@/lib/api';
import styles from './EditZone.module.css';
import { Loader2 } from 'lucide-react';

export default function EditHostedZonePage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const id = parseInt(params.id as string, 10);

  const [name, setName] = useState('');
  const [type, setType] = useState<HostedZoneType>('Public');
  const [comment, setComment] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isNaN(id)) {
      addToast('Invalid hosted zone ID', 'error');
      router.push('/hosted-zones');
      return;
    }

    const fetchZone = async () => {
      try {
        const zone = await api.getHostedZone(id);
        setName(zone.name);
        setType(zone.type);
        setComment(zone.comment || '');
        setRecordCount(zone.record_count || 0);
      } catch (err: any) {
        addToast(err.message || 'Failed to fetch hosted zone', 'error');
        router.push('/hosted-zones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchZone();
  }, [id, router, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.updateHostedZone(id, { name, type, comment });
      addToast('Hosted zone updated successfully', 'success');
      router.push('/hosted-zones');
    } catch (err: any) {
      addToast(err.message || 'Failed to update hosted zone', 'error');
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Route 53', href: '/dashboard' },
    { label: 'Hosted zones', href: '/hosted-zones' },
    { label: name || id.toString(), href: `/hosted-zones/${id}` },
    { label: 'Edit' }
  ];

  return (
    <AppLayout customBreadcrumbs={breadcrumbs}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Edit {name || 'Loading...'}</h1>
          <a href="#" className={styles.infoLink}>Info</a>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#545b64' }}>
            <Loader2 size={16} className={styles.spinner} />
            Loading...
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Edit hosted zone</h2>
                <p className={styles.cardDesc}>A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.</p>
              </div>

              <div className={styles.readOnlyField}>
                <div className={styles.fieldLabel}>Domain name</div>
                <div className={styles.fieldValue}>{name}</div>
              </div>

              <div className={styles.readOnlyField}>
                <div className={styles.fieldLabel}>Hosted zone ID</div>
                <div className={styles.fieldValue}>Z{id.toString().padStart(20, '08962702GJYF4HBBF7AX')}</div>
              </div>

              <div className={styles.readOnlyField}>
                <div className={styles.fieldLabel}>Record count</div>
                <div className={styles.fieldValue}>{recordCount}</div>
              </div>

              <div className={styles.readOnlyField}>
                <div className={styles.fieldLabel}>Type</div>
                <div className={styles.fieldValue}>{type} hosted zone</div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <span className={styles.fieldLabel} style={{marginBottom: 0}}>Description - optional</span>
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <div className={styles.fieldDesc}>This value lets you distinguish hosted zones that have the same name.</div>
                <textarea
                  className={styles.textarea}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="The hosted zone is used for..."
                />
                <div className={styles.charCount}>The description can have up to 256 characters. {comment.length}/256</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  Tags <a href="#" className={styles.infoLink} style={{fontSize: '14px', fontWeight: 'normal'}}>Info</a>
                </h2>
                <p className={styles.cardDesc}>Apply tags to hosted zones to help organize and identify them.</p>
              </div>

              <p className={styles.tagEmptyText}>No tags associated with the resource.</p>
              
              <button className={styles.addTagBtn}>Add tag</button>
              <p className={styles.tagHelpText}>You can add up to 50 more tags.</p>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => router.push(`/hosted-zones/${id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn} 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* eslint-disable */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { api, HostedZoneType } from '@/lib/api';
import styles from '../HostedZoneForm.module.css';
import { Loader2 } from 'lucide-react';

export default function CreateHostedZonePage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<HostedZoneType>('Public');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.createHostedZone({ name, type, comment });
      addToast('Hosted zone created successfully', 'success');
      router.push('/hosted-zones');
    } catch (err: any) {
      addToast(err.message || 'Failed to create hosted zone', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Create hosted zone</h1>
          <a href="#" className={styles.infoLink}>Info</a>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Hosted zone configuration</h2>
              <p className={styles.cardDesc}>
                A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
              </p>
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.formGroup} style={{ marginTop: 0 }}>
                <div className={styles.labelRow}>
                  <span className={styles.fieldLabel} style={{marginBottom: 0}}>Domain name</span>
                  <div className={styles.divider} style={{ height: '12px' }} />
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <div className={styles.fieldDesc}>This is the name of the domain that you want to route traffic for.</div>
                <input
                  className={styles.inputField}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="example.com"
                  required
                />
                <div className={styles.charCount}>Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` {'{ | }'} . ~</div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <span className={styles.fieldLabel} style={{marginBottom: 0}}>Description - optional</span>
                  <div className={styles.divider} style={{ height: '12px' }} />
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

              <div className={styles.radioGroup}>
                <div className={styles.labelRow}>
                  <span className={styles.fieldLabel}>Type</span>
                  <div className={styles.divider} />
                  <a href="#" className={styles.infoLink} style={{fontSize: '14px', fontWeight: 'normal'}}>Info</a>
                </div>
                <div className={styles.fieldDesc}>The type indicates whether you want to route traffic on the internet or in an Amazon VPC.</div>
                
                <div className={styles.radioCardsContainer}>
                  <label className={`${styles.radioCard} ${type === 'Public' ? styles.radioCardSelected : ''}`}>
                    <input
                      type="radio"
                      id="typePublic"
                      name="type"
                      value="Public"
                      checked={type === 'Public'}
                      onChange={(e) => setType(e.target.value as HostedZoneType)}
                      disabled={isSubmitting}
                      className={styles.radioInput}
                    />
                    <div className={styles.radioText}>
                      <strong>Public hosted zone</strong>
                      <span>A public hosted zone determines how traffic is routed on the internet.</span>
                    </div>
                  </label>
                  
                  <label className={`${styles.radioCard} ${type === 'Private' ? styles.radioCardSelected : ''}`}>
                    <input
                      type="radio"
                      id="typePrivate"
                      name="type"
                      value="Private"
                      checked={type === 'Private'}
                      onChange={(e) => setType(e.target.value as HostedZoneType)}
                      disabled={isSubmitting}
                      className={styles.radioInput}
                    />
                    <div className={styles.radioText}>
                      <strong>Private hosted zone</strong>
                      <span>A private hosted zone determines how traffic is routed within an Amazon VPC.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                Tags <a href="#" className={styles.infoLink} style={{fontSize: '14px', fontWeight: 'normal'}}>Info</a>
              </h2>
              <p className={styles.cardDesc}>Apply tags to hosted zones to help organize and identify them.</p>
            </div>
            <div className={styles.cardContent} style={{ gap: '0', paddingTop: '0' }}>
              <p className={styles.tagEmptyText}>No tags associated with the resource.</p>
              <button type="button" className={styles.addTagBtn} disabled>Add tag</button>
              <p className={styles.tagHelpText}>You can add up to 50 more tags.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/hosted-zones" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className={styles.spinner} />}
              Create hosted zone
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

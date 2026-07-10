/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import styles from '../../RecordForm.module.css';

export default function EditRecordPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const zoneId = parseInt(params.id as string, 10);
  const recordId = parseInt(params.recordId as string, 10);

  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [port, setPort] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFields, setErrorFields] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (isNaN(zoneId) || isNaN(recordId)) {
      router.push('/hosted-zones');
      return;
    }
    const fetchRecord = async () => {
      try {
        const r = await api.getDnsRecord(zoneId, recordId);
        setName(r.name);
        setType(r.type);
        setTtl(r.ttl);
        setValue(r.value);
        setPriority(r.priority ?? '');
        setWeight(r.weight ?? '');
        setPort(r.port ?? '');
      } catch (err) {
        addToast('Failed to fetch record', 'error');
        router.push(`/hosted-zones/${zoneId}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [zoneId, recordId, router, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorFields({});
    setGeneralError('');

    const payload: any = { name, type, ttl, value };
    if (type === 'MX' || type === 'SRV') {
      if (priority !== '') payload.priority = priority;
    }
    if (type === 'SRV') {
      if (weight !== '') payload.weight = weight;
      if (port !== '') payload.port = port;
    }

    try {
      await api.updateDnsRecord(zoneId, recordId, payload);
      addToast('Record updated successfully', 'success');
      router.push(`/hosted-zones/${zoneId}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to update record';
      if (msg.includes('Value') || msg.includes('CAA')) {
        setErrorFields({ value: msg });
      } else if (msg.includes('Priority')) {
        setErrorFields({ priority: msg });
      } else if (msg.toLowerCase().includes('weight') || msg.toLowerCase().includes('port')) {
        setErrorFields({ srv: msg });
      } else {
        setGeneralError(msg);
      }
      setIsSubmitting(false);
    }
  };

  const showPriority = type === 'MX' || type === 'SRV';
  const showSrv = type === 'SRV';

  return (
    <AppLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Edit record</h1>
        <p className={styles.description}>
          Modify the properties of your DNS record.
        </p>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#545b64' }}>
            <Loader2 size={16} className={styles.spinner} />
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.card}>
            <div className={styles.warningBanner}>
              <strong>Warning:</strong> Changing the record name, type, or routing policy could impact the traffic that is routed to this record.
            </div>

            {generalError && <div className={styles.generalError}>{generalError}</div>}

            <FormField label="Record name" id="name" required>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Record type" id="type" required>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="A">A - Routes traffic to an IPv4 address and some AWS resources</option>
                <option value="AAAA">AAAA - Routes traffic to an IPv6 address and some AWS resources</option>
                <option value="CNAME">CNAME - Routes traffic to another domain name</option>
                <option value="TXT">TXT - Routes traffic to text strings</option>
                <option value="MX">MX - Routes traffic to mail servers</option>
                <option value="NS">NS - Routes traffic to name servers</option>
                <option value="PTR">PTR - Routes traffic to a domain name (reverse DNS)</option>
                <option value="SRV">SRV - Routes traffic to a specific port and server</option>
                <option value="CAA">CAA - Specifies certificate authorities</option>
              </select>
            </FormField>

            <FormField label="Routing policy" id="routing_policy" required>
              <select id="routing_policy" disabled>
                <option value="Simple">Simple</option>
              </select>
            </FormField>

            <FormField label="TTL (seconds)" id="ttl" required>
              <input
                id="ttl"
                type="number"
                value={ttl}
                onChange={(e) => setTtl(parseInt(e.target.value))}
                disabled={isSubmitting}
                min={0}
                required
              />
            </FormField>

            {showPriority && (
              <FormField label="Priority" id="priority" error={errorFields.priority} required>
                <input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value ? parseInt(e.target.value) : '')}
                  disabled={isSubmitting}
                  required
                />
              </FormField>
            )}

            {showSrv && (
              <>
                <FormField label="Weight" id="weight" error={errorFields.srv} required>
                  <input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : '')}
                    disabled={isSubmitting}
                    required
                  />
                </FormField>
                <FormField label="Port" id="port" error={errorFields.srv} required>
                  <input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value ? parseInt(e.target.value) : '')}
                    disabled={isSubmitting}
                    required
                  />
                </FormField>
              </>
            )}

            <FormField label="Value" id="value" error={errorFields.value} required>
              <textarea
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                required
              />
            </FormField>

            <div className={styles.actions}>
              <Link href={`/hosted-zones/${zoneId}`} className={styles.cancelBtn}>
                Cancel
              </Link>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting && <Loader2 size={16} className={styles.spinner} />}
                Save changes
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}

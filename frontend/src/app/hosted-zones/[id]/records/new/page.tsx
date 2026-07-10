/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/Toast';
import { api, HostedZone, DNSRecord } from '@/lib/api';
import styles from './CreateRecord.module.css';

export default function CreateRecordPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const zoneId = parseInt(params.id as string, 10);
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [existingRecords, setExistingRecords] = useState<DNSRecord[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [isAlias, setIsAlias] = useState(false);
  const [type, setType] = useState('A');
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState('');
  const [routingPolicy, setRoutingPolicy] = useState('Simple');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFields, setErrorFields] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [showExisting, setShowExisting] = useState(false);

  useEffect(() => {
    if (isNaN(zoneId)) {
      router.push('/hosted-zones');
      return;
    }
    const fetchData = async () => {
      try {
        const [z, recordsRes] = await Promise.all([
          api.getHostedZone(zoneId),
          api.getDnsRecords(zoneId, 1, 100) // fetch some existing records
        ]);
        setZone(z);
        setExistingRecords(recordsRes.items);
      } catch (err) {
        router.push('/hosted-zones');
      }
    };
    fetchData();
  }, [zoneId, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorFields({});
    setGeneralError('');

    // Construct final name by appending root domain if subdomain is provided
    const finalName = name.trim() ? `${name.trim()}.${zone?.name}` : zone?.name || '';
    const payload: any = { name: finalName, type, ttl, value };

    try {
      await api.createDnsRecord(zoneId, payload);
      addToast('Record created successfully', 'success');
      router.push(`/hosted-zones/${zoneId}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to create record';
      if (msg.includes('Value')) {
        setErrorFields({ value: msg });
      } else {
        setGeneralError(msg);
      }
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Route 53', href: '/dashboard' },
    { label: 'Hosted zones', href: '/hosted-zones' },
    { label: zone?.name || zoneId.toString(), href: `/hosted-zones/${zoneId}` },
    { label: 'Create record' }
  ];

  return (
    <AppLayout customBreadcrumbs={breadcrumbs}>
      <div className={styles.pageLayout}>

        {generalError && (
          <div className={styles.errorAlert}>
            <span>{generalError}</span>
          </div>
        )}

        <div className={styles.header}>
          <h1 className={styles.title}>Create record</h1>
          <a href="#" className={styles.infoLink}>Info</a>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Quick create record</h2>
            <a href="#" className={styles.wizardLink}>Switch to wizard</a>
          </div>

          <div className={styles.recordSection}>
            <div className={styles.recordHeader}>
              <div className={styles.recordTitle}>
                <ChevronDown size={16} /> Record 1
              </div>
              <button className={styles.secondaryBtn}>Delete</button>
            </div>

            <div className={styles.formGrid}>
              {/* Row 1: Record Name */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.label} htmlFor="name">Record name</label>
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <div className={styles.nameInputWrapper}>
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="subdomain"
                    disabled={isSubmitting}
                  />
                  <span className={styles.domainSuffix}>{zone?.name}</span>
                </div>
                <div className={styles.helpText}>Keep blank to create a record for the root domain.</div>
              </div>

              {/* Row 1 right: Record Type */}
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.label} htmlFor="type">Record type</label>
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <select
                  id="type"
                  className={styles.select}
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
                  <option value="SOA">SOA - Start of Authority</option>
                </select>
              </div>
            </div>

            {/* Row 2: Alias */}
            <div className={styles.aliasToggle}>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={isAlias} 
                  onChange={(e) => setIsAlias(e.target.checked)} 
                  disabled={isSubmitting}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.aliasLabel}>Alias</span>
            </div>

            {/* Row 3: Value */}
            <div className={styles.formGroup} style={{ marginBottom: 24 }}>
              <div className={styles.labelWrapper}>
                <label className={styles.label} htmlFor="value">Value</label>
                <a href="#" className={styles.infoLink}>Info</a>
              </div>
              <textarea
                id="value"
                className={styles.textarea}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="192.0.2.235"
                disabled={isSubmitting}
              />
              <div className={styles.helpText}>Enter multiple values on separate lines.</div>
              {errorFields.value && <div className={styles.errorText}>{errorFields.value}</div>}
            </div>

            {/* Row 4: TTL and Routing Policy */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.label} htmlFor="ttl">TTL (seconds)</label>
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <div className={styles.ttlWrapper}>
                  <input
                    id="ttl"
                    type="number"
                    className={`${styles.input} ${styles.ttlInput}`}
                    value={ttl}
                    onChange={(e) => setTtl(parseInt(e.target.value))}
                    disabled={isSubmitting}
                    min={0}
                  />
                  <button className={styles.presetBtn} onClick={() => setTtl(60)} disabled={isSubmitting}>1m</button>
                  <button className={styles.presetBtn} onClick={() => setTtl(3600)} disabled={isSubmitting}>1h</button>
                  <button className={styles.presetBtn} onClick={() => setTtl(86400)} disabled={isSubmitting}>1d</button>
                </div>
                <div className={styles.helpText}>Recommended values: 60 to 172800 (two days)</div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelWrapper}>
                  <label className={styles.label} htmlFor="routing_policy">Routing policy</label>
                  <a href="#" className={styles.infoLink}>Info</a>
                </div>
                <select
                  id="routing_policy"
                  className={styles.select}
                  value={routingPolicy}
                  onChange={(e) => setRoutingPolicy(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="Simple">Simple routing</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.addRecordRow}>
            <button className={styles.secondaryBtn} disabled>Add another record</button>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={`/hosted-zones/${zoneId}`} className={styles.secondaryBtn} style={{ textDecoration: 'none' }}>
            Cancel
          </Link>
          <button className={styles.primaryBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create records'}
          </button>
        </div>

        {/* View existing records */}
        <div className={styles.viewRecordsSection}>
          <div 
            className={styles.collapsibleHeader} 
            onClick={() => setShowExisting(!showExisting)}
          >
            {showExisting ? <ChevronDown size={20} /> : <ChevronRight size={20} />} 
            View existing records
          </div>
          <div className={styles.collapsibleDesc}>
            The following table lists the existing records in {zone?.name}.
          </div>
          
          {showExisting && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Record name</th>
                    <th>Type</th>
                    <th>Routing policy</th>
                    <th>Value/Route traffic to</th>
                  </tr>
                </thead>
                <tbody>
                  {existingRecords.map(record => (
                    <tr key={record.id}>
                      <td>{record.name}</td>
                      <td>{record.type}</td>
                      <td>Simple</td>
                      <td style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{record.value}</td>
                    </tr>
                  ))}
                  {existingRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>No existing records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

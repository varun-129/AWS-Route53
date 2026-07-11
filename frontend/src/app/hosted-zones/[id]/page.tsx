/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { api, HostedZone, DNSRecord } from '@/lib/api';
import { RecordDrawer } from '@/components/ui/RecordDrawer';
import { Info, RefreshCw, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import styles from './ZoneDetail.module.css';

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, opacity: 0.5 }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const zoneId = parseInt(params.id as string, 10);

  const [zone, setZone] = useState<HostedZone | null>(null);
  
  const [data, setData] = useState<DNSRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [deleteModalRecord, setDeleteModalRecord] = useState<DNSRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [checkedRecordIds, setCheckedRecordIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchZone = React.useCallback(async () => {
    try {
      const z = await api.getHostedZone(zoneId);
      setZone(z);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch hosted zone', 'error');
      router.push('/hosted-zones');
    }
  }, [zoneId, addToast, router]);

  const fetchRecords = React.useCallback(async () => {
    if (isNaN(zoneId)) return;
    setLoading(true);
    try {
      const res = await api.getDnsRecords(zoneId, page, pageSize, debouncedSearch, typeFilter || undefined);
      setData(res.items);
      setTotalCount(res.total_count);
      setCheckedRecordIds([]);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch records', 'error');
    } finally {
      setLoading(false);
    }
  }, [zoneId, page, debouncedSearch, typeFilter, addToast]);

  useEffect(() => {
    if (isNaN(zoneId)) {
      router.push('/hosted-zones');
      return;
    }
    fetchZone();
  }, [zoneId, fetchZone, router]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    if (!deleteModalRecord) return;
    setIsDeleting(true);
    try {
      await api.deleteDnsRecord(zoneId, deleteModalRecord.id);
      addToast('Record deleted successfully', 'success');
      setDeleteModalRecord(null);
      fetchRecords();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (checkedRecordIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await api.bulkDeleteDnsRecords(zoneId, checkedRecordIds);
      addToast(`${res.deleted_count} records deleted successfully`, 'success');
      setCheckedRecordIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete records', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const recordsToExport = data.filter(r => checkedRecordIds.includes(r.id));
      if (recordsToExport.length === 0) {
        addToast('No records selected for export', 'error');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordsToExport, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${zone?.name || 'zone'}-selected-records.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      addToast('Export successful', 'success');
    } catch (err: any) {
      addToast(err.message || 'Export failed', 'error');
    }
  };

  const handleDeleteZone = async () => {
    if (window.confirm('Are you sure you want to delete this hosted zone?')) {
      try {
        await api.deleteHostedZone(zoneId);
        addToast('Hosted zone deleted successfully', 'success');
        router.push('/hosted-zones');
      } catch (err: any) {
        addToast(err.message || 'Failed to delete hosted zone', 'error');
      }
    }
  };

  const columns: Column<DNSRecord>[] = [
    { key: 'name', header: <>{'Record name'} <SortIcon/></> },
    { key: 'type', header: <>{'Type'} <SortIcon/></> },
    { key: 'routing', header: <>{'Routing policy'} <SortIcon/></>, render: () => 'Simple' },
    { key: 'diff', header: <>{'Differentiator'} <SortIcon/></>, render: () => '-' },
    { key: 'alias', header: <>{'Alias'} <SortIcon/></>, render: () => 'No' },
    { 
      key: 'value', 
      header: <>{'Value/Route traffic to'} <SortIcon/></>,
      render: (r) => (
        <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
          {r.value}
        </span>
      )
    },
    { key: 'ttl', header: <>{'TTL (seconds)'} <SortIcon/></> },
    { key: 'healthCheck', header: <>{'Health check ID'} <SortIcon/></>, render: () => '-' },
    { key: 'eval', header: <>{'Evaluate target health'} <SortIcon/></>, render: () => '-' },
    { key: 'recordId', header: <>{'Record ID'} <SortIcon/></>, render: () => '-' }
  ];

  const breadcrumbs = [
    { label: 'Route 53', href: '/dashboard' },
    { label: 'Hosted zones', href: '/hosted-zones' },
    { label: zone?.name || zoneId.toString() }
  ];

  return (
    <AppLayout noPadding={true} customBreadcrumbs={breadcrumbs}>
      <div className={styles.pageLayout}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <span className={styles.publicBadge}>Public</span>
              <h1 className={styles.title}>{zone ? zone.name : 'Loading...'}</h1>
              <a href="#" className={styles.infoLink}>Info</a>
              <div className={styles.headerActions}>
                <button className={styles.secondaryBtn} onClick={handleDeleteZone}>Delete zone</button>
                <button className={styles.secondaryBtn} disabled>Test record</button>
                <button className={styles.secondaryBtn} disabled>Configure query logging</button>
              </div>
            </div>
            
            <div className={styles.zoneDetailsCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <ChevronRight size={16} /> Hosted zone details
                </div>
                <button className={styles.secondaryBtn} onClick={() => router.push(`/hosted-zones/${zoneId}/edit`)}>
                  Edit hosted zone
                </button>
              </div>
            </div>

            <div className={styles.tabs}>
              <div className={`${styles.tab} ${styles.active}`}>Records ({totalCount})</div>
              <div className={styles.tab}>Accelerated recovery</div>
              <div className={styles.tab}>DNSSEC signing</div>
              <div className={styles.tab}>Hosted zone tags (0)</div>
            </div>

            <div className={styles.recordsSection}>
              <div className={styles.recordsHeaderContainer}>
                <div className={styles.recordsHeaderLeft}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Records ({totalCount})</h2>
                    <a href="#" className={styles.infoLink}>Info</a>
                  </div>
                  <p className={styles.sectionDesc}>
                    Automatic mode is the current search behavior optimized for best filter results. <a href="#">To change modes go to settings.</a>
                  </p>
                </div>
                <div className={styles.recordsHeaderRight}>
                  <button className={styles.iconBtn} onClick={fetchRecords} aria-label="Refresh">
                    <RefreshCw size={14} />
                  </button>
                  {checkedRecordIds.length > 0 ? (
                    <button 
                      className={styles.secondaryBtn}
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                    >
                      Delete records ({checkedRecordIds.length})
                    </button>
                  ) : (
                    <button 
                      className={styles.secondaryBtn}
                      onClick={() => selectedRecord && setDeleteModalRecord(selectedRecord)}
                      disabled={!selectedRecord}
                    >
                      Delete record
                    </button>
                  )}
                  <button 
                    className={styles.secondaryBtnBlue} 
                    onClick={handleExportJSON}
                    disabled={checkedRecordIds.length === 0}
                  >
                    Export JSON
                  </button>
                  <Link href={`/hosted-zones/${zoneId}/records/new`} className={styles.createBtn}>
                    Create record
                  </Link>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.filters}>
                  <div className={styles.searchBox}>
                    <Search size={16} color="#545b64" />
                    <input
                      type="text"
                      placeholder="Filter records by property or value"
                      className={styles.searchInput}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className={styles.selectGroup}>
                    <select 
                      className={styles.typeSelect} 
                      value={typeFilter} 
                      onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    >
                      <option value="">Type</option>
                      <option value="A">A</option>
                      <option value="AAAA">AAAA</option>
                      <option value="CNAME">CNAME</option>
                      <option value="TXT">TXT</option>
                      <option value="MX">MX</option>
                      <option value="NS">NS</option>
                      <option value="PTR">PTR</option>
                      <option value="SRV">SRV</option>
                      <option value="CAA">CAA</option>
                    </select>
                    <select className={styles.typeSelect} defaultValue="">
                      <option value="">Routing policy</option>
                    </select>
                    <select className={styles.typeSelect} defaultValue="">
                      <option value="">Alias</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.toolbarActions}>
                  <span className={styles.itemsCount}>{totalCount} items</span>
                  <Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                  />
                  <button className={styles.iconBtn} aria-label="Settings">
                    <SettingsIcon size={14} />
                  </button>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                keyExtractor={(item) => item.id}
                emptyMessage="No records found in this hosted zone."
                onRowClick={(record) => {
                  if (selectedRecord?.id === record.id) {
                    setSelectedRecord(null);
                    setIsDrawerOpen(false);
                  } else {
                    setSelectedRecord(record);
                    setIsDrawerOpen(true);
                  }
                }}
                selectedItem={selectedRecord}
                selectable={true}
                checkedIds={checkedRecordIds}
                onSelectionChange={(ids) => setCheckedRecordIds(ids as number[])}
              />
            </div>
          </div>
        </div>

        {isDrawerOpen && (
          <RecordDrawer 
            record={selectedRecord} 
            zoneId={zoneId}
            onClose={() => setIsDrawerOpen(false)}
            onRecordUpdated={() => {
              fetchRecords();
              setSelectedRecord(null);
              setIsDrawerOpen(false);
            }}
            domainName={zone?.name}
          />
        )}
      </div>

      <Modal
        isOpen={!!deleteModalRecord}
        onClose={() => setDeleteModalRecord(null)}
        title="Delete Record"
        footer={
          <div className={styles.modalFooter}>
            <button 
              className={styles.cancelBtn} 
              onClick={() => setDeleteModalRecord(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              className={styles.deleteBtn} 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p>Are you sure you want to delete the <strong>{deleteModalRecord?.type}</strong> record for <strong>{deleteModalRecord?.name}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Delete Records"
        footer={
          <div className={styles.modalFooter}>
            <button 
              className={styles.cancelBtn} 
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </button>
            <button 
              className={styles.deleteBtn} 
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p>Are you sure you want to delete {checkedRecordIds.length} record{checkedRecordIds.length > 1 ? 's' : ''}?</p>
        {checkedRecordIds.length <= 5 && (
          <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
            {data.filter(r => checkedRecordIds.includes(r.id)).map(r => (
              <li key={r.id}><strong>{r.type}</strong> {r.name}</li>
            ))}
          </ul>
        )}
        <p>This action cannot be undone.</p>
      </Modal>
    </AppLayout>
  );
}

/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { api, HostedZone } from '@/lib/api';
import styles from './HostedZones.module.css';
import { RefreshCw, Settings as SettingsIcon } from 'lucide-react';

export default function HostedZonesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [data, setData] = useState<HostedZone[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);
  
  const [deleteModalZone, setDeleteModalZone] = useState<HostedZone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchZones = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getHostedZones(page, pageSize, debouncedSearch);
      setData(res.items);
      setTotalCount(res.total_count);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch hosted zones', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, addToast]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleDelete = async () => {
    if (!deleteModalZone) return;
    setIsDeleting(true);
    try {
      await api.deleteHostedZone(deleteModalZone.id);
      addToast('Hosted zone deleted successfully', 'success');
      setDeleteModalZone(null);
      fetchZones();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete hosted zone', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<HostedZone>[] = [
    {
      key: 'name',
      header: 'Hosted zone name ▼',
      render: (zone) => (
        <Link href={`/hosted-zones/${zone.id}`} className={styles.link}>
          {zone.name}
        </Link>
      )
    },
    {
      key: 'type',
      header: 'Type ▼',
    },
    {
      key: 'createdBy',
      header: 'Created by ▼',
      render: () => 'Route 53'
    },
    {
      key: 'recordCount',
      header: 'Record count ▼',
      render: (zone) => (zone.record_count ?? 0).toString()
    },
    {
      key: 'description',
      header: 'Description ▼',
      render: (zone) => zone.comment || '-'
    },
    {
      key: 'hostedZoneId',
      header: 'Hosted zone ID ▼',
      render: (zone) => `Z0${zone.id}EXAMPLE` // Placeholder
    }
  ];

  return (
    <AppLayout>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Hosted zones ({totalCount})</h1>
            <a href="#" className={styles.infoLink}>Info</a>
          </div>
          <p className={styles.sectionDesc}>
            Automatic mode is the current search behavior optimized for best filter results. <a href="#">To change modes go to settings.</a>
          </p>
        </div>
        
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} onClick={fetchZones} aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <button 
            className={styles.secondaryBtn} 
            disabled={!selectedZone}
            onClick={() => selectedZone && router.push(`/hosted-zones/${selectedZone.id}`)}
          >
            View details
          </button>
          <button 
            className={styles.secondaryBtn} 
            disabled={!selectedZone}
            onClick={() => selectedZone && router.push(`/hosted-zones/${selectedZone.id}/edit`)}
          >
            Edit
          </button>
          <button 
            className={styles.secondaryBtn} 
            disabled={!selectedZone}
            onClick={() => selectedZone && setDeleteModalZone(selectedZone)}
          >
            Delete
          </button>
          <Link href="/hosted-zones/new" className={styles.createBtn}>
            Create hosted zone
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Filter records by property or value"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.toolbarActions}>
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
        emptyMessage="No hosted zones found."
        onRowClick={(zone) => {
          if (selectedZone?.id === zone.id) {
            setSelectedZone(null);
          } else {
            setSelectedZone(zone);
          }
        }}
        selectedItem={selectedZone}
      />

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      <Modal
        isOpen={!!deleteModalZone}
        onClose={() => setDeleteModalZone(null)}
        title="Delete Hosted Zone"
        footer={
          <div className={styles.modalFooter}>
            <button 
              className={styles.cancelBtn} 
              onClick={() => setDeleteModalZone(null)}
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
        <p>Are you sure you want to delete the hosted zone <strong>{deleteModalZone?.name}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </AppLayout>
  );
}

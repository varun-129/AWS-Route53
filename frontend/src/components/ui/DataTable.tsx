/* eslint-disable */
import React from 'react';
import styles from './DataTable.module.css';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  selectedItem?: T | null;
  selectable?: boolean;
  checkedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
}

export function DataTable<T>({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "No data available",
  keyExtractor,
  onRowClick,
  selectedItem,
  selectable = false,
  checkedIds = [],
  onSelectionChange
}: DataTableProps<T>) {
  
  const allCurrentIds = data.map(keyExtractor);
  const isAllChecked = allCurrentIds.length > 0 && allCurrentIds.every(id => checkedIds.includes(id));
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newChecked = new Set(checkedIds);
      allCurrentIds.forEach(id => newChecked.add(id));
      onSelectionChange?.(Array.from(newChecked));
    } else {
      const newChecked = new Set(checkedIds);
      allCurrentIds.forEach(id => newChecked.delete(id));
      onSelectionChange?.(Array.from(newChecked));
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {selectable ? (
              <th className={styles.checkboxTh}>
                <input 
                  type="checkbox" 
                  checked={isAllChecked}
                  onChange={handleSelectAll}
                />
              </th>
            ) : onRowClick ? (
              <th className={styles.checkboxTh}>
                <input type="radio" disabled style={{ visibility: 'hidden' }} />
              </th>
            ) : null}
            {columns.map((col, idx) => (
              <th key={col.key} className={idx < columns.length - 1 ? styles.dividerTh : ''}>
                <div className={styles.thContent}>
                  {col.header}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={(selectable || onRowClick) ? columns.length + 1 : columns.length} className={styles.loadingCell}>
                <Loader2 className={styles.spinner} size={24} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={(selectable || onRowClick) ? columns.length + 1 : columns.length} className={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const itemId = keyExtractor(item);
              const isSelected = selectedItem && keyExtractor(selectedItem) === itemId;
              const isChecked = checkedIds.includes(itemId);
              
              return (
                <tr 
                  key={itemId} 
                  className={isSelected ? styles.selectedRow : ''}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {selectable ? (
                    <td className={styles.checkboxTd} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={(e) => {
                          e.stopPropagation();
                          const newChecked = new Set(checkedIds);
                          if (e.target.checked) {
                            newChecked.add(itemId);
                          } else {
                            newChecked.delete(itemId);
                          }
                          onSelectionChange?.(Array.from(newChecked));
                        }}
                      />
                    </td>
                  ) : onRowClick ? (
                    <td className={styles.checkboxTd} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="radio" 
                        name="dataTableSelection"
                        checked={isSelected || false} 
                        onChange={() => onRowClick(item)}
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

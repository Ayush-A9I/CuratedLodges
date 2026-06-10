'use client';

import React from 'react';
import styles from './admin.module.css';

export interface DataTableColumn<T> {
    /** Unique key for the column. */
    key: string;
    /** Header label. */
    header: string;
    /**
     * How to render the cell. If omitted, `row[key]` is rendered as text.
     * Receives the row and its index.
     */
    render?: (row: T, index: number) => React.ReactNode;
    /** Optional fixed width (CSS value). */
    width?: string;
    /** Align cell text. Defaults to 'left'. */
    align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
    /** Column definitions. */
    columns: DataTableColumn<T>[];
    /** Row data. */
    rows: T[];
    /** Returns a stable key for a row. Defaults to row.id then index. */
    rowKey?: (row: T, index: number) => string | number;
    /** Show loading state instead of rows. */
    loading?: boolean;
    /** Message shown when there are no rows. */
    emptyMessage?: string;
    /** Edit action handler — when provided, an Edit button is rendered per row. */
    onEdit?: (row: T) => void;
    /** Delete action handler — when provided, a Delete button is rendered per row. */
    onDelete?: (row: T) => void;
    /** Custom extra actions rendered in the actions cell, before edit/delete. */
    renderActions?: (row: T) => React.ReactNode;
}

/**
 * Generic, themed data table with loading + empty states and optional
 * per-row edit/delete actions.
 */
export function DataTable<T extends Record<string, any>>({
    columns,
    rows,
    rowKey,
    loading,
    emptyMessage = 'No records found.',
    onEdit,
    onDelete,
    renderActions,
}: DataTableProps<T>) {
    const hasActions = !!onEdit || !!onDelete || !!renderActions;
    const colCount = columns.length + (hasActions ? 1 : 0);

    const keyFor = (row: T, index: number) =>
        rowKey ? rowKey(row, index) : (row.id ?? index);

    return (
        <div className={styles.tableWrap}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={{ width: col.width, textAlign: col.align }}>
                                    {col.header}
                                </th>
                            ))}
                            {hasActions && <th style={{ textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={colCount}>
                                    <div className={styles.tableState}>
                                        <div className={styles.spinner} />
                                        Loading…
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={colCount}>
                                    <div className={styles.tableState}>{emptyMessage}</div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <tr key={keyFor(row, index)}>
                                    {columns.map((col) => (
                                        <td key={col.key} style={{ textAlign: col.align }}>
                                            {col.render ? col.render(row, index) : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td>
                                            <div className={styles.rowActions}>
                                                {renderActions?.(row)}
                                                {onEdit && (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                                        onClick={() => onEdit(row)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                                        onClick={() => onDelete(row)}
                                                        style={{ color: 'var(--cl-danger)' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;

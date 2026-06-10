/**
 * Barrel export for shared admin panel components.
 *
 * Import from `@/components/admin`:
 * ```ts
 * import { AdminShell, DataTable, Modal, ConfirmDialog, PageHeader,
 *          AdminInput, SaveButton, useToast } from '@/components/admin';
 * ```
 */

// Layout chrome
export { AdminShell } from './AdminShell';
export type { AdminShellProps } from './AdminShell';
export { Sidebar, ADMIN_NAV } from './Sidebar';
export { Topbar } from './Topbar';

// Data display
export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

// Overlays
export { Modal } from './Modal';
export type { ModalProps } from './Modal';
export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

// Feedback
export { ToastProvider, useToast } from './Toast';
export type { ToastType } from './Toast';

// Form primitives
export {
    AdminLabel,
    FormRow,
    AdminInput,
    AdminTextarea,
    AdminSelect,
    AdminCheckbox,
    SaveButton,
} from './FormPrimitives';
export type {
    AdminLabelProps,
    FormRowProps,
    AdminInputProps,
    AdminTextareaProps,
    AdminSelectProps,
    AdminSelectOption,
    AdminCheckboxProps,
    SaveButtonProps,
} from './FormPrimitives';

"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './ReadMoreModal.module.css';

interface ReadMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ReadMoreModal: React.FC<ReadMoreModalProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      contentRef.current?.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className={styles.content} ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ReadMoreModal;

'use client';

import React from 'react';
import { Plus, Trash2, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '@/contexts/LocalizationContext';
import type { Naturalist, NaturalistSessionInput } from '@/types/api';
import styles from './NaturalistSessionPicker.module.css';

/** Upper bound on the number of session entries (Req 2.2). */
const MAX_SESSIONS = 20;
/** Per-entry session-count bounds (Req 2.2). */
const MIN_SESSION_COUNT = 1;
const MAX_SESSION_COUNT = 20;

export interface NaturalistSessionPickerProps {
    /** Naturalists available for the lodge being booked. */
    naturalists: Naturalist[];
    /** Current session entries (controlled value). */
    sessions: NaturalistSessionInput[];
    /** Called with the next session list whenever the user edits the picker. */
    onChange: (sessions: NaturalistSessionInput[]) => void;
    /** Booking check-in date (`YYYY-MM-DD`); lower bound for session dates. */
    checkIn: string;
    /** Booking check-out date (`YYYY-MM-DD`); upper bound for session dates. */
    checkOut: string;
}

/**
 * Controlled picker for 0–20 optional naturalist sessions (Req 2.2).
 *
 * Each entry selects a naturalist, a session date constrained to the
 * `[checkIn, checkOut]` range, and a session count between 1 and 20. The
 * component owns no data fetching: it renders the `sessions` prop and reports
 * every edit through `onChange`. Prices are formatted through the
 * Localization_Context `convertPrice` formatter.
 */
export default function NaturalistSessionPicker({
    naturalists,
    sessions,
    onChange,
    checkIn,
    checkOut,
}: NaturalistSessionPickerProps) {
    const { t } = useTranslation();
    const { convertPrice } = useLocalization();

    const atCapacity = sessions.length >= MAX_SESSIONS;

    const updateSession = (
        index: number,
        patch: Partial<NaturalistSessionInput>,
    ) => {
        const next = sessions.map((session, i) =>
            i === index ? { ...session, ...patch } : session,
        );
        onChange(next);
    };

    const addSession = () => {
        if (atCapacity) {
            return;
        }
        const next: NaturalistSessionInput = {
            naturalistId: '',
            sessionDate: checkIn || '',
            numSessions: MIN_SESSION_COUNT,
        };
        onChange([...sessions, next]);
    };

    const removeSession = (index: number) => {
        onChange(sessions.filter((_, i) => i !== index));
    };

    const clampCount = (raw: number): number => {
        if (!Number.isFinite(raw)) {
            return MIN_SESSION_COUNT;
        }
        const rounded = Math.round(raw);
        return Math.min(MAX_SESSION_COUNT, Math.max(MIN_SESSION_COUNT, rounded));
    };

    return (
        <section className={styles.picker} aria-label={t('checkout.naturalistSessions')}>
            <div className={styles.header}>
                <div className={styles.headingGroup}>
                    <Compass size={18} className={styles.headingIcon} aria-hidden="true" />
                    <h3 className={styles.heading}>{t('checkout.naturalistSessions')}</h3>
                    <span className={styles.optionalBadge}>{t('checkout.optional')}</span>
                </div>
                <span className={styles.count}>
                    {sessions.length} / {MAX_SESSIONS}
                </span>
            </div>

            {sessions.length === 0 && (
                <p className={styles.empty}>{t('checkout.noSessions')}</p>
            )}

            <ul className={styles.list}>
                {sessions.map((session, index) => {
                    const selected = naturalists.find(
                        (n) => n.id === session.naturalistId,
                    );
                    return (
                        <li key={index} className={styles.entry}>
                            <div className={styles.entryGrid}>
                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor={`session-naturalist-${index}`}
                                    >
                                        {t('checkout.selectNaturalist')}
                                    </label>
                                    <select
                                        id={`session-naturalist-${index}`}
                                        className={styles.select}
                                        value={session.naturalistId}
                                        onChange={(e) =>
                                            updateSession(index, {
                                                naturalistId: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            {t('checkout.chooseNaturalist')}
                                        </option>
                                        {naturalists.map((naturalist) => (
                                            <option
                                                key={naturalist.id}
                                                value={naturalist.id}
                                            >
                                                {naturalist.name} —{' '}
                                                {convertPrice(
                                                    naturalist.pricePerSession,
                                                )}
                                                {t('price.perSession')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label
                                        className={styles.label}
                                        htmlFor={`session-date-${index}`}
                                    >
                                        {t('checkout.scheduleDates')}
                                    </label>
                                    <input
                                        id={`session-date-${index}`}
                                        type="date"
                                        className={styles.input}
                                        value={session.sessionDate}
                                        min={checkIn || undefined}
                                        max={checkOut || undefined}
                                        onChange={(e) =>
                                            updateSession(index, {
                                                sessionDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.fieldNarrow}>
                                    <label
                                        className={styles.label}
                                        htmlFor={`session-count-${index}`}
                                    >
                                        {t('checkout.howManySessions')}
                                    </label>
                                    <input
                                        id={`session-count-${index}`}
                                        type="number"
                                        className={styles.input}
                                        inputMode="numeric"
                                        min={MIN_SESSION_COUNT}
                                        max={MAX_SESSION_COUNT}
                                        value={session.numSessions}
                                        onChange={(e) =>
                                            updateSession(index, {
                                                numSessions: clampCount(
                                                    e.target.valueAsNumber,
                                                ),
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => removeSession(index)}
                                    aria-label={t('checkout.removeSession')}
                                    title={t('checkout.removeSession')}
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>

                            {selected && (
                                <p className={styles.priceLine}>
                                    {selected.role
                                        ? `${selected.name} · ${selected.role}`
                                        : selected.name}
                                    {' — '}
                                    {convertPrice(selected.pricePerSession)}
                                    {t('price.perSession')}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                className={styles.addButton}
                onClick={addSession}
                disabled={atCapacity}
            >
                <Plus size={16} aria-hidden="true" />
                {t('checkout.addSession')}
            </button>

            {atCapacity && (
                <p className={styles.limitNote}>{t('checkout.sessionsLimit')}</p>
            )}
        </section>
    );
}

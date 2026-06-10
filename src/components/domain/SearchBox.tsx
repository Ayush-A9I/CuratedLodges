'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

import api from '@/lib/api';
import { useApiResource } from '@/hooks/useApiResource';
import { canSubmitSearch } from '@/logic/predicates';
import type { Region, ParkSummary } from '@/types/api';

import styles from './SearchBox.module.css';

/**
 * Read timeout for SearchBox region/park lookups (Req 9.8).
 */
const SEARCHBOX_TIMEOUT_MS = 10000;

interface SearchBoxProps {
  initialRegion?: string;
  initialPark?: string;
  compact?: boolean;
}

interface RegionsResponse {
  regions: Region[];
}

interface ParksResponse {
  parks: ParkSummary[];
}

/**
 * Region/park selection control on the homepage and park-page header.
 *
 * Sources real options from the typed API client:
 * - On mount, calls `getRegions` to populate the region control with
 *   `{ name, slug }` items (Req 9.1).
 * - When a region is selected, calls `getParksByRegion(slug)` and replaces any
 *   previously loaded park options with the returned parks (Req 9.2).
 *
 * Per-control feedback states are presented through `useApiResource` and the
 * shared feedback patterns:
 * - Loading state on the affected control while a fetch is in flight, with the
 *   control disabled until it resolves (Req 9.3).
 * - Error state with a user-readable message and retry affordance on failure;
 *   previously loaded options are preserved by `useApiResource` (Req 9.4).
 * - Empty-state message when a successful response carries zero items
 *   (Req 9.7).
 * - 10-second timeout produces a timeout error via `useApiResource` (Req 9.8).
 *
 * Submission is gated by `canSubmitSearch`: navigation is withheld until both
 * region and park are selected; submitting incomplete shows a field-level
 * error against the affected control (Req 9.5, 9.6).
 *
 * Theme/styling and i18n are preserved — all visible text is resolved through
 * `react-i18next` and styling continues to use the existing CSS module.
 *
 * Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8
 */
const SearchBox: React.FC<SearchBoxProps> = ({
  initialRegion = '',
  initialPark = '',
  compact = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedPark, setSelectedPark] = useState<string>(initialPark);
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

  // Mirror initial-prop changes from parent navigations.
  useEffect(() => {
    setSelectedRegion(initialRegion);
    setSelectedPark(initialPark);
    setSubmitAttempted(false);
  }, [initialRegion, initialPark]);

  // Regions: fetched once on mount with a 10-second timeout (Req 9.1, 9.8).
  const regionsState = useApiResource<RegionsResponse>(
    () => api.getRegions(),
    { timeoutMs: SEARCHBOX_TIMEOUT_MS },
  );
  const regions: Region[] = regionsState.data?.regions ?? [];
  const regionsHaveResolved = regionsState.data !== null;
  const regionsEmpty =
    regionsHaveResolved &&
    !regionsState.loading &&
    !regionsState.error &&
    regions.length === 0;

  // Parks: re-fetched when the region selection changes; gated until a region is chosen.
  const parksState = useApiResource<ParksResponse>(
    () => api.getParksByRegion(selectedRegion),
    {
      enabled: Boolean(selectedRegion),
      timeoutMs: SEARCHBOX_TIMEOUT_MS,
      deps: [selectedRegion],
    },
  );
  const parks: ParkSummary[] = parksState.data?.parks ?? [];
  const parksHaveResolved = parksState.data !== null;
  const parksEmpty =
    Boolean(selectedRegion) &&
    parksHaveResolved &&
    !parksState.loading &&
    !parksState.error &&
    parks.length === 0;

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(event.target.value);
    // Replacing the region replaces the park selection; the parks fetch
    // re-runs and replaces the previously loaded park options (Req 9.2).
    setSelectedPark('');
    setSubmitAttempted(false);
  };

  const handleParkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPark(event.target.value);
    setSubmitAttempted(false);
  };

  const handleFind = () => {
    // Field-level error and withheld navigation when either selection is
    // missing (Req 9.6).
    if (!canSubmitSearch(selectedRegion, selectedPark)) {
      setSubmitAttempted(true);
      return;
    }
    setSubmitAttempted(false);
    // Navigate to the park detail page using the selected slugs (Req 9.5).
    router.push(`/park/${selectedRegion}/${selectedPark}`);
  };

  const submitDisabled = !canSubmitSearch(selectedRegion, selectedPark);

  // Per-control disable state: while a request is in flight, on error, or on
  // an empty result, the control is disabled until resolved (Req 9.3, 9.4, 9.7).
  const regionControlDisabled =
    regionsState.loading || Boolean(regionsState.error) || regionsEmpty;

  const parkControlDisabled =
    !selectedRegion ||
    parksState.loading ||
    Boolean(parksState.error) ||
    parksEmpty;

  const regionPlaceholder = regionsState.loading
    ? t('search.loadingRegions')
    : t('search.whereToExplore');

  const parkPlaceholder = !selectedRegion
    ? t('search.selectRegionFirst')
    : parksState.loading
      ? t('search.loadingParks')
      : t('search.whichDestination');

  const showRegionRequired =
    submitAttempted && !selectedRegion && !regionsState.error;
  const showParkRequired =
    submitAttempted &&
    Boolean(selectedRegion) &&
    !selectedPark &&
    !parksState.error;

  return (
    <div className={`${styles.searchBox} ${compact ? styles.compact : ''}`}>
      <div className={styles.selectWrapper}>
        <div className={styles.selectGroup}>
          <label className={styles.label} htmlFor="searchbox-region">
            {t('search.selectRegion')}
          </label>
          <select
            id="searchbox-region"
            value={selectedRegion}
            onChange={handleRegionChange}
            className={styles.select}
            disabled={regionControlDisabled}
            aria-busy={regionsState.loading || undefined}
            aria-invalid={
              showRegionRequired || Boolean(regionsState.error) || undefined
            }
          >
            <option value="">{regionPlaceholder}</option>
            {regions.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>

          {regionsState.error && (
            <div className={styles.controlMessage} role="alert">
              <span className={styles.controlError}>
                {regionsState.error.message}
              </span>
              <button
                type="button"
                onClick={regionsState.retry}
                className={styles.retryLink}
              >
                {t('common.retry')}
              </button>
            </div>
          )}
          {!regionsState.error && regionsEmpty && (
            <div className={styles.controlMessage}>
              <span className={styles.controlEmpty}>
                {t('search.emptyRegions')}
              </span>
            </div>
          )}
          {showRegionRequired && (
            <div className={styles.controlMessage} role="alert">
              <span className={styles.controlError}>
                {t('search.regionRequired')}
              </span>
            </div>
          )}
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.label} htmlFor="searchbox-park">
            {t('search.selectNationalPark')}
          </label>
          <select
            id="searchbox-park"
            value={selectedPark}
            onChange={handleParkChange}
            className={styles.select}
            disabled={parkControlDisabled}
            aria-busy={parksState.loading || undefined}
            aria-invalid={
              showParkRequired || Boolean(parksState.error) || undefined
            }
          >
            <option value="">{parkPlaceholder}</option>
            {parks.map((park) => (
              <option key={park.slug} value={park.slug}>
                {park.name}
              </option>
            ))}
          </select>

          {parksState.error && (
            <div className={styles.controlMessage} role="alert">
              <span className={styles.controlError}>
                {parksState.error.message}
              </span>
              <button
                type="button"
                onClick={parksState.retry}
                className={styles.retryLink}
              >
                {t('common.retry')}
              </button>
            </div>
          )}
          {!parksState.error && parksEmpty && (
            <div className={styles.controlMessage}>
              <span className={styles.controlEmpty}>
                {t('search.emptyParks')}
              </span>
            </div>
          )}
          {showParkRequired && (
            <div className={styles.controlMessage} role="alert">
              <span className={styles.controlError}>
                {t('search.parkRequired')}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleFind}
        disabled={submitDisabled}
        className={`${styles.findButton} ${submitDisabled ? styles.disabled : ''}`}
      >
        {compact ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        ) : (
          t('search.search')
        )}
      </button>
    </div>
  );
};

export default SearchBox;

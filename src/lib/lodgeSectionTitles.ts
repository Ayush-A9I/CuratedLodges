/** Display config for a lodge page section heading. */
export interface SectionTitleDisplay {
    title: string;
    /** Optional trailing substring rendered with accent styling (defaults only). */
    accent?: string;
    accentClassName?: string;
}

export const DEFAULT_SECTION_TITLES = {
    originStory: {
        title: 'Not just a place to visit, but a place to call home.',
        accent: 'call home.',
        accentClassName: 'italic bg-[#FFE8A1]/50 px-2 rounded-sm',
    },
    naturalistPhilosophy: {
        title: 'Deeply educational and ethical wildlife tracking.',
    },
    afterSafariVibe: {
        title: 'The After-Safari Rhythm.',
        accent: 'Rhythm.',
        accentClassName: 'italic bg-[#CCDD99]/40 px-2 rounded-sm',
    },
} as const satisfies Record<string, SectionTitleDisplay>;

export type SectionTitleKey = keyof typeof DEFAULT_SECTION_TITLES;

export const SECTION_TITLE_FIELD_META: Array<{
    key: SectionTitleKey;
    label: string;
    description: string;
}> = [
    {
        key: 'originStory',
        label: 'Origin Story heading',
        description: 'Large heading beside the origin story image grid.',
    },
    {
        key: 'naturalistPhilosophy',
        label: 'Philosophy heading',
        description: 'Heading in The Philosophy section.',
    },
    {
        key: 'afterSafariVibe',
        label: 'After-safari heading',
        description: 'Heading in The Evenings section.',
    },
];

/** Resolve a section heading — custom override or styled default. */
export function resolveSectionTitle(
    key: SectionTitleKey,
    customTitles?: Record<string, string> | null
): SectionTitleDisplay {
    const custom = customTitles?.[key]?.trim();
    if (custom) return { title: custom };
    return { ...DEFAULT_SECTION_TITLES[key] };
}

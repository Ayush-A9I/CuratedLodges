import React from 'react';
import type { SectionTitleDisplay } from '@/lib/lodgeSectionTitles';

interface SectionTitleHeadingProps {
    display: SectionTitleDisplay;
    className?: string;
}

/**
 * Renders a lodge section heading. Default titles may include a styled accent
 * substring; fully custom titles from admin render as plain text.
 */
export function SectionTitleHeading({ display, className }: SectionTitleHeadingProps) {
    const { title, accent, accentClassName } = display;

    if (!accent || !title.includes(accent)) {
        return <h2 className={className}>{title}</h2>;
    }

    const idx = title.indexOf(accent);
    const before = title.slice(0, idx);
    const after = title.slice(idx + accent.length);

    return (
        <h2 className={className}>
            {before}
            <span className={accentClassName}>{accent}</span>
            {after}
        </h2>
    );
}

export default SectionTitleHeading;

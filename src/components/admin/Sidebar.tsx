'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

/** Grouped navigation definition for the admin sidebar. */
export const ADMIN_NAV: NavGroup[] = [
    {
        label: 'Overview',
        items: [{ label: 'Dashboard', href: '/admin', icon: '◧' }],
    },
    {
        label: 'Catalog',
        items: [
            { label: 'Lodges', href: '/admin/lodges', icon: '◈' },
            { label: 'Parks', href: '/admin/parks', icon: '⛰' },
            { label: 'Regions', href: '/admin/regions', icon: '◍' },
            { label: 'Amenities', href: '/admin/amenities', icon: '✦' },
        ],
    },
    {
        label: 'Content',
        items: [
            { label: 'Field Notes', href: '/admin/field-notes', icon: '✎' },
            { label: 'Testimonials', href: '/admin/testimonials', icon: '❝' },
        ],
    },
    {
        label: 'Operations',
        items: [
            { label: 'Bookings', href: '/admin/bookings', icon: '▤' },
            { label: 'Users', href: '/admin/users', icon: '◑' },
            { label: 'Newsletter', href: '/admin/newsletter', icon: '✉' },
        ],
    },
    {
        label: 'System',
        items: [{ label: 'Settings', href: '/admin/homepage-settings', icon: '⚙' }],
    },
];

/** Determine if a nav link should be highlighted as active. */
function isActive(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>
                <span className={styles.brandDot} />
                <span>Curated Lodges</span>
            </div>
            <nav>
                {ADMIN_NAV.map((group) => (
                    <div className={styles.navGroup} key={group.label}>
                        <div className={styles.navGroupLabel}>{group.label}</div>
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${isActive(pathname, item.href) ? styles.navLinkActive : ''
                                    }`}
                            >
                                <span aria-hidden style={{ width: 18, textAlign: 'center' }}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component } from 'svelte';

export type BentoCardProps = {
    name: string;
    background: ConstructorOfATypedSvelteComponent | Component<any, any, any> | null | undefined;
    icon: string;
    description?: string;
    cta?: string;
    href?: string;
    color?: string;
    class: string;
}
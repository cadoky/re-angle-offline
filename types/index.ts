import React from 'react';

export interface AngleDirection {
    id: string;
    label: string;
    degree: number;
    iconPos: number;
}

export interface DropdownProps {
    label: string;
    icon: React.ReactNode;
    value: string | number | undefined;
    options: string[];
    translations?: Record<string, string>;
    isOpen: boolean;
    setOpen: (v: boolean) => void;
    onChange: (v: any) => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

export interface SelectorProps {
    label?: string;
    icon: React.ReactNode;
    value: string | number | undefined;
    options: string[] | undefined;
    onChange: (v: any) => void;
    translations?: Record<string, string>;
    helpTexts?: Record<string, string>;
    optionImages?: Record<string, string>;
    disabled?: boolean;
    colorPicker?: {
        val: string;
        set: (v: string) => void;
    } | null;
}

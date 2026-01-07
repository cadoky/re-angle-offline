export const safeString = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val;
    return String(val);
};

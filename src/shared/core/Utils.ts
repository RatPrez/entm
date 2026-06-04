export function toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/// strips off numbers from classes, be careful using this on classes with numbers in their name.
export function compareClass(value: string | undefined, compare: string) : boolean {
    if (value == undefined) return false;
    const normalized = toCamelCase(value).replace(/\d+$/, '');
    return normalized == compare;
}

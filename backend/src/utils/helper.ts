/**
 * Remove specified keys from an object
 * @param obj - The source object
 * @param keys - Keys to remove
 * @returns New object without the specified keys
 */
export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result as Omit<T, K>;
}

/**
 * Remove a single key from an object
 * @param obj - The source object
 * @param key - Key to remove
 * @returns New object without the specified key
 */
export function omitOne<T extends object, K extends keyof T>(
    obj: T,
    key: K
): Omit<T, K> {
    const { [key]: _, ...rest } = obj;
    return rest as Omit<T, K>;
}

/**
 * Keep only specified keys from an object
 * @param obj - The source object
 * @param keys - Keys to keep
 * @returns New object with only the specified keys
 */
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

export function verifyUUID(value: string) {
    if (!value) {
        return false;
    }
    const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export function sanitizeS3KeySegment(str: string): string {
    return str
        .trim()
        .normalize('NFD') // split accented characters (e.g., café → cafe + ´)
        .replace(/[\u0300-\u036f]/g, '') // remove accent marks
        .replace(/[^a-zA-Z0-9._\- ]/g, '') // remove unsafe chars
        .replace(/\s+/g, '-') // replace spaces (and multiple spaces) with hyphens
        .toLowerCase();
}
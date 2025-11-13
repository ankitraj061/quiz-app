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
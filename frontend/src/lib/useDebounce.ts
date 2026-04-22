import { useEffect, useState } from "react";

/**
 * Debounce any value. The returned value trails `value` by `delay` ms.
 * Useful for search inputs to avoid refetching on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}

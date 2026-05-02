import { useEffect, useRef } from "react";

/**
 * Intercepts the Android hardware back button (popstate) when a modal/drawer is open
 * so it closes the overlay instead of navigating to the previous page.
 *
 * Pattern: push a dummy history state when the overlay opens; on popstate the dummy
 * state is consumed and onClose() fires, leaving the user on the current page.
 * If the overlay is closed via UI, the dummy state remains — the next back press
 * is a no-op (same URL) and the one after that navigates to the previous page.
 */
export function useAndroidBack(isOpen: boolean, onClose: () => void): void {
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState(null, "");

        const handler = () => onCloseRef.current();
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, [isOpen]);
}

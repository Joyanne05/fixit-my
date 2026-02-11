import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string, lat?: number, lon?: number) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

interface Suggestion {
    properties: {
        formatted: string;
        place_id: string;
        lat: number;
        lon: number;
    }
}

export default function LocationAutocomplete({ value, onChange, placeholder, className, required }: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce logic
    const [debouncedValue, setDebouncedValue] = useState(value);

    // Update debounced value after delay
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, 500);
        return () => clearTimeout(handler);
    }, [value]);

    // Fetch suggestions when debounced value changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/location/autocomplete?text=${encodeURIComponent(debouncedValue)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.features || []);
                    if (data.features && data.features.length > 0) {
                        setShowSuggestions(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (debouncedValue !== value) return; // Wait for debounce to settle - actually this check is redundant with useEffect dependency.

        fetchSuggestions();
    }, [debouncedValue]);


    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (suggestion: Suggestion) => {
        onChange(suggestion.properties.formatted, suggestion.properties.lat, suggestion.properties.lon);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        // Open suggestions again if typing
                        if (e.target.value.length >= 3) setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    required={required}
                    className={className}
                    onFocus={() => {
                        if (value.length >= 3) setShowSuggestions(true);
                    }}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-gray-400" size={16} />
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.properties.place_id || Math.random()}
                            onClick={() => handleSelect(suggestion)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-start gap-2"
                        >
                            <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                            <span>{suggestion.properties.formatted}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

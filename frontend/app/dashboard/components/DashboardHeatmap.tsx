"use client";
import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Type declaration for leaflet.heat
declare module "leaflet" {
    function heatLayer(
        latlngs: Array<[number, number, number?]>,
        options?: Record<string, unknown>
    ): L.Layer;
}

// Dynamically import leaflet.heat (side-effect import)
import "leaflet.heat";

interface HeatmapReport {
    report_id: number;
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
}

interface DashboardHeatmapProps {
    selectedCategory: string;
}

export default function DashboardHeatmap({ selectedCategory }: DashboardHeatmapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const heatLayerRef = useRef<L.Layer | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);

    const [reports, setReports] = useState<HeatmapReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"heat" | "markers">("markers");

    // Fetch heatmap data
    useEffect(() => {
        async function fetchHeatmapData() {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/report/heatmap`
                );
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setReports(data.reports || []);
            } catch (error) {
                console.error("Error fetching heatmap data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHeatmapData();
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [4.2105, 101.9758], // Centre of Malaysia
            zoom: 7,
            zoomControl: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution:
                '&copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19,
            subdomains: "abcd",
        }).addTo(map);

        mapInstanceRef.current = map;

        // Cleanup on unmount
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Filter reports by category
    const filteredReports =
        selectedCategory === "all"
            ? reports
            : reports.filter((r) => r.category === selectedCategory);

    // Update layers when reports, filter, or viewMode change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing layers
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
            heatLayerRef.current = null;
        }
        if (markerLayerRef.current) {
            map.removeLayer(markerLayerRef.current);
            markerLayerRef.current = null;
        }

        if (filteredReports.length === 0) return;

        if (viewMode === "heat") {
            // Heat layer
            const heatData: [number, number, number][] = filteredReports.map((r) => [
                r.latitude,
                r.longitude,
                1.0, // intensity
            ]);

            const heat = L.heatLayer(heatData, {
                radius: 35,
                blur: 25,
                maxZoom: 17,
                minOpacity: 0.45,
                max: 1.0,
                gradient: {
                    0.0: "#124076",
                    0.3: "#1a6fb5",
                    0.5: "#f59e0b",
                    0.7: "#ef4444",
                    1.0: "#dc2626",
                },
            });
            heat.addTo(map);
            heatLayerRef.current = heat;
        } else {
            // Marker layer
            const markerGroup = L.layerGroup();

            // Status-based colours
            const statusColors: Record<string, string> = {
                open: "#ef4444",
                acknowledged: "#f59e0b",
                in_progress: "#3b82f6",
                closed: "#22c55e",
            };

            filteredReports.forEach((r) => {
                const color = statusColors[r.status] || "#6b7280";

                const icon = L.divIcon({
                    className: "custom-marker",
                    html: `<div style="
            width: 14px; height: 14px;
            background: ${color};
            border: 2.5px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });

                const marker = L.marker([r.latitude, r.longitude], { icon });

                marker.bindPopup(
                    `<div style="min-width: 160px; font-family: var(--font-outfit), sans-serif;">
            <p style="font-weight: 600; margin: 0 0 4px; font-size: 14px; color: #111827;">${r.title}</p>
            <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: capitalize;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 4px; vertical-align: middle;"></span>
              ${r.status.replace("_", " ")}
            </p>
            <a href="/reports/${r.report_id}" style="font-size: 12px; color: #124076; font-weight: 600; text-decoration: none;">View Report →</a>
          </div>`,
                    { closeButton: false, offset: [0, -4] }
                );

                marker.addTo(markerGroup);
            });

            markerGroup.addTo(map);
            markerLayerRef.current = markerGroup;
        }

        // Auto-fit bounds if we have data
        if (filteredReports.length > 0) {
            const bounds = L.latLngBounds(
                filteredReports.map((r) => [r.latitude, r.longitude])
            );
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [filteredReports, viewMode]);

    return (
        <div className="relative w-full">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                    {filteredReports.length}{" "}
                    {filteredReports.length === 1 ? "report" : "reports"} on map
                </p>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setViewMode("markers")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "markers"
                            ? "bg-white text-brand-primary shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Markers
                    </button>
                    <button
                        onClick={() => setViewMode("heat")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "heat"
                            ? "bg-white text-brand-primary shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Heatmap
                    </button>
                </div>
            </div>

            {/* Legend (markers mode) */}
            {viewMode === "markers" && (
                <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-500">
                    {[
                        { label: "Open", color: "#ef4444" },
                        { label: "Acknowledged", color: "#f59e0b" },
                        { label: "In Progress", color: "#3b82f6" },
                        { label: "Closed", color: "#22c55e" },
                    ].map((item) => (
                        <span key={item.label} className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ background: item.color }}
                            />
                            {item.label}
                        </span>
                    ))}
                </div>
            )}

            {/* Map Container */}
            <div className="relative z-0 isolate rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {isLoading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-brand-primary rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading map data...</p>
                        </div>
                    </div>
                )}

                {!isLoading && filteredReports.length === 0 && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-500 font-medium mb-1">No reports to display</p>
                            <p className="text-sm text-gray-400">
                                Reports with location data will appear here
                            </p>
                        </div>
                    </div>
                )}

                <div
                    ref={mapContainerRef}
                    className="w-full h-[400px] md:h-[550px]"
                />
            </div>

        </div>
    );
}

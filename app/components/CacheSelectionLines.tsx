'use client'

import {Layer, Marker, Source, useMap} from "react-map-gl/mapbox";
import type {ExpressionSpecification} from "mapbox-gl";
import {useEffect, useState} from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {Cached} from "@mui/icons-material";
import {CacheSelection, DirectorServer, LatLong} from "@/app/type";
import CacheDetails from "@/app/components/CacheDetails";

const PALETTE = [
	"#E6194B", "#3CB44B", "#4363D8", "#F58231", "#911EB4", "#42D4F4", "#F032E6", "#BFEF45",
	"#FABED4", "#469990", "#DCBEFF", "#9A6324", "#800000", "#AAFFC3", "#808000", "#000075",
	"#FFE119", "#FFD8B1", "#00A86B", "#C71585", "#2F4F4F", "#BC8F8F", "#4B0082", "#FF4500",
]

// How each of the director's choices is drawn, in priority order
const CHOICES = [
	{label: "1st", dasharray: [1, 0]},
	{label: "2nd", dasharray: [4, 2]},
	{label: "3rd", dasharray: [1, 2]},
]

const toRadians = (degrees: number) => degrees * Math.PI / 180
const toDegrees = (radians: number) => radians * 180 / Math.PI

/**
 * Points along the great circle between a and b, with longitudes unwrapped
 * so the line stays continuous when it crosses the antimeridian
 */
const greatCircle = (a: LatLong, b: LatLong, steps = 64): [number, number][] => {
	const [lat1, lon1, lat2, lon2] = [a.latitude, a.longitude, b.latitude, b.longitude].map(toRadians)
	const d = 2 * Math.asin(Math.sqrt(
		Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
	))

	if (d === 0) {
		return [[a.longitude, a.latitude], [b.longitude, b.latitude]]
	}

	const coordinates: [number, number][] = []
	for (let i = 0; i <= steps; i++) {
		const f = i / steps
		const A = Math.sin((1 - f) * d) / Math.sin(d)
		const B = Math.sin(f * d) / Math.sin(d)
		const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
		const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
		const z = A * Math.sin(lat1) + B * Math.sin(lat2)

		let longitude = toDegrees(Math.atan2(y, x))
		const latitude = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)))

		if (coordinates.length) {
			const previous = coordinates[coordinates.length - 1][0]
			while (longitude - previous > 180) longitude -= 360
			while (longitude - previous < -180) longitude += 360
		}
		coordinates.push([longitude, latitude])
	}
	return coordinates
}

const CACHE_ICON_COLOR = "#FF7B00"

const CacheSelectionLines = ({selections, generatedAt}: {selections: CacheSelection[], generatedAt: string}) => {

	// Mapbox throws if sources are added before the style (and its imports) finish loading
	const {current: map} = useMap()
	const [styleLoaded, setStyleLoaded] = useState(false)
	useEffect(() => {
		if (!map) return
		if (map.loaded()) {
			setStyleLoaded(true)
			return
		}
		const onIdle = () => setStyleLoaded(true)
		map.once('idle', onIdle)
		return () => {
			map.off('idle', onIdle)
		}
	}, [map])

	const [shownChoices, setShownChoices] = useState<number[]>([0])
	const [selectedCache, setSelectedCache] = useState<DirectorServer | null>(null)

	const allCaches = selections.flatMap(x => x.caches).filter((x): x is DirectorServer => x !== null)
	const cacheNames = [...new Set(allCaches.map(x => x.name))].sort()
	const colorFor = (name: string) => PALETTE[cacheNames.indexOf(name) % PALETTE.length]

	const linesFor = (choice: number) => ({
		type: "FeatureCollection" as const,
		features: selections.flatMap(x => {
			const cache = x.caches[choice]
			if (!cache) return []
			return [{
				type: "Feature" as const,
				properties: {color: colorFor(cache.name), cache: cache.name},
				geometry: {type: "LineString" as const, coordinates: greatCircle(x.point, cache)},
			}]
		})
	})

	// Color each grid point and its cell by the highest priority choice currently shown
	const firstShown = Math.min(...shownChoices)
	const propertiesFor = (x: CacheSelection) => {
		const cache = x.caches[firstShown]
		return {color: cache ? colorFor(cache.name) : "#888888", cache: cache?.name ?? ""}
	}

	const points = {
		type: "FeatureCollection" as const,
		features: selections.map(x => ({
			type: "Feature" as const,
			properties: propertiesFor(x),
			geometry: {type: "Point" as const, coordinates: [x.point.longitude, x.point.latitude]},
		}))
	}

	const cells = {
		type: "FeatureCollection" as const,
		features: selections.map(x => ({
			type: "Feature" as const,
			properties: propertiesFor(x),
			geometry: {type: "Polygon" as const, coordinates: [x.cell]},
		}))
	}

	// When a cache is selected, fade out everything that doesn't point to it
	const highlight = (selected: number, other: number, normal: number): ExpressionSpecification | number => selectedCache
		? ["case", ["==", ["get", "cache"], selectedCache.name], selected, other]
		: normal

	// Only mark the caches picked by a shown choice, plus the selected one
	const shownCaches = new Map(
		selections
			.flatMap(x => shownChoices.map(choice => x.caches[choice]))
			.filter((x): x is DirectorServer => !!x)
			.map(x => [x.name, x])
	)
	if (selectedCache) shownCaches.set(selectedCache.name, selectedCache)

	return (
		<>
			<Box component={'div'} style={{
				position: 'absolute',
				top: 0,
				left: 0,
				margin: 5,
				padding: 10,
				backgroundColor: "white",
				borderRadius: 1,
				zIndex: 9999,
			}}>
				<ToggleButtonGroup
					size="small"
					value={shownChoices}
					onChange={(_, value: number[]) => {
						// Always keep at least one choice visible
						if (value.length) setShownChoices(value)
					}}
				>
					{CHOICES.map((choice, i) => (
						<ToggleButton key={choice.label} value={i} sx={{gap: 1}}>
							<svg width={24} height={4}>
								<line x1={0} y1={2} x2={24} y2={2} stroke="currentColor" strokeWidth={2} strokeDasharray={choice.dasharray.map(x => x * 2).join(' ')} />
							</svg>
							{choice.label} choice
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>
			{styleLoaded && <>
				<Source id="cache-selection-cells" type="geojson" data={cells}>
					<Layer
						id="cache-selection-cells"
						type="fill"
						paint={{"fill-color": ["get", "color"], "fill-opacity": highlight(0.6, 0.08, 0.35)}}
					/>
				</Source>
				{/* Draw lower priority choices first so the top choice sits on top */}
				{[...shownChoices].sort((a, b) => b - a).map(choice => (
					<Source key={choice} id={`cache-selection-lines-${choice}`} type="geojson" data={linesFor(choice)}>
						<Layer
							id={`cache-selection-lines-${choice}`}
							type="line"
							paint={{
								"line-color": ["get", "color"],
								"line-width": 1.5,
								"line-opacity": highlight(0.95, 0.08, 0.7),
								"line-dasharray": CHOICES[choice].dasharray,
							}}
						/>
					</Source>
				))}
				<Source id="cache-selection-points" type="geojson" data={points}>
					<Layer
						id="cache-selection-points"
						type="circle"
						paint={{
							"circle-color": ["get", "color"],
							"circle-radius": 2.5,
							"circle-stroke-color": "#FFFFFF",
							"circle-stroke-width": 0.5,
							"circle-opacity": highlight(1, 0.15, 1),
							"circle-stroke-opacity": highlight(1, 0.15, 1),
						}}
					/>
				</Source>
			</>}
			{[...shownCaches.values()].map(cache => {
				const selected = cache.name === selectedCache?.name
				return (
					<Marker
						key={cache.name}
						latitude={cache.latitude}
						longitude={cache.longitude}
						anchor="center"
						style={{cursor: "pointer", zIndex: selected ? 1 : 0}}
						onClick={e => {
							e.originalEvent.stopPropagation()
							setSelectedCache(selected ? null : cache)
						}}
					>
						<Box
							title={cache.name}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 28,
								height: 28,
								boxSizing: "border-box",
								borderRadius: "50%",
								backgroundColor: "#000000",
								// Outline in the cache's line color so it can be matched to its lines and cells
								border: `3px solid ${colorFor(cache.name)}`,
								boxShadow: selected ? "0 0 0 2px #FFFFFF, 0 0 0 4px #000000" : "0 1px 3px rgba(0, 0, 0, 0.4)",
								transform: selected ? "scale(1.25)" : "none",
								transition: "transform 120ms, box-shadow 120ms",
							}}
						>
							<Cached sx={{color: CACHE_ICON_COLOR, fontSize: 18}} />
						</Box>
					</Marker>
				)
			})}
			{selectedCache && (
				<CacheDetails
					cache={selectedCache}
					selections={selections}
					generatedAt={generatedAt}
					onClose={() => setSelectedCache(null)}
				/>
			)}
		</>
	)
}

export default CacheSelectionLines;

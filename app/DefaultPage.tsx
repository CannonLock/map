'use client'

import Markers from "@/app/markers/Markers";
import {MarkerContext} from "@/app/components/BaseMap"
import {useContext, useEffect, useState} from "react";
import {MarkerProps} from "@/app/type";

interface DefaultPageProps {
	ospoolMarkers: MarkerProps[]
	cacheMarkers: MarkerProps[]
	originMarkers: MarkerProps[]
	storageMarkers: MarkerProps[]
}

function DefaultPage({originMarkers, cacheMarkers, ospoolMarkers, storageMarkers}: DefaultPageProps) {

	const markers = useContext(MarkerContext);
	const [displayMarkers, setDisplayMarkers] = useState<MarkerProps[]>([])

	useEffect(() => {
		(async () => {

			let displayMarkers: MarkerProps[] = []
			if (markers.includes('cache')) {
				displayMarkers = [...displayMarkers, ...cacheMarkers]
			}

			if (markers.includes('origin')) {
				displayMarkers = [...displayMarkers, ...originMarkers]
			}

			if (markers.includes('ospool')) {
				displayMarkers = [...displayMarkers, ...ospoolMarkers]
			}

			if (markers.includes('storage')) {
				displayMarkers = [...displayMarkers, ...storageMarkers]
			}

			setDisplayMarkers(displayMarkers)
		})()
	}, [markers])

	return <Markers markers={displayMarkers} />
}

export default DefaultPage;

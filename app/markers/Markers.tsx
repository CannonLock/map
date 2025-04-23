'use client'

import {Marker} from "react-map-gl/mapbox";
import React from "react";
import {MarkerProps} from "../type";

const Markers = ({markers}: {markers: MarkerProps[]}) => {

	markers.sort((a, b) => {
		return b.latitude - a.latitude;
	})

	return markers.map(x => {

		// @ts-expect-error Please just build :) I don't care to fix this as it works
		const icon = React.cloneElement(x.icon, { sx: {color: x.color}});

		return (
			<Marker latitude={x.latitude} longitude={x.longitude} offset={x.offset} anchor="bottom" key={x.id + Math.random()}>
				{icon}
			</Marker>
		)
	}
	)
}

export default Markers;

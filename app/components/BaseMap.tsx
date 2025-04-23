'use client'

import Map from "react-map-gl/mapbox"
import {useState, createContext} from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Box, Button, FormControl, InputLabel, MenuItem, Select} from '@mui/material';

function BaseMap({children}: {children: React.ReactNode}) {

	const [mapBackground, setMapBackground] = useState(true);
	const [markers, setMarkers] = useState<string[]>(['origin', 'cache', 'ospool', 'storage']);

	return (
			<>
				<MarkerContext.Provider value={markers}>
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
						<Button onClick={() => setMapBackground(!mapBackground)} variant="contained" color="primary" sx={{ mr: 1 }}>
							Remove Background
						</Button>
						<FormControl>
							<InputLabel id={"markers"}>Markers</InputLabel>
							<Select
								multiple
								labelId={"markers"}
								id={"markers"}
								value={markers}
								label={"Markers"}
								size="small"
								onChange={(e) => {
									const {
										target: { value },
									} = e;
									setMarkers(typeof value === 'string' ? value.split(',') : value)
								}}
								sx={{width: 200}}
							>
								<MenuItem value={"cache"}>Cache</MenuItem>
								<MenuItem value={"ospool"}>OSPool</MenuItem>
								<MenuItem value={"origin"}>Origin</MenuItem>
								<MenuItem value={"storage"}>Storage</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Map
						mapboxAccessToken="pk.eyJ1IjoiY2Fubm9uLWxvY2siLCJhIjoiY2xqNmpla2dqMGpmZTNxbnY2M210c2RwcCJ9.b1Z-x0y2urZLAFp8Sv0-wQ"
						initialViewState={{
							longitude: -92.4,
							latitude: 37.8,
							zoom: 3
						}}
						projection={'mercator'}
						style={{width: "100%", height: "100%"}}
						mapStyle={mapBackground ? "mapbox://styles/cannon-lock/cm9u8lv2400fd01qt9yvj8nyz" : {version: 8,sources: {},layers: []}}
					>
						{children}
					</Map>
				</MarkerContext.Provider>
			</>

	)
}

export const MarkerContext = createContext<string[]>([])

export default BaseMap;

import {TripOrigin} from "@mui/icons-material";
import {LatLong} from "../type";
import {ReactElement} from "react";
import {SCALING_FACTOR} from "@/app/markers/index";

const OriginMarkers = ({locations}: {locations: LatLong[]}) => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-origin`,
			icon: TripOrigin as unknown as ReactElement,
			color: "#DAD71B",
			offset: [SCALING_FACTOR, -SCALING_FACTOR] as [number, number]
		}
	})
}

export default OriginMarkers;

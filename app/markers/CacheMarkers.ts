import {Cached} from "@mui/icons-material";
import {LatLong, MarkerProps} from "../type";
import {ReactElement} from "react";
import {SCALING_FACTOR} from "@/app/markers/index";

const CacheMarkers = ({locations}: {locations: LatLong[]}): MarkerProps[] => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-cache`,
			icon: Cached as unknown as ReactElement,
			color: "#FF7B00",
			offset: [-SCALING_FACTOR, -SCALING_FACTOR] as [number, number]
		}
	})
}

export default CacheMarkers;

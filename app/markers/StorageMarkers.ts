import {Storage} from "@mui/icons-material";
import {LatLong} from "../type";
import {ReactElement} from "react";
import {SCALING_FACTOR} from "@/app/markers/index";

const StorageMarkers = ({locations}: {locations: LatLong[]}) => {

	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-origin`,
			icon: Storage as unknown as ReactElement,
			color: "#79DF26",
			offset: [-SCALING_FACTOR, SCALING_FACTOR] as [number, number]
		}
	})
}

export default StorageMarkers;

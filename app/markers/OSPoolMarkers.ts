import {Memory} from "@mui/icons-material";
import {LatLong} from "../type";
import {ReactElement} from "react";
import {SCALING_FACTOR} from "@/app/markers/index";

const OSPoolMarkers = ({locations}: {locations: LatLong[]}) => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-ospool`,
			icon: Memory as unknown as ReactElement,
			color: "#12DABF",
			offset: [SCALING_FACTOR, SCALING_FACTOR] as [number, number]
		}
	})
}

export default OSPoolMarkers;

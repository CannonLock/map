import {Memory} from "@mui/icons-material";
import {LatLong} from "../type";

const OSPoolMarkers = ({locations}: {locations: LatLong[]}) => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-ospool`,
			icon: Memory,
			color: "blue",
			offset: [0, 10]
		}
	})
}

export default OSPoolMarkers;

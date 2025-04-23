import {Storage} from "@mui/icons-material";
import {LatLong} from "../type";

const OriginMarkers = ({locations}: {locations: LatLong[]}) => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-origin`,
			icon: Storage,
			color: "red",
			offset: [15, -15]
		}
	})
}

export default OriginMarkers;

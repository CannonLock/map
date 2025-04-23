import {Cached} from "@mui/icons-material";
import {LatLong} from "../type";

const CacheMarkers = ({locations}: {locations: LatLong[]}) => {
	return locations.map(x => {
		return {
			...x,
			id: `${x.latitude}-${x.longitude}-cache`,
			icon: Cached,
			color: "green",
			offset: [-15, -15],
		}
	})
}

export default CacheMarkers;

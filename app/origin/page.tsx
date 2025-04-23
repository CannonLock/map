import {getOSDFOriginInstitutions} from "@/app/util";
import Markers from "@/app/markers/Markers";
import OriginMarkers from "@/app/markers/OriginMarkers";

async function Page() {
	const originInstitutions = await getOSDFOriginInstitutions()
	const originMarkers = OriginMarkers({locations: originInstitutions})

	return <Markers markers={originMarkers} />
}

export default Page;

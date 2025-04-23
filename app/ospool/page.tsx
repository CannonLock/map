import {getOSPoolInstitutions} from "@/app/util";
import OSPoolMarkers from "@/app/markers/OSPoolMarkers";
import Markers from "@/app/markers/Markers";

async function Page() {

	const ospoolInstitutions = await getOSPoolInstitutions()
	const ospoolMarkers = OSPoolMarkers({locations: ospoolInstitutions})

	return <Markers markers={ospoolMarkers} />
}

export default Page;

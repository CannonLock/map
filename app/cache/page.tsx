import {getOSDFCacheInstitutions} from "@/app/util";
import Markers from "@/app/markers/Markers";
import CacheMarkers from "@/app/markers/CacheMarkers";

async function Page() {

	const cacheInstitutions = await getOSDFCacheInstitutions()
	const cacheMarkers = CacheMarkers({locations: cacheInstitutions})

	return <Markers markers={cacheMarkers} />
}

export default Page;

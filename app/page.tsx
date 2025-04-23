import {getOSDFCacheInstitutions, getOSDFOriginInstitutions, getOSPoolInstitutions} from "@/app/util";
import OSPoolMarkers from "@/app/markers/OSPoolMarkers";
import OriginMarkers from "@/app/markers/OriginMarkers";
import CacheMarkers from "@/app/markers/CacheMarkers";
import DefaultPage from "@/app/DefaultPage";

async function Page() {

  const ospoolInstitutions = await getOSPoolInstitutions()
  const ospoolMarkers = OSPoolMarkers({locations: ospoolInstitutions})

  const cacheInstitutions = await getOSDFCacheInstitutions()
  const cacheMarkers = CacheMarkers({locations: cacheInstitutions})

  const originInstitutions = await getOSDFOriginInstitutions()
  const originMarkers = OriginMarkers({locations: originInstitutions})

  return <DefaultPage ospoolMarkers={ospoolMarkers} cacheMarkers={cacheMarkers} originMarkers={originMarkers} />
}

export default Page;

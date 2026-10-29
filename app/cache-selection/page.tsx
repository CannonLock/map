import {getCacheSelections} from "@/app/util";
import CacheSelectionLines from "@/app/components/CacheSelectionLines";

// Number of equidistant points covering the globe, only those on land are queried
const GRID_POINT_COUNT = 3000

async function Page() {

	const selections = await getCacheSelections(GRID_POINT_COUNT)

	return <CacheSelectionLines selections={selections} generatedAt={new Date().toISOString()} />
}

export default Page;

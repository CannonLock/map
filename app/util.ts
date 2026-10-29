import {ResourceGroup, Institution, LatLong, DirectorServer, CacheSelection, GridCell} from "@/app/type";
import {geoArea, geoContains} from "d3-geo";
import {geoVoronoi} from "d3-geo-voronoi";
import {feature} from "topojson-client";
import landTopology from "world-atlas/land-50m.json";

const DIRECTOR_URL = 'https://osdf-director.osg-htc.org'
const DIRECTOR_TEST_OBJECT = '/pelicanplatform/test/hello-world.txt'

const getInstitutions = async (): Promise<Record<string, Institution>> => {
	const response = await fetch('https://topology-institutions.osg-htc.org/api/institution_ids');
	if (!response.ok) {
		throw new Error('Failed to fetch institutions');
	}
	const data = await response.json() as Institution[];
	const dataById = data.reduce((acc, institution) => {
		acc[institution.id] = institution;
		return acc;
	}, {} as Record<string, Institution>);
	return dataById;
}

const getResourceGroups = async (): Promise<Record<string, ResourceGroup>> => {
	const response = await fetch('https://topology.opensciencegrid.org/api/resource_group_summary');
	if (!response.ok) {
		throw new Error('Failed to fetch resource groups');
	}
	const data = await response.json() as Record<string, ResourceGroup>;
	return data
}

const fetchOSPoolResourcesList = async () => {
	const response = await fetch("https://osg-htc.org/ospool-data/data/ospool_resources_report/ospool_resources.json")
	const ospoolResources : string[] = await response.json()
	return new Set(ospoolResources.map(x => x.toLowerCase()))
}

const doesResourceGroupsContributesToOSPool = (resourceGroup: ResourceGroup, ospoolResources: Set<string>) => {
	return resourceGroup.Resources.Resource.some(resource => {
		return ospoolResources.has(resource.Name.toLowerCase())
	})
}

const doesResourceGroupsHaveOSDFCache = (resourceGroup: ResourceGroup) => {

	const rgServices = resourceGroup.Resources.Resource.flatMap(resource => {
		return resource.Services.Service.map(service => {
			return service.Name
		})
	})

	return rgServices.includes("XRootD cache server") || rgServices.includes("Pelican cache")
}

const doesResourceGroupsHaveOSDFOrigin = (resourceGroup: ResourceGroup) => {

	const rgServices = resourceGroup.Resources.Resource.flatMap(resource => {
		return resource.Services.Service.map(service => {
			return service.Name
		})
	})

	return rgServices.includes("XRootD origin server") || rgServices.includes("Pelican origin")

}

export const resourceGroupsToInstitutions = async (resourceGroups: ResourceGroup[]) => {
	const institutions = await getInstitutions()

	const institutionIds = resourceGroups.map(resourceGroup => {
		return resourceGroup.Facility.InstitutionID
	})

	// Remove duplicates
	const uniqueInstitutionIds = new Set(institutionIds)

	// Include a filter for now to remove null ids from incomplete topo data
	return [...uniqueInstitutionIds].filter(x => x in institutions).map(id => institutions[id])
}

const resourceGroupsToSites = async (resourceGroups: ResourceGroup[]): Promise<LatLong[]> => {
	const sites = resourceGroups.reduce((acc, rg) => {
		acc[rg.Site.Name] = {
			latitude: rg.Site.Latitude,
			longitude: rg.Site.Longitude,
		}
		return acc
	}, {} as Record<string, {latitude: number, longitude: number}>)

	return Object.values(sites)
}

/**
 * The meat of the file
 */


export const getOSDFStorageInstitutions = async () => {
	const s3StorageLocations: LatLong[] = [
		{ latitude: 40.0177064535727, longitude: -105.27273175578432 },
		{ latitude: 29.75646754188935, longitude: -95.36541967712513 },
		{ latitude: 38.66574439687952, longitude: -77.71508848490011 },
		{ latitude: 44.508813879524006, longitude: -121.32246448252789 },
		{ latitude: 44.508813879524006, longitude: -121.32246448252789 }
	];

	return [...(await getOSDFOriginInstitutions()), ...s3StorageLocations]
}

export const getOSDFCacheInstitutions = async () => {
	const resourceGroups = await getResourceGroups()

	const cacheResourceGroups = Object.values(resourceGroups).filter(resourceGroup => {
		return doesResourceGroupsHaveOSDFCache(resourceGroup)
	})

	const institutions = resourceGroupsToSites(cacheResourceGroups)

	return institutions
}

export const getOSDFOriginInstitutions = async () => {
	const resourceGroups = await getResourceGroups()

	const originResourceGroups = Object.values(resourceGroups).filter(resourceGroup => {
		return doesResourceGroupsHaveOSDFOrigin(resourceGroup)
	})

	return resourceGroupsToSites(originResourceGroups)
}


export const getOSPoolInstitutions = async () => {
	const ospoolResources = await fetchOSPoolResourcesList()
	const resourceGroups = await getResourceGroups()

	const ospoolResourceGroups = Object.values(resourceGroups).filter(resourceGroup => {
		return doesResourceGroupsContributesToOSPool(resourceGroup, ospoolResources)
	})

	return resourceGroupsToSites(ospoolResourceGroups)
}

const getDirectorServers = async (): Promise<DirectorServer[]> => {
	const response = await fetch(`${DIRECTOR_URL}/api/v1.0/director_ui/servers`)
	if (!response.ok) {
		throw new Error('Failed to fetch director servers');
	}
	const data = await response.json() as DirectorServer[]

	// Keep only what the map needs so the page payload stays small
	return data.map(server => ({
		name: server.name,
		url: server.url,
		webUrl: server.webUrl,
		type: server.type,
		latitude: server.latitude,
		longitude: server.longitude,
		healthStatus: server.healthStatus,
		serverStatus: server.serverStatus,
		version: server.version,
		ioLoad: server.ioLoad,
		filtered: server.filtered,
		filteredType: server.filteredType,
		namespacePrefixes: [...new Set(server.namespacePrefixes ?? [])].sort(),
	}))
}

/**
 * Roughly equidistant points covering the globe, using a Fibonacci lattice
 */
export const getGlobeGrid = (count: number): LatLong[] => {
	const goldenAngle = Math.PI * (3 - Math.sqrt(5))
	return [...Array(count).keys()].map(i => {
		const y = 1 - (2 * (i + 0.5)) / count
		const longitude = ((i * goldenAngle * 180 / Math.PI) % 360) - 180
		return {
			latitude: Math.asin(y) * 180 / Math.PI,
			longitude,
		}
	})
}

const EARTH_RADIUS_KM = 6371.0088

/**
 * Unwrap a cell's longitudes around its site so it draws as one shape on the map,
 * closing it over the pole when the cell surrounds one
 */
const unwrapRing = (ring: number[][], site: LatLong): [number, number][] => {
	let previous = site.longitude
	const unwrapped = ring.map(([longitude, latitude]) => {
		while (longitude - previous > 180) longitude -= 360
		while (longitude - previous < -180) longitude += 360
		previous = longitude
		return [longitude, latitude] as [number, number]
	})

	const first = unwrapped[0]
	const last = unwrapped[unwrapped.length - 1]
	if (Math.abs(last[0] - first[0]) > 180) {
		const pole = site.latitude > 0 ? 90 : -90
		unwrapped.push([last[0], pole], [first[0], pole], first)
	}
	return unwrapped
}

/**
 * Grid points that fall on land, each with the area of the globe closest to it.
 * Cells are built from the whole grid so coastal cells don't spill out over the ocean.
 */
export const getLandGridCells = (count: number): GridCell[] => {
	const land = feature(landTopology as unknown as Parameters<typeof feature>[0], 'land')
	const points = getGlobeGrid(count)
	const cells = geoVoronoi(points.map(x => [x.longitude, x.latitude] as [number, number])).polygons().features

	return cells.flatMap((cell, i) => {
		const point = points[i]
		if (!geoContains(land, [point.longitude, point.latitude])) return []
		return [{
			point,
			cell: unwrapRing(cell.geometry.coordinates[0], point),
			areaKm2: geoArea(cell) * EARTH_RADIUS_KM ** 2,
		}]
	})
}

/**
 * Ask the director which caches it would redirect a client at this location to,
 * in priority order, using the Link header of the redirect
 */
const getSelectedCacheHosts = async (point: LatLong): Promise<string[]> => {
	try {
		const response = await fetch(`${DIRECTOR_URL}/api/v1.0/director/object${DIRECTOR_TEST_OBJECT}`, {
			method: 'HEAD',
			redirect: 'manual',
			headers: {'X-Pelican-Coordinate': `lat=${point.latitude},long=${point.longitude}`},
		})
		const link = response.headers.get('link') ?? ''

		// Each entry looks like <https://host:port/path>; rel="duplicate"; pri=1; depth=2
		return [...link.matchAll(/<([^>]+)>[^,]*?pri=(\d+)/g)]
			.sort((a, b) => Number(a[2]) - Number(b[2]))
			.map(match => new URL(match[1]).host)
	} catch {
		return []
	}
}

export const getCacheSelections = async (pointCount: number, choiceCount = 3, concurrency = 10): Promise<CacheSelection[]> => {
	const servers = await getDirectorServers()
	const cachesByHost = servers
		.filter(server => server.type === 'Cache')
		.reduce((acc, server) => {
			acc[new URL(server.url).host] = server
			return acc
		}, {} as Record<string, DirectorServer>)

	const cells = getLandGridCells(pointCount)
	const selections: CacheSelection[] = []

	// Work through the grid in small batches to be gentle on the director
	for (let i = 0; i < cells.length; i += concurrency) {
		const batch = cells.slice(i, i + concurrency)
		const hostLists = await Promise.all(batch.map(x => getSelectedCacheHosts(x.point)))
		hostLists.forEach((hosts, j) => {
			if (hosts.length) {
				// Unknown hosts stay as null so each choice keeps its true rank
				selections.push({
					...batch[j],
					caches: hosts.slice(0, choiceCount).map(host => cachesByHost[host] ?? null),
				})
			}
		})
	}

	return selections
}

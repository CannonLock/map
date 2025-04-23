import {ResourceGroup, Institution, LatLong} from "@/app/type";

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

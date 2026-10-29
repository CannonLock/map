// Minimal typings for the parts of d3-geo-voronoi we use, the package ships without any
declare module 'd3-geo-voronoi' {
	import type {FeatureCollection, Polygon} from 'geojson';

	interface GeoVoronoi<T> {
		// Each feature's properties.site is the datum it was built from
		polygons(): FeatureCollection<Polygon, {site: T; sitecoordinates: [number, number]}>;
	}

	export function geoVoronoi<T = [number, number]>(data: T[]): GeoVoronoi<T>;
}

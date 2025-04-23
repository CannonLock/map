import {ReactElement} from "react";

export type ResourceContact = {
	CILogonID: string | null;
	ContactRank: string;
	Name: string;
};

export type ContactList = {
	ContactType: string;
	Contacts: {
		Contact: ResourceContact[];
	};
};

export type ResourceService = {
	Description: string;
	Details: string | null;
	ID: number;
	Name: string;
};

export type Resource = {
	Active: boolean;
	ContactLists: {
		ContactList: ContactList[];
	};
	Description: string;
	Disable: boolean;
	FQDN: string;
	FQDNAliases: string | null;
	ID: number;
	IsCCStar: boolean;
	Name: string;
	Services: {
		Service: ResourceService[];
	};
	Tags: string | null;
	VOOwnership: string;
	WLCGInformation: string;
};

export type Facility = {
	ID: number;
	InstitutionID: string;
	IsCCStar: boolean;
	Name: string;
};

export type Site = {
	AddressLine1: string;
	City: string;
	Country: string;
	Description: string;
	ID: number;
	IsCCStar: boolean;
	Latitude: number;
	LongName: string;
	Longitude: number;
	Name: string;
	Zipcode: string;
};

export type SupportCenter = {
	ID: number;
	Name: string;
};

export type ResourceGroup = {
	Disable: boolean;
	Facility: Facility;
	GridType: string;
	GroupDescription: string;
	GroupID: number;
	GroupName: string;
	IsCCStar: boolean;
	Production: boolean;
	Resources: {
		Resource: Resource[];
	};
	Site: Site;
	SupportCenter: SupportCenter;
};

export type Institution = {
	name: string;
	id: string;
	ror_id: string;
	unitid: string | null;
	longitude: number;
	latitude: number;
	ipeds_metadata: unknown | null;
	carnegie_metadata: unknown | null;
};

export type MarkerProps = {
	offset: [number, number];
	latitude: number;
	longitude: number;
	icon: ReactElement;
	id: string;
	color: string;
}

export type LatLong = {
	latitude: number;
	longitude: number;
}
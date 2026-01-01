export type ProfileViewProps = {
	userid: string | null;
	user: {
		Name: string;
		Bio: string;
		Avatar: string | null;
		Posts: number | null;
		Followers: number | null;
		Following: number | null;
		Connections: number | null;
		// skills: {
		//     frontend: [],
		//     backend: [],
		//     tools: [],
		// },
		skills: [];
		interests: [];
		verified: boolean;
		currentlyWorkingOn: string;
		lookingFor: string;
		availability: string;
		lookingToConnectWith: string[] | null;
		Projects: number | null;
		Hackathons: number | null;
		skillMatches: number | null;
	};
	isOwner: boolean;
};
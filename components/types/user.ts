export type User = {
	user: {
		uid: string | null;
		username: string | null;
		Name: string | undefined;
		Bio: string | null;
		Avatar: string | null;
		Posts: number | null;
		Followers: number | null;
		Following: number | null;
		Connections: number | null;
		Skills: {
			Languages: string[];
			Frameworks: string[];
			Platforms: string[];
			Tools: string[];
		};
		interests: string[];
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

export type UserTile = {
	uid: string;
	username: string;
	Name: string;
	Avatar: string;
	verified: boolean;
}

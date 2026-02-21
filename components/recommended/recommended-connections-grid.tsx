"use client";

import { UserCard } from "./user-card";

type Props = {
	users: any[];
	onConnect: (userId: string) => void;
};

export function RecommendedConnectionsGrid({ users, onConnect }: Props) {
	if (!users || !users.length) {
		return (
			<div className="text-sm text-muted-foreground">
				No users found. Try adjusting your search or filter.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{users.map((u) => (
				<UserCard
					key={u.uid || u.id}
					user={{
						id: u.uid || u.id,
						name: u.Name || u.name,
						avatar: u.Avatar || u.avatar,
						bio: u.Bio || u.bio,
						skills: u.interests || u.skills || [],
					} as any}
					onConnect={onConnect}
				/>
			))}
		</div>
	);
}

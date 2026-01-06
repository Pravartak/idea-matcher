// components/profile/ProfileViewServer.tsx
import ProfileView from "./ProfileView";

export default function ProfileViewServer({
	user,
	isOwner,
	posts,
}: {
	user: any;
	isOwner: boolean;
	posts: any;
}) {
	return <ProfileView user={user} isOwner={isOwner} posts={posts}/>;
}

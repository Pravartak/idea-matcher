// components/profile/ProfileViewServer.tsx
import ProfileView from "./ProfileView";

export default function ProfileViewServer({
	user,
	userid,
	isOwner,
}: {
	user: any;
	userid: string;
	isOwner: boolean;
}) {
	return <ProfileView user={user} userid={userid} isOwner={isOwner} />;
}

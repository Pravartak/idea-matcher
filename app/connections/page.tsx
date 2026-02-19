"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	ArrowLeft,
	UserPlus,
	CheckCircle,
	Bell,
	Search,
	X,
} from "lucide-react";
import { UserTile } from "@/components/types/user";
import { auth, db } from "@/lib/firebase";
import {
	doc,
	getDoc,
	arrayUnion,
	arrayRemove,
	writeBatch,
	increment,
} from "firebase/firestore";

interface User {
	id: string;
	name: string;
	username: string;
	avatar: string;
	verified: boolean;
	role?: string;
	skills?: string[];
	matchPercentage?: number;
}

type ConnectionList = "connect" | "requested" | "requests" | "connected";

export default function Connections() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [showRequests, setShowRequests] = useState(false);
	const [userConnectionStatus, setUserConnectionStatus] = useState<
		Record<string, ConnectionList>
	>({});
	const [userConnections, setUserConnections] = useState<UserTile[]>([]);
	const [userRequests, setUserRequests] = useState<any[]>([]);

	// Lock scroll when dropdown is open
	useEffect(() => {
		if (showRequests) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [showRequests]);

	// Mock data for recommended connections
	const recommendedUsers: User[] = [
		{
			id: "5",
			name: "Pratik Sharma",
			username: "pratiksharma",
			avatar: "/placeholder.svg",
			verified: false,
			role: "Developer",
			skills: ["React", "TypeScript"],
			matchPercentage: 85,
		},
		{
			id: "6",
			name: "Zahid Ahmed",
			username: "zahidahmed",
			avatar: "/placeholder.svg",
			verified: true,
			role: "Designer",
			skills: ["Design"],
			matchPercentage: 90,
		},
		{
			id: "7",
			name: "Malhar Patel",
			username: "malharpatel",
			avatar: "/placeholder.svg",
			verified: false,
			role: "Developer",
			skills: ["Node.js"],
			matchPercentage: 75,
		},
		{
			id: "8",
			name: "Simran Kaur",
			username: "simrankaur",
			avatar: "/placeholder.svg",
			verified: true,
			role: "Developer",
			skills: ["Python"],
			matchPercentage: 80,
		},
		{
			id: "9",
			name: "Saloni Verma",
			username: "saloniverma",
			avatar: "/placeholder.svg",
			verified: false,
			role: "Designer",
			skills: ["Design"],
			matchPercentage: 95,
		},
		{
			id: "10",
			name: "Arjun Reddy",
			username: "arjunreddy",
			avatar: "/placeholder.svg",
			verified: true,
			role: "Developer",
			skills: ["React"],
			matchPercentage: 80,
		},
	];

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			if (user) {
				try {
					const userDoc = await getDoc(doc(db, "Connections", user.uid));
					if (userDoc.exists()) {
						const userData = userDoc.data();
						const connectedUids = userData.Connected || [];
						const sentRequestsUids = userData.SentRequests || [];
						const incomingRequestUids = userData.Requests || [];

						const statuses: Record<string, ConnectionList> = {};
						connectedUids.forEach(
							(uid: string) => (statuses[uid] = "connected"),
						);
						incomingRequestUids.forEach(
							(uid: string) => (statuses[uid] = "requests"),
						);
						sentRequestsUids.forEach(
							(uid: string) => (statuses[uid] = "requested"),
						);
						setUserConnectionStatus(statuses);

						const fetchUserProfiles = async (uids: string[]) => {
							if (!uids || uids.length === 0) return [];
							const userSnaps = await Promise.all(
								uids.map((uid) => getDoc(doc(db, "users", uid))),
							);
							return userSnaps
								.filter((snap) => snap.exists())
								.map(
									(snap) =>
										({ uid: snap.id, ...snap.data() }) as unknown as UserTile,
								);
						};

						const [fetchedConnections, fetchedRequests] = await Promise.all([
							fetchUserProfiles(connectedUids),
							fetchUserProfiles(incomingRequestUids),
						]);

						setUserConnections(fetchedConnections);
						setUserRequests(fetchedRequests);
					}
				} catch (error: any) {
					console.error("Error fetching user profile:", error);
					if (error.code === "permission-denied") {
						console.error(
							"Check Firestore security rules for 'Connections' and 'users' collections.",
						);
					}
				}
			}
		});
		return () => unsubscribe();
	}, []);

	const clearSearch = () => {
		setSearchQuery("");
	};

	const handleConnectAction = async (targetUid: string) => {
		const viewerUid = auth.currentUser?.uid;
		if (!viewerUid) return;

		const currentStatus = userConnectionStatus[targetUid] || "connect";
		const viewerRef = doc(db, "Connections", viewerUid);
		const targetRef = doc(db, "Connections", targetUid);
		const viewerUserRef = doc(db, "users", viewerUid);
		const targetUserRef = doc(db, "users", targetUid);

		const updateLocalStatus = (status?: ConnectionList) => {
			setUserConnectionStatus((prev) => {
				const next = { ...prev };
				if (status) next[targetUid] = status;
				else delete next[targetUid];
				return next;
			});
		};

		try {
			const batch = writeBatch(db);

			if (currentStatus === "connect") {
				batch.set(
					viewerRef,
					{ SentRequests: arrayUnion(targetUid) },
					{ merge: true },
				);
				batch.set(
					targetRef,
					{ Requests: arrayUnion(viewerUid) },
					{ merge: true },
				);
				await batch.commit();
				updateLocalStatus("requested");
			} else if (currentStatus === "requested") {
				batch.update(viewerRef, { SentRequests: arrayRemove(targetUid) });
				batch.update(targetRef, { Requests: arrayRemove(viewerUid) });
				await batch.commit();
				updateLocalStatus(undefined);
			} else if (currentStatus === "connected") {
				const confirm = window.confirm("Are you sure you want to disconnect?");
				if (!confirm) return;

				batch.update(viewerRef, { Connected: arrayRemove(targetUid) });
				batch.update(targetRef, { Connected: arrayRemove(viewerUid) });
				batch.update(viewerUserRef, { Connections: increment(-1) });
				batch.update(targetUserRef, { Connections: increment(-1) });
				await batch.commit();

				updateLocalStatus(undefined);
				setUserConnections((prev) => prev.filter((u) => u.uid !== targetUid));
			} else if (currentStatus === "requests") {
				// Accept request
				batch.set(
					viewerRef,
					{
						Connected: arrayUnion(targetUid),
						Requests: arrayRemove(targetUid),
					},
					{ merge: true },
				);
				batch.set(
					targetRef,
					{
						Connected: arrayUnion(viewerUid),
						SentRequests: arrayRemove(viewerUid),
					},
					{ merge: true },
				);
				batch.update(viewerUserRef, { Connections: increment(1) });
				batch.update(targetUserRef, { Connections: increment(1) });
				await batch.commit();

				updateLocalStatus("connected");
				const acceptedUser = userRequests.find((u) => u.uid === targetUid);
				if (acceptedUser) {
					setUserRequests((prev) => prev.filter((u) => u.uid !== targetUid));
					setUserConnections((prev) => [...prev, acceptedUser]);
				}
			}
		} catch (error) {
			console.error("Error updating connection status:", error);
		}
	};

	const handleRejectAction = async (targetUid: string) => {
		const viewerUid = auth.currentUser?.uid;
		if (!viewerUid) return;

		const viewerRef = doc(db, "Connections", viewerUid);
		const targetRef = doc(db, "Connections", targetUid);

		try {
			const batch = writeBatch(db);
			batch.update(viewerRef, { Requests: arrayRemove(targetUid) });
			batch.update(targetRef, { SentRequests: arrayRemove(viewerUid) });
			await batch.commit();

			setUserConnectionStatus((prev) => {
				const next = { ...prev };
				delete next[targetUid];
				return next;
			});
			setUserRequests((prev) => prev.filter((u) => u.uid !== targetUid));
		} catch (error) {
			console.error("Error rejecting request:", error);
		}
	};

	// Filtering logic for recommended users
	const filteredRecommendedUsers = searchQuery.trim()
		? recommendedUsers.filter((user) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					user.name.toLowerCase().includes(searchLower) ||
					user.username.toLowerCase().includes(searchLower)
				);
			})
		: recommendedUsers;

	const getConnectionButtonText = (userId: string) => {
		const status = userConnectionStatus[userId];
		switch (status) {
			case "requested":
				return "Requested";
			case "connected":
				return "Connected";
			case "requests":
				return "Accept";
			default:
				return "Connect";
		}
	};

	const getConnectionButtonVariant = (
		userId: string,
	): "default" | "outline" | "secondary" => {
		const status = userConnectionStatus[userId];
		if (status === "connected") return "secondary";
		return status === "requested" ? "outline" : "default";
	};

	const UserCard = ({ user }: { user: any }) => {
		// Normalize user data (handle differences between Firestore and Mock data)
		const uid = user.uid || user.id;
		const name = user.Name || user.name || "Unknown";
		const username = user.username || "";
		const avatar =
			user.Avatar || user.avatar || user.photoURL || "/placeholder.svg";
		const isVerified = user.verified;

		return (
			<div
				onClick={() => router.push(`/u/${uid}`)}
				className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
				<Avatar>
					<AvatarImage src={avatar} alt={name} />
					<AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<p className="font-mono font-medium text-sm">{name}</p>
						{isVerified && <CheckCircle className="h-3.5 w-3.5 text-primary" />}
					</div>
					<p className="text-xs text-muted-foreground">{username}</p>
				</div>

				{userConnectionStatus[uid] === "requests" && (
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							handleRejectAction(uid);
						}}
						className="h-8 w-8 text-muted-foreground hover:text-destructive mr-2">
						<X className="h-4 w-4" />
					</Button>
				)}
				<Button
					variant={getConnectionButtonVariant(uid)}
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						handleConnectAction(uid);
					}}
					className="flex-shrink-0">
					{userConnectionStatus[uid] === "connect" && (
						<UserPlus className="h-4 w-4 mr-2" />
					)}
					{getConnectionButtonText(uid)}
				</Button>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col overflow-hidden">
			{/* Main Content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Header */}
				<div className="sticky top-0 bg-background border-b border-border z-10">
					<div className="max-w-4xl mx-auto w-full px-4 py-4 flex items-center justify-between">
						<button
							onClick={() => router.back()}
							className="p-2 hover:bg-muted rounded-lg transition-colors"
							aria-label="Go back">
							<ArrowLeft className="h-5 w-5" />
						</button>
						<h1 className="text-lg font-mono font-bold">IdeaMatcher</h1>
						<div className="relative">
							<Button
								size="icon"
								variant="ghost"
								onClick={() => setShowRequests(!showRequests)}
								className="relative">
								<Bell className="h-5 w-5" />
								{userRequests.length > 0 && (
									<span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
								)}
							</Button>

							{/* Requests Dropdown */}
							{showRequests && (
								<div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto z-30">
									<h3 className="font-mono font-bold mb-4">
										Connection Requests
									</h3>
									{userRequests.length > 0 ? (
										userRequests.map((user) => (
											<UserCard key={user.uid} user={user} />
										))
									) : (
										<p className="text-sm text-muted-foreground text-center py-4">
											No connection requests
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Main Content Wrapper */}
				<main className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6 scrollbar-hide">
					{/* Search Bar */}
					<div className="relative mb-8">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search connections..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-card border-border font-mono text-sm"
						/>
						{searchQuery && (
							<button
								onClick={clearSearch}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors">
								<X className="h-4 w-4 text-muted-foreground" />
							</button>
						)}
					</div>

					{/* Your Connections Section */}
					<section className="mb-12">
						<h2 className="font-mono text-lg font-bold mb-4">
							Your Connections ({userConnections.length})
						</h2>
						{userConnections.length > 0 ? (
							<div className="space-y-3">
								{userConnections.map((user) => (
									<UserCard key={user.uid} user={user} />
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground font-mono">
								No connections found
							</div>
						)}
					</section>

					{/* Recommended Connections Section */}
					<section>
						<h2 className="font-mono text-lg font-bold mb-4">
							Recommended Connections ({filteredRecommendedUsers.length})
						</h2>
						{filteredRecommendedUsers.length > 0 ? (
							<div className="space-y-3">
								{filteredRecommendedUsers.map((user) => (
									<UserCard key={user.id} user={user} />
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground font-mono">
								No recommended connections found
							</div>
						)}
					</section>
				</main>
			</div>
		</div>
	);
}

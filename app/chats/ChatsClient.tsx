"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Search,
	X,
	ArrowLeft,
	Plus,
	CheckCircle,
	MessageSquare,
	Clock,
	Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import {
	collection,
	getDocs,
	limit,
	query,
	where,
	doc,
	getDoc,
	onSnapshot,
} from "firebase/firestore";
import { UserTile } from "@/components/types/user";
import { ChatTileProps } from "@/components/chatComponents/ChatComponents";
import { toggleConnectionStatus } from "@/components/profile/ProfileView";

type ConnectionStatus = "notConnected" | "requested" | "connected" | "incomingRequest";

const formatTimeAgo = (timestamp: string) => {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
	return date.toLocaleDateString();
};

export default function InboxPage({
	initialChats,
}: {
	initialChats: ChatTileProps[];
}) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [chats, setChats] = useState<ChatTileProps[]>(initialChats);
	const [filteredChats, setFilteredChats] = useState<ChatTileProps[]>(initialChats);
	const [searchUserResults, setSearchUserResults] = useState<UserTile[]>([]);
	const [isSearchingUsers, setIsSearchingUsers] = useState(false);
	const [viewerUsername, setViewerUsername] = useState<string | null>(null);
	const [showNewChatView, setShowNewChatView] = useState(false);
	const [connections, setConnections] = useState<UserTile[]>([]);
	const [suggestedUsers, setSuggestedUsers] = useState<UserTile[]>([]);
	const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({});
	const [currentUser, setCurrentUser] = useState<any>(null);

	useEffect(() => {
		setChats(initialChats);
		setFilteredChats(initialChats);
	}, [initialChats]);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			setCurrentUser(user);
			if (user) {
				try {
					const userDoc = await getDoc(doc(db, "users", user.uid));
					if (userDoc.exists()) {
						setViewerUsername(
							userDoc.data().username || user.displayName || "Guest",
						);
					} else {
						setViewerUsername(user.displayName || "Guest");
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
				}
			} else {
				setChats([]);
				setFilteredChats([]);
			}
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!currentUser) return;

		const q = query(
			collection(db, "Conversations"),
			where("members", "array-contains", currentUser.uid)
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const chatPromises = snapshot.docs.map(async (docSnapshot) => {
				const data = docSnapshot.data();
				const otherUserId = data.members.find((uid: string) => uid !== currentUser.uid) || currentUser.uid;
				
				let otherUserData = { name: "Unknown", username: "unknown", avatar: "" };
				if (otherUserId) {
					try {
						const userDocRef = doc(db, "users", otherUserId);
						const userDocSnap = await getDoc(userDocRef);
						if (userDocSnap.exists()) {
							const userData = userDocSnap.data();
							otherUserData = {
								name: userData.Name || "Unknown",
								username: userData.username || "unknown",
								avatar: userData.Avatar || userData.avatar || "placeholder.svg",
							};
						}
					} catch (e) {
						console.error("Error fetching other user", e);
					}
				}

				return {
					id: docSnapshot.id,
					name: otherUserId === currentUser.uid ? `${otherUserData.name} (You)` : otherUserData.name,
					username: otherUserData.username,
					avatar: otherUserData.avatar,
					lastMessage: data.lastMessage || "",
					timestamp: data.lastMessageAt ? data.lastMessageAt.toDate().toISOString() : new Date().toISOString(),
					unread: data.unreadCount?.[currentUser.uid] || 0,
					verified: data.verified || false,
					members: data.members
				} as ChatTileProps;
			});

			const resolvedChats = await Promise.all(chatPromises);
			resolvedChats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
			setChats(resolvedChats);
		});

		return () => unsubscribe();
	}, [currentUser]);

	useEffect(() => {
		if (!searchQuery) {
			setFilteredChats(chats);
		}
	}, [chats, searchQuery]);

	const handleSearch = async (searchTerm: string) => {
		setSearchQuery(searchTerm);

		if (!searchTerm.trim()) {
			setFilteredChats(chats);
			setSearchUserResults([]);
			setIsSearchingUsers(false);
			return;
		}

		const keywords = searchTerm
			.toLowerCase()
			.split(/\s+/)
			.filter((k) => k.length > 0);

		try {
			// Search for users in Firestore
			const usersRef = collection(db, "users");

			// Query by username
			const usernameQuery = query(
				usersRef,
				where("username", ">=", searchTerm),
				where("username", "<=", searchTerm + "\uf8ff"),
				limit(10),
			);

			// Query by Name
			const nameQuery = query(
				usersRef,
				where("Name", ">=", searchTerm),
				where("Name", "<=", searchTerm + "\uf8ff"),
				limit(10),
			);

			const [usernameSnapshot, nameSnapshot] = await Promise.all([
				getDocs(usernameQuery),
				getDocs(nameQuery),
			]);

			// Combine results and remove duplicates
			const usersMap = new Map<string, UserTile>();
			const addToMap = (doc: any) => {
				usersMap.set(doc.id, {
					uid: doc.id,
					...doc.data(),
				} as UserTile);
			};

			usernameSnapshot.docs.forEach(addToMap);
			nameSnapshot.docs.forEach(addToMap);

			const matchedUsers = Array.from(usersMap.values());

			if (matchedUsers.length > 0) {
				setSearchUserResults(matchedUsers);
				setIsSearchingUsers(true);
				setFilteredChats([]);
			} else {
				// If no users found, search in chats
				const filtered = chats.filter((chat) => {
					const searchableContent =
						`${chat.name} ${chat.username} ${chat.lastMessage}`.toLowerCase();
					return keywords.every((keyword) =>
						searchableContent.includes(keyword),
					);
				});
				setFilteredChats(filtered);
				setSearchUserResults([]);
				setIsSearchingUsers(false);
			}
		} catch (error) {
			console.error("Error searching users:", error);
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
		setFilteredChats(chats);
		setSearchUserResults([]);
		setIsSearchingUsers(false);
	};

	const getConnectionButtonText = (userId: string) => {
		const status = connectionStatuses[userId] || "notConnected";
		switch (status) {
			case "connected":
				return "Connected";
			case "requested":
				return "Requested";
			case "incomingRequest":
				return "Accept";
			default:
				return "Connect";
		}
	};

	const getConnectionButtonVariant = (
		userId: string,
	): "default" | "outline" => {
		const status = connectionStatuses[userId] || "notConnected";
		switch (status) {
			case "connected":
				return "outline";
			case "requested":
				return "outline";
			case "incomingRequest":
				return "default"; // Or a distinct style for accept
			default:
				return "default";
		}
	};

	const toggleNewChatView = async () => {
		if (!showNewChatView) {
			setShowNewChatView(true);
			try {
				// Fetch current user's connections to determine status
				const currentUser = auth.currentUser;
				const currentStatuses: Record<string, ConnectionStatus> = {};
				
				if (currentUser) {
					const connectionsRef = doc(db, "Connections", currentUser.uid);
					const connectionsSnap = await getDoc(connectionsRef);
					if (connectionsSnap.exists()) {
						const data = connectionsSnap.data();
						data.Connected?.forEach((uid: string) => currentStatuses[uid] = "connected");
						data.SentRequests?.forEach((uid: string) => currentStatuses[uid] = "requested");
						data.Requests?.forEach((uid: string) => currentStatuses[uid] = "incomingRequest");
					}
				}
				
				setConnectionStatuses(currentStatuses);

				// Fetch users
				const usersRef = collection(db, "users");
				const q = query(usersRef, limit(20));
				const querySnapshot = await getDocs(q);
				const fetchedUsers = querySnapshot.docs.map((doc) => ({
					uid: doc.id,
					...doc.data(),
				})) as UserTile[];

				const newConnections: UserTile[] = [];
				const newSuggested: UserTile[] = [];

				fetchedUsers.forEach((user) => {
					if (auth.currentUser && user.uid === auth.currentUser.uid) return;

					const status = currentStatuses[user.uid] || "notConnected";
					if (status === "connected") {
						newConnections.push(user);
					} else {
						newSuggested.push(user);
					}
				});

				setConnections(newConnections);
				setSuggestedUsers(newSuggested);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		} else {
			setShowNewChatView(false);
		}
	};

	const handleConnectAction = async (targetUid: string) => {
		const viewerUid = auth.currentUser?.uid;
		if (!viewerUid) return;

		const currentStatus = connectionStatuses[targetUid] || "notConnected";
		const newStatus = await toggleConnectionStatus(
			targetUid,
			viewerUid,
			currentStatus,
		);

		if (newStatus) {
			setConnectionStatuses((prev) => ({
				...prev,
				[targetUid]: newStatus as ConnectionStatus,
			}));
		}
	};

	const renderUserItem = (user: UserTile) => (
		<div
			key={user.uid}
			className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
			<Avatar>
				<AvatarImage
					src={
						user.Avatar ||
						(user as any).avatar ||
						(user as any).photoURL ||
						(user as any).profilePic ||
						(user as any).image ||
						"/placeholder.svg"
					}
					alt={user.Name}
				/>
				<AvatarFallback>{(user.Name || "?").slice(0, 2)}</AvatarFallback>
			</Avatar>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<p className="font-mono font-medium text-sm">{user.Name}</p>
					{user.verified && (
						<CheckCircle className="h-3.5 w-3.5 text-primary" />
					)}
				</div>
				<p className="text-xs text-muted-foreground">{user.username}</p>
			</div>

			{connectionStatuses[user.uid] === "connected" && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push(`/c/${user.username}`)}
					className="mr-2">
					<MessageSquare className="h-4 w-4" />
				</Button>
			)}

			<Button
				variant={getConnectionButtonVariant(user.uid)}
				size="sm"
				onClick={() => handleConnectAction(user.uid)}
				className="flex-shrink-0">
				{getConnectionButtonText(user.uid)}
			</Button>
		</div>
	);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Top Header */}
			<div className="sticky top-0 bg-background border-b border-border z-10">
				<div className="max-w-2xl mx-auto w-full px-4 py-4 flex items-center justify-between">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-muted rounded-lg transition-colors"
						aria-label="Go back">
						<ArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-lg font-mono font-bold">{viewerUsername}</h1>
					<Button size="icon" variant="ghost" onClick={toggleNewChatView}>
						<Plus
							className={`h-5 w-5 transition-transform ${showNewChatView ? "rotate-45" : ""}`}
						/>
					</Button>
				</div>
			</div>

			<div className="max-w-2xl mx-auto w-full px-4 py-8">
				{/* Search Bar */}
				<div className="relative mb-8">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						className="pl-10 pr-10 py-2 font-mono border-border"
					/>
					{searchQuery && (
						<button
							onClick={clearSearch}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors">
							<X className="h-4 w-4 text-muted-foreground" />
						</button>
					)}
				</div>

				{/* User Search Results */}
				{isSearchingUsers && searchUserResults.length > 0 && (
					<div className="space-y-2">
						<h3 className="text-sm font-mono font-bold mb-4">Users</h3>
						{searchUserResults.map(renderUserItem)}
					</div>
				)}

				{/* New Chat View (Connections & Suggestions) */}
				{!isSearchingUsers && showNewChatView && (
					<div className="space-y-6">
						{connections.length > 0 && (
							<div className="space-y-2">
								<h3 className="text-sm font-mono font-bold text-muted-foreground">
									Connections
								</h3>
								{connections.map(renderUserItem)}
							</div>
						)}

						<div className="space-y-2">
							<h3 className="text-sm font-mono font-bold text-muted-foreground">
								Suggested
							</h3>
							{suggestedUsers.map(renderUserItem)}
						</div>
					</div>
				)}

				{/* Chat List */}
				{!isSearchingUsers && !showNewChatView && (
					<div className="space-y-2">
						{filteredChats.length === 0 ? (
							searchQuery ? (
								<div className="py-12 text-center">
									<p className="text-muted-foreground font-mono">
										No chats found for "{searchQuery}"
									</p>
								</div>
							) : (
								<div className="py-12 text-center">
									<MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
									<p className="text-muted-foreground font-mono">
										No conversations yet
									</p>
								</div>
							)
						) : (
							filteredChats.map((chat) => (
								<div
									key={chat.id}
									className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
									onClick={() => router.push(`c/${chat.username}`)}>
									{/* Avatar */}
									<div className="relative">
										<Avatar>
											<AvatarImage
												src={chat.avatar || "/placeholder.svg"}
												alt={chat.name}
											/>
											<AvatarFallback>
												{(chat.name || "?").slice(0, 2)}
											</AvatarFallback>
										</Avatar>
									</div>

									{/* Chat Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<div className="flex items-center gap-2">
												<p className="font-mono font-medium text-sm">
													{chat.name}
												</p>
												{chat.verified && (
													<CheckCircle className="h-3.5 w-3.5 text-primary" />
												)}
											</div>
											<p className="text-xs text-muted-foreground font-mono flex-shrink-0">
												{formatTimeAgo(chat.timestamp)}
											</p>
										</div>
										<div className="flex items-center justify-between">
											<p className="text-xs text-muted-foreground truncate">
												{chat.lastMessage}
											</p>
											{chat.unread > 0 && (
												<div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center ml-2 flex-shrink-0">
													<span className="text-xs font-mono font-bold text-white">
														{chat.unread > 9 ? "9+" : chat.unread}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
}

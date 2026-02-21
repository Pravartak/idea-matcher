"use client";

import {
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	VolumeX,
	Volume2,
	MoreHorizontal,
	Heart,
	MessageCircle,
	Share2,
	Bookmark,
	Trash2,
	UserMinus,
	Flag,
	Link as LinkIcon,
	Pencil,
	X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
	updateDoc,
	doc,
	setDoc,
	increment,
	getDoc,
	addDoc,
	getDocs,
	deleteDoc,
	deleteField,
	query,
	orderBy,
	collection,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPortal } from "react-dom";
import { deleteObject, ref } from "firebase/storage";

export interface PostMedia {
	type: "image" | "video" | "audio";
	url: string;
	path: string; // storage path

	alt?: string; // for images (accessibility)
	thumbnail?: string; // for video/audio preview
	duration?: number; // for audio/video (seconds)
}

export type Posts = {
	id: string[] | any[];
};

export interface Post {
	id: string;
	authorUid: string;

	author: {
		name: string;
		username: string;
		avatar: string;
		verified: boolean;
	};

	content: string;
	media?: PostMedia[];
	tags: string[] | undefined;

	likesCount: number;
	commentsCount: number;
	sharesCount: number;

	createdAt: Date | number; // Date.now() timestamp
}

interface CommentBadgeType {
	type: "general" | "suggestion" | "question" | "insight" | "collaboration";
	label: string;
	icon: string;
	color: string;
}

interface Reply {
	id: string;
	author: {
		name: string;
		username: string;
		avatar: string;
		verified: boolean;
	};
	content: string;
	timestamp: string;
	likes: string[];
}

interface Comment {
	id: string;
	authorUid: string;
	author: {
		name: string;
		username: string;
		avatar: string;
		verified: boolean;
	};
	content: string;
	badge: CommentBadgeType;
	timestamp: string;
	likes: string[];
	replies?: Reply[];
	createdAt?: any;
}

const commentBadgeTypes: Record<string, CommentBadgeType> = {
	general: {
		type: "general",
		label: "General",
		icon: "💬",
		color: "bg-blue-900/40 text-blue-300 border-blue-700/50",
	},
	suggestion: {
		type: "suggestion",
		label: "Suggestion",
		icon: "💡",
		color: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
	},
	question: {
		type: "question",
		label: "Question",
		icon: "❓",
		color: "bg-purple-900/40 text-purple-300 border-purple-700/50",
	},
	insight: {
		type: "insight",
		label: "Insight",
		icon: "✨",
		color: "bg-green-900/40 text-green-300 border-green-700/50",
	},
	collaboration: {
		type: "collaboration",
		label: "Collaboration",
		icon: "🤝",
		color: "bg-pink-900/40 text-pink-300 border-pink-700/50",
	},
};

export function MediaCarousel({ media }: { media: PostMedia[] }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	if (media.length === 1) {
		return <MediaItem media={media[0]} />;
	}

	return (
		<div className="relative">
			<MediaItem media={media[currentIndex]} />
			{media.length > 1 && (
				<>
					<button
						onClick={() =>
							setCurrentIndex((prev) =>
								prev > 0 ? prev - 1 : media.length - 1,
							)
						}
						className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors">
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button
						onClick={() =>
							setCurrentIndex((prev) =>
								prev < media.length - 1 ? prev + 1 : 0,
							)
						}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors">
						<ChevronRight className="w-5 h-5" />
					</button>
					<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
						{media.map((_, idx) => (
							<span
								key={idx}
								className={`w-2 h-2 rounded-full transition-colors ${
									idx === currentIndex ? "bg-primary" : "bg-muted-foreground/50"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

export function MediaItem({ media }: { media: PostMedia }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const mediaRef = useRef<HTMLMediaElement | null>(null);

	useEffect(() => {
		const mediaElement = mediaRef.current;
		if (!mediaElement) return;

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onEnded = () => setIsPlaying(false);
		const onTimeUpdate = () => setCurrentTime(mediaElement.currentTime);
		const onLoadedMetadata = () => setDuration(mediaElement.duration);
		const onVolumeChange = () => setIsMuted(mediaElement.muted);

		mediaElement.addEventListener("play", onPlay);
		mediaElement.addEventListener("pause", onPause);
		mediaElement.addEventListener("ended", onEnded);
		mediaElement.addEventListener("timeupdate", onTimeUpdate);
		mediaElement.addEventListener("loadedmetadata", onLoadedMetadata);
		mediaElement.addEventListener("volumechange", onVolumeChange);

		return () => {
			mediaElement.removeEventListener("play", onPlay);
			mediaElement.removeEventListener("pause", onPause);
			mediaElement.removeEventListener("ended", onEnded);
			mediaElement.removeEventListener("timeupdate", onTimeUpdate);
			mediaElement.removeEventListener("loadedmetadata", onLoadedMetadata);
			mediaElement.removeEventListener("volumechange", onVolumeChange);
		};
	}, [media.type]);

	const togglePlay = () => {
		if (mediaRef.current) {
			if (isPlaying) {
				mediaRef.current.pause();
			} else {
				mediaRef.current.play();
			}
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	if (media.type === "image") {
		return (
			<img
				src={media.url || "/placeholder.svg"}
				alt={media.alt || "Post image"}
				className="w-full h-auto object-cover max-h-96 rounded-lg"
			/>
		);
	}

	if (media.type === "video") {
		return (
			<div className="relative rounded-lg overflow-hidden bg-secondary">
				<video
					ref={mediaRef as any}
					src={media.url || "/placeholder.svg"}
					controls
					muted={isMuted}
					className="w-full h-auto object-cover max-h-96"
				/>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<button
						onClick={togglePlay}
						className="p-4 bg-primary/90 rounded-full hover:bg-primary transition-colors pointer-events-auto">
						{isPlaying ? (
							<Pause className="w-6 h-6" />
						) : (
							<Play className="w-6 h-6 ml-1" />
						)}
					</button>
				</div>
				<button
					onClick={() => setIsMuted(!isMuted)}
					className="absolute bottom-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors">
					{isMuted ? (
						<VolumeX className="w-4 h-4" />
					) : (
						<Volume2 className="w-4 h-4" />
					)}
				</button>
			</div>
		);
	}

	if (media.type === "audio") {
		return (
			<div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
				<audio ref={mediaRef as any} src={media.url} muted={isMuted} />
				<button
					onClick={togglePlay}
					className="p-3 bg-primary rounded-full hover:bg-primary/80 transition-colors">
					{isPlaying ? (
						<Pause className="w-5 h-5" />
					) : (
						<Play className="w-5 h-5 ml-0.5" />
					)}
				</button>
				<div className="flex-1">
					<div className="h-1 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-100"
							style={{
								width: `${duration ? (currentTime / duration) * 100 : 0}%`,
							}}
						/>
					</div>
					<div className="flex justify-between mt-1 font-mono text-xs text-muted-foreground">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration || media.duration || 0)}</span>
					</div>
				</div>
				<button
					onClick={() => setIsMuted(!isMuted)}
					className="p-2 hover:bg-muted rounded-full transition-colors">
					{isMuted ? (
						<VolumeX className="w-4 h-4" />
					) : (
						<Volume2 className="w-4 h-4" />
					)}
				</button>
			</div>
		);
	}

	return null;
}

export const PostCard = ({
	post,
	onDelete,
	GuestLoginDialog,
}: {
	post: Post;
	onDelete?: (id: string) => void;
	GuestLoginDialog?: React.ComponentType<{
		isOpen: boolean;
		onClose: () => void;
	}>;
}) => {
	const [isLiked, setIsLiked] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const [showDrawer, setShowDrawer] = useState(false);
	const [commentsOpen, setCommentsOpen] = useState(false);
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likesCount);
	const [commentsCount, setCommentsCount] = useState(post.commentsCount);
	const viewerUid = auth.currentUser?.uid;
	const isOwner = viewerUid === post.authorUid;

	useEffect(() => {
		// Disable zoom for all pages
		const meta = document.querySelector("meta[name='viewport']");
		const content =
			"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
		if (meta) {
			meta.setAttribute("content", content);
		} else {
			const newMeta = document.createElement("meta");
			newMeta.name = "viewport";
			newMeta.content = content;
			document.head.appendChild(newMeta);
		}
	}, []);

	useEffect(() => {
		if (!viewerUid) return;
		const checkLike = async () => {
			const likeRef = doc(db, "Posts", post.id, "likes", viewerUid);
			const likeSnap = await getDoc(likeRef);
			if (likeSnap.exists()) {
				setIsLiked(true);
			}

			// Check if following
			if (!isOwner) {
				const followersRef = doc(db, "followers", post.authorUid);
				const docSnap = await getDoc(followersRef);
				if (docSnap.exists() && docSnap.data()[viewerUid]) {
					setIsFollowing(true);
				}
			}
		};
		checkLike();
	}, [post.id, viewerUid, post.authorUid, isOwner]);

	const handleLike = async () => {
		if (!viewerUid) {
			setShowLoginDialog(true);
			return;
		}

		const postRef = doc(db, "Posts", post.id);
		const likeRef = doc(db, "Posts", post.id, "likes", viewerUid);

		if (isLiked) {
			setLikesCount((prev) => prev - 1);
			setIsLiked(false);
			await updateDoc(postRef, { likesCount: increment(-1) });
			await deleteDoc(likeRef);
		} else {
			setLikesCount((prev) => prev + 1);
			setIsLiked(true);
			await updateDoc(postRef, { likesCount: increment(1) });
			await setDoc(likeRef, { [viewerUid]: true });
		}
	};

	const handleBookmark = () => {
		if (!viewerUid) {
			setShowLoginDialog(true);
			return;
		}
		setIsBookmarked(!isBookmarked);
	};

	const handleDelete = async () => {
		const confirmDelete = confirm("Are you sure you want to delete this post?");
		if (!confirmDelete) return;

		try {
			if (post.media?.length) {
				await Promise.all(
					post.media.map((m) => {
						if (!m.path) return Promise.resolve();
						const mediaRef = ref(storage, m.path);
						return deleteObject(mediaRef);
					}),
				);
			}

			await deleteDoc(doc(db, "Posts", post.id));
			await updateDoc(doc(db, "users", post.authorUid), {
				Posts: increment(-1),
			});
			if (onDelete) onDelete(post.id);
			setShowDrawer(false);
		} catch (error) {
			console.error("Error deleting post:", error);
			alert("Failed to delete post. Please try again.");
		}
	};

	const handleUnfollow = async () => {
		if (!viewerUid) {
			setShowDrawer(false);
			setShowLoginDialog(true);
			return;
		}

		const userRef = doc(db, "users", post.authorUid);
		const followersRef = doc(db, "followers", post.authorUid);
		const viewerRef = doc(db, "users", viewerUid);

		try {
			await updateDoc(userRef, { Followers: increment(-1) });
			await updateDoc(followersRef, { [viewerUid]: deleteField() });
			await updateDoc(viewerRef, { Following: increment(-1) });
			setIsFollowing(false);
			setShowDrawer(false);
		} catch (error) {
			console.error("Error unfollowing:", error);
		}
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
		setShowDrawer(false);
	};

	return (
		<article className="bg-card border border-border rounded-xl p-4 md:p-5 min-w-0 overflow-hidden">
			{/* Post Header */}
			<div className="flex items-start justify-between mb-4">
				<Link
					href={`/u/${post.authorUid}`}
					className="flex items-center gap-3 hover:opacity-80 transition-opacity">
					<Avatar className="w-11 h-11">
						<AvatarImage
							src={post.author?.avatar || "/placeholder.svg"}
							alt={post.author?.name || "IdeaMatcher"}
						/>
						<AvatarFallback className="font-mono">
							{(post.author?.name || "IM")[0]}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-mono font-medium text-foreground">
								{post.author?.name || "Idea Matcher"}
							</span>
							{post.author.verified && (
								<span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
									Verified
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
							<span>{post.author.username}</span>
							<span>·</span>
							<span suppressHydrationWarning>
								{post.createdAt instanceof Date
									? post.createdAt.toLocaleString()
									: new Date(post.createdAt).toLocaleString()}
							</span>
						</div>
					</div>
				</Link>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowDrawer(true)}
					className="text-muted-foreground hover:text-foreground">
					<MoreHorizontal className="w-5 h-5" />
				</Button>
			</div>

			{/* Post Content */}
			<p className="font-mono text-sm text-foreground leading-relaxed mb-4 break-words">
				{post.content}
			</p>

			{/* Media */}
			{post.media && post.media.length > 0 && (
				<div className="mb-4">
					<MediaCarousel media={post.media} />
				</div>
			)}

			{/* Tags */}
			<div className="flex flex-wrap gap-2 mb-4">
				{post.tags?.map((tag: string) => (
					<span
						key={tag}
						className="px-2 py-1 bg-secondary text-muted-foreground text-xs font-mono rounded hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
						{tag}
					</span>
				))}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLike}
						className={`gap-2 font-mono text-xs ${
							isLiked
								? "text-red-500 hover:text-red-600"
								: "text-muted-foreground hover:text-foreground"
						}`}>
						<Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
						{likesCount}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setCommentsOpen(true)}
						className="gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
						<MessageCircle className="w-4 h-4" />
						{commentsCount}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
						<Share2 className="w-4 h-4" />
						{post.sharesCount}
					</Button>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleBookmark}
					className={`${
						isBookmarked
							? "text-primary hover:text-primary/90"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					<Bookmark
						className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
					/>
				</Button>
			</div>

			<PostOptionsDrawer
				isOpen={showDrawer}
				onClose={() => setShowDrawer(false)}
				postAuthorUid={post.authorUid}
				isOwner={isOwner}
				isFollowing={isFollowing}
				onDelete={handleDelete}
				onUnfollow={handleUnfollow}
				onCopyLink={handleCopyLink}
			/>
			<CommentsSection
				postId={post.id}
				isOpen={commentsOpen}
				postAuthorUid={post.authorUid}
				onClose={() => setCommentsOpen(false)}
				onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
				onCommentDeleted={() => setCommentsCount((prev) => prev - 1)}
				GuestLoginDialog={GuestLoginDialog}
			/>
			{GuestLoginDialog && (
				<GuestLoginDialog
					isOpen={showLoginDialog}
					onClose={() => setShowLoginDialog(false)}
				/>
			)}
		</article>
	);
};

function CommentsSection({
	postId,
	isOpen,
	onClose,
	postAuthorUid,
	onCommentAdded,
	onCommentDeleted,
	GuestLoginDialog,
}: {
	postId: string;
	isOpen: boolean;
	onClose: () => void;
	postAuthorUid: string;
	onCommentAdded?: () => void;
	onCommentDeleted?: () => void;
	GuestLoginDialog?: React.ComponentType<{
		isOpen: boolean;
		onClose: () => void;
	}>;
}) {
	const [drawerHeight, setDrawerHeight] = useState(60);
	const [isDragging, setIsDragging] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState<Comment[]>([]);
	const [selectedBadge, setSelectedBadge] = useState("general");
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [commentWithOptions, setCommentWithOptions] = useState<Comment | null>(
		null,
	);
	const [replyingTo, setReplyingTo] = useState<{
		id: string;
		username: string;
	} | null>(null);
	const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
	const viewerUid = auth.currentUser?.uid;

	const drawerHeightRef = useRef(drawerHeight);

	useEffect(() => {
		drawerHeightRef.current = drawerHeight;
	}, [drawerHeight]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		if (isDragging) {
			document.body.style.userSelect = "none";
		} else {
			document.body.style.userSelect = "";
		}
		return () => {
			document.body.style.userSelect = "";
		};
	}, [isDragging]);

	const handleDrawerStart = () => {
		setIsDragging(true);
	};

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const viewportHeight = window.innerHeight;
			const newHeight = ((viewportHeight - e.clientY) / viewportHeight) * 100;

			if (newHeight > 30 && newHeight < 95) {
				setDrawerHeight(newHeight);
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			const viewportHeight = window.innerHeight;
			const newHeight =
				((viewportHeight - e.touches[0].clientY) / viewportHeight) * 100;

			if (newHeight > 30 && newHeight < 95) {
				setDrawerHeight(newHeight);
			}
		};

		const handleDragEnd = () => {
			setIsDragging(false);
			if (drawerHeightRef.current < 62) {
				setDrawerHeight(50);
			} else {
				setDrawerHeight(90);
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("touchmove", handleTouchMove);
		window.addEventListener("touchend", handleDragEnd);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleDragEnd);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleDragEnd);
		};
	}, [isDragging]);

	const closeComments = () => {
		onClose();
		setNewComment("");
		setSelectedBadge("general");
		setReplyingTo(null);
	};

	useEffect(() => {
		if (!isOpen) return;
		const getComments = async () => {
			try {
				if (!postId) return;
				const q = query(collection(db, "Posts", postId, "comments"));
				const querySnapshot = await getDocs(q);
				const fetchedComments = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Comment[];

				// Sort client-side to avoid index issues on empty collections
				fetchedComments.sort((a, b) => {
					const timeA = a.createdAt?.seconds
						? a.createdAt.seconds
						: a.createdAt
							? new Date(a.createdAt).getTime() / 1000
							: 0;
					const timeB = b.createdAt?.seconds
						? b.createdAt.seconds
						: b.createdAt
							? new Date(b.createdAt).getTime() / 1000
							: 0;
					return timeB - timeA;
				});

				setComments(fetchedComments);
			} catch (error) {
				console.error("Error fetching comments:", error);
			}
		};
		getComments();
	}, [postId, isOpen]);

	useEffect(() => {
		if (!viewerUid || comments.length === 0) return;

		const checkLikes = () => {
			const newLiked = new Set<string>();
			comments.forEach((c) => {
				if (Array.isArray(c.likes) && c.likes.includes(viewerUid)) {
					newLiked.add(c.id);
				}
			});
			setLikedComments(newLiked);
		};

		checkLikes();
	}, [comments, viewerUid]);

	const handleAuthAction = (action: () => void) => {
		if (!auth.currentUser) {
			setShowLoginDialog(true);
			return;
		}
		action();
	};

	const addComment = async () => {
		if (!newComment.trim()) return;

		const viewer = auth.currentUser;

		if (!viewer) {
			setShowLoginDialog(true);
			return;
		}

		const commenter = doc(db, "users", viewer?.uid!);
		const commenterSnap = await getDoc(commenter);
		const commenterData = commenterSnap.data();

		const author = {
			name: commenterData?.Name || "IdeaMatcher User",
			username: commenterData?.username || "ideamatcheruser",
			avatar: commenterData?.Avatar || "/placeholder.svg",
			verified: commenterData?.verified || false,
		};

		if (replyingTo) {
			const reply: Reply = {
				id: Date.now().toString(),
				author,
				content: newComment,
				timestamp: new Date().toLocaleString(),
				likes: [],
			};

			const commentRef = doc(db, "Posts", postId, "comments", replyingTo.id);

			// Optimistic update
			setComments((prev) =>
				prev.map((c) => {
					if (c.id === replyingTo.id) {
						return { ...c, replies: [...(c.replies || []), reply] };
					}
					return c;
				}),
			);

			setNewComment("");
			setReplyingTo(null);

			try {
				await updateDoc(commentRef, {
					replies: arrayUnion(reply),
				});
			} catch (error) {
				console.error("Error adding reply:", error);
			}
		} else {
			const postRef = doc(db, "Posts", postId);
			const commentsRef = collection(db, "Posts", postId, "comments");
			const newCommentRef = doc(commentsRef);

			const newCommentData = {
				authorUid: viewer.uid,
				author,
				content: newComment,
				badge: commentBadgeTypes[selectedBadge],
				timestamp: new Date().getTime().toString(),
				createdAt: new Date(),
				likes: [],
				replies: [],
			};

			// Optimistic update
			setComments((prev) => [
				{ ...newCommentData, id: newCommentRef.id } as unknown as Comment,
				...prev,
			]);
			setNewComment("");

			try {
				await setDoc(newCommentRef, newCommentData);
				try {
					await updateDoc(postRef, {
						commentsCount: increment(1),
					});
					onCommentAdded?.();
				} catch (error) {
					console.error("Error updating comment count:", error);
					onCommentAdded?.();
				}
			} catch (error) {
				console.error("Error adding comment:", error);
				setComments((prev) => prev.filter((c) => c.id !== newCommentRef.id));
			}
		}
	};

	const toggleCommentLike = async (commentId: string) => {
		if (!viewerUid) {
			setShowLoginDialog(true);
			return;
		}

		const isLiked = likedComments.has(commentId);
		const commentRef = doc(db, "Posts", postId, "comments", commentId);

		setLikedComments((prev) => {
			const next = new Set(prev);
			if (isLiked) {
				next.delete(commentId);
			} else {
				next.add(commentId);
			}
			return next;
		});

		setComments((prev) =>
			prev.map((c) => {
				if (c.id === commentId) {
					const currentLikes = Array.isArray(c.likes) ? c.likes : [];
					const newLikes = isLiked
						? currentLikes.filter((uid) => uid !== viewerUid)
						: [...currentLikes, viewerUid];
					return { ...c, likes: newLikes };
				}
				return c;
			}),
		);

		try {
			if (isLiked) {
				await updateDoc(commentRef, { likes: arrayRemove(viewerUid) });
			} else {
				await updateDoc(commentRef, { likes: arrayUnion(viewerUid) });
			}
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const deleteComment = async (commentId: string) => {
		try {
			const commentRef = doc(db, "Posts", postId, "comments", commentId);
			await deleteDoc(commentRef);
			setComments((prev) => prev.filter((comment) => comment.id !== commentId));
			try {
				await updateDoc(doc(db, "Posts", postId), {
					commentsCount: increment(-1),
				});
				onCommentDeleted?.();
			} catch (error) {
				console.error("Error updating comment count:", error);
				onCommentDeleted?.();
			}
		} catch (error) {
			console.error("Error deleting comment:", error);
		}
	};

	if (!isOpen) return null;

	return createPortal(
		<>
			<div
				className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
				onClick={closeComments}
			/>
			<div
				style={{
					height: `${drawerHeight}vh`,
					maxWidth: "min(100%, 45rem)",
					left: "50%",
					transform: "translateX(-50%)",
				}}
				className={`fixed bottom-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl flex flex-col ${
					!isDragging ? "transition-all duration-300" : ""
				}`}>
				{/* Draggable Handle */}
				<div
					onMouseDown={handleDrawerStart}
					onTouchStart={handleDrawerStart}
					className="h-1 bg-muted rounded-full mx-auto my-3 w-12 cursor-grab active:cursor-grabbing touch-none"
				/>

				{/* Header */}
				<div className="flex items-center justify-between px-6 pb-4 border-b border-border">
					<h2 className="text-xl font-semibold">Comments</h2>
					<button
						onClick={closeComments}
						className="p-1 hover:bg-muted rounded-lg transition">
						<LinkIcon className="w-5 h-5" />
					</button>
				</div>

				{/* Comments Container */}
				<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
					<style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>

					{/* Comment */}
					{comments.map((comment) => (
						<div
							key={comment.id}
							id={`comment-${comment.id}`}
							className="bg-background border border-border rounded-xl p-4 space-y-3">
							{/* Comment Header */}
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-3 flex-1">
									<Avatar className="w-8 h-8">
										<AvatarImage
											src={comment.author?.avatar || "/placeholder.svg"}
										/>
										<AvatarFallback>
											{comment.author?.name?.charAt(0) || "?"}
										</AvatarFallback>
									</Avatar>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-semibold text-sm">
												{comment.author?.name || "Anonymous"}
											</span>
											{comment.author?.verified && (
												<LinkIcon className="w-4 h-4 text-blue-400" />
											)}
											<span
												className={`text-xs px-2.5 py-0.5 rounded-full border ${comment.badge.color}`}>
												{comment.badge.icon} {comment.badge.label}
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											@
											{comment.author?.username?.replace("@", "") ||
												"anonymous"}{" "}
											·{" "}
											<span suppressHydrationWarning>
												{comment.createdAt?.seconds
													? new Date(
															comment.createdAt.seconds * 1000,
														).toLocaleString()
													: comment.createdAt instanceof Date
														? comment.createdAt.toLocaleString()
														: "Just now"}
											</span>
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setCommentWithOptions(comment)}
									className="text-muted-foreground hover:text-foreground -mr-2 h-8 w-8">
									<MoreHorizontal className="w-5 h-5" />
								</Button>
							</div>

							{/* Comment Content with Markdown Support */}
							<div className="text-sm leading-relaxed space-y-2">
								{comment.content
									.split("\n\n")
									.map((paragraph: string, i: number) => {
										if (paragraph.startsWith("```")) {
											const lang = paragraph.split("\n")[0].replace("```", "");
											const code = paragraph
												.split("\n")
												.slice(1, -1)
												.join("\n");
											return (
												<div
													key={i}
													className="bg-muted rounded-lg p-3 border border-border overflow-x-auto">
													<code className="text-xs font-mono text-foreground whitespace-pre">
														{code}
													</code>
												</div>
											);
										}
										return (
											<p key={i} className="whitespace-pre-wrap">
												{paragraph}
											</p>
										);
									})}
							</div>

							{/* Engagement */}
							<div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
								<button
									onClick={() => toggleCommentLike(comment.id)}
									className={`flex items-center gap-1 transition ${likedComments.has(comment.id) ? "text-red-500" : "hover:text-foreground"}`}>
									<Heart
										className={`w-4 h-4 ${likedComments.has(comment.id) ? "fill-current" : ""}`}
									/>
									{Array.isArray(comment.likes)
										? comment.likes.length
										: (comment.likes as any) || 0}
								</button>
								<button
									onClick={() =>
										handleAuthAction(() => {
											setReplyingTo({
												id: comment.id,
												username: comment.author.username,
											});
											setNewComment("");
										})
									}
									className="flex items-center gap-1 hover:text-foreground transition">
									<LinkIcon className="w-4 h-4" />
									Reply
								</button>
							</div>

							{/* Replies */}
							{comment.replies && comment.replies.length > 0 && (
								<div className="mt-3 pt-3 border-t border-border space-y-3">
									{comment.replies.map((reply: any) => (
										<div
											key={reply.id}
											className="bg-muted/30 rounded-lg p-3 space-y-2">
											<div className="flex items-center gap-2 flex-wrap">
												<Avatar className="w-6 h-6">
													<AvatarImage
														src={reply.author.avatar || "/placeholder.svg"}
													/>
													<AvatarFallback>
														{reply.author.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs font-semibold">
													{reply.author.name}
												</span>
												{reply.author?.verified && (
													<LinkIcon className="w-3 h-3 text-blue-400" />
												)}
												<span className="text-xs text-primary">
													@{comment.author.username.replace("@", "")}
												</span>
											</div>
											<p className="text-sm">{reply.content}</p>
											<p className="text-xs text-muted-foreground">
												{reply.timestamp}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>

				{commentWithOptions && (
					<CommentOptionsDrawer
						isOpen={!!commentWithOptions}
						onClose={() => setCommentWithOptions(null)}
						isCommentOwner={viewerUid === commentWithOptions.authorUid}
						isPostOwner={viewerUid === postAuthorUid}
						onDelete={() => {
							deleteComment(commentWithOptions.id);
							setCommentWithOptions(null);
						}}
						onEdit={() => {
							// TODO: implement edit
							setCommentWithOptions(null);
						}}
						onReport={() => {
							// TODO: implement report
							setCommentWithOptions(null);
						}}
						onCopyLink={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}/post/${postId}#comment-${commentWithOptions.id}`,
							);
							setCommentWithOptions(null);
						}}
					/>
				)}
				{/* Comment Input */}
				<div className="border-t border-border px-6 py-4 space-y-3">
					{replyingTo && (
						<div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
							<span>
								Replying to{" "}
								<span className="font-semibold text-primary">
									@{replyingTo.username}
								</span>
							</span>
							<button
								onClick={() => setReplyingTo(null)}
								className="hover:text-foreground">
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					<div className="flex gap-2">
						{Object.entries(commentBadgeTypes).map(([key, badge]) => (
							<button
								key={key}
								onClick={() => setSelectedBadge(key)}
								className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
									selectedBadge === key
										? badge.color
										: "bg-muted/50 border-border hover:border-primary"
								}`}>
								{badge.icon} {badge.label}
							</button>
						))}
					</div>

					<div className="flex gap-2">
						<textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder={
								replyingTo ? "Write a reply..." : "Share your insight..."
							}
							className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
							rows={2}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={closeComments}>
							Cancel
						</Button>
						<Button
							size="sm"
							disabled={!newComment.trim()}
							onClick={addComment}>
							Post Comment
						</Button>
					</div>
				</div>
			</div>
			{GuestLoginDialog && (
				<GuestLoginDialog
					isOpen={showLoginDialog}
					onClose={() => setShowLoginDialog(false)}
				/>
			)}
		</>,
		document.body,
	);
}

function CommentOptionsDrawer({
	isOpen,
	onClose,
	isCommentOwner,
	isPostOwner,
	onDelete,
	onEdit,
	onReport,
	onCopyLink,
}: {
	isOpen: boolean;
	onClose: () => void;
	isCommentOwner: boolean;
	isPostOwner: boolean;
	onDelete: () => void;
	onEdit: () => void;
	onReport: () => void;
	onCopyLink: () => void;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!mounted || !isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}>
			<div
				className="w-full max-w-md bg-background border-t border-border rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-300"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-center mb-6">
					<div className="w-12 h-1.5 bg-muted rounded-full" />
				</div>

				<div className="flex flex-col gap-2">
					{(isCommentOwner || isPostOwner) && (
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-mono"
							onClick={onDelete}>
							<Trash2 className="w-5 h-5" />
							Delete Comment
						</Button>
					)}

					{isCommentOwner && (
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 font-mono"
							onClick={onEdit}>
							<Pencil className="w-5 h-5" />
							Edit Comment
						</Button>
					)}

					<Button
						variant="ghost"
						className="w-full justify-start gap-3 font-mono"
						onClick={onCopyLink}>
						<LinkIcon className="w-5 h-5" />
						Copy Link
					</Button>

					{!isCommentOwner && (
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 font-mono"
							onClick={onReport}>
							<Flag className="w-5 h-5" />
							Report Comment
						</Button>
					)}
				</div>

				<div className="mt-4 pt-4 border-t border-border">
					<Button
						variant="outline"
						className="w-full font-mono rounded-xl"
						onClick={onClose}>
						Cancel
					</Button>
				</div>
			</div>
		</div>,
		document.body,
	);
}

function PostOptionsDrawer({
	isOpen,
	onClose,
	isOwner,
	isFollowing,
	onDelete,
	onUnfollow,
	onCopyLink,
}: {
	isOpen: boolean;
	onClose: () => void;
	postAuthorUid: string;
	isOwner: boolean;
	isFollowing: boolean;
	onDelete: () => void;
	onUnfollow: () => void;
	onCopyLink: () => void;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!mounted || !isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}>
			<div
				className="w-full max-w-md bg-background border-t border-border rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-300"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-center mb-6">
					<div className="w-12 h-1.5 bg-muted rounded-full" />
				</div>

				<div className="flex flex-col gap-2">
					{isOwner && (
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-mono"
							onClick={onDelete}>
							<Trash2 className="w-5 h-5" />
							Delete Post
						</Button>
					)}

					{isFollowing && (
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 font-mono"
							onClick={onUnfollow}>
							<UserMinus className="w-5 h-5" />
							Unfollow Author
						</Button>
					)}

					<Button
						variant="ghost"
						className="w-full justify-start gap-3 font-mono"
						onClick={onCopyLink}>
						<LinkIcon className="w-5 h-5" />
						Copy Link
					</Button>

					<Button
						variant="ghost"
						className="w-full justify-start gap-3 font-mono"
						onClick={() => {
							// Report logic here
							onClose();
						}}>
						<Flag className="w-5 h-5" />
						Report Post
					</Button>
				</div>

				<div className="mt-4 pt-4 border-t border-border">
					<Button
						variant="outline"
						className="w-full font-mono rounded-xl"
						onClick={onClose}>
						Cancel
					</Button>
				</div>
			</div>
		</div>,
		document.body,
	);
}

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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { updateDoc, doc, setDoc, increment, getDoc, deleteDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface PostMedia {
	type: "image" | "video" | "audio";
	url: string;

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
								prev > 0 ? prev - 1 : media.length - 1
							)
						}
						className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors">
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button
						onClick={() =>
							setCurrentIndex((prev) =>
								prev < media.length - 1 ? prev + 1 : 0
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
				<audio
					ref={mediaRef as any}
					src={media.url}
					muted={isMuted}
				/>
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

export const PostCard = ({ post }: { post: Post }) => {
	const [isLiked, setIsLiked] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likesCount);
	const viewerUid = auth.currentUser?.uid;

	useEffect(() => {
		if (!viewerUid) return;
		const checkLike = async () => {
			const likeRef = doc(db, "Posts", post.id, "likes", viewerUid);
			const likeSnap = await getDoc(likeRef);
			if (likeSnap.exists()) {
				setIsLiked(true);
			}
		};
		checkLike();
	}, [post.id, viewerUid]);

	const handleLike = async () => {
		if (!viewerUid) return;

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
		setIsBookmarked(!isBookmarked);
	};

	return (
		<article className="bg-card border border-border rounded-xl p-5 min-w-0 overflow-hidden">
			{/* Post Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<Avatar className="w-11 h-11">
						<AvatarImage
							src={post.author?.avatar || "/placeholder.svg"}
							alt={post.author?.name || "Idea Matcher"}
						/>
						<AvatarFallback className="font-mono">
							{post.author?.name[0] || "U"}
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
							<span>
								{post.createdAt instanceof Date
									? post.createdAt.toLocaleString()
									: new Date(post.createdAt).toLocaleString()}
							</span>
						</div>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
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
						className={`gap-2 font-mono text-xs ${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}>
						<Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
						{likesCount}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
						<MessageCircle className="w-4 h-4" />
						{post.commentsCount}
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
					className={`${isBookmarked ? "text-primary hover:text-primary/90" : "text-muted-foreground hover:text-foreground"}`}>
					<Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
				</Button>
			</div>
		</article>
	);
};

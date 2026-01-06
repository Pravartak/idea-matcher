"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	ChevronLeft,
	ImageIcon,
	Video,
	Music,
	Trash2,
	Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db, storage } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Post } from "@/components/postComponents/PostComponents";

interface PostMedia {
	type: "image" | "video" | "audio";
	url: string;
	alt?: string;
	file?: File;
}

interface CreatePostFormData {
	content: string;
	media: PostMedia[];
	tags: string[];
	postType: "teammates" | "updates" | "hackathon" | "discussion";
}

export default function CreatePostPage() {
	const router = useRouter();
	const [formData, setFormData] = useState<CreatePostFormData>({
		content: "",
		media: [],
		tags: [],
		postType: "discussion",
	});
	const [tagInput, setTagInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userData, setUserData] = useState<any | null>(null);

	useEffect(() => {
		// Retrieve logged in user data
		const auth = getAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/signup");
				return;
			}

			const docRef = doc(db, "users", user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				router.push("/onboarding/profile");
				return;
			}

			setUserData(docSnap.data());
		});
		return () => unsubscribe();
	}, []);

	// Mock user data - in a real app, this would come from auth context
	const currentUser = {
		uid: "user123",
		name: "Your Name",
		username: "yourname",
		avatar: "/user-profile-avatar.png",
		verified: true,
	};

	const postTypes = [
		{ value: "teammates", label: "Looking for teammates" },
		{ value: "updates", label: "Project updates" },
		{ value: "hackathon", label: "Hackathon" },
		{ value: "discussion", label: "Discussion" },
	];

	const hasMedia = formData.media.length > 0;
	const mediaType = hasMedia ? formData.media[0].type : null;
	const canAddImages = !hasMedia || mediaType === "image";
	const canAddVideoAudio = !hasMedia || mediaType !== "image";
	const isNearLimit = formData.content.length > 640;
	const isAtLimit = formData.content.length >= 800;

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (e.target.value.length <= 800) {
			setFormData((prev) => ({
				...prev,
				content: e.target.value,
			}));
		}
	};

	const handleMediaUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: "image" | "video" | "audio"
	) => {
		const files = e.target.files;
		if (files) {
			// If adding video or audio, remove all existing media and only add one
			if (type !== "image") {
				const file = files[0];
				const reader = new FileReader();
				reader.onload = (event) => {
					const url = event.target?.result as string;
					setFormData((prev) => ({
						...prev,
						media: [
							{
								type,
								url,
								file,
								alt: file.name,
							},
						],
					}));
				};
				reader.readAsDataURL(file);
			} else {
				// For images, allow multiple
				Array.from(files).forEach((file) => {
					const reader = new FileReader();
					reader.onload = (event) => {
						const url = event.target?.result as string;
						setFormData((prev) => ({
							...prev,
							media: [
								...prev.media,
								{
									type,
									url,
									file,
									alt: file.name,
								},
							],
						}));
					};
					reader.readAsDataURL(file);
				});
			}
		}
	};

	const handleRemoveMedia = (index: number) => {
		setFormData((prev) => ({
			...prev,
			media: prev.media.filter((_, i) => i !== index),
		}));
	};

	const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && tagInput.trim()) {
			e.preventDefault();
			const cleanedInput = tagInput.trim().replace(/\s+/g, "");
			const tag = cleanedInput.startsWith("#")
				? cleanedInput
				: `#${cleanedInput}`;
			if (!formData.tags.includes(tag)) {
				setFormData((prev) => ({
					...prev,
					tags: [...prev.tags, tag],
				}));
				setTagInput("");
			}
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	async function uploadPostMedia(
		postId: string,
		media: { file: File; type: "image" | "video" | "audio" }[]
	) {
		const uploadedMedia = [];

		for (const item of media) {
			const file = item.file;

			const storageRef = ref(
				storage,
				`Posts/${postId}/${Date.now()}-${file.name}`
			);

			await uploadBytes(storageRef, file);

			const url = await getDownloadURL(storageRef);

			uploadedMedia.push({
				type: item.type,
				url,
			});
		}

		return uploadedMedia;
	}

	const handleSubmit = async () => {
		if (!formData.content.trim()) {
			alert("Post content cannot be empty!");
			return;
		}

		setIsSubmitting(true);

		try {
			// 1️⃣ Create post ref & ID
			const postRef = doc(collection(db, "Posts"));
			const postId = postRef.id;

			// 2️⃣ Upload media first
			let uploadedMedia: PostMedia[] = [];

			if (formData.media.length > 0) {
				const mediaFiles = formData.media.filter(
					(m): m is PostMedia & { file: File } => m.file !== undefined
				);
				uploadedMedia = await uploadPostMedia(postId, mediaFiles);
			}

			// 3️⃣ Save post to Firestore
			await setDoc(postRef, {
				id: postId,
				authorUid: userData.uid,

				author: {
					name: userData.Name,
					username: userData.username,
					avatar: userData.Avatar,
					verified: userData.verified || false,
				},

				content: formData.content,
				media: uploadedMedia,
				tags: formData.tags,

				likesCount: 0,
				commentsCount: 0,
				sharesCount: 0,
				createdAt: Date.now(),
			});

			await updateDoc(doc(db, "users", userData.uid), {
				Posts: userData.Posts + 1,
			});

			// 4️⃣ Reset form
			setFormData({
				content: "",
				media: [],
				tags: [],
				postType: "discussion",
			});

			// 5️⃣ Redirect
			router.push("/home");
		} catch (error) {
			console.error("Failed to publish post:", error);
			alert("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
				<Link href="/home">
					<Button
						variant="ghost"
						size="icon"
						className="text-foreground hover:bg-secondary">
						<ChevronLeft className="w-5 h-5" />
					</Button>
				</Link>
				<h1 className="font-mono text-lg font-bold text-foreground">
					Create Post
				</h1>
				<div className="w-10" />
			</header>

			{/* Main Content */}
			<main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
				{/* User Info */}
				<div className="flex items-center gap-4">
					<Avatar className="w-12 h-12">
						<AvatarImage
							src={userData?.Avatar || "/placeholder.svg"}
							alt={userData?.Name}
						/>
						<AvatarFallback className="font-mono">
							{userData?.Name[0]}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="flex items-center gap-2">
							<p className="font-mono font-medium text-foreground">
								{userData?.Name}
							</p>
							{userData?.verified && (
								<span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
									Verified
								</span>
							)}
						</div>
						<p className="font-mono text-sm text-muted-foreground">
							@{userData?.username}
						</p>
					</div>
				</div>

				<div>
					<label className="block font-mono font-medium text-foreground mb-2 text-sm">
						Post Type
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{postTypes.map((type) => (
							<button
								key={type.value}
								onClick={() =>
									setFormData((prev) => ({
										...prev,
										postType: type.value as CreatePostFormData["postType"],
									}))
								}
								className={`px-3 py-2 rounded-lg font-mono text-xs sm:text-sm transition-colors ${
									formData.postType === type.value
										? "bg-primary text-primary-foreground"
										: "bg-card border border-border text-foreground hover:bg-secondary"
								}`}>
								{type.label}
							</button>
						))}
					</div>
				</div>

				{/* Content Input */}
				<div>
					<textarea
						value={formData.content}
						onChange={handleContentChange}
						placeholder="What's on your mind? Share your ideas, projects, or ask for collaborators..."
						className={`w-full bg-card border rounded-lg p-4 font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors ${
							isAtLimit
								? "border-destructive"
								: isNearLimit
								? "border-yellow-500"
								: "border-border"
						}`}
						rows={6}
					/>
					<div className="mt-2 flex items-center justify-between">
						<p
							className={`font-mono text-xs ${
								isAtLimit
									? "text-destructive"
									: isNearLimit
									? "text-yellow-500"
									: "text-muted-foreground"
							}`}>
							{formData.content.length} / 800 characters
						</p>
						{isAtLimit && (
							<p className="font-mono text-xs text-destructive">
								Character limit reached
							</p>
						)}
					</div>
				</div>

				{/* Media Preview */}
				{formData.media.length > 0 && (
					<div className="space-y-3">
						<h3 className="font-mono font-medium text-foreground">
							Attached Media
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{formData.media.map((media, index) => (
								<div
									key={index}
									className="relative bg-card border border-border rounded-lg p-3 group">
									{media.type === "image" && (
										<img
											src={media.url || "/placeholder.svg"}
											alt={media.alt}
											className="w-full h-32 object-cover rounded"
										/>
									)}
									{media.type === "video" && (
										<div className="w-full h-32 bg-secondary rounded flex flex-col items-center justify-center relative overflow-hidden">
											<video
												src={media.url}
												className="w-full h-full object-cover opacity-30"
											/>
											<div className="absolute inset-0 flex items-center justify-center">
												<Video className="w-8 h-8 text-muted-foreground" />
											</div>
										</div>
									)}
									{media.type === "audio" && (
										<div className="w-full h-32 bg-secondary rounded flex flex-col items-center justify-center gap-2">
											<Music className="w-8 h-8 text-muted-foreground" />
											<p className="font-mono text-xs text-muted-foreground text-center px-2">
												{media.alt}
											</p>
										</div>
									)}
									<p className="mt-2 font-mono text-xs text-muted-foreground truncate">
										{media.alt}
									</p>
									<button
										onClick={() => handleRemoveMedia(index)}
										className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
										<Trash2 className="w-4 h-4 text-destructive-foreground" />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Media Upload Buttons */}
				<div className="flex flex-wrap gap-2">
					{canAddImages && (
						<label className="cursor-pointer">
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={(e) => handleMediaUpload(e, "image")}
								className="hidden"
							/>
							<div className="px-4 py-2 border border-border rounded-lg font-mono text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
								<ImageIcon className="w-4 h-4" />
								Add Image
							</div>
						</label>
					)}
					{canAddVideoAudio && formData.media.length === 0 && (
						<>
							<label className="cursor-pointer">
								<input
									type="file"
									accept="video/*"
									onChange={(e) => handleMediaUpload(e, "video")}
									className="hidden"
								/>
								<div className="px-4 py-2 border border-border rounded-lg font-mono text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
									<Video className="w-4 h-4" />
									Add Video
								</div>
							</label>
							<label className="cursor-pointer">
								<input
									type="file"
									accept="audio/*"
									onChange={(e) => handleMediaUpload(e, "audio")}
									className="hidden"
								/>
								<div className="px-4 py-2 border border-border rounded-lg font-mono text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
									<Music className="w-4 h-4" />
									Add Audio
								</div>
							</label>
						</>
					)}
				</div>

				{/* Tags Input */}
				<div className="space-y-3">
					<label className="block font-mono font-medium text-foreground">
						Tags
					</label>
					<input
						type="text"
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyPress={handleAddTag}
						placeholder="Type and press Enter to add tags (e.g., #WebDev, #Startup)..."
						className="w-full bg-card border border-border rounded-lg px-4 py-2 font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					{formData.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{formData.tags.map((tag) => (
								<div
									key={tag}
									className="px-3 py-1 bg-primary/20 text-primary rounded-full font-mono text-sm flex items-center gap-2">
									{tag}
									<button
										onClick={() => handleRemoveTag(tag)}
										className="hover:bg-primary/30 rounded-full p-0.5 transition-colors">
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Submit Button */}
				<div className="flex gap-3 pt-4">
					<Button
						onClick={() => router.back()}
						variant="outline"
						className="flex-1 font-mono">
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || !formData.content.trim() || isAtLimit}
						className="flex-1 gap-2 font-mono bg-primary hover:bg-primary/80">
						<Send className="w-4 h-4" />
						{isSubmitting ? "Publishing..." : "Publish Post"}
					</Button>
				</div>
			</main>
		</div>
	);
}

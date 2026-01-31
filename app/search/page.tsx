"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostCard, Post } from "@/components/postComponents/PostComponents";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

type SearchType = "user" | "post" | "project" | "hackathon";

interface SearchUser {
	id: string;
	name: string;
	username: string;
	avatar: string;
	verified: boolean;
}

interface SearchProject {
	id: string;
	name: string;
	description: string;
	skills: string[];
	roles: { name: string; filled: boolean }[];
}

// Helper function to tokenize search query into keywords
const getKeywords = (query: string): string[] => {
	return query
		.toLowerCase()
		.split(/\s+/)
		.filter((keyword) => keyword.length > 0);
};

// Check if content contains all keywords
const matchesAllKeywords = (content: string, keywords: string[]): boolean => {
	const lowerContent = content.toLowerCase();
	return keywords.every((keyword) => lowerContent.includes(keyword));
};

export default function SearchPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<SearchType | null>(null);
	const [results, setResults] = useState<(SearchUser | Post | SearchProject)[]>(
		[],
	);
	const [recentSearches, setRecentSearches] = useState<
		Record<string, string[]>
	>({});

	const searchTypes: { type: SearchType; prefix: string; label: string }[] = [
		{ type: "user", prefix: "@", label: "Users" },
		{ type: "post", prefix: "#", label: "Posts" },
		{ type: "project", prefix: "!", label: "Projects" },
		{ type: "hackathon", prefix: "$", label: "Hackathons" },
	];

	useEffect(() => {
		const saved = localStorage.getItem("recentSearches");
		if (saved) {
			try {
				setRecentSearches(JSON.parse(saved));
			} catch (e) {
				console.error("Failed to parse recent searches", e);
			}
		}
	}, []);

	const saveSearch = () => {
		if (!searchQuery.trim()) return;

		let category = "general";
		if (selectedType) {
			category = selectedType;
		} else {
			const matchingType = searchTypes.find((t) =>
				searchQuery.startsWith(t.prefix),
			);
			if (matchingType) {
				category = matchingType.type;
			}
		}

		setRecentSearches((prev) => {
			const currentList = prev[category] || [];
			const newList = [
				searchQuery,
				...currentList.filter((s) => s !== searchQuery),
			].slice(0, 5);
			const newState = { ...prev, [category]: newList };
			localStorage.setItem("recentSearches", JSON.stringify(newState));
			return newState;
		});
	};

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (!searchQuery.trim()) {
				setResults([]);
				return;
			}

			let queryToSearch = searchQuery;
			if (selectedType) {
				const prefix = searchTypes.find((t) => t.type === selectedType)?.prefix;
				if (prefix && searchQuery.startsWith(prefix)) {
					queryToSearch = searchQuery.slice(prefix.length);
				}
			}
			const keywords = getKeywords(queryToSearch);

			const fetchUsers = async () => {
				try {
					const q = query(collection(db, "users"), limit(50));
					const snap = await getDocs(q);
					return snap.docs
						.map((doc) => {
							const data = doc.data();
							return {
								id: doc.id,
								name: data.Name || "User",
								username: data.username || "@user",
								avatar: data.Avatar || "/placeholder.svg",
								verified: data.verified || false,
							} as SearchUser;
						})
						.filter(
							(u) =>
								matchesAllKeywords(u.name, keywords) ||
								matchesAllKeywords(u.username, keywords),
						);
				} catch (e) {
					console.error("Error fetching users", e);
					return [];
				}
			};

			const fetchPosts = async () => {
				try {
					const q = query(
						collection(db, "Posts"),
						orderBy("createdAt", "desc"),
						limit(50),
					);
					const snap = await getDocs(q);
					return snap.docs
						.map((doc) => {
							const data = doc.data();
							return {
								id: doc.id,
								...data,
								createdAt: data.createdAt?.toMillis
									? data.createdAt.toMillis()
									: data.createdAt || Date.now(),
							} as Post;
						})
						.filter(
							(p) =>
								matchesAllKeywords(p.content, keywords) ||
								matchesAllKeywords(p.author.name, keywords),
						);
				} catch (e) {
					console.error("Error fetching posts", e);
					return [];
				}
			};

			const fetchProjects = async (collectionName: string) => {
				try {
					const q = query(collection(db, collectionName), limit(50));
					const snap = await getDocs(q);
					return snap.docs
						.map(
							(doc) =>
								({
									id: doc.id,
									...doc.data(),
								}) as SearchProject,
						)
						.filter((p) => {
							const searchableContent =
								`${p.name} ${p.description} ${p.skills?.join(" ")}`.toLowerCase();
							return keywords.every((keyword) =>
								searchableContent.includes(keyword),
							);
						});
				} catch (e: any) {
					if (e?.code !== "permission-denied") {
						console.error(`Error fetching ${collectionName}`, e);
					}
					return [];
				}
			};

			if (!selectedType) {
				// Search across all categories without a type selected
				const allResults: (SearchUser | Post | SearchProject)[] = [];
				const [users, posts, projects, hackathons] = await Promise.all([
					fetchUsers(),
					fetchPosts(),
					fetchProjects("Projects"),
					fetchProjects("Hackathons"),
				]);
				allResults.push(...users, ...posts, ...projects, ...hackathons);
				setResults(allResults);
				return;
			}

			switch (selectedType) {
				case "user":
					setResults(await fetchUsers());
					break;
				case "post":
					setResults(await fetchPosts());
					break;
				case "project":
				case "hackathon":
					setResults(
						await fetchProjects(
							selectedType === "project" ? "Projects" : "Hackathons",
						),
					);
					break;
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, selectedType]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		const matchingType = searchTypes.find((t) => query.startsWith(t.prefix));
		if (matchingType) {
			if (selectedType !== matchingType.type) {
				setResults([]);
				setSelectedType(matchingType.type);
			}
		} else {
			if (selectedType !== null) {
				setResults([]);
				setSelectedType(null);
			}
		}
	};

	const handleTypeSelect = (type: SearchType) => {
		if (selectedType === type) {
			setSelectedType(null);
			setSearchQuery("");
			setResults([]);
		} else {
			setSelectedType(type);
			setResults([]);
			const prefix = searchTypes.find((t) => t.type === type)?.prefix;
			if (prefix) {
				setSearchQuery(prefix);
			}
		}
	};

	const renderResults = () => {
		// No type selected and nothing typed - show recent searches
		if (!selectedType && !searchQuery.trim()) {
			return (
				<div className="space-y-8">
					{Object.entries(recentSearches).map(([type, searches]) => {
						if (searches.length === 0) return null;
						return (
							<div key={type}>
								<h3 className="text-lg font-mono mb-4 capitalize">
									Recent {type}s
								</h3>
								<div className="flex flex-wrap gap-2">
									{searches.map((search) => (
										<Badge
											key={search}
											variant="secondary"
											className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
											onClick={() => {
												const typeMap: Record<string, SearchType | null> = {
													user: "user",
													post: "post",
													project: "project",
													hackathon: "hackathon",
												};
												setSelectedType(typeMap[type] ?? null);
												setSearchQuery(search);
											}}>
											{search}
										</Badge>
									))}
								</div>
							</div>
						);
					})}
				</div>
			);
		}

		// No type selected but something typed - show results from all categories
		if (!selectedType && searchQuery.trim()) {
			if (results.length === 0) {
				return (
					<div className="py-12 text-center">
						<p className="text-muted-foreground font-mono">
							No results found for "{searchQuery}"
						</p>
					</div>
				);
			}

			// Group results by type
			const userResults = results.filter(
				(r): r is SearchUser => "username" in r,
			);
			const postResults = results.filter((r): r is Post => "authorUid" in r);
			const projectResults = results.filter(
				(r): r is SearchProject => "skills" in r,
			);

			return (
				<div className="space-y-8">
					{/* Users */}
					{userResults.length > 0 && (
						<div>
							<h3 className="text-lg font-mono mb-4">Users</h3>
							<div className="space-y-3">
								{userResults.map((user) => (
									<Link key={user.id} href={`/u/${user.id}`}>
										<div
											key={user.id}
											className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
											<Avatar>
												<AvatarImage
													src={user.avatar || "/placeholder.svg"}
													alt={user.name}
												/>
												<AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<p className="font-mono font-medium">{user.name}</p>
													{user.verified && (
														<span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
															Verified
														</span>
													)}
												</div>
												<p className="text-sm text-muted-foreground">
													{user.username}
												</p>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Posts */}
					{postResults.length > 0 && (
						<div>
							<h3 className="text-lg font-mono mb-4">Posts</h3>
							<div className="space-y-4">
								{postResults.map((post) => (
									<div key={post.id}>
										<PostCard post={post} />
									</div>
								))}
							</div>
						</div>
					)}

					{/* Projects and Hackathons */}
					{projectResults.length > 0 && (
						<div>
							<h3 className="text-lg font-mono mb-4">Projects & Hackathons</h3>
							<div className="space-y-4">
								{projectResults.map((project) => (
									<div
										key={project.id}
										className="p-4 rounded-lg border border-border bg-card">
										<h4 className="font-mono font-medium mb-2">
											{project.name}
										</h4>
										<p className="text-sm text-muted-foreground mb-3">
											{project.description}
										</p>
										<div className="flex flex-wrap gap-2 mb-3">
											{project.skills.map((skill) => (
												<Badge key={skill} variant="secondary">
													{skill}
												</Badge>
											))}
										</div>
										<div className="flex flex-wrap gap-2 mb-3">
											{project.roles.map((role) => (
												<Badge
													key={role.name}
													variant={role.filled ? "default" : "outline"}
													className={
														role.filled ? "bg-white text-foreground" : ""
													}>
													{role.name}
												</Badge>
											))}
										</div>
										<Button size="sm" className="w-full">
											Request to Join
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			);
		}

		if (searchQuery.trim() && results.length === 0) {
			return (
				<div className="py-12">
					<p className="text-center text-muted-foreground">
						No results found for "{searchQuery}"
					</p>
				</div>
			);
		}

		if (!searchQuery.trim()) {
			return (
				<div>
					<h3 className="text-lg font-mono mb-4">Recent searches</h3>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{selectedType === "user" &&
					(results as SearchUser[]).map((user) => (
						<Link key={user.id} href={`/u/${user.id}`}>
							<div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer transition-colors">
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={user.avatar || "/placeholder.svg"}
										alt={user.name}
									/>
									<AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="font-mono font-semibold">{user.name}</p>
										{user.verified && (
											<span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
												Verified
											</span>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										{user.username}
									</p>
								</div>
							</div>
						</Link>
					))}

				{selectedType === "post" &&
					(results as Post[]).map((post) => (
						<div key={post.id}>
							<PostCard post={post} />
						</div>
					))}

				{(selectedType === "project" || selectedType === "hackathon") &&
					(results as SearchProject[]).map((project) => (
						<div
							key={project.id}
							className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
							<div className="mb-3">
								<h3 className="font-mono font-semibold text-lg">
									{project.name}
								</h3>
								<p className="text-sm text-muted-foreground mt-1">
									{project.description}
								</p>
							</div>

							<div className="mb-4">
								<p className="text-xs font-semibold mb-2 text-muted-foreground">
									Skills Required
								</p>
								<div className="flex flex-wrap gap-2">
									{project.skills.map((skill) => (
										<Badge key={skill} variant="outline">
											{skill}
										</Badge>
									))}
								</div>
							</div>

							<div className="mb-4">
								<p className="text-xs font-semibold mb-2 text-muted-foreground">
									Roles Needed
								</p>
								<div className="flex flex-wrap gap-2">
									{project.roles.map((role) => (
										<Badge
											key={role.name}
											className={`${
												role.filled
													? "bg-foreground text-background"
													: "bg-muted text-muted-foreground border border-border"
											}`}>
											{role.name}
										</Badge>
									))}
								</div>
							</div>

							<Button className="w-full">Request to Join</Button>
						</div>
					))}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="max-w-2xl mx-auto w-full px-4 py-8">
				{/* Header with Back Button */}
				<div className="flex items-center gap-4 mb-8">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-muted rounded-lg transition-colors"
						aria-label="Go back">
						<ArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-2xl font-mono font-bold">Search</h1>
				</div>

				{/* Search Bar */}
				<div className="relative mb-8">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
					<Input
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								saveSearch();
							}
						}}
						className="pl-10 pr-10 py-6 text-lg"
					/>
					{searchQuery && (
						<button
							onClick={() => {
								setSearchQuery("");
								setResults([]);
							}}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
							<X className="h-5 w-5" />
						</button>
					)}
				</div>

				{/* Type Selection */}
				<div className="flex flex-wrap gap-3 mb-8">
					{searchTypes.map(({ type, prefix, label }) => (
						<Button
							key={type}
							onClick={() => handleTypeSelect(type)}
							variant={selectedType === type ? "default" : "outline"}
							className="font-mono">
							<span className="text-lg">{prefix}</span>
							{label}
						</Button>
					))}
				</div>

				{/* Results */}
				<div>{renderResults()}</div>
			</div>
		</div>
	);
}

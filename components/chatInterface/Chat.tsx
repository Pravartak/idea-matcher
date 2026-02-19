"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "../types/user";
import { auth, db } from "@/lib/firebase";
import {
	addDoc,
	collection,
	doc,
	setDoc,
	serverTimestamp,
	increment,
	onSnapshot,
	query,
	orderBy,
} from "firebase/firestore";
import { ReceiverMsgBox, SenderMsgBox } from "../chatComponents/ChatComponents";

interface ChatProps {
	targetUser: User["user"];
	messages: any[];
	isOwner: boolean;
}

export default function ChatPage({ targetUser, messages, isOwner }: ChatProps) {
	const router = useRouter();
	const [messageInput, setMessageInput] = useState("");
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [messagesList, setMessagesList] = useState<any[]>(messages);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setCurrentUser(user);
			if (user) {
				const ids = [user.uid, targetUser.uid].sort();
				setConversationId(ids.join("_"));
			}
		});
		return () => unsubscribe();
	}, [targetUser.uid]);

	useEffect(() => {
		if (!conversationId || !currentUser) return;

		const q = query(
			collection(db, "Conversations", conversationId, "Messages"),
			orderBy("createdAt", "asc"),
		);
		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const msgs = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setMessagesList(msgs);
			},
			(error) => {
				// Ignore permission errors for new chats (document doesn't exist yet)
				if (error.code !== "permission-denied") {
					console.error("Error fetching messages:", error);
				}
			},
		);

		// Listen to conversation document to reset unread count
		const conversationRef = doc(db, "Conversations", conversationId);
		const unsubscribeConversation = onSnapshot(
			conversationRef,
			(docSnap) => {
				if (docSnap.exists()) {
					const data = docSnap.data();
					// If there are unread messages for the current user, reset them
					if (data.unreadCount && data.unreadCount[currentUser.uid] > 0) {
						setDoc(
							conversationRef,
							{
								unreadCount: {
									[currentUser.uid]: 0,
								},
							},
							{ merge: true },
						);
					}
				}
			},
			(error) => {
				// Ignore permission errors for new chats
				if (error.code !== "permission-denied") {
					console.error("Error fetching conversation:", error);
				}
			},
		);

		return () => {
			unsubscribe();
			unsubscribeConversation();
		};
	}, [conversationId, currentUser]);

	const handleSendMessage = async () => {
		if (messageInput.trim() && conversationId && targetUser?.uid) {
			const currentUser = auth.currentUser;
			if (!currentUser) return;

			try {
				const conversationRef = doc(db, "Conversations", conversationId);
				await setDoc(
					conversationRef,
					{
						lastMessage: messageInput,
						lastMessageAt: serverTimestamp(),
						members: [currentUser.uid, targetUser.uid],
						unreadCount: {
							[currentUser.uid]: 0,
							[targetUser.uid]: increment(1),
						},
						readBy: {
							[currentUser.uid]: true,
							[targetUser.uid]: false,
						},
					},
					{ merge: true },
				);

				await addDoc(
					collection(db, "Conversations", conversationId, "Messages"),
					{
						content: messageInput,
						createdAt: serverTimestamp(),
						readBy: [currentUser.uid], // Mark as read by the sender
						senderId: currentUser.uid,
						type: "text",
					},
				);
			} catch (e) {
				console.error("Error sending message: ", e);
			}
			console.log("Sending message:", messageInput);
			setMessageInput("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<div className="sticky top-0 bg-background border-b border-muted z-10">
				<div className="max-w-2xl mx-auto w-full px-4 py-4 flex items-center justify-between">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-muted rounded-lg transition-colors"
						aria-label="Go back">
						<ArrowLeft className="h-5 w-5" />
					</button>

					<div className="flex-1 flex items-center justify-center gap-3 mx-4">
						<Avatar className="h-8 w-8">
							<AvatarImage
								src={targetUser?.Avatar || "/placeholder.svg"}
								alt={targetUser?.Name}
							/>
							<AvatarFallback>
								{targetUser?.Name?.slice(0, 2) || "?"}
							</AvatarFallback>
						</Avatar>
						<p className="font-mono font-medium text-sm">
							{targetUser?.Name || "User"}
						</p>
					</div>

					<button
						className="p-2 hover:bg-muted rounded-lg transition-colors"
						aria-label="More options">
						<MoreVertical className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="max-w-2xl mx-auto w-full flex flex-col min-h-full">
					<div className="text-center space-y-2 mb-8">
						<Avatar className="h-16 w-16 mx-auto">
							<AvatarImage
								src={targetUser?.Avatar || "/placeholder.svg"}
								alt={targetUser?.Name}
							/>
							<AvatarFallback>
								{targetUser?.Name?.slice(0, 2) || "?"}
							</AvatarFallback>
						</Avatar>
						<p className="font-mono font-bold text-lg">
							{targetUser?.Name || "User"}
						</p>
						<p className="font-mono text-sm text-muted-foreground">
							@{targetUser?.username || "user"} {targetUser?.verified && "✓"}
						</p>
						<p className="font-mono text-xs text-muted-foreground mt-4">
							Say, Hello!
						</p>
					</div>

					<div className="flex-1 flex flex-col justify-end min-h-0">
						{messagesList.map((msg, index) =>
							msg.senderId === currentUser?.uid ? (
								<SenderMsgBox key={msg.id || index} content={msg.content} />
							) : (
								<ReceiverMsgBox key={msg.id || index} content={msg.content} />
							),
						)}
					</div>
				</div>
			</div>

			{/* Message Input */}
			<div className="bg-background border-t border-muted p-4">
				<div className="max-w-2xl mx-auto">
					<div className="flex gap-3 items-end">
						<Input
							type="text"
							placeholder="Type a message..."
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							onKeyPress={handleKeyPress}
							className="flex-1 bg-card border-muted font-mono text-sm resize-none rounded-lg"
						/>
						<Button
							onClick={handleSendMessage}
							disabled={!messageInput.trim()}
							size="icon"
							className="flex-shrink-0">
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
		</div>
	);
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

export interface ChatTileProps {
	id: string;
	name: string;
	username: string;
	avatar: string;
	lastMessage: string;
	timestamp: string;
	unread: number;
	verified: boolean;
	members: string[];
}

export const ReceiverMsgBox = ({ content }: { content: string }) => {
	return (
		<div className="flex justify-start mb-2">
			<div className="max-w-[75%] bg-muted rounded-lg px-4 py-2">
				<p className="font-mono text-sm text-foreground break-words">
					{content}
				</p>
			</div>
		</div>
	);
};

export const SenderMsgBox = ({ content }: { content: string }) => {
	return (
		<div className="flex justify-end mb-2">
			<div className="max-w-[75%] bg-primary rounded-lg px-4 py-2">
				<p className="font-mono text-sm text-primary-foreground break-words">
					{content}
				</p>
			</div>
		</div>
	);
};

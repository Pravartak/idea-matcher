"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    MoreHorizontal,
    MessageSquare,
} from "lucide-react";
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
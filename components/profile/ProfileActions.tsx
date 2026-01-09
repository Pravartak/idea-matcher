"use client";

import { User } from "../types/user";

export default function ProfileActions({
	targetUid,
	viewerUid,
}: {
	targetUid: string | null;
	viewerUid?: User["user"]["uid"] | null;
}) {
	if (targetUid !== viewerUid) {
		return;
	}
	return null;
}
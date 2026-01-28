import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
			<Loader2 className="w-8 h-8 animate-spin mb-2" />
			<p>Loading feed...</p>
		</div>
	);
}
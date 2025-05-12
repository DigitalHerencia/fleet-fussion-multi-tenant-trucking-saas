import { Skeleton } from "../../../../components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex h-[600px] w-full items-center justify-center">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

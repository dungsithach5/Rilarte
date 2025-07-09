import { Skeleton } from "./ui/skeleton"

export default function SkeletonPost() {
  return (
    <div className="mb-4 break-inside-avoid">
      <Skeleton className="h-60 w-full rounded-lg mb-2" />
      <div className="flex items-center gap-3 mt-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mt-2" />
    </div>
  );
}

import { Skeleton } from "./ui/skeleton";

export default function SkeletonPost({ index }: { index: number }) {
  const heights = [150, 200, 250, 300, 180, 220, 270, 320];
  const height = heights[index % heights.length];

  return (
    <div className="break-inside-avoid w-full rounded-lg overflow-hidden">
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}
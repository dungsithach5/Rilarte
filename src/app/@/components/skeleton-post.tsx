import Masonry from "react-masonry-css";
import { Skeleton } from "./ui/skeleton";

interface SkeletonMasonryProps {
  count?: number;
}

export default function SkeletonMasonry({ count = 12 }: SkeletonMasonryProps) {
  const randomHeights = Array.from({ length: count }, () =>
    150 + Math.floor(Math.random() * 170)
  );

  const skeletons = randomHeights.map((height, i) => (
    <Skeleton key={i} className="w-full rounded-lg" style={{ height }} />
  ));

  const breakpointColumnsObj = {
    default: 6,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-4"
      columnClassName="flex flex-col gap-4"
    >
      {skeletons}
    </Masonry>
  );
}

import { SkeletonCards, SkeletonTable } from '@/components/admin/feedback';

export default function AdminLoading() {
  return (
    <div className="space-y-5">
      <div className="h-7 w-48 rounded-md bg-white/[0.05] animate-pulse" />
      <SkeletonCards count={4} />
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}

"use client"

import { useParams } from 'next/navigation';
import ProfileHeader from '../../@/components/ProfileHeader';
import ProfileTabs from '../../@/components/ProfileTabs';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  if (!userId) {
    return <div>User ID not found</div>;
  }

  return (
    <main className="">
      <ProfileHeader targetUserId={userId} />
      <ProfileTabs targetUserId={userId} />
    </main>
  )
} 
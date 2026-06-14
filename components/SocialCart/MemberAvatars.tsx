// components/SocialCart/MemberAvatars.tsx
// Animated row of member avatars with live presence indicators

'use client';

import type { SocialCartMember } from '@/lib/socialCart/types';

interface Props {
  members: SocialCartMember[];
  myMemberId?: string;
}

export default function MemberAvatars({ members, myMemberId }: Props) {
  if (members.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.slice(0, 6).map((member, i) => (
          <div key={member.id} className="relative" style={{ zIndex: members.length - i }}>
            <div
              className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: member.avatar_color }}
              title={member.name}
            >
              {member.name.slice(0, 1).toUpperCase()}
            </div>
            {/* Live pulse indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          </div>
        ))}
        {members.length > 6 && (
          <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shadow-sm">
            +{members.length - 6}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        {members.length === 1
          ? `${members[0].name} (you)`
          : `${members.length} people in this cart`}
      </div>
    </div>
  );
}

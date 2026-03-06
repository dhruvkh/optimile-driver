import React from 'react';
import { cn } from './BigActionButton';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  points: number;
  isMe?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ rank, name, points, isMe }) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border",
      isMe ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
          rank <= 3 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
        )}>
          {rank}
        </div>
        <span className={cn("font-medium", isMe ? "text-indigo-900" : "text-gray-900")}>
          {name} {isMe && "(You)"}
        </span>
      </div>
      <span className="font-bold text-gray-900">{points} pts</span>
    </div>
  );
};

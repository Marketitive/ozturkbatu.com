import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface LanyardData {
  discord_user: {
    username: string;
    avatar: string;
    id: string;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Array<{
    name: string;
    details?: string;
    state?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
  }>;
}

const statusColors = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500',
};

const statusLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

export function DiscordPresence({ userId = '94490510688792576' }: { userId?: string }) {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanyard = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const json = await response.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch Discord presence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanyard();
    const interval = setInterval(fetchLanyard, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8 bg-card border border-border rounded-lg">
        <p className="text-muted-foreground text-sm">Failed to load Discord presence</p>
      </div>
    );
  }

  const currentActivity = data.activities.find(a => a.name !== 'Custom Status');

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors h-full">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`}
              alt={data.discord_user.username}
            />
            <AvatarFallback>{data.discord_user.username[0]}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-card ${statusColors[data.discord_status]}`}
          />
        </div>
        <div className="w-full">
          <h3 className="font-semibold text-base truncate">{data.discord_user.username}</h3>
          <p className="text-xs text-muted-foreground">@{data.discord_user.username.toLowerCase()}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        {currentActivity ? (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2 text-center">Currently</p>
            <div className="flex flex-col items-center gap-2">
              {currentActivity.assets?.large_image && (
                <img
                  src={
                    currentActivity.assets.large_image.startsWith('mp:')
                      ? `https://media.discordapp.net/${currentActivity.assets.large_image.replace('mp:', '')}`
                      : `https://cdn.discordapp.com/app-assets/${currentActivity.name}/${currentActivity.assets.large_image}.png`
                  }
                  alt={currentActivity.assets.large_text || currentActivity.name}
                  className="h-16 w-16 rounded"
                />
              )}
              <div className="w-full text-center">
                <p className="font-medium text-sm truncate">{currentActivity.name}</p>
                {currentActivity.details && (
                  <p className="text-xs text-muted-foreground truncate">{currentActivity.details}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">No status</p>
            <p className="text-xs text-muted-foreground mt-1">Just chilling...</p>
            <p className="text-xs text-muted-foreground italic mt-2">Enjoy your stay!</p>
          </div>
        )}
      </div>
    </div>
  );
}

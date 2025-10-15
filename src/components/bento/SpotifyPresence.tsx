import { useEffect, useState } from 'react';
import { SiSpotify } from 'react-icons/si';

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  isPlaying: boolean;
}

export function SpotifyPresence() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    // In production, you'd integrate with Last.fm or Spotify API
    const mockTrack: SpotifyTrack = {
      name: 'Your Favorite Song',
      artist: 'Artist Name',
      album: 'Album Name',
      albumArt: 'https://via.placeholder.com/300',
      isPlaying: false,
    };

    setTimeout(() => {
      setTrack(mockTrack);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
        <div className="h-20 w-20 bg-muted rounded animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center justify-center p-8 bg-card border border-border rounded-lg">
        <p className="text-muted-foreground text-sm">No recent tracks</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors group h-full">
      <img
        src={track.albumArt}
        alt={track.album}
        className="h-16 w-16 rounded shadow-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <SiSpotify className="text-accent h-4 w-4" />
          <span className="text-xs text-muted-foreground">
            {track.isPlaying ? 'Now Playing' : 'Last played...'}
          </span>
        </div>
        <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
          {track.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">by {track.artist}</p>
        <p className="text-xs text-muted-foreground truncate mt-1">on {track.album}</p>
      </div>
    </div>
  );
}

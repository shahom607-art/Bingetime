'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Media } from '@/services/tmdb';
import { formatDurationToString } from '@/lib/utils';
import { XCircle, CalendarDays, Info, Film, Tv } from 'lucide-react';

interface WatchlistItemProps {
  item: Media;
  onRemove: (itemId: string) => void;
}

const WatchlistItem: FC<WatchlistItemProps> = ({ item, onRemove }) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <div className="aspect-[2/3] w-full relative">
          <Image
            src={item.poster}
            alt={`${item.title} poster`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${item.type === 'movie' ? 'movie' : 'tv show'} poster`}
          />
           <div className="absolute top-2 right-2 bg-background/80 text-foreground p-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
            {item.type === 'movie' ? <Film size={14}/> : <Tv size={14} />} 
            {item.type === 'movie' ? 'Movie' : 'TV Show'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2" title={item.title}>
          {item.title}
        </CardTitle>
        {item.releaseDate && (
          <p className="text-xs text-muted-foreground mb-1 flex items-center">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            {new Date(item.releaseDate).getFullYear()}
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-2">
          Runtime: {formatDurationToString(item.duration)}
        </p>
        {item.overview && (
           <p className="text-xs text-muted-foreground line-clamp-3" title={item.overview}>
             <Info className="h-3 w-3 mr-1.5 inline-block relative -top-px" />
             {item.overview}
           </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="w-full"
          aria-label={`Remove ${item.title} from watchlist`}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WatchlistItem;

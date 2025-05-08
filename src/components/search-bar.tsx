'use client';

import type { ChangeEvent, FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchMedia, getMediaDetails, type SearchResult, type Media } from '@/services/tmdb'; // Assuming tmdb service exists
import { useWatchlist } from '@/hooks/use-watchlist';
import { Loader2, Search, Film, Tv } from 'lucide-react';
import Image from 'next/image';

const SearchBar: FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addItemToWatchlist } = useWatchlist();

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(true);
    const timerId = setTimeout(async () => {
      try {
        const mediaResults = await searchMedia(query);
        setResults(mediaResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timerId);
  }, [query]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSelectMedia = async (selectedMedia: SearchResult) => {
    setIsFetchingDetails(true);
    setShowSuggestions(false);
    setQuery(''); // Clear search input
    try {
      const details: Media = await getMediaDetails(selectedMedia.id, selectedMedia.type);
      await addItemToWatchlist(details);
    } catch (error) {
      console.error("Error fetching media details or adding to watchlist:", error);
      // Handle error (e.g., show toast)
    } finally {
      setIsFetchingDetails(false);
    }
  };
  
  const getIconForType = (type: string) => {
    if (type === 'movie') return <Film className="h-5 w-5 text-muted-foreground" />;
    if (type === 'tv') return <Tv className="h-5 w-5 text-muted-foreground" />;
    return null;
  };


  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex w-full items-center space-x-2">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for movies or TV shows..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          // onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestions
          className="pl-10 pr-16 h-12 text-lg"
          aria-label="Search media"
        />
        {isFetchingDetails && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {showSuggestions && (query.length > 0) && (
        <Card className="absolute z-10 mt-1 w-full shadow-lg">
          <CardContent className="p-0">
            {isLoading && !results.length ? (
              <div className="p-4 text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading suggestions...
              </div>
            ) : !isLoading && results.length === 0 && query.length > 0 ? (
              <div className="p-4 text-center text-muted-foreground">No results found for "{query}".</div>
            ) : (
              <ScrollArea className="h-auto max-h-80">
                <ul>
                  {results.map((item) => (
                    <li key={item.id} className="border-b last:border-b-0">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 rounded-none"
                        onClick={() => handleSelectMedia(item)}
                        aria-label={`Add ${item.title} to watchlist`}
                      >
                        <div className="flex items-center space-x-3">
                          {getIconForType(item.type)}
                          <span className="font-medium text-left">{item.title}</span>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;

// IMPORTANT: THIS IS A SIMPLIFIED IMPLEMENTATION FOR THE FRONTEND.
// In a real-world application, API keys should NOT be exposed on the client-side.
// API calls should be proxied through a backend (e.g., Firebase Functions) to protect the API key.

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "YOUR_TMDB_API_KEY_HERE"; // Fallback, replace with your actual key or ensure NEXT_PUBLIC_TMDB_API_KEY is set
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


export interface Media {
  id: string; // TMDB ID, converted to string
  title: string;
  type: 'movie' | 'tv';
  duration: number; // in seconds
  poster: string; // Full URL to poster
  releaseDate?: string; // YYYY-MM-DD
  overview?: string;
}

export interface SearchResult {
  id: string; // TMDB ID, converted to string
  title: string;
  type: 'movie' | 'tv';
  posterPath?: string | null; // Relative path
  releaseDate?: string; // YYYY-MM-DD
}

// Helper to fetch and handle TMDB API responses
async function fetchTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
    console.warn("TMDB API Key is not configured. Using mock data.");
    // Simulate API delay for mock data
    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint.startsWith('/search/multi')) {
      return {
        results: [
          { id: 299534, title: "Avengers: Endgame (Mock)", media_type: "movie", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", release_date: "2019-04-24" },
          { id: 1399, name: "Game of Thrones (Mock)", media_type: "tv", poster_path конфигурация/u3bZgnGQ9T01sWNhyveQz0wz0IL.jpg", first_air_date: "2011-04-17" },
          { id: 603, title: "The Matrix (Mock)", media_type: "movie", poster_path_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", release_date: "1999-03-30" }
        ].filter(item => (item.title || item.name)?.toLowerCase().includes(params.query?.toLowerCase() || ""))
      };
    }
    if (endpoint.startsWith('/movie/')) {
      const id = endpoint.split('/')[2];
      return { id: parseInt(id), title: `Mock Movie ${id}`, runtime: 120, poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", release_date: "2023-01-01", overview: "This is a mock movie description." };
    }
    if (endpoint.startsWith('/tv/')) {
      const id = endpoint.split('/')[2];
      return { id: parseInt(id), name: `Mock TV Show ${id}`, episode_run_time: [45], number_of_seasons: 3, number_of_episodes: 30, poster_path: "/u3bZgnGQ9T01sWNhyveQz0wz0IL.jpg", first_air_date: "2022-01-01", overview: "This is a mock TV show description." };
    }
    return { results: [] };
  }


  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });
  const url = `${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`TMDB API Error (${response.status}): ${errorData.status_message || response.statusText} for URL: ${url}`);
    throw new Error(`TMDB API Error: ${errorData.status_message || response.statusText}`);
  }
  return response.json();
}

export async function searchMedia(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await fetchTmdb('/search/multi', { query, include_adult: 'false', language: 'en-US', page: '1' });
  
  return (data.results || [])
    .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name))
    .map((item: any): SearchResult => ({
      id: String(item.id),
      title: item.media_type === 'movie' ? item.title : item.name,
      type: item.media_type as 'movie' | 'tv',
      posterPath: item.poster_path,
      releaseDate: item.media_type === 'movie' ? item.release_date : item.first_air_date,
    }))
    .slice(0, 10); // Limit to 10 results for performance
}


export async function getMediaDetails(id: string, type: 'movie' | 'tv'): Promise<Media> {
  let details;
  let duration = 0;

  if (type === 'movie') {
    details = await fetchTmdb(`/movie/${id}`, { language: 'en-US' });
    duration = (details.runtime || 0) * 60; // Convert minutes to seconds
  } else { // type === 'tv'
    details = await fetchTmdb(`/tv/${id}`, { language: 'en-US' });
    // For TV shows, duration can be complex.
    // Using average episode runtime * total episodes as a common approach.
    // TMDB's episode_run_time can be an array. Take the first, or average.
    const avgEpisodeRuntime = details.episode_run_time && details.episode_run_time.length > 0 
                              ? details.episode_run_time[0] 
                              : 45; // Default if not available
    const totalEpisodes = details.number_of_episodes || (details.seasons?.reduce((sum: number, season: any) => sum + (season.episode_count || 0) , 0) || 0);
    
    duration = (avgEpisodeRuntime || 0) * (totalEpisodes || 0) * 60; // Convert minutes to seconds
    
    // If totalEpisodes is 0 but it's a known series, maybe default to a single season's worth or a placeholder.
    // This logic can be refined based on desired accuracy vs. complexity.
    if (totalEpisodes === 0 && (details.number_of_seasons || 0) > 0) {
        // Fallback: average runtime * typical episodes per season (e.g., 10) * number of seasons
        duration = (avgEpisodeRuntime || 45) * 10 * (details.number_of_seasons || 1) * 60;
    }
    if (duration === 0 && details.id) { // Still 0, maybe it's a miniseries or one-off
        duration = (avgEpisodeRuntime || 45) * 60; // single episode
    }
  }

  return {
    id: String(details.id),
    title: type === 'movie' ? details.title : details.name,
    type,
    duration,
    poster: details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : `https://picsum.photos/seed/${details.id}/500/750`,
    releaseDate: type === 'movie' ? details.release_date : details.first_air_date,
    overview: details.overview,
  };
}

// Mock functions if API key is missing
if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
  console.warn("Using MOCK TMDB functions because API key is not set.");
}

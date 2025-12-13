import { NextRequest, NextResponse } from "next/server";

/**
 * Извлича видео от YouTube чрез няколко различни API ключа в случай на неуспех.
 * Ако не успее да извлече данни от всички ключове, хвърля грешка.
 *
 * @async
 * @function fetchYouTubeWithFailover
 * @param {string} query - Търсенето за видео в YouTube.
 * @returns {Promise<Object>} - Връща обект с videoId и youTubeEmbedUrl.
 * @throws {Error} - Хвърля грешка, ако не успее да извлече данни от всички API ключове.
 */
const fetchYouTubeWithFailover = async (query: string) => {
  const apiKeys = [process.env.YOUTUBE_API_KEY_1, process.env.YOUTUBE_API_KEY_2, process.env.YOUTUBE_API_KEY_3];

  // Filter out undefined keys
  const validKeys = apiKeys.filter((key) => key);

  if (validKeys.length === 0) {
    throw new Error("No YouTube API keys configured");
  }

  for (let i = 0; i < validKeys.length; i++) {
    const apiKey = validKeys[i];
    try {
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${`${encodeURIComponent(query)} - tutorial`}&key=${apiKey}`;

      const response = await fetch(youtubeUrl);

      // Detailed error logging
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`API Key ${i + 1} returned non-OK status: ${response.status}`, errorData);
        continue;
      }

      const data = await response.json();

      // Comprehensive data validation
      if (data.error) {
        console.warn(`API Key ${i + 1} returned an error:`, data.error);
        continue;
      }

      if (!data.items || data.items.length === 0) {
        console.warn(`No videos found for query: "${query}" with API Key ${i + 1}`);
        continue;
      }

      // Extract video ID from the first result
      const videoId = data.items[0]?.id?.videoId;

      if (!videoId) {
        console.warn(`No valid video ID found with API Key ${i + 1}`);
        continue;
      }

      const youTubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

      console.log(`Successfully fetched video for "${query}" using API Key ${i + 1}`);

      return {
        videoId,
        youTubeEmbedUrl,
        snippet: data.items[0].snippet, // Optional: include video details
      };
    } catch (error) {
      console.error(`Detailed error with API Key ${i + 1}:`, error);
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
    }
  }

  throw new Error(`Failed to fetch YouTube video after trying ${validKeys.length} API key(s)`);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const result = await fetchYouTubeWithFailover(q);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in YouTube search route:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

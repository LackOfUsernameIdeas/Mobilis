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
  // Списък с всички налични YouTube API ключове
  const apiKeys = [process.env.YOUTUBE_API_KEY_1, process.env.YOUTUBE_API_KEY_2, process.env.YOUTUBE_API_KEY_3];

  // Филтриране на недефинирани ключове
  const validKeys = apiKeys.filter((key) => key);

  if (validKeys.length === 0) {
    throw new Error("No YouTube API keys configured");
  }

  // Опит за извличане на видео с всеки наличен API ключ
  for (let i = 0; i < validKeys.length; i++) {
    const apiKey = validKeys[i];
    try {
      // Конструиране на YouTube Search API URL с добавка "tutorial" към търсенето
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${`${encodeURIComponent(query)} - tutorial`}&key=${apiKey}`;

      const response = await fetch(youtubeUrl);

      // Детайлно логване на грешки при неуспешен HTTP отговор
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`API Key ${i + 1} returned non-OK status: ${response.status}`, errorData);
        continue; // Преминаване към следващия API ключ
      }

      const data = await response.json();

      // Проверка за грешки в отговора от API
      if (data.error) {
        console.warn(`API Key ${i + 1} returned an error:`, data.error);
        continue;
      }

      // Валидация дали има намерени резултати
      if (!data.items || data.items.length === 0) {
        console.warn(`No videos found for query: "${query}" with API Key ${i + 1}`);
        continue;
      }

      // Извличане на video ID от първия резултат
      const videoId = data.items[0]?.id?.videoId;

      if (!videoId) {
        console.warn(`No valid video ID found with API Key ${i + 1}`);
        continue;
      }

      // Генериране на embed URL за видеото
      const youTubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

      console.log(`Successfully fetched video for "${query}" using API Key ${i + 1}`);

      return {
        videoId,
        youTubeEmbedUrl,
        snippet: data.items[0].snippet, // Допълнително: включване на детайли за видеото
      };
    } catch (error) {
      console.error(`Detailed error with API Key ${i + 1}:`, error);
      // Логване на пълната грешка за debugging
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
    }
  }

  // Хвърляне на грешка ако всички API ключове са изчерпани
  throw new Error(`Failed to fetch YouTube video after trying ${validKeys.length} API key(s)`);
};

/**
 * GET endpoint за търсене на YouTube видео по даден query параметър
 * @param request - NextRequest обект съдържащ "q" като query параметър
 * @returns JSON отговор с videoId, youTubeEmbedUrl и snippet информация
 */
export async function GET(request: NextRequest) {
  try {
    // Извличане на query параметъра от URL адреса
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    // Валидация на задължителния параметър
    if (!q) {
      console.log("Missing required query parameter: q");
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Извикване на функцията с failover логика за търсене на видео
    const result = await fetchYouTubeWithFailover(q);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in YouTube search route:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

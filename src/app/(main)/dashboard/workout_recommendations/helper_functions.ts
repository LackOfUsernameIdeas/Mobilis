export const fetchYouTubeEmbed = async (query: string) => {
  try {
    const response = await fetch(`/api/get-recommendation-video?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.youTubeEmbedUrl || null;
  } catch (error) {
    console.error(`Error fetching YouTube video for ${query}:`, error);
    return null;
  }
};

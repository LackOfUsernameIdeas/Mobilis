import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`;

    const response = await fetch(youtubeUrl);
    const data = await response.json();

    // Extract video ID from the first result
    const videoId = data.items?.[0]?.id?.videoId;

    if (!videoId) {
      return NextResponse.json({ error: "No video found for this query" }, { status: 404 });
    }

    const youTubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

    return NextResponse.json({
      videoId,
      youTubeEmbedUrl,
    });
  } catch (error) {
    console.error("Error in YouTube search route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

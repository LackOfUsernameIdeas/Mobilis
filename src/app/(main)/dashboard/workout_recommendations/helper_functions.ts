export const fetchYouTubeEmbed = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/get-recommendation-video?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.youTubeEmbedUrl || null;
  } catch (error) {
    console.error(`Error fetching YouTube video for ${query}:`, error);
    return null;
  }
};

export const fetchWorkoutRecommendations = async (
  userId: string,
  category: string,
  answers: Record<string, any>,
  userStats: any,
): Promise<any> => {
  try {
    const response = await fetch("/api/get-model-response/workout-recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        category,
        answers,
        userStats,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Server error" }));
      throw new Error(errorData?.error || `Failed to fetch workout recommendations: ${response.status}`);
    }

    const responseJson = await response.json();
    return JSON.parse(responseJson);
  } catch (error) {
    console.error("Error fetching workout recommendations:", error);
    throw new Error(error instanceof Error ? error.message : "An error occurred while fetching recommendations");
  }
};

export const validateNumericInput = (value: string, pattern: RegExp, maxValue: number): boolean => {
  if (value === "") return true;
  if (!pattern.test(value)) return false;

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return true;

  return numericValue <= maxValue;
};

export const calculateWeightDifference = (targetWeight: number, currentWeight: number): string => {
  const difference = targetWeight - currentWeight;
  const sign = difference > 0 ? "+" : "";
  return `${sign}${difference.toFixed(1)} кг от текущото тегло`;
};

export const handleExclusiveCheckbox = (
  selectedItems: string[],
  item: string,
  checked: boolean,
  exclusiveOption: string,
): string[] => {
  // If the exclusive option is being checked, clear all others
  if (item === exclusiveOption && checked) {
    return [exclusiveOption];
  }

  // If any other option is being checked, remove the exclusive option
  if (checked && selectedItems.includes(exclusiveOption)) {
    return [item];
  }

  // Normal checkbox behavior
  return checked ? [...selectedItems, item] : selectedItems.filter((i) => i !== item);
};

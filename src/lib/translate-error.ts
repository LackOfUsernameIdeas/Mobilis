// lib/translate-error.ts

export function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    // Login errors
    "Invalid login credentials": "Невалидни данни за вход",
    "Email not confirmed": "Имейлът не е потвърден",
    "Invalid email or password": "Невалиден имейл или парола",
    "User not found": "Потребителят не е намерен",
    "Invalid credentials": "Невалидни данни",

    // Registration errors
    "User already registered": "Потребителят вече е регистриран",
    "Email already registered": "Имейлът вече е регистриран",
    "Password should be at least 6 characters": "Паролата трябва да бъде поне 6 символа",
    "Signup requires a valid password": "Регистрацията изисква валидна парола",

    // OAuth errors
    "OAuth provider not enabled": "OAuth доставчикът не е активиран",
    "OAuth error": "Грешка при OAuth",

    // Network errors
    "Failed to fetch": "Неуспешна заявка",
    "Network request failed": "Мрежовата заявка се провали",
    "Unable to connect": "Няма връзка",

    // General errors
    "An error occurred": "Възникна грешка",
    "Something went wrong": "Нещо се обърка",
    "Please try again": "Моля, опитайте отново",
  };

  // Check for exact match
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial matches
  for (const [english, bulgarian] of Object.entries(errorMap)) {
    if (errorMessage.includes(english)) {
      return bulgarian;
    }
  }

  // Return original message if no translation found
  return errorMessage;
}

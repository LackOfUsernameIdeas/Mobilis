// lib/translate-error.ts

export function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    // Грешки при вход
    "Invalid login credentials": "Невалидни данни за вход",
    "Email not confirmed": "Имейлът не е потвърден",
    "Invalid email or password": "Невалиден имейл или парола",
    "User not found": "Потребителят не е намерен",
    "Invalid credentials": "Невалидни данни",

    // Грешки при регистрация
    "User already registered": "Потребителят вече е регистриран",
    "Email already registered": "Имейлът вече е регистриран",
    "Password should be at least 6 characters": "Паролата трябва да бъде поне 6 символа",
    "Signup requires a valid password": "Регистрацията изисква валидна парола",

    // OAuth грешки
    "OAuth provider not enabled": "OAuth доставчикът не е активиран",
    "OAuth error": "Грешка при OAuth",

    // Мрежови грешки
    "Failed to fetch": "Неуспешна заявка",
    "Network request failed": "Мрежовата заявка се провали",
    "Unable to connect": "Няма връзка",

    // Общи грешки
    "An error occurred": "Възникна грешка",
    "Something went wrong": "Нещо се обърка",
    "Please try again": "Моля, опитайте отново",
  };

  // Проверка за точно съвпадение
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Проверка за частични съвпадения
  for (const [english, bulgarian] of Object.entries(errorMap)) {
    if (errorMessage.includes(english)) {
      return bulgarian;
    }
  }

  // Връщане на оригиналното съобщение, ако не е намерен превод
  return errorMessage;
}

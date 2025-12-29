import globals
from app import ModernExerciseApp
from preload_exercises import initialize_tts_cache

globals.app = ModernExerciseApp()  # Създаване на ново приложение и записването му в глобална променлива

initialize_tts_cache() # Зареждане на TTS в background thread

globals.app.run() # Стартиране на приложението
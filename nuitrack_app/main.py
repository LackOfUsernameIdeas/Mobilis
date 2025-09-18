import globals
from app import ModernExerciseApp

globals.app = ModernExerciseApp()  # Създаване на ново приложение и записването му в глобална променлива
globals.app.run()  # Стартиране на приложението
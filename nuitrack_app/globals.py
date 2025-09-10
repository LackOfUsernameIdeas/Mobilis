import logging
import os

from exercises import EXERCISE_JSON_5

# Настройка за логване в отделен файл
log_file = os.path.join(os.path.dirname(__file__), 'nuitrack_log.txt')
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, mode='w', encoding='utf-8'),  # Презаписване на файла при всяко стартиране
    ]
)
logger = logging.getLogger(__name__)

# Глобални променливи
session_running = [False]      # Дали сесията е активна
session_start_time = 0         # Време на стартиране на сесията
current_user_skeleton = None   # Последната заснета скелетна рамка на потребителя
exercise_active = [False]      # Дали упражнението е активно
current_step = [0]             # Индекс на текущата стъпка
step_start_time = [0]          # Време на стартиране на текущата стъпка
nuitrack_instance = None       # Инстанция на Nuitrack
depth_to_color_frame = None    # Преобразувана дълбочинна рамка към цветова
user_metrics = None            # Данни от калибриране (височина, дължина на ръка, ширина на таз)
previous_user_skeleton = None  # Скелет от предишния кадър за откриване на движение
calibration_active = [False]   # Следи дали е активна калибриране
calibration_start_time = [0]   # Време на стартиране на калибриране

app = None                     # Основен обект на приложението

# Обект за упражнение
EXERCISE_JSON = EXERCISE_JSON_5
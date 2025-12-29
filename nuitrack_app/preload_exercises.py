"""
Помощен модул за предварително зареждане на TTS аудио файлове
Използвай това при стартиране на приложението
"""

import logging
import globals

logger = logging.getLogger(__name__)

def preload_all_exercise_instructions():
    """
    Предварително зарежда ВСИЧКИ инструкции от всички упражнения.
    Това елиминира латентността при първото произнасяне.
    """
    all_instructions = []
    
    logger.info("Starting to collect exercise instructions for preloading...")
    
    # Обхожда всички упражнения от globals
    for exercise_idx, exercise in enumerate(globals.ALL_EXERCISES):
        exercise_name = exercise.get("exercise_name", f"Exercise {exercise_idx + 1}")
        logger.debug(f"Processing {exercise_name}...")
        
        # Обхожда всички стъпки
        for step in exercise["steps"]:
            # Комбинира име и инструкции точно както в speak_step()
            full_text = f"{step['name']}. {step['instructions']}"
            all_instructions.append(full_text)
    
    logger.info(f"Collected {len(all_instructions)} unique instructions")
    
    # Стартира предварителното зареждане в background thread
    globals.tts_manager.preload_phrases(all_instructions)
    logger.info("Started preloading audio files in background...")
    
    return len(all_instructions)

def preload_common_messages():
    """
    Предварително зарежда често използвани съобщения.
    Извикай това заедно с preload_all_exercise_instructions()
    """
    common_messages = [
        "Готови ли сте?",
        "Започваме",
        "Отлична работа!",
        "Почивка",
        "Продължаваме",
        "Упражнението е завършено!",
        "Поздравления!",
        "Коригирайте позата",
        "Перфектно!",
        "Задръжте позицията"
    ]
    
    logger.info(f"Preloading {len(common_messages)} common messages...")
    globals.tts_manager.preload_phrases(common_messages)
    
    return len(common_messages)

def initialize_tts_cache():
    """
    Главна функция за инициализиране на TTS кеша.
    Извикай това след създаване на GUI, преди mainloop().
    """
    try:
        logger.info("=" * 50)
        logger.info("TTS Cache Initialization Started")
        logger.info("=" * 50)
        
        # Стартира TTS мениджъра
        globals.tts_manager.start()
        
        # Зарежда всички упражнения
        exercise_count = preload_all_exercise_instructions()
        
        # Зарежда общи съобщения
        message_count = preload_common_messages()
        
        total = exercise_count + message_count
        
        logger.info("=" * 50)
        logger.info(f"TTS Cache: {total} phrases queued for preloading")
        logger.info("This will run in background - app is ready to use!")
        logger.info("=" * 50)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize TTS cache: {e}")
        return False
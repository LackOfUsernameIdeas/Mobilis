import logging
import threading
import globals

logger = logging.getLogger(__name__)

class CacheStatus:
    """Следи състоянието на кеширането"""
    def __init__(self):
        self.is_caching = False
        self.is_complete = False
        self.current = 0
        self.total = 0
        self.error = None
        self.files_generated = 0
        self._lock = threading.Lock()
    
    def update_progress(self, current, total, generated=False):
        """Актуализира прогреса на кеширането"""
        with self._lock:
            self.current = current
            self.total = total
            if generated: 
                self.files_generated += 1
    
    def start(self, total):
        """Маркира началото на кеширането"""
        with self._lock:
            self.is_caching = True
            self.is_complete = False
            self.current = 0
            self.files_generated = 0
            self.total = total
            self.error = None
    
    def finish(self, error=None):
        """Маркира края на кеширането"""
        with self._lock:
            self.is_caching = False
            self.is_complete = True
            self.error = error
    
    def get_progress_text(self):
        """Връща текст за прогреса"""
        with self._lock:
            if self.error:
                return f"❌ Грешка при кеширане: {self.error}"
            elif self.is_complete:
                return f"✅ Готово! ({self.total} инструкции)"
            elif self.is_caching:
                percentage = (self.current / self.total * 100) if self.total > 0 else 0
                return f"⏳ Зареждане на аудио инструкции... {self.current}/{self.total} ({percentage:.0f}%)"
            else:
                return "Зареждане..."

# Глобална инстанция на статуса
cache_status = CacheStatus()

def initialize_tts_cache():
    """
    Предварително генерира и кешира всички инструкции от всички упражнения.
    Извиква се веднъж при стартиране на приложението в background thread.
    """
    def preload_worker():
        try:
            logger.info("🔄 Starting TTS cache initialization...")
            
            # Събира всички уникални инструкции от всички упражнения
            all_instructions = []
            for exercise in globals.ALL_EXERCISES:
                for step in exercise["steps"]:
                    instruction_text = step["instructions"]
                    if instruction_text and instruction_text not in all_instructions:
                        all_instructions.append(instruction_text)
            
            total = len(all_instructions)
            logger.info(f"📝 Found {total} unique instructions to preload")
            
            # Маркира началото
            cache_status.start(total)
            
            # Инициализира TTS мениджъра
            if not globals.tts_manager._lazy_initialize():
                raise Exception("Failed to initialize TTS manager")
            
            # Генерира всяка инструкция поотделно с прогрес
            for idx, text in enumerate(all_instructions, 1):
                try:
                    cache_path = globals.tts_manager._get_cache_path(text)
                    logger.info(f"Cache path: {cache_path}")

                    # Генерира файла ако не съществува
                    if not os.path.exists(cache_path):
                        logger.info(f"[{idx}/{total}] Generating: {text[:40]}...")
                        globals.tts_manager._generate_audio_file(text, cache_path)
                    else:
                        logger.debug(f"[{idx}/{total}] Already cached: {text[:40]}...")
                    
                    # Запазва пътя в паметта
                    globals.tts_manager.preloaded_audio[text] = cache_path
                    
                    # Актуализира прогреса
                    cache_status.update_progress(idx, total, generated=not os.path.exists(cache_path))
                    
                    # Актуализира UI ако приложението е заредено
                    if globals.app and hasattr(globals.app, 'update_cache_status'):
                        globals.app.root.after(0, lambda: globals.app.update_cache_status())
                    
                except Exception as e:
                    logger.error(f"[{idx}/{total}] Error preloading '{text[:30]}...': {e}")
            
            # Маркира завършването
            cache_status.finish()
            logger.info(f"✅ TTS cache initialization complete - {total} instructions ready!")
            
            # Финална актуализация на UI
            if globals.app and hasattr(globals.app, 'update_cache_status'):
                globals.app.root.after(0, lambda: globals.app.update_cache_status())
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Error during TTS cache initialization: {error_msg}")
            cache_status.finish(error=error_msg)
            
            # Актуализира UI с грешката
            if globals.app and hasattr(globals.app, 'update_cache_status'):
                globals.app.root.after(0, lambda: globals.app.update_cache_status())
    
    # Стартира в background thread за да не блокира UI
    threading.Thread(target=preload_worker, daemon=True).start()
    logger.info("🚀 TTS cache initialization started in background")

import os  # Добавяме импорта тук за _get_cache_path
import logging
import threading
import queue
import pyttsx3

logger = logging.getLogger(__name__)

class TTSManager:
    """Управлява text-to-speech за прочитане на инструкции за упражнения"""
    
    def __init__(self):
        self.initialized = False
        self.engine = None
        self.tts_queue = queue.Queue()
        self.tts_thread = None
        self.running = False
        self.current_speech_thread = None
        
    def _lazy_initialize(self):
        """Инициализира TTS engine само при първа нужда"""
        if self.initialized:
            return True
            
        try:
            self.initialized = True
            logger.info("TTS manager initialized successfully")
            return True
            
        except ImportError:
            logger.error("pyttsx3 not installed. Run: pip install pyttsx3")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize TTS manager: {e}")
            return False
    
    def _init_engine_in_thread(self):
        """Инициализира pyttsx3 engine в работния thread, нужно за COM под Windows"""
        if self.engine is not None:
            return True
            
        try:
            self.engine = pyttsx3.init()
            
            # Настройки на гласа
            self.engine.setProperty('rate', 150)
            self.engine.setProperty('volume', 0.9)
            
            # Опит за избор на български глас, ако е наличен
            voices = self.engine.getProperty('voices')
            for voice in voices:
                if 'bg' in voice.languages or 'bulgarian' in voice.name.lower():
                    self.engine.setProperty('voice', voice.id)
                    logger.info(f"Using Bulgarian voice: {voice.name}")
                    break
            else:
                logger.info("No Bulgarian voice found, using default voice")
            
            logger.info("TTS engine initialized in worker thread")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS engine in thread: {e}")
            return False
    
    def _speak_text(self, text):
        """Произнася един текст в отделен thread"""
        try:
            # Създава engine в този thread при нужда
            local_engine = pyttsx3.init()
            local_engine.setProperty('rate', 150)
            
            logger.info(f"Speaking: {text[:50]}...")
            local_engine.say(text)
            local_engine.runAndWait()
            
            # Освобождаване на ресурси
            del local_engine
            logger.info("Finished speaking")
            
        except Exception as e:
            logger.error(f"Error speaking text: {e}")
    
    def _tts_worker(self):
        """Фонов thread, който обработва TTS опашката"""
        while self.running:
            try:
                # Взима текст от опашката с timeout
                text = self.tts_queue.get(timeout=0.5)
                
                # None се използва като сигнал за спиране на thread-а
                if text is None:
                    break
                
                # Проверява дали в момента има активно говорене
                if self.current_speech_thread and self.current_speech_thread.is_alive():
                    logger.debug("Interrupting previous speech")
                    # Оставя текущото говорене да приключи естествено
                
                # Стартира ново говорене в отделен thread
                self.current_speech_thread = threading.Thread(
                    target=self._speak_text, 
                    args=(text,),
                    daemon=True
                )
                self.current_speech_thread.start()
                
                self.tts_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in TTS worker: {e}")
    
    def start(self):
        """Стартира фоновия TTS thread"""
        if not self._lazy_initialize():
            return False
        
        if not self.running:
            self.running = True
            self.tts_thread = threading.Thread(target=self._tts_worker, daemon=True)
            self.tts_thread.start()
            logger.info("TTS worker thread started")
        
        return True
    
    def speak(self, text, interrupt=False):
        """
        Добавя текст към TTS опашката
        
        Аргументи:
            text: Текст за произнасяне
            interrupt: При True изчиства опашката преди добавяне
        """
        if not self.initialized and not self._lazy_initialize():
            return
        
        if not self.running:
            self.start()
        
        try:
            if interrupt:
                # Изчиства текущата опашка
                while not self.tts_queue.empty():
                    try:
                        self.tts_queue.get_nowait()
                        self.tts_queue.task_done()
                    except queue.Empty:
                        break
                
                logger.debug("Queue cleared for interrupt")
            
            self.tts_queue.put(text)
            logger.info(f"Added to TTS queue: {text[:50]}...")
            
        except Exception as e:
            logger.error(f"Error adding text to TTS queue: {e}")
    
    def speak_step(self, step_name, instructions):
        """Произнася инструкциите за стъпка веднага и прекъсва текущото говорене"""
        text = f"{step_name}. {instructions}"
        self.speak(text, interrupt=True)
    
    def stop(self):
        """Спира TTS и изчиства опашката"""
        try:
            # Изчиства опашката
            while not self.tts_queue.empty():
                try:
                    self.tts_queue.get_nowait()
                    self.tts_queue.task_done()
                except queue.Empty:
                    break
            
            logger.debug("TTS stopped and queue cleared")
            
        except Exception as e:
            logger.error(f"Error stopping TTS: {e}")
    
    def cleanup(self):
        """Освобождава всички TTS ресурси"""
        try:
            self.running = False
            
            # Изпраща сигнал за спиране на worker thread-а
            if self.tts_thread and self.tts_thread.is_alive():
                self.tts_queue.put(None)
                self.tts_thread.join(timeout=2.0)
            
            self.initialized = False
            logger.info("TTS engine cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up TTS: {e}")

# Създава глобална инстанция на TTS мениджъра
tts_manager = TTSManager()
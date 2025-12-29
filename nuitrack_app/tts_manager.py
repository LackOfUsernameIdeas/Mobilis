import logging
import threading
import queue
import os
from pathlib import Path
from dotenv import load_dotenv

import requests
import sys
import tempfile

import pygame

logger = logging.getLogger(__name__)

# Получаване на абсолютен път до .env файла
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class TTSManager:
    """Управлява text-to-speech за прочитане на инструкции за упражнения"""
    
    def __init__(self, cache_dir=None):
        self.initialized = False
        self.tts_queue = queue.Queue()
        self.tts_thread = None
        self.running = False
        self.current_speech_thread = None
        
        # OpenAI API настройки
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = "https://api.openai.com/v1/audio/speech"
        self.model = "gpt-4o-mini-tts"
        self.voice = "coral" 
        self.instructions = "Speak in a friendly, clear, and natural tone. Pronounce Bulgarian correctly, with normal speed."
        
        if cache_dir is None:
            if getattr(sys, 'frozen', False):
                # Извличане на tts_cache директорията при компилирано .exe
                base_path = sys._MEIPASS
                cache_dir = os.path.join(base_path, 'tts_cache')
            else:
                base_path = os.path.dirname(os.path.abspath(__file__))
                cache_dir = os.path.join(base_path, "tts_cache")

        # Кеш директория за предварително генерирани аудио файлове
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)
        self.cache_enabled = True
        
        # Предварително зареждане на често използвани фрази
        self.preloaded_audio = {}
        
    def _lazy_initialize(self):
        """Инициализира TTS engine само при първа нужда"""
        if self.initialized:
            return True
            
        try:
            # Инициализира pygame mixer веднъж в началото
            if not pygame.mixer.get_init():
                # Намалени буфери за по-малка латентност
                pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
                logger.info("Pygame mixer initialized with optimized settings")
            
            self.initialized = True
            logger.info("TTS manager initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS manager: {e}")
            return False
    
    def _get_cache_path(self, text):
        """Генерира път за кеширан файл базиран на текста"""
        import hashlib
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        return os.path.join(self.cache_dir, f"openai_tts_{text_hash}.mp3")
    
    def preload_phrases(self, phrases):
        """
        Предварително генерира и кешира често използвани фрази
        Извиква това в началото с често използваните инструкции
        
        Аргументи:
            phrases: List или dict с текстове за предварително зареждане
        """
        if not self._lazy_initialize():
            return
        
        def preload_worker():
            items = list(phrases.items() if isinstance(phrases, dict) else enumerate(phrases))
            total = len(items)
            
            for idx, (key, text) in enumerate(items, 1):
                try:
                    cache_path = self._get_cache_path(text)
                    
                    # Генерира файла ако не съществува
                    if not os.path.exists(cache_path):
                        logger.info(f"[{idx}/{total}] Generating: {text[:40]}...")
                        self._generate_audio_file(text, cache_path)
                    else:
                        logger.debug(f"[{idx}/{total}] Already cached: {text[:40]}...")
                    
                    # Запазва пътя в паметта
                    self.preloaded_audio[text] = cache_path
                    
                except Exception as e:
                    logger.error(f"[{idx}/{total}] Error preloading: {e}")
            
            logger.info(f"✓ Preloading complete! {len(self.preloaded_audio)} phrases ready.")
        
        # Стартира в background thread, за да не блокира
        threading.Thread(target=preload_worker, daemon=True).start()
    
    def _generate_audio_file(self, text, output_path):
        """
        Генерира аудио файл от текст използвайки OpenAI TTS API
        
        Args:
            text: Текст за произнасяне
            output_path: Път където да се запази аудио файла
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "input": text,
            "voice": self.voice,
            "instructions": self.instructions,
            "response_format": "mp3"
        }
        
        try:
            response = requests.post(
                self.api_url, 
                headers=headers, 
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                logger.debug(f"Audio generated and saved to {output_path}")
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                raise Exception(f"API request failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling OpenAI API: {e}")
            raise
    
    def _speak_text_openai(self, text):
        """Произнася текст използвайки OpenAI TTS"""
        temp_file = None
        try:            
            logger.info(f"Speaking with OpenAI TTS: {text[:50]}...")
            
            # Проверка за кеширан файл
            if self.cache_enabled and text in self.preloaded_audio:
                audio_file = self.preloaded_audio[text]
                logger.debug("Using preloaded audio")
            else:
                # Проверка за кеширан файл на диска
                cache_path = self._get_cache_path(text)
                if self.cache_enabled and os.path.exists(cache_path):
                    audio_file = cache_path
                    logger.debug("Using cached audio file")
                else:
                    # Генерира нов файл
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
                        temp_file = fp.name
                    
                    self._generate_audio_file(text, temp_file)
                    audio_file = temp_file
                    
                    # Кешира файла ако е разрешено
                    if self.cache_enabled:
                        try:
                            import shutil
                            shutil.copy(temp_file, cache_path)
                            logger.debug(f"Cached audio to {cache_path}")
                        except Exception as e:
                            logger.warning(f"Could not cache audio: {e}")
            
            # Възпроизвежда аудиото
            pygame.mixer.music.load(audio_file)
            pygame.mixer.music.play()
            
            # Изчаква завършване
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
            
            logger.info("Finished speaking with OpenAI TTS")
            
        except Exception as e:
            logger.error(f"Error speaking with OpenAI TTS: {e}")
        finally:
            # Изчиства временния файл само ако е създаден нов
            if temp_file and os.path.exists(temp_file):
                try:
                    pygame.mixer.music.unload()
                    os.unlink(temp_file)
                except Exception as e:
                    logger.warning(f"Could not delete temp file: {e}")
    
    def _speak_text(self, text):
        """Произнася един текст в отделен thread"""
        self._speak_text_openai(text)
    
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
    
    def speak_step(self, instructions):
        """Произнася инструкциите за стъпка веднага и прекъсва текущото говорене"""
        text = f"{instructions}"
        self.speak(text, interrupt=True)
    
    def stop(self):
        """Спира TTS и изчиства опашката"""
        try:
            # Спира pygame mixer
            try:
                if pygame.mixer.get_init():
                    pygame.mixer.music.stop()
            except:
                pass
            
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
            
            # Спира pygame mixer
            try:
                if pygame.mixer.get_init():
                    pygame.mixer.quit()
            except:
                pass
            
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
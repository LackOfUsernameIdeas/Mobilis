import os
import logging
import threading
import sys

logger = logging.getLogger(__name__)

class SoundManager:
    """Manages sound effects for the application"""
    
    def __init__(self):
        self.initialized = False
        self.step_complete_path = None
        self.exercise_complete_path = None
        self.pygame_mixer = None
        self.winsound = None
        self.playback_method = None
        
        # Prepare paths but don't initialize yet
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.step_complete_path = os.path.join(base_dir, 'step_complete_sound.wav')
        self.exercise_complete_path = os.path.join(base_dir, 'exercise_complete_sound.wav')
        
        # Log file existence
        if os.path.exists(self.step_complete_path):
            logger.info(f"Found step_complete_sound.wav")
        else:
            logger.warning(f"step_complete_sound.wav not found at {self.step_complete_path}")
            
        if os.path.exists(self.exercise_complete_path):
            logger.info(f"Found exercise_complete_sound.wav")
        else:
            logger.warning(f"exercise_complete_sound.wav not found at {self.exercise_complete_path}")
    
    def _lazy_initialize(self):
        """Initialize sound system only when first needed"""
        if self.initialized:
            return True
            
        # Try winsound first (Windows built-in, no dependencies)
        if sys.platform == 'win32':
            try:
                import winsound
                self.winsound = winsound
                self.playback_method = 'winsound'
                self.initialized = True
                logger.info("Using winsound for audio playback")
                return True
            except ImportError:
                logger.debug("winsound not available")
        
        # Try pygame as fallback
        try:
            import pygame.mixer
            pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
            self.pygame_mixer = pygame.mixer
            self.playback_method = 'pygame'
            self.initialized = True
            logger.info("Using pygame.mixer for audio playback")
            return True
        except Exception as e:
            logger.warning(f"pygame.mixer initialization failed: {e}")
        
        logger.error("No audio playback method available. Sounds will be disabled.")
        return False
    
    def _play_sound_threaded(self, sound_path, sound_name):
        """Play sound in a separate thread to avoid blocking"""
        def _play():
            try:
                if not os.path.exists(sound_path):
                    logger.debug(f"{sound_name} not found: {sound_path}")
                    return
                
                if not self._lazy_initialize():
                    return
                
                if self.playback_method == 'winsound' and self.winsound:
                    # SND_ASYNC plays sound asynchronously (non-blocking)
                    self.winsound.PlaySound(
                        sound_path, 
                        self.winsound.SND_FILENAME | self.winsound.SND_ASYNC
                    )
                    logger.debug(f"Played {sound_name} with winsound")
                    
                elif self.playback_method == 'pygame' and self.pygame_mixer:
                    sound = self.pygame_mixer.Sound(sound_path)
                    sound.play()
                    logger.debug(f"Played {sound_name} with pygame")
                    
            except Exception as e:
                logger.error(f"Error playing {sound_name}: {e}")
        
        # Play in background thread to avoid blocking
        thread = threading.Thread(target=_play, daemon=True)
        thread.start()
    
    def play_step_complete(self):
        """Play sound when a step is completed"""
        self._play_sound_threaded(self.step_complete_path, "step completion sound")
    
    def play_exercise_complete(self):
        """Play sound when the entire exercise is completed"""
        self._play_sound_threaded(self.exercise_complete_path, "exercise completion sound")
    
    def stop_all(self):
        """Stop all currently playing sounds"""
        try:
            if self.playback_method == 'pygame' and self.pygame_mixer and self.initialized:
                self.pygame_mixer.stop()
                logger.debug("Stopped all pygame sounds")
            elif self.playback_method == 'winsound' and self.winsound:
                # Stop winsound playback
                self.winsound.PlaySound(None, self.winsound.SND_PURGE)
                logger.debug("Stopped winsound playback")
        except Exception as e:
            logger.error(f"Error stopping sounds: {e}")
    
    def cleanup(self):
        """Clean up sound resources"""
        try:
            if self.playback_method == 'pygame' and self.pygame_mixer and self.initialized:
                self.pygame_mixer.quit()
                self.initialized = False
                logger.info("pygame.mixer cleaned up")
        except Exception as e:
            logger.error(f"Error cleaning up sound system: {e}")

# Create a global sound manager instance
sound_manager = SoundManager()
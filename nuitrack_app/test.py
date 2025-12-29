"""
Reads a specific step using TTS
"""
import time
from exercises import EXERCISE_JSON_7
from tts_manager import tts_manager

def read_step(step_number):
    """Reads a specific step"""
    steps = EXERCISE_JSON_7['steps']
    idx = step_number - 1
    if not (0 <= idx < len(steps)):
        print(f"Invalid step number. Exercise has 1-{len(steps)} steps")
        return

    if not tts_manager.start():
        print("Failed to start TTS manager!")
        return

    try:
        step = steps[idx]
        print(f"Reading step {step_number}: {step['instructions']}")
        tts_manager.speak_step(step['instructions'])
        time.sleep(step['duration_seconds'] + 10)

        print(f"\n✓ Finished reading step {step_number}")

    finally:
        tts_manager.stop()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <step_number>")
    else:
        try:
            step_number = int(sys.argv[1])
            read_step(step_number)
        except ValueError:
            print("Step number must be an integer")

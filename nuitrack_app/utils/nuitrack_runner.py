import time
import custom_messagebox as messagebox
import cv2
from PyNuitrack import py_nuitrack

from utils.calibration import update_calibration_progress
from utils.exercise_logic import check_relative_pose, update_exercise_progress
from utils.skeleton_processing import process_skeleton_data
from utils.visualization import draw_simple_skeleton, draw_text

import globals

def run_nuitrack():
    """Главен цикъл на Nuitrack програмата - обработва скелетни данни и показва камерата."""
    
    try:
        # 1) Инициализация на Nuitrack обект
        nuitrack = py_nuitrack.Nuitrack()
        globals.nuitrack_instance = nuitrack
        nuitrack.init()
        
        devices = nuitrack.get_device_list()
        if devices:
            nuitrack.set_device(devices[0])
        
        nuitrack.create_modules()
        nuitrack.run()
        
        # 2) Запис на началното време на сесията
        globals.session_start_time = time.time()
        
        # 3) Главен цикъл за обработка на данни
        while globals.session_running:
            cv2.waitKey(1)

            try:
                # Обновяване на данните от сензора
                nuitrack.update()
                
                skeleton_data = nuitrack.get_skeleton()
                img_color = nuitrack.get_color_data()
                
                # Опит за взимане на depth-to-color съответствие
                try:
                    globals.depth_to_color_frame = nuitrack.get_depth_to_color_frame()
                except:
                    pass
                
                # Обработка на скелетните данни
                process_skeleton_data(skeleton_data)
                
                # Рисуване върху видео потока
                if img_color.size:
                    draw_simple_skeleton(img_color, skeleton_data, nuitrack)
                    
                    # 4) Изчисляване на изминалото време
                    elapsed = time.time() - globals.session_start_time
                    minutes = int(elapsed // 60)
                    seconds = elapsed % 60
                    
                    # 5) Събиране на статус линии за показване върху видео
                    status_lines = [
                        f"Сесия: {minutes:02d}:{seconds:05.2f}",
                        f"Скелет: {'ЗАСЕЧЕН' if globals.current_user_skeleton else 'ТЪРСЕНЕ...'}",
                    ]
                    
                    # Статус при калибриране
                    if globals.calibration_active:
                        elapsed_cal = time.time() - globals.calibration_start_time
                        remaining_cal = max(0, 5 - elapsed_cal)
                        status_lines.extend([
                            f"КАЛИБРИРАНЕ: {remaining_cal:.1f} секунди остават"
                        ])
                    
                    # Статус при упражнение
                    elif globals.exercise_active:
                        step_data = globals.EXERCISE_JSON["steps"][globals.current_step]
                        if globals.current_user_skeleton and globals.user_metrics:
                            accuracy, details = check_relative_pose(
                                globals.current_user_skeleton,
                                step_data.get("required_poses", {}),
                                step_data.get("target_angles", {}),
                                step_data.get("tolerance", {"angle_tolerance": 20, "distance_tolerance": 0.2}),
                                globals.user_metrics
                            )
                        else:
                            accuracy = 0
                        
                        status_lines.extend([
                            f"Упражнение: Стъпка {globals.current_step + 1}/{len(globals.EXERCISE_JSON['steps'])}",
                            f"Точност: {accuracy:.0f}%",
                            f"Цел: {step_data['name']}"
                        ])
                    
                    # Статус при изчакване
                    else:
                        status_lines.append("Упражнение: В готовност за стартиране")
                    
                    # 6) Показване на всички статус линии върху екрана
                    for i, line in enumerate(status_lines):
                        y_pos = 30 + (i * 25)
                        img_color = draw_text(img_color, line, (10, y_pos))
                                        
                    cv2.namedWindow('OpenCV - Nuitrack SDK', cv2.WINDOW_NORMAL)
                    cv2.resizeWindow('OpenCV - Nuitrack SDK', 1024, 768)
                    cv2.imshow('OpenCV - Nuitrack SDK', img_color)
                
            except Exception as e:
                print(f"Loop error: {e}")
            
        print("=== SESSION ENDED ===")
        
    except Exception as e:
        print(f"Nuitrack error: {e}")
        messagebox.showerror("Error", f"Nuitrack failed: {e}")
    finally:
        # Освобождаване на ресурси
        globals.nuitrack_instance = None
        try:
            nuitrack.release()
        except:
            pass
        cv2.destroyAllWindows()

def update_timer_display():
    """Обновява таймера и прогреса в отделен нишков процес (thread)."""
    
    while globals.session_running:
        try:
            # Изчисляване на изминалото време от старта на сесията
            if globals.session_running:
                elapsed = time.time() - globals.session_start_time
                minutes = int(elapsed // 60)   # цели минути
                seconds = elapsed % 60         # остатъчни секунди
                globals.app.elapsed_label.config(text=f"Session Time: {minutes:02d}:{seconds:05.2f}")
            
            # Обновяване на прогреса:
            #    - Ако е активна калибриране → обновяваме прогреса на калибрирането
            #    - Ако е активно упражнение → обновяваме прогреса на упражнението
            if globals.calibration_active:
                update_calibration_progress()
            elif globals.exercise_active:
                update_exercise_progress()
            
            # Пауза между обновяванията, за да не натоварваме CPU
            time.sleep(0.1)
        
        except:
            # При грешка прекратяваме нишката
            break

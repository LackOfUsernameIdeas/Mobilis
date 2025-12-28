import time
import custom_messagebox as messagebox

import numpy as np
from utils.skeleton_processing import calculate_3d_distance, process_skeleton_data

import globals

def perform_calibration(nuitrack):
    """Калибриране на неутрална поза."""

    # Ако нямаме инициализиран Nuitrack обект, прекратяваме функцията
    if not nuitrack:
        globals.logger.error("No Nuitrack instance provided")
        return None
    
    # Записване времето на начало на калибрирането
    start_time = time.time()
    # Инициализира списък за съхранение на данни за скелета
    samples = []
    
    # Продължава цикъла за 5 секунди, докато сесията и калибрирането са активни
    while time.time() - start_time < 5 and globals.session_running and globals.calibration_active:
        try:
            nuitrack.update() # Актуализиране на данните от камерата
            skeleton_data = nuitrack.get_skeleton()
            process_skeleton_data(skeleton_data, debug=True)
            
            # Проверка дали има достатъчно зесечени стави
            if (globals.current_user_skeleton and len(globals.current_user_skeleton) >= 6):  # Трябва да имаме поне 6 засечени стави

                # Проверка на важни стави за калибриране
                required_joints = ['HEAD', 'TORSO', 'LEFT_ANKLE', 'RIGHT_ANKLE', 'RIGHT_SHOULDER', 'RIGHT_WRIST']
                missing_joints = [j for j in required_joints if j not in globals.current_user_skeleton or globals.current_user_skeleton[j].get('confidence', 0) < 0.4]
                if not missing_joints:
                    samples.append(dict(globals.current_user_skeleton))
                else:
                    globals.logger.debug(f"Calibration: Missing or low-confidence joints: {missing_joints}")
            time.sleep(0.05)

        except Exception as e:
            globals.logger.error(f"Calibration update error: {e}")
    
    # Проверка за достатъчен брой валидни обекти със засечени стави
    if len(samples) < 5: 
        globals.logger.info(f"Calibration failed: Only {len(samples)} valid samples (need 5)")
        feedback = f"Не са открити достатъчно валидни пози. Събрани са само {len(samples)} проби.\n"
        feedback += "Уверете се: Цялото тяло е видимо, стойте неподвижно, ръцете надолу, краката заедно.\n"
        feedback += "Проверете прозореца на OpenCV за скелета (жълти линии, магента точки)."
        messagebox.showwarning("Неуспешно калибриране", feedback)
        return None
    
    # Усредняване на данните за всяка става
    avg_skeleton = {}
    try:
        for joint in samples[0].keys():
            # Проверка дали всички проби съдържат тази става
            if any(joint not in s for s in samples):
                raise KeyError(joint)
            
            avg_skeleton[joint] = {
                "x": np.mean([s[joint]['x'] for s in samples]),
                "y": np.mean([s[joint]['y'] for s in samples]),
                "z": np.mean([s[joint]['z'] for s in samples])
            }

    except KeyError as missing_joint:
        globals.logger.error(f"Calibration failed: Missing joint {missing_joint}")
        messagebox.showerror("Неуспешно калибриране", "Неуспешно калибриране. Моля, опитайте пак!")
        return None

    # Проверка дали торсът е центриран и на правилна дистанция
    torso_x = avg_skeleton.get('TORSO', {}).get('x', 0)
    torso_z = avg_skeleton.get('TORSO', {}).get('z', 1500)
    if abs(torso_x) > 400 or not (1000 < torso_z < 3000):  # Relaxed X to 400mm
        globals.logger.error(f"Calibration failed: Torso off-center (X={torso_x:.0f}mm) or bad distance (Z={torso_z:.0f}mm)")
        feedback = "Торсът не е в правилна позиция. Твърде сте близо или далече.\n"
        feedback += "Застанете изправени в центъра на кадъра на около 1.5–2м от камерата.\n"
        feedback += "Осветлението трябва да е равномерно – не твърде тъмно и не твърде силно. Камерата да е на височината на гърдите."
        messagebox.showwarning("Нужно е коригиране на позицията", feedback)
        return None
    
    # Изчисляване на височината на потребителя
    height = abs(avg_skeleton.get('HEAD', {}).get('y', 0) - avg_skeleton.get('LEFT_ANKLE', {}).get('y', 0))
    if height < 1000 or height > 2500:
        globals.logger.error(f"Calibration failed: Unrealistic height ({height:.0f}mm)")
        feedback = f"Нереалистична височина ({height:.0f}мм). Увери се, че главата и глезените са засечени.\n"
        feedback += "Провери OpenCV прозореца за стабилно скелетно проследяване."
        messagebox.showwarning("Калибрирането е неуспешна", feedback)
        return None
    
    # Изчисляване на дължина и ширина на различни части на тялото
    arm_length = calculate_3d_distance(avg_skeleton.get('RIGHT_SHOULDER'), avg_skeleton.get('RIGHT_WRIST'))
    hip_width = abs(avg_skeleton.get('RIGHT_HIP', {}).get('x', 0) - avg_skeleton.get('LEFT_HIP', {}).get('x', 0))
    shoulder_width = abs(avg_skeleton.get('RIGHT_SHOULDER', {}).get('x', 0) - avg_skeleton.get('LEFT_SHOULDER', {}).get('x', 0))
    left_leg = abs(avg_skeleton.get('LEFT_HIP', {}).get('y', 0) - avg_skeleton.get('LEFT_KNEE', {}).get('y', 0))
    right_leg = abs(avg_skeleton.get('RIGHT_HIP', {}).get('y', 0) - avg_skeleton.get('RIGHT_KNEE', {}).get('y', 0))
    leg_length = max(left_leg, right_leg) if left_leg or right_leg else 500  # Default if missing
    standing_head_y = avg_skeleton.get('HEAD', {}).get('y', height * 0.8) - avg_skeleton.get('TORSO', {}).get('y', 0)

    globals.user_metrics = {
        "height": height,
        "arm_length": arm_length,
        "hip_width": hip_width,
        "shoulder_width": shoulder_width,
        "leg_length": leg_length,
        "standing_head_y": standing_head_y
    }

    globals.calibration_completed = True
    
    # Пускане на звук при успешно калибриране
    globals.sound_manager.play_exercise_complete()

    globals.logger.info(f"Calibration successful: {len(samples)} samples collected")
    return globals.user_metrics

def update_calibration_progress():
    """Актуализира таймера на калибрирането с визуално обратно броене."""

    # Проверява дали калибрирането е активно
    if not globals.calibration_active:
        return

def calculate_tolerances(tolerances, user_metrics):
    """Изчисляване на толеранси базирани на метриките на потребителя."""
    return {
        'arm_tol': tolerances['distance_tolerance'] * user_metrics['arm_length'],
        'hip_tol': tolerances['distance_tolerance'] * user_metrics['hip_width'],
        'height_tol': tolerances['distance_tolerance'] * user_metrics['height'],
        'leg_tol': tolerances['distance_tolerance'] * user_metrics['leg_length']
    }
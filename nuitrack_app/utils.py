from tkinter import messagebox
import cv2
import numpy as np
import time
import math
from PyNuitrack import py_nuitrack
from PIL import ImageFont, ImageDraw, Image
import globals

from check_angles import _check_single_angle
from check_poses import (
    _check_arms_down, _check_arms_bent_waist, _check_arms_raised, _check_arms_back, _check_arms_forward, _check_arms_w_shape, _check_arms_y_shape, _check_legs_together, _check_legs_apart, _check_lunge_pose, _check_knees_bent, _check_shoulders_retracted, _check_pelvis_anterior, _check_pelvis_posterior, _check_head_retracted, _check_head_tilted_left, _check_head_tilted_right, _check_spine_extended
)

def draw_text(img, text, pos, font_path="D:/Projects/CodeWithPros/noit_2026/ARIAL.TTF", font_size=24, color=(255,255,255)):
    # Make sure we're working with a copy to avoid modifying the original
    img_copy = img.copy()
    
    try:
        img_pil = Image.fromarray(cv2.cvtColor(img_copy, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)
        
        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"Font loading failed: {e}, using default font")
            font = ImageFont.load_default()
        
        # Draw black outline (slightly offset)
        outline_offset = max(1, font_size // 12)  # Adjust offset based on font size
        draw.text((pos[0] + outline_offset, pos[1] + outline_offset), text, font=font, fill=(0, 0, 0))

        # Draw main text
        draw.text(pos, text, font=font, fill=color)

        # Convert back to OpenCV format
        result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        return result
        
    except Exception as e:
        print(f"draw_text error: {e}")
        # Fallback to OpenCV text if PIL fails
        cv2.putText(img_copy, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_size/24.0, color, 2)
        return img_copy

def project_world_to_screen(world_x, world_y, world_z, nuitrack):
    """Конвертира координати от 3D (реален свят) към 2D (екран) за визуализация на обекти върху видео потока."""
    try:
        # Ако нямаме инициализиран Nuitrack обект, прекратяваме функцията
        if not nuitrack:
            return None
        
        # Параметри на проекцията (прозорчето на камерата):
        # fx, fy - фокусни разстояния (определят ъгъла на виждане и мащаба на проекцията - колко близо или далеч камерата вижда скелета, само че в пиксели)
        # cx, cy - координати на центъра на изображението (половината от ширина и височина)
        fx = 400.0
        fy = 400.0
        cx = 320.0
        cy = 240.0
        
        # Ако Z е прекалено малко (точката е твърде близо), проекцията няма смисъл
        if world_z <= 100:
            return None

        # Конверсия на координати от 3D (реален свят) към 2D (екран):
        # 1) Умножение по fx и fy:
        #    - fx и fy са числа, които казват колко „разтеглени“ ще бъдат координатите на екрана (какъв zoom ще има).
        #    - Ако умножим X и Y по по-големи числа → точките се отдалечават от центъра → ефект на zoom-in.
        #    - Ако умножим X и Y по по-малки числа → точките се приближават → ефект на zoom-out.
        #    - Умноженията → X*fx и -Y*fy, мащабират координатите, така че да съответстват на размера на екрана.
        # 2) Минус при Y:
        #    - В 3D координатната система, Y расте нагоре.
        #    - При екранната координатна система (в пиксели) Y расте надолу от горния ляв ъгъл.
        #    - Минусът обръща координатата, за да съвпаднат двете системи.
        # 3) Деление на Z:
        #    - Деленията → X/Z и Y/Z, дават представа за близостта на обекта до камерата.
        #    - Колкото **по-далеч** е точката, толкова по-голямо Z ще има → деленията X/Z и Y/Z дават **по-малки числови стойности**
        #    - Колкото **по-близо** е точката, толкова по-малко Z ще има → деленията X/Z и Y/Z дават **по-големи числови стойности**        
        # 4) Прибавяне на cx и cy:
        #    - Прибавяме cx и cy в сметките, за да изместим координатите, така че центърът на екрана да съвпада с (0,0) в 3D координатната система.
        #    - Камерата има резолюция 640x480, тоест центъра на екрана се намира в: cx=320 и cy=240.
        screen_x = int((world_x * fx / world_z) + cx)
        screen_y = int((-world_y * fy / world_z) + cy)
        
        globals.logger.info(f"DEBUG: World({world_x}, {world_y}, {world_z}) -> Screen({screen_x}, {screen_y})")
        
        return (screen_x, screen_y)
                
    except Exception as e:
        # Общ fallback при грешка
        print(f"Projection error: {e}")
        return None

def _calculate_tolerances(tolerances, user_metrics):
    """Изчисляване на толеранси базирани на метриките на потребителя."""
    return {
        'arm_tol': tolerances['distance_tolerance'] * user_metrics['arm_length'],
        'hip_tol': tolerances['distance_tolerance'] * user_metrics['hip_width'],
        'height_tol': tolerances['distance_tolerance'] * user_metrics['height'],
        'leg_tol': tolerances['distance_tolerance'] * user_metrics['leg_length']
    }

def _normalize_skeleton(user_skeleton):
    """Нормализиране на скелетните данни спрямо торса."""
    ref = user_skeleton.get('TORSO', {"x": 0, "y": 0, "z": 0})
    rel_skeleton = {}
    
    for k, v in user_skeleton.items():
        if v.get('confidence', 0) < 0.3:
            globals.logger.debug(f"Skipping joint {k} - confidence={v.get('confidence', 0):.2f}")
            continue
        rel_skeleton[k] = {
            "x": v['x'] - ref['x'],
            "y": v['y'] - ref['y'],
            "z": v['z'] - ref['z']
        }
    
    return rel_skeleton

def check_relative_pose(user_skeleton, required_poses, target_angles, tolerances, user_metrics):
    """Проверка на позите и ъглите на потребителя спрямо зададени критерии."""

    # Ако няма скелетни данни или метрики → прекъсваме
    if not user_skeleton or not user_metrics:
        globals.logger.debug("No skeleton or metrics available")
        return 0.0, {"feedback": "No skeleton or metrics available"}
    
    feedback = {}      # Съобщения за обратна връзка
    total_score = 0.0  # Общ резултат
    checks = 0         # Брой извършени проверки

    # Нормализиране на скелетните данни
    rel_skeleton = _normalize_skeleton(user_skeleton)

    # Изчисляване на толеранси
    tolerances_data = _calculate_tolerances(tolerances, user_metrics)

    # Дефиниране на проверките за пози
    pose_checkers = {
        'arms_down': _check_arms_down,
        'arms_bent_waist': _check_arms_bent_waist,
        'arms_raised': _check_arms_raised,
        'arms_back': _check_arms_back,
        'arms_forward': _check_arms_forward,
        'arms_w_shape': _check_arms_w_shape,
        'arms_y_shape': _check_arms_y_shape,
        'legs_together': _check_legs_together,
        'legs_apart': _check_legs_apart,
        'lunge_pose': _check_lunge_pose,
        'knees_bent': _check_knees_bent,
        'shoulders_retracted': _check_shoulders_retracted,
        'pelvis_anterior': _check_pelvis_anterior,
        'pelvis_posterior': _check_pelvis_posterior,
        'head_retracted': _check_head_retracted,
        'head_tilted_left': _check_head_tilted_left,
        'head_tilted_right': _check_head_tilted_right,
        'spine_extended': _check_spine_extended
    }
    
    # Проверка на позите с постепенно натрупване на total_score и checks
    for pose_name in required_poses:
        if pose_name in ['arms_down', 'arms_forward'] and not required_poses.get(pose_name):
            continue

        if pose_name in pose_checkers:
            is_ok, msg = pose_checkers[pose_name](rel_skeleton, required_poses, tolerances_data, user_metrics)
            feedback[pose_name] = {'ok': is_ok, 'msg': msg}
            total_score += 100 if is_ok else 0
            checks += 1

    # --- Проверка на ъглите ---
    for angle_name, target in target_angles.items():
        if angle_name not in ["right_arm_angle", "left_arm_angle"]:
            continue  
        fb, score, count = _check_single_angle(angle_name, target, user_skeleton, rel_skeleton, tolerances)
        feedback[angle_name] = fb
        total_score += score
        checks += count
    
    # Финални резултати
    accuracy = total_score / checks if checks > 0 else 0.0
    detailed_feedback = "\n".join([f"{k}: {v['msg']}" for k, v in feedback.items()])
    all_ok = all(v['ok'] for v in feedback.values() if 'ok' in v)
    
    # Отпечатваме критични стави за дебъг
    globals.logger.debug(f"Step {globals.current_step[0] + 1}: Critical joints - {[(k, v) for k, v in rel_skeleton.items() if k in ['TORSO', 'RIGHT_SHOULDER', 'RIGHT_WRIST', 'LEFT_SHOULDER', 'LEFT_WRIST', 'RIGHT_HIP', 'LEFT_HIP', 'RIGHT_KNEE', 'LEFT_KNEE']]}")

    return accuracy, {"feedback": detailed_feedback, "all_ok": all_ok}

def calculate_3d_distance(joint1, joint2):
    """Изчисляване на 3D разстояние между две точки"""
    # Проверява дали двете стави (joint1 и joint2) съществуват
    if not joint1 or not joint2:
        # Ако някоя от ставите липсва, връща нереално разстояние
        return float('inf')
    
    # Изчислява разликите по осите X, Y и Z между двете стави
    dx = joint1.get('x', 0) - joint2.get('x', 0)
    dy = joint1.get('y', 0) - joint2.get('y', 0) 
    dz = joint1.get('z', 0) - joint2.get('z', 0)
    
    # Използва формулата за евклидово разстояние: sqrt(dx² + dy² + dz²)
    distance = math.sqrt(dx*dx + dy*dy + dz*dz)
    # Връща изчисленото разстояние
    return distance

def process_skeleton_data(data, debug=False):
    """Извличане на данни за скелета от Nuitrack"""
    
    # Проверява дали има валидни данни за скелета
    if not data or not hasattr(data, 'skeletons') or not data.skeletons:
        # Ако няма данни, записва съобщение и изчиства текущия скелет
        globals.logger.debug("No skeleton data available")
        globals.current_user_skeleton = None
        return
    
    # Списък с имената на ставите, които се проследяват
    joint_names = [
        "HEAD", "NECK", "TORSO", "WAIST", "LEFT_COLLAR", "LEFT_SHOULDER",
        "LEFT_ELBOW", "LEFT_WRIST", "LEFT_HAND", "RIGHT_COLLAR",
        "RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST", "RIGHT_HAND",
        "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE", "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"
    ]
    
    # Взема първия скелет от данните
    skeleton = data.skeletons[0]
    # Извлича данните за стави
    joints_data = skeleton[1:] if isinstance(skeleton, (list, tuple)) and len(skeleton) > 0 else skeleton
    
    # Създава празен речник за текущия скелет
    user_skeleton = {}
    
    # Обхожда всяка става от данните
    for i, joint in enumerate(joints_data):
        # Ако индексът надвишава броя на имената на ставите, спира
        if i >= len(joint_names):
            break
            
        # Взема името на текущата става
        joint_name = joint_names[i]
        
        try:
            # Проверява формата на данните за ставата
            if hasattr(joint, 'real') and hasattr(joint, 'confidence'):
                # Ако има 'real' координати и confidence, създава речник с координати
                joint_data = {
                    "x": float(joint.real[0]),
                    "y": float(joint.real[1]),
                    "z": float(joint.real[2]),
                    "confidence": float(joint.confidence)
                }
            elif hasattr(joint, 'x'):
                # Ако има само 'x' и 'y', използва z=1000 по подразбиране
                joint_data = {
                    "x": float(joint.x),
                    "y": float(joint.y),
                    "z": float(joint.z) if hasattr(joint, 'z') else 1000.0,
                    "confidence": float(joint.confidence) if hasattr(joint, 'confidence') else 1.0
                }
            else:
                # Ако няма валидни данни за ставата, продължава към следващата
                continue
            
            # Запазва данните само ако confidence е над 0.4
            if joint_data['confidence'] > 0.4:
                user_skeleton[joint_name] = joint_data
                # Ако дебъг режимът е активен, записва координатите на ключови стави
                if debug and joint_name in ["HEAD", "NECK", "TORSO", "RIGHT_SHOULDER", "RIGHT_ELBOW", 
                                           "RIGHT_WRIST", "LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"]:
                    globals.logger.debug(f"DETECTED: {joint_name} at ({joint_data['x']:.0f}, {joint_data['y']:.0f}, {joint_data['z']:.0f})mm, confidence={joint_data['confidence']:.2f}")
                
        except Exception as e:
            # Ако възникне грешка при обработката, записва грешката и продължава
            globals.logger.error(f"Error processing joint {joint_name}: {e}")
            continue
    
    # Запазва текущия скелет като предишен за следващото обновяване
    globals.previous_user_skeleton = globals.current_user_skeleton.copy() if globals.current_user_skeleton else None
    # Актуализира текущия скелет с новите данни
    globals.current_user_skeleton = user_skeleton

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
    while time.time() - start_time < 5 and globals.session_running[0] and globals.calibration_active[0]:
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
    for joint in samples[0].keys():
        avg_skeleton[joint] = {
            "x": np.mean([s[joint]['x'] for s in samples]),
            "y": np.mean([s[joint]['y'] for s in samples]),
            "z": np.mean([s[joint]['z'] for s in samples])
        }
    
    # Проверка дали торсът е центриран и на правилна дистанция
    torso_x = avg_skeleton.get('TORSO', {}).get('x', 0)
    torso_z = avg_skeleton.get('TORSO', {}).get('z', 1500)
    if abs(torso_x) > 400 or not (1000 < torso_z < 3000):  # Relaxed X to 400mm
        globals.logger.error(f"Calibration failed: Torso off-center (X={torso_x:.0f}mm) or bad distance (Z={torso_z:.0f}mm)")
        feedback = f"Проблем с позицията: Торс X={torso_x:.0f}мм (трябва ±400мм), Z={torso_z:.0f}мм (трябва 1000-3000мм).\n"
        feedback += "Центрирай се наляво/надясно в изгледа на камерата. Застани на 1.5-2м разстояние.\n"
        feedback += "Камера на височина на гърдите (~1.2-1.5м), добро осветление, прилепнали дрехи, чист фон."
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

    globals.logger.info(f"Calibration successful: {len(samples)} samples collected")
    return globals.user_metrics

def update_calibration_progress():
    """Актуализира таймера на калибрирането с визуално обратно броене."""

    # Проверява дали калибрирането е активно
    if not globals.calibration_active[0]:
        return
    
    # Изчислява изминалото време от началото на калибрирането
    elapsed_time = time.time() - globals.calibration_start_time[0]
    # Изчислява оставащото време (максимум 0, минимум 5 секунди)
    remaining_time = max(0, 5 - elapsed_time)
    
    # Актуализира етикетите в графичния интерфейс с прогреса на калибрирането
    globals.app.instruction_label.config(text="🎯 КАЛИБРИРАНЕТО Е В ПРОЦЕС")
    globals.app.instruction_label.config(text="Stand straight with arms at sides. Stay still!")
    
    # Ако остава време за калибриране
    if remaining_time > 0:
        # Актуализира таймера с оставащото време
        globals.app.timer_label.config(
            text=f"⏱️ Калибриране... {remaining_time:.1f} секунди остават", 
            fg="blue", 
            bg="lightblue"
        )
        
        # Показва статуса на откриване на скелета
        if globals.current_user_skeleton:
            # Ако скелетът е открит, показва броя на ставите
            skeleton_status = f"✅ Skeleton detected ({len(globals.current_user_skeleton)} joints)"
            globals.app.accuracy_label.config(text=skeleton_status, fg="green")
        else:
            # Ако скелетът не е открит, показва съобщение за търсене
            globals.app.accuracy_label.config(text="🔍 Търсене на скелет...", fg="orange")
    else:
        # Ако калибрирането е приключило, показва съобщение за обработка
        globals.app.timer_label.config(
            text="🔄 Обработка на данни за калибриране...", 
            fg="green", 
            bg="lightgreen"
        )

def draw_calibration_overlay(image):
    """Рисува таймер с обратно броене до калибриране върху видео потока."""
    # Проверява дали калибрирането е активно
    if not globals.calibration_active[0]:
        return
    
    # Взема размерите на изображението (височина и ширина)
    height, width = image.shape[:2]
    # Изчислява изминалото време от началото на калибрирането
    elapsed_time = time.time() - globals.calibration_start_time[0]
    # Изчислява оставащото време (максимум 0, минимум 5 секунди)
    remaining_time = max(0, 5 - elapsed_time)
    
    # Създава копие на изображението за наслагването
    overlay = image.copy()
    # Рисува полупрозрачен правоъгълник върху цялото изображение
    cv2.rectangle(overlay, (0, 0), (width, height), (0, 50, 100), -1)
    # Комбинира оригиналното изображение с наслагването (70% оригинал, 30% наслагване)
    cv2.addWeighted(overlay, 0.3, image, 0.7, 0, image)
    
    # Голям текст за обратно броене
    # Формира текст с оставащото време за калибриране
    countdown_text = f"{remaining_time:.1f}s"
    font_scale = 2.0  # Мащаб на шрифта
    font_size = int(36 * font_scale)  # Приблизително преобразуване към пиксели
    font_thickness = 3  # Дебелина на шрифта
    # Изчислява размера на текста
    text_size = cv2.getTextSize(countdown_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
    # Центрира текста хоризонтално
    text_x = (width - text_size[0]) // 2
    # Позиционира текста вертикално в средата
    text_y = height // 2
    
    # Рисува текст с контур
    # Черен контур за текста
    cv2.putText(image, countdown_text, (text_x, text_y), 
                cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), font_thickness + 2)
    # Жълт текст за обратното броене
    cv2.putText(image, countdown_text, (text_x, text_y), 
                cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 255), font_thickness)
    
    # Лента за прогрес
    # Проверява дали остава време за калибриране
    if remaining_time > 0:
        # Изчислява прогреса (0 до 1) спрямо изминалото време
        progress = (5 - remaining_time) / 5
        bar_width = 300  # Ширина на лентата
        bar_height = 20  # Височина на лентата
        # Центрира лентата хоризонтално
        bar_x = (width - bar_width) // 2
        # Позиционира лентата под инструкциите
        bar_y = text_y + 110
        
        # Рисува сив фон за лентата
        cv2.rectangle(image, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
        # Рисува зелен прогрес в лентата
        progress_width = int(bar_width * progress)
        cv2.rectangle(image, (bar_x, bar_y), (bar_x + progress_width, bar_y + bar_height), (0, 255, 0), -1)
        # Рисува бял контур около лентата
        cv2.rectangle(image, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (255, 255, 255), 2)

def update_exercise_progress():
    """Актуализира прогреса на упражнението с проверка на относителни пози."""
    # Декларира глобални променливи за състоянието на упражнението и скелета
    
    # Проверява дали упражнението е активно и има ли скелетни данни и метрики
    if not globals.exercise_active[0] or not globals.current_user_skeleton or not globals.user_metrics:
        globals.logger.debug("No exercise active, skeleton, or metrics")
        return
    
    # Взема данните за текущата стъпка от упражнението
    current_step_data = globals.EXERCISE_JSON["steps"][globals.current_step[0]]
    # Извлича изискваните пози (напр. arms_raised, legs_together)
    required_poses = current_step_data.get("required_poses", {})
    # Извлича целевите ъгли (напр. ъгъл на ръката)
    target_angles = current_step_data.get("target_angles", {})
    # Взема толерансите за грешки (ъглов и дистанционен)
    tolerances = current_step_data.get("tolerance", {"angle_tolerance": 20, "distance_tolerance": 0.2})
    
    # Взема Z координатата на торса (разстояние от камерата)
    user_z = globals.current_user_skeleton.get('TORSO', {}).get('z', 1500)

    # Записва дебъг информация за стъпката, разстоянието и толерансите
    globals.logger.debug(f"Step {globals.current_step[0] + 1}: user_z={user_z:.0f}, tolerances={tolerances}")

    # Проверява точността на позата спрямо изискванията
    accuracy, details = check_relative_pose(globals.current_user_skeleton, required_poses, target_angles, tolerances, globals.user_metrics)
    # Извлича детайлна обратна връзка за позите
    detailed_feedback = details["feedback"]
    # Проверява дали всички пози са коректни
    all_ok = details["all_ok"]
    
    # Изчислява изминалото време за текущата стъпка
    elapsed_time = time.time() - globals.step_start_time[0]
    # Взема продължителността на стъпката
    duration = current_step_data["duration_seconds"]
    # Изчислява оставащото време
    remaining_time = max(0, duration - elapsed_time)
        
    # Проверява дали има движение (скок) за стъпка 2
    motion_detected = False
    current_step_data = globals.EXERCISE_JSON["steps"][globals.current_step[0]]
    is_jumping_jacks = globals.EXERCISE_JSON.get("exercise_name", "").lower() == "jumping jacks"
    requires_jump = current_step_data.get("requires_jump", False)
    
    if (is_jumping_jacks or requires_jump) and globals.previous_user_skeleton:
        # Взема Y координатите на глезените или коленете от предишния и текущия скелет
        prev_right_y = globals.previous_user_skeleton.get('RIGHT_ANKLE', globals.previous_user_skeleton.get('RIGHT_KNEE', globals.previous_user_skeleton.get('TORSO', {}))).get('y', 0)
        prev_left_y = globals.previous_user_skeleton.get('LEFT_ANKLE', globals.previous_user_skeleton.get('LEFT_KNEE', globals.previous_user_skeleton.get('TORSO', {}))).get('y', 0)
        curr_right_y = globals.current_user_skeleton.get('RIGHT_ANKLE', globals.current_user_skeleton.get('RIGHT_KNEE', globals.current_user_skeleton.get('TORSO', {}))).get('y', 0)
        curr_left_y = globals.current_user_skeleton.get('LEFT_ANKLE', globals.current_user_skeleton.get('LEFT_KNEE', globals.current_user_skeleton.get('TORSO', {}))).get('y', 0)
        # Изчислява средната промяна по Y за откриване на скок
        delta_y = abs((curr_right_y + curr_left_y) / 2 - (prev_right_y + prev_left_y) / 2)
        # Счита за скок, ако промяната е над 20 мм
        motion_detected = delta_y > 20
        globals.logger.debug(f"Jump motion: delta_y={delta_y:.0f}mm, detected={motion_detected}, right_y={curr_right_y:.0f}, left_y={curr_left_y:.0f}")
    else:
        # Ако не е стъпка 2 или няма предишен скелет, приема движението за валидно
        motion_detected = True
        globals.logger.debug("Jump motion: Skipped (no previous skeleton)")
    
    # Задава минимална точност и време за завършване на стъпката
    min_accuracy = 80.0

    # Проверява дали стъпката е завършена (точност, време, пози, движение)
    step_complete = (accuracy >= min_accuracy and elapsed_time >= duration and all_ok and 
                     ((is_jumping_jacks or requires_jump) or motion_detected))
        
    try:
        # Взема името и инструкциите за текущата стъпка
        step_name = current_step_data["name"]
        instructions = current_step_data["instructions"]
        
        # Актуализира етикета за стъпката в интерфейса
        globals.app.instruction_label.config(text=f"Step {globals.current_step[0] + 1}/{len(globals.EXERCISE_JSON['steps'])}: {step_name}")
        # Актуализира инструкциите в интерфейса
        globals.app.instruction_label.config(text=instructions)
        
        # Формира текст за точността
        accuracy_text = f"Точност на изпълнение: {accuracy:.1f}% (need {min_accuracy}%)"
        if all_ok:
            accuracy_text += " ✓ Всички пози са ОК!"
        else:
            accuracy_text += " ✗ Коригирайте позите"
        
        # Актуализира етикета за точност
        globals.app.accuracy_label.config(text=accuracy_text)
        
        # Ако стъпката е завършена, показва съобщение за успех
        if step_complete:
            globals.logger.info(f"СТЪПКА {globals.current_step[0] + 1} ЗАВЪРШЕНА: Точност на изпълнение={accuracy:.1f}%")
            globals.app.timer_label.config(text="✅ СТЪПКАТА Е ЗАВЪРШЕНА! Преминаване към следваща...", fg="green", bg="lightgreen")
        # Ако точността е добра, но времето не е изтекло
        elif accuracy >= min_accuracy:
            globals.app.timer_label.config(text=f"🎯 Добре! Задръж още {remaining_time:.1f}s more", fg="orange", bg="lightyellow")
        # Ако точността е ниска, показва оставащото време
        else:
            globals.app.timer_label.config(text=f"⏱️ Време: {remaining_time:.1f}s | Коригирайте позите", fg="red", bg="white")
        
        # Променя цвета на етикета за точност според стойността
        if accuracy >= 90:
            globals.app.accuracy_label.config(fg="green")
        elif accuracy >= min_accuracy:
            globals.app.accuracy_label.config(fg="orange")
        else:
            globals.app.accuracy_label.config(fg="red")
        
        # Ако стъпката е завършена, преминава към следващата
        if step_complete:
            advance_to_next_step()
            
    except Exception as e:
        globals.logger.error(f"GUI update error: {e}")

def advance_to_next_step():
    """Преминаване към следващата стъпка на упражнението."""
    
    # Увеличава индекса на текущата стъпка
    globals.current_step[0] += 1
    # Записва времето на започване на новата стъпка
    globals.step_start_time[0] = time.time()
    
    # Проверява дали всички стъпки са завършени
    if globals.current_step[0] >= len(globals.EXERCISE_JSON["steps"]):
        globals.exercise_active[0] = False
        globals.current_step[0] = 0
        messagebox.showinfo("Упражнението е завършено!", 
                          "Поздравления! Вие изпълнихте всички стъпки успешно! 🎉")
        globals.app.exercise_btn.config(text="Стартиране на упражнение", bg="blue")
        
        globals.app.instruction_label.config(text="🏆 Упражнението е завършено!")
        globals.app.instruction_label.config(text="Поздравления! Всички позиции са изпълнени успешно!")
        globals.app.accuracy_label.config(text="Упражнението е завършено!")
        globals.app.timer_label.config(text="🎯 Браво!")
        
        print("🎉 === EXERCISE COMPLETED === 🎉")

def draw_distance_feedback(image, user_z):
    """Рисува лента за разположение на потребителя пред камерата с валидна зона 2.5m-3.0m пред камерата."""

    # Взема размерите на изображението (височина и ширина)
    height, width = image.shape[:2]

    # Дефинира диапазони за разстоянията
    min_display = 1000   # 1.0m - минимално показвано разстояние
    max_display = 4500   # 4.5m - максимално показвано разстояние
    min_valid = 2500     # 2.5m - начало на валидната зона
    max_valid = 3000     # 3.0m - край на валидната зона

    # Определя цвета на маркера според разстоянието
    if user_z < min_valid:
        progress_color = (0, 0, 255)  # Червен (твърде близо)
    elif user_z > max_valid:
        progress_color = (0, 165, 255)  # Оранжев (твърде далеч)
    else:
        progress_color = (0, 255, 0)  # Зелен (валидно разстояние)

    # Настройки на лентата за визуализация
    bar_width = 400  # Ширина на лентата
    bar_height = 20  # Височина на лентата
    bar_x = (width - bar_width) // 2  # Центрира лентата хоризонтално
    bar_y = height - 40  # Позиционира лентата близо до долния край на изображението

    # Рисува сива лента за целия диапазон (1m–4.5m)
    cv2.rectangle(image, (bar_x, bar_y),
                  (bar_x + bar_width, bar_y + bar_height),
                  (50, 50, 50), -1)

    # Рисува зелена зона за валидния диапазон (2.5m–3.0m)
    valid_start = int(((min_valid - min_display) / (max_display - min_display)) * bar_width)  # Начало на зелената зона
    valid_end = int(((max_valid - min_display) / (max_display - min_display)) * bar_width)  # Край на зелената зона
    cv2.rectangle(image, (bar_x + valid_start, bar_y),
                  (bar_x + valid_end, bar_y + bar_height),
                  (0, 100, 0), -1)

    # Изчислява позицията на маркера за текущото разстояние
    if user_z < min_display:
        current_pos = 0  # Ако е твърде близо, маркерът е в началото
    elif user_z > max_display:
        current_pos = bar_width  # Ако е твърде далеч, маркерът е в края
    else:
        # Пропорционално изчисляване на позицията в лентата
        current_pos = int(((user_z - min_display) / (max_display - min_display)) * bar_width)

    # Определя координатата на маркера по X
    marker_x = bar_x + min(max(current_pos, 0), bar_width)
    # Рисува запълнен кръг за текущото разстояние
    cv2.circle(image, (marker_x, bar_y + bar_height // 2), 12, progress_color, -1)
    # Рисува бял контур около кръга за по-добра видимост
    cv2.circle(image, (marker_x, bar_y + bar_height // 2), 12, (255, 255, 255), 2)

    # Добавя текстови етикети за разстоянията
    cv2.putText(image, "1m", (bar_x - 20, bar_y + 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)  # Етикет за 1m
    cv2.putText(image, "2.5m", (bar_x + valid_start - 20, bar_y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)  # Етикет за начало на валидната зона
    cv2.putText(image, "3.0m", (bar_x + valid_end - 20, bar_y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)  # Етикет за край на валидната зона
    cv2.putText(image, "4.5m", (bar_x + bar_width + 5, bar_y + 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)  # Етикет за 4.5m

def draw_simple_skeleton(image, data, nuitrack):
    """Рисува скелета върху видео потока."""

    # Проверява дали има данни за скелета
    if not hasattr(data, 'skeletons') or not data.skeletons:
        return
    
    # Списък с имената на ставите, които ще се визуализират
    joint_names = [
        "HEAD", "NECK", "TORSO", "WAIST", "LEFT_COLLAR", "LEFT_SHOULDER",
        "LEFT_ELBOW", "LEFT_WRIST", "LEFT_HAND", "RIGHT_COLLAR",
        "RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST", "RIGHT_HAND",
        "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE", "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"
    ]
    
    # Дефинира връзките между ставите за рисуване на линиите на скелета
    connections = [
        (0, 1), (1, 2), (2, 3),  # Гръбнак
        (1, 4), (4, 5), (5, 6), (6, 7), (7, 8),  # Лява ръка
        (1, 9), (9, 10), (10, 11), (11, 12), (12, 13),  # Дясна ръка
        (3, 14), (14, 15), (15, 16),  # Ляв крак
        (3, 17), (17, 18), (18, 19)  # Десен крак
    ]

    # Обхожда всеки скелет в данните
    for skel in data.skeletons:
        # Извлича ставите, премахвайки първия елемент, ако е списък
        joints = skel[1:] if len(skel) > 1 else skel
        points = []
        # Обхожда всяка става за визуализация
        for i, joint in enumerate(joints):
            # Проверява дали ставата има проекционни координати
            if hasattr(joint, 'projection') and len(joint.projection) >= 2:
                # Закръгля координатите до цели числа
                x, y = round(joint.projection[0]), round(joint.projection[1])
                points.append((x, y))
                
                # Оцветява ключови стави в магента, останалите в зелено
                if joint_names[i] in ["HEAD", "NECK", "LEFT_COLLAR", "TORSO", "RIGHT_SHOULDER", "RIGHT_ELBOW", 
                                    "RIGHT_WRIST", "LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"]:
                    cv2.circle(image, (x, y), 8, (255, 0, 255), -1)  # Magenta for tracked joints
                else:
                    cv2.circle(image, (x, y), 6, (0, 255, 0), -1)  # Green for others
                
                # Рисува линиите между свързаните стави
                for (start_idx, end_idx) in connections:
                    if start_idx < len(points) and end_idx < len(points):
                        cv2.line(image, points[start_idx], points[end_idx], (0, 255, 255), 2)

    # Визиализация на таймер за калибриране, ако е активно
    if globals.calibration_active[0]:
        draw_calibration_overlay(image)

    # Визиализация на лента за определяне на разстоянието пред камерата, ако има данни за скелета
    if globals.current_user_skeleton and isinstance(globals.current_user_skeleton, dict) and 'TORSO' in globals.current_user_skeleton:
        torso_joint = globals.current_user_skeleton.get('TORSO')
        if torso_joint and isinstance(torso_joint, dict):
            user_z = torso_joint.get('z', 1500)
            draw_distance_feedback(image, user_z)

    # Рисува насоки за пози, ако упражнението е активно
    if globals.exercise_active[0] and globals.current_step[0] < len(globals.EXERCISE_JSON["steps"]) and globals.current_user_skeleton:
        # Взема данните за текущата стъпка
        current_step_data = globals.EXERCISE_JSON["steps"][globals.current_step[0]]
        # Рисува стрелки за повдигнати ръце
        if "arms_raised" in current_step_data.get("required_poses", {}):
            # Проектира позициите на раменете върху екрана
            right_shoulder_proj = project_world_to_screen(
                globals.current_user_skeleton.get('RIGHT_SHOULDER', {}).get('x', 0),
                globals.current_user_skeleton.get('RIGHT_SHOULDER', {}).get('y', 0),
                globals.current_user_skeleton.get('RIGHT_SHOULDER', {}).get('z', 0),
                nuitrack
            )
            left_shoulder_proj = project_world_to_screen(
                globals.current_user_skeleton.get('LEFT_SHOULDER', {}).get('x', 0),
                globals.current_user_skeleton.get('LEFT_SHOULDER', {}).get('y', 0),
                globals.current_user_skeleton.get('LEFT_SHOULDER', {}).get('z', 0),
                nuitrack
            )
            # Рисува зелена стрелка нагоре за дясното рамо
            if right_shoulder_proj:
                cv2.arrowedLine(image, right_shoulder_proj, (right_shoulder_proj[0], right_shoulder_proj[1] - 100), (0, 255, 0), 3, tipLength=0.3)
            # Рисува зелена стрелка нагоре за лявото рамо
            if left_shoulder_proj:
                cv2.arrowedLine(image, left_shoulder_proj, (left_shoulder_proj[0], left_shoulder_proj[1] - 100), (0, 255, 0), 3, tipLength=0.3)
        
        # Рисува стрелки за раздалечени крака
        if "legs_apart" in current_step_data.get("required_poses", {}):
            # Проектира позициите на таза върху екрана
            right_hip_proj = project_world_to_screen(
                globals.current_user_skeleton.get('RIGHT_HIP', {}).get('x', 0),
                globals.current_user_skeleton.get('RIGHT_HIP', {}).get('y', 0),
                globals.current_user_skeleton.get('RIGHT_HIP', {}).get('z', 0),
                nuitrack
            )
            left_hip_proj = project_world_to_screen(
                globals.current_user_skeleton.get('LEFT_HIP', {}).get('x', 0),
                globals.current_user_skeleton.get('LEFT_HIP', {}).get('y', 0),
                globals.current_user_skeleton.get('LEFT_HIP', {}).get('z', 0),
                nuitrack
            )
            # Рисува зелена стрелка надясно за десния таз
            if right_hip_proj:
                cv2.arrowedLine(image, right_hip_proj, (right_hip_proj[0] + 100, right_hip_proj[1]), (0, 255, 0), 3, tipLength=0.3)
            # Рисува зелена стрелка наляво за левия таз
            if left_hip_proj:
                cv2.arrowedLine(image, left_hip_proj, (left_hip_proj[0] - 100, left_hip_proj[1]), (0, 255, 0), 3, tipLength=0.3)
        
        # Рисува стрелки за Y форма (нагоре) на китките
        if "arms_y_shape" in current_step_data.get("required_poses", {}):
            right_wrist_proj = project_world_to_screen(
                globals.current_user_skeleton.get('RIGHT_WRIST', {}).get('x', 0),
                globals.current_user_skeleton.get('RIGHT_WRIST', {}).get('y', 0),
                globals.current_user_skeleton.get('RIGHT_WRIST', {}).get('z', 0),
                nuitrack
            )
            left_wrist_proj = project_world_to_screen(
                globals.current_user_skeleton.get('LEFT_WRIST', {}).get('x', 0),
                globals.current_user_skeleton.get('LEFT_WRIST', {}).get('y', 0),
                globals.current_user_skeleton.get('LEFT_WRIST', {}).get('z', 0),
                nuitrack
            )
            if right_wrist_proj:
                cv2.arrowedLine(image, right_wrist_proj, (right_wrist_proj[0], right_wrist_proj[1] - 100), (0, 255, 0), 3, tipLength=0.3)
            if left_wrist_proj:
                cv2.arrowedLine(image, left_wrist_proj, (left_wrist_proj[0], left_wrist_proj[1] - 100), (0, 255, 0), 3, tipLength=0.3)  

        # Рисува стрелки за наклон на главата наляво
        if current_step_data.get("required_poses", {}).get("head_tilted_left"):
            head_proj = project_world_to_screen(
                globals.current_user_skeleton.get('HEAD', {}).get('x', 0),
                globals.current_user_skeleton.get('HEAD', {}).get('y', 0),
                globals.current_user_skeleton.get('HEAD', {}).get('z', 0),
                nuitrack
            )
            if head_proj:
                cv2.arrowedLine(image, head_proj, (head_proj[0] + 100, head_proj[1]), (0, 255, 0), 3, tipLength=0.3)

        # Рисува стрелки за наклон на главата надясно
        if current_step_data.get("required_poses", {}).get("head_tilted_right"):
            head_proj = project_world_to_screen(
                globals.current_user_skeleton.get('HEAD', {}).get('x', 0),
                globals.current_user_skeleton.get('HEAD', {}).get('y', 0),
                globals.current_user_skeleton.get('HEAD', {}).get('z', 0),
                nuitrack
            )
            if head_proj:
                cv2.arrowedLine(image, head_proj, (head_proj[0] - 100, head_proj[1]), (0, 255, 0), 3, tipLength=0.3)

def update_timer_display():
    """Обновява таймера и прогреса в отделен нишков процес (thread)."""
    
    while globals.session_running[0]:
        try:
            # Изчисляване на изминалото време от старта на сесията
            if globals.session_running[0]:
                elapsed = time.time() - globals.session_start_time
                minutes = int(elapsed // 60)   # цели минути
                seconds = elapsed % 60         # остатъчни секунди
                globals.app.elapsed_label.config(text=f"Session Time: {minutes:02d}:{seconds:05.2f}")
            
            # Обновяване на прогреса:
            #    - Ако е активна калибриране → обновяваме прогреса на калибрирането
            #    - Ако е активно упражнение → обновяваме прогреса на упражнението
            if globals.calibration_active[0]:
                update_calibration_progress()
            elif globals.exercise_active[0]:
                update_exercise_progress()
            
            # Пауза между обновяванията, за да не натоварваме CPU
            time.sleep(0.1)
        
        except:
            # При грешка прекратяваме нишката
            break

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
        print("🎯 === EXERCISE STARTED === 🎯")
        
        # 3) Главен цикъл за обработка на данни
        while globals.session_running[0]:
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
                    if globals.calibration_active[0]:
                        elapsed_cal = time.time() - globals.calibration_start_time[0]
                        remaining_cal = max(0, 5 - elapsed_cal)
                        status_lines.extend([
                            f"КАЛИБРИРАНЕ: {remaining_cal:.1f} секунди остават"
                        ])
                    
                    # Статус при упражнение
                    elif globals.exercise_active[0]:
                        step_data = globals.EXERCISE_JSON["steps"][globals.current_step[0]]
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
                            f"Упражнение: Стъпка {globals.current_step[0] + 1}/{len(globals.EXERCISE_JSON['steps'])}",
                            f"Точност: {accuracy:.0f}% (нужни са 80+%)",
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
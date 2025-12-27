from PIL import ImageFont, ImageDraw, Image
import numpy as np
import cv2
import time
import os

from utils.skeleton_processing import project_world_to_screen

import globals

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def draw_text(img, text, pos, font_path=os.path.join(BASE_DIR, 'ARIAL.TTF'), font_size=24, color=(255,255,255)):
    # Уверете се, че работим с копие, за да избегнем промяна на оригинала
    img_copy = img.copy()
    
    try:
        img_pil = Image.fromarray(cv2.cvtColor(img_copy, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)
        
        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"Font loading failed: {e}, using default font")
            font = ImageFont.load_default()
        
        # Начертайте черен контур (леко изместен)
        outline_offset = max(1, font_size // 12)  # Регулирайте отместването според размера на шрифта
        draw.text((pos[0] + outline_offset, pos[1] + outline_offset), text, font=font, fill=(0, 0, 0))

        # Начертайте основния текст
        draw.text(pos, text, font=font, fill=color)

        # Конвертирайте обратно във формат OpenCV
        result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        return result
        
    except Exception as e:
        print(f"draw_text error: {e}")
        # Резервен вариант с OpenCV текст, ако PIL се провали
        cv2.putText(img_copy, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_size/24.0, color, 2)
        return img_copy

def draw_simple_skeleton(image, data, nuitrack):
    """Начертава скелет върху видео потока с насоки за позата."""
    
    if not _has_skeleton_data(data):
        return
    
    _draw_all_skeletons(image, data)
    _draw_ui_overlays(image, nuitrack)

def _has_skeleton_data(data):
    """Проверява дали са налични данни за скелета."""
    return hasattr(data, 'skeletons') and data.skeletons


def _draw_all_skeletons(image, data):
    """Начертава всички открити скелети."""
    for skeleton in data.skeletons:
        joints = skeleton[1:] if len(skeleton) > 1 else skeleton
        joint_points = _get_joint_points(joints)
        
        _draw_joint_circles(image, joint_points)
        _draw_skeleton_connections(image, joint_points)


def _get_joint_points(joints):
    """Извлича позициите на ставите от данните за скелета."""
    joint_points = []
    
    for joint in joints:
        if hasattr(joint, 'projection') and len(joint.projection) >= 2:
            x = round(joint.projection[0])
            y = round(joint.projection[1])
            joint_points.append((x, y))
        else:
            joint_points.append(None)  # Заместител за липсващи стави
    
    return joint_points


def _draw_joint_circles(image, joint_points):
    """Начертава кръгове за всяка става с цветово кодиране."""
    # Ключови стави, които се подчертават в магента
    KEY_JOINT_INDICES = {0, 1, 2, 4, 5, 6, 7, 10, 11, 12}  # HEAD, NECK и др.
    
    for i, point in enumerate(joint_points):
        if point is None:
            continue
            
        if i in KEY_JOINT_INDICES:
            cv2.circle(image, point, 8, (255, 0, 255), -1)  # Магента за ключови стави
        else:
            cv2.circle(image, point, 6, (0, 255, 0), -1)    # Зелено за останалите


def _draw_skeleton_connections(image, joint_points):
    """Начертава линии, свързващи ставите на скелета."""
    # Структура на връзките на скелета
    CONNECTIONS = [
        (0, 1), (1, 2), (2, 3),                    # Гръбначен стълб
        (1, 4), (4, 5), (5, 6), (6, 7), (7, 8),    # Лява ръка
        (1, 9), (9, 10), (10, 11), (11, 12), (12, 13),  # Дясна ръка
        (3, 14), (14, 15), (15, 16),               # Ляв крак
        (3, 17), (17, 18), (18, 19)                # Десен крак
    ]
    
    for start_idx, end_idx in CONNECTIONS:
        if (_is_valid_connection(joint_points, start_idx, end_idx)):
            cv2.line(image, joint_points[start_idx], joint_points[end_idx], 
                    (0, 255, 255), 2)


def _is_valid_connection(joint_points, start_idx, end_idx):
    """Проверява дали може да се начертае връзка между две стави."""
    return (start_idx < len(joint_points) and 
            end_idx < len(joint_points) and
            joint_points[start_idx] is not None and 
            joint_points[end_idx] is not None)


def _draw_ui_overlays(image, nuitrack):
    """Начертава UI елементи и насоки за позата."""
    _draw_calibration_if_active(image)
    _draw_distance_feedback_if_available(image)
    _draw_exercise_guidance_if_active(image, nuitrack)


def _draw_calibration_if_active(image):
    """Начертава таймер за калибрация."""
    if globals.calibration_active:
        draw_calibration_overlay(image)


def _draw_distance_feedback_if_available(image):
    """Начертава лента за обратна връзка за разстоянието."""
    skeleton = globals.current_user_skeleton
    
    if not (skeleton and isinstance(skeleton, dict) and 'TORSO' in skeleton):
        return
        
    torso_joint = skeleton.get('TORSO')
    if torso_joint and isinstance(torso_joint, dict):
        user_z = torso_joint.get('z', 1500)
        draw_distance_feedback(image, user_z)


def _draw_exercise_guidance_if_active(image, nuitrack):
    """Начертава насочващи стрелки по време на упражнение."""
    if not _should_draw_exercise_guidance():
        return
        
    current_step_data = globals.EXERCISE_JSON["steps"][globals.current_step]
    required_poses = current_step_data.get("required_poses", {})
    
    _draw_pose_guidance_arrows(image, nuitrack, required_poses)


def _should_draw_exercise_guidance():
    """Проверява дали трябва да се начертаят насоки за упражненията."""
    return (globals.exercise_active and 
            globals.current_step < len(globals.EXERCISE_JSON["steps"]) and 
            globals.current_user_skeleton)


def _draw_pose_guidance_arrows(image, nuitrack, required_poses):
    """Начертава стрелки за изискваните пози."""
    skeleton = globals.current_user_skeleton
    
    if "legs_apart" in required_poses:
        _draw_legs_apart_arrows(image, nuitrack, skeleton)
    
    if "arms_y_shape" in required_poses:
        _draw_y_shape_arrows(image, nuitrack, skeleton)
    
    if required_poses.get("head_tilted_left"):
        _draw_head_tilt_arrow(image, nuitrack, skeleton, direction="left")
    
    if required_poses.get("head_tilted_right"):
        _draw_head_tilt_arrow(image, nuitrack, skeleton, direction="right")


def _draw_legs_apart_arrows(image, nuitrack, skeleton):
    """Начертава стрелки навън за поза с разтворени крака."""
    right_hip_proj = _get_joint_projection('RIGHT_HIP', skeleton, nuitrack)
    left_hip_proj = _get_joint_projection('LEFT_HIP', skeleton, nuitrack)
    
    if right_hip_proj:
        end_point = (right_hip_proj[0] + 100, right_hip_proj[1])
        cv2.arrowedLine(image, right_hip_proj, end_point, (0, 255, 0), 3, tipLength=0.3)
    
    if left_hip_proj:
        end_point = (left_hip_proj[0] - 100, left_hip_proj[1])
        cv2.arrowedLine(image, left_hip_proj, end_point, (0, 255, 0), 3, tipLength=0.3)


def _draw_y_shape_arrows(image, nuitrack, skeleton):
    """Начертава стрелки нагоре за Y-образна поза (ръце нагоре)."""
    joints = ['RIGHT_WRIST', 'LEFT_WRIST']
    
    for joint_name in joints:
        joint_proj = _get_joint_projection(joint_name, skeleton, nuitrack)
        if joint_proj:
            end_point = (joint_proj[0], joint_proj[1] - 100)
            cv2.arrowedLine(image, joint_proj, end_point, (0, 255, 0), 3, tipLength=0.3)


def _draw_head_tilt_arrow(image, nuitrack, skeleton, direction):
    """Начертава хоризонтална стрелка за наклон на главата."""
    head_proj = _get_joint_projection('HEAD', skeleton, nuitrack)
    
    if not head_proj:
        return
        
    if direction == "left":
        end_point = (head_proj[0] + 100, head_proj[1])
    else:  # right
        end_point = (head_proj[0] - 100, head_proj[1])
    
    cv2.arrowedLine(image, head_proj, end_point, (0, 255, 0), 3, tipLength=0.3)


def _get_joint_projection(joint_name, skeleton, nuitrack):
    """Взема координатите на прожекцията на екрана за дадена става."""
    joint_data = skeleton.get(joint_name, {})
    
    if not joint_data:
        return None
        
    x = joint_data.get('x', 0)
    y = joint_data.get('y', 0)
    z = joint_data.get('z', 0)
    
    return project_world_to_screen(x, y, z, nuitrack)

def draw_calibration_overlay(image):
    """Рисува таймер с обратно броене до калибриране върху видео потока."""
    # Проверява дали калибрирането е активно
    if not globals.calibration_active:
        return
    
    # Взема размерите на изображението (височина и ширина)
    height, width = image.shape[:2]
    # Изчислява изминалото време от началото на калибрирането
    elapsed_time = time.time() - globals.calibration_start_time
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
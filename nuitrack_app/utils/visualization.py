from PIL import ImageFont, ImageDraw, Image
import numpy as np
import cv2
import time

from utils.skeleton_processing import project_world_to_screen

import globals

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
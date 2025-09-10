import numpy as np
import math

from globals import logger

# Функция за изчисляване на ъгъла на повдигане на ръката
def arm_elevation_angle(shoulder, wrist):

    # Проверка за налични данни и достатъчно confidence
    if not shoulder or not wrist or shoulder.get('confidence', 0) < 0.4 or wrist.get('confidence', 0) < 0.4:
        logger.debug(f"Skipping angle calc - low confidence: shoulder={shoulder.get('confidence', 0):.2f}, wrist={wrist.get('confidence', 0):.2f}")
        return None
    
    # Вектор от рамото до китката
    v = np.array([wrist['x'] - shoulder['x'], wrist['y'] - shoulder['y'], wrist['z'] - shoulder['z']])
    norm_v = np.linalg.norm(v)
    if norm_v == 0:
        logger.debug("Zero vector in arm angle calculation")
        return None
    
    # Сравняваме спрямо вертикала надолу
    vertical_down = np.array([0, -1, 0])
    cos_angle = np.dot(v / norm_v, vertical_down)
    angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
    return angle

# Функция за изчисляване на ъгъла на коляното
def calculate_knee_angle(hip, knee, ankle):

    if not hip or not knee or not ankle or hip.get('confidence', 0) < 0.4 or knee.get('confidence', 0) < 0.4 or ankle.get('confidence', 0) < 0.4:
        logger.debug(f"Skipping knee angle calc - low confidence: hip={hip.get('confidence', 0):.2f}, knee={knee.get('confidence', 0):.2f}, ankle={ankle.get('confidence', 0):.2f}")
        return None
    
    # Вектори от коляното към таза и от коляното към глезена
    v1 = np.array([hip['x'] - knee['x'], hip['y'] - knee['y'], hip['z'] - knee['z']])        
    norm_v1 = np.linalg.norm(v1)

    # Проверка за липсващ глезен или ниска увереност: сравнявай бедро-коляно с вертикала
    if not ankle or ankle.get('confidence', 0) < 0.3:
        logger.debug("Fallback knee angle: no ankle or low confidence, assuming vertical calf")
        vertical_down = np.array([0, -1, 0])
        cos_angle = np.dot(v1 / norm_v1, vertical_down)
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
        return angle  # Приблизително изчислява ъгъла на бедрото спрямо вертикала

    # Стандартно изчисление с глезен
    if ankle.get('confidence', 0) >= 0.3:
        v2 = np.array([ankle['x'] - knee['x'], ankle['y'] - knee['y'], ankle['z'] - knee['z']])
        norm_v2 = np.linalg.norm(v2)
        if norm_v2 == 0:
            logger.debug("Zero vector in knee-ankle calculation")
            return None
    
        # Изчисляване на ъгъла между двата вектора
        cos_angle = np.dot(v1 / norm_v1, v2 / norm_v2)
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
        return angle

    logger.debug("No valid angle calculation possible")
    return None

def check_single_angle(angle_name, target, user_skeleton, rel_skeleton, tolerances):
    """Проверка на единичен ъгъл."""
    angle = None
    feedback = {}
    score = 0
    is_ok = False

    # Проверка на ъглите на ръцете
    if angle_name == "right_arm_angle":
        angle = arm_elevation_angle(user_skeleton.get('RIGHT_SHOULDER'), user_skeleton.get('RIGHT_WRIST'))
    elif angle_name == "left_arm_angle":
        angle = arm_elevation_angle(user_skeleton.get('LEFT_SHOULDER'), user_skeleton.get('LEFT_WRIST'))

    # Проверка на ъглите на коленете
    elif angle_name == "right_knee_angle":
        angle = calculate_knee_angle(user_skeleton.get('RIGHT_HIP'), user_skeleton.get('RIGHT_KNEE'), user_skeleton.get('RIGHT_ANKLE'))
    elif angle_name == "left_knee_angle":
        angle = calculate_knee_angle(user_skeleton.get('LEFT_HIP'), user_skeleton.get('LEFT_KNEE'), user_skeleton.get('LEFT_ANKLE'))

    # Проверка на лактите
    if angle_name in ['right_elbow_angle', 'left_elbow_angle']:
        side = 'RIGHT' if 'right' in angle_name else 'LEFT'
        shoulder = rel_skeleton.get(f'{side}_SHOULDER', {})
        elbow = rel_skeleton.get(f'{side}_ELBOW', {})
        wrist = rel_skeleton.get(f'{side}_WRIST', {})
        
        if shoulder and elbow and wrist:
            v1 = np.array([shoulder['x'] - elbow['x'], shoulder['y'] - elbow['y'], shoulder['z'] - elbow['z']])
            v2 = np.array([wrist['x'] - elbow['x'], wrist['y'] - elbow['y'], wrist['z'] - elbow['z']])
            angle = math.degrees(math.acos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-10)))
            is_ok = abs(angle - target) <= tolerances['angle_tolerance']
            feedback = {
                'ok': is_ok,
                'msg': f"✓" if is_ok else f"✗ {side.lower()}_elbow_angle: {angle:.0f}° (target: {target}°)"
            }

            logger.debug(f"{angle_name}: measured={angle:.0f}, target={target}, ok={is_ok}")

            return feedback, 100 if is_ok else 0, 1
        else:
            feedback = {
                'ok': False,
                'msg': f"✗ {angle_name}: Липсващи стави"
            }
            logger.debug(f"{angle_name}: Missing joints for {side} arm")

            return feedback, 0, 1

    logger.info(f"Angle {angle_name} calculated: {angle}")

    # Общ случай
    if angle is None:
        feedback = {'ok': False, 'msg': f"{angle_name}: Not detected ✗"}
        return feedback, 0, 1
    
    diff = abs(angle - target)
    score = max(0, 100 * (1 - diff / (2 * tolerances['angle_tolerance'])))
    is_ok = diff <= tolerances['angle_tolerance']

    feedback = {
        'ok': is_ok,
        'msg': f"{angle:.0f}° (target {target}° ±{tolerances['angle_tolerance']}°) {'✓' if is_ok else '✗ Повдигнете ръката до нивото на раменете'}"
    }

    logger.debug(f"{angle_name}: {angle:.0f}° (target {target}°)")
        
    return feedback, score, 1

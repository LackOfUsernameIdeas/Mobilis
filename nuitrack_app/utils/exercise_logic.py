import time
from tkinter import messagebox

from utils.calibration import calculate_tolerances
from utils.check_angles import check_single_angle
from utils.check_poses import (
    _check_arms_down, _check_arms_bent_waist, _check_arms_raised, _check_arms_back, _check_arms_forward, _check_arms_w_shape, _check_arms_y_shape, _check_legs_together, _check_legs_apart, _check_lunge_pose, _check_knees_bent, _check_shoulders_retracted, _check_pelvis_anterior, _check_pelvis_posterior, _check_head_retracted, _check_head_tilted_left, _check_head_tilted_right, _check_spine_extended
)
from utils.skeleton_processing import normalize_skeleton

import globals

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
    rel_skeleton = normalize_skeleton(user_skeleton)

    # Изчисляване на толеранси
    tolerances_data = calculate_tolerances(tolerances, user_metrics)

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
    required_joints = {
        "right_arm_angle": ["RIGHT_SHOULDER", "RIGHT_WRIST"],
        "left_arm_angle": ["LEFT_SHOULDER", "LEFT_WRIST"],
        "right_elbow_angle": ["RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"],
        "left_elbow_angle": ["LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"],
        "right_knee_angle": ["RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"],
        "left_knee_angle": ["LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"]
    }
    
    for angle_name, target in target_angles.items():
        joints = required_joints.get(angle_name, [])

        if not all(user_skeleton.get(j) for j in joints):  
            feedback[angle_name] = {"ok": False, "msg": "✗ Няма скелетни данни"}
            checks += 1
            continue

        fb, score, count = check_single_angle(angle_name, target, user_skeleton, rel_skeleton, tolerances)
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

    # Логика за задържане на позата
    current_time = time.time()
    if not hasattr(globals, 'hold_start_time'):
        globals.hold_start_time = [0]  # Инициализиране при първо изпълнение
    if not hasattr(globals, 'hold_duration'):
        globals.hold_duration = [0]  # Натрупана продължителност на задържане
    
    if accuracy >= min_accuracy and all_ok and motion_detected:
        if globals.hold_start_time[0] == 0:
            globals.hold_start_time[0] = current_time
        globals.hold_duration[0] = current_time - globals.hold_start_time[0]
        remaining_time = max(0, duration - globals.hold_duration[0])
    else:
        globals.hold_start_time[0] = 0
        globals.hold_duration[0] = 0
        remaining_time = duration  # Показва пълната продължителност, докато не се постигне позата

    # Проверява дали стъпката е завършена (задържане за необходимата продължителност - точност, време, пози)
    step_complete = (globals.hold_duration[0] >= duration)
        
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
            globals.hold_start_time[0] = 0
            globals.hold_duration[0] = 0
            advance_to_next_step()
            
    except Exception as e:
        globals.logger.error(f"GUI update error: {e}")

def advance_to_next_step():
    """Преминаване към следващата стъпка на упражнението."""
    
    # Увеличава индекса на текущата стъпка
    globals.current_step[0] += 1
    # Записва времето на започване на новата стъпка
    globals.step_start_time[0] = time.time()
    # Ресетва hold timers за новата стъпка
    globals.hold_start_time[0] = 0
    globals.hold_duration[0] = 0
    
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

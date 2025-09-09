from globals import logger

def _check_arms_down(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце спуснати надолу"""
    right_wrist_y = rel_skeleton.get('RIGHT_WRIST', {}).get('y', 0)
    left_wrist_y = rel_skeleton.get('LEFT_WRIST', {}).get('y', 0)
    right_shoulder_y = rel_skeleton.get('RIGHT_SHOULDER', {}).get('y', 0)
    left_shoulder_y = rel_skeleton.get('LEFT_SHOULDER', {}).get('y', 0)
    
    # Китките трябва да са по-ниско от раменете с достатъчна разлика
    is_right_down = right_wrist_y < right_shoulder_y - (0.7 * user_metrics['arm_length'] - tolerances_data['arm_tol'])
    is_left_down = left_wrist_y < left_shoulder_y - (0.7 * user_metrics['arm_length'] - tolerances_data['arm_tol'])
    is_down = is_right_down and is_left_down
    
    logger.debug(f"arms_down: right={is_right_down}, left={is_left_down}")
    return is_down, "✓" if is_down else "✗ Спуснете ръцете си плътно до тялото"

def _check_arms_bent_waist(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце свити на кръста"""
    required = required_poses["arms_bent_waist"]
    right_wrist = rel_skeleton.get('RIGHT_WRIST', {})
    left_wrist = rel_skeleton.get('LEFT_WRIST', {})
    right_elbow = rel_skeleton.get('RIGHT_ELBOW', {})
    left_elbow = rel_skeleton.get('LEFT_ELBOW', {})
    right_hip = rel_skeleton.get('RIGHT_HIP', {})
    left_hip = rel_skeleton.get('LEFT_HIP', {})

    # Проверка: ъгъл в лакътя да е сгънат (китка да е по-близо до рамо отколкото до бедро)
    right_elbow_bent = (
        abs(right_wrist.get('y', 0) - right_elbow.get('y', 0)) <
        abs(right_wrist.get('y', 0) - right_hip.get('y', 0)) + tolerances_data['arm_tol']
    )
    left_elbow_bent = (
        abs(left_wrist.get('y', 0) - left_elbow.get('y', 0)) <
        abs(left_wrist.get('y', 0) - left_hip.get('y', 0)) + tolerances_data['arm_tol']
    )

    is_bent_waist = right_elbow_bent and left_elbow_bent
    is_ok = (is_bent_waist == required)
    
    if required:
        msg = "✓" if is_ok else "✗ Поставете китките върху кръста"
    else:
        msg = "✓" if is_ok else "✗ Не поставяйте китките върху кръста (изпънете ръцете)"
    
    logger.debug(f"arms_bent_waist: right_bent={right_elbow_bent}, left_bent={left_elbow_bent}, required={required}, ok={is_ok}")
    return is_ok, msg

def _check_arms_raised(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце вдигнати нагоре"""
    right_wrist_y = rel_skeleton.get('RIGHT_WRIST', {}).get('y', 0)
    left_wrist_y = rel_skeleton.get('LEFT_WRIST', {}).get('y', 0)
    head_y = rel_skeleton.get('HEAD', {}).get('y', 0)
    
    # Китките трябва да са по-високо от главата
    is_right_raised = right_wrist_y > head_y + tolerances_data['arm_tol']
    is_left_raised = left_wrist_y > head_y + tolerances_data['arm_tol']
    is_raised = is_right_raised and is_left_raised
    
    logger.debug(f"arms_raised: right={is_right_raised}, left={is_left_raised}")
    return is_raised, "✓" if is_raised else "✗ Повдигнете ръцете си до нивото на раменете или по-високо"

def _check_arms_back(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце назад (гърди изпъчени)"""
    tol = tolerances_data['arm_tol'] * 1.5 
    
    has_right = 'RIGHT_WRIST' in rel_skeleton and 'RIGHT_SHOULDER' in rel_skeleton
    has_left = 'LEFT_WRIST' in rel_skeleton and 'LEFT_SHOULDER' in rel_skeleton
    
    is_right_back = False
    if has_right:
        right_wrist_z = rel_skeleton['RIGHT_WRIST']['z']
        right_shoulder_z = rel_skeleton['RIGHT_SHOULDER']['z']
        # китката трябва да е по-назад от рамото
        is_right_back = right_wrist_z > right_shoulder_z + tol
    
    is_left_back = False
    if has_left:
        left_wrist_z = rel_skeleton['LEFT_WRIST']['z']
        left_shoulder_z = rel_skeleton['LEFT_SHOULDER']['z']
        # китката трябва да е по-назад от рамото
        is_left_back = left_wrist_z > left_shoulder_z + tol
    
    # Приема се ако поне едната ръка е назад
    is_back = (is_right_back and has_right) or (is_left_back and has_left)
    
    logger.debug(f"arms_back: right={is_right_back} (has_right={has_right}), left={is_left_back} (has_left={has_left})")
    return is_back, "✓" if is_back else "✗ Изпънете ръцете назад за разтягане (отворете гърдите)"

def _check_arms_forward(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце напред"""
    tol_z = tolerances_data['arm_tol'] * 1.5
    tol_x = user_metrics['shoulder_width'] * 0.6

    has_right = 'RIGHT_WRIST' in rel_skeleton and 'RIGHT_SHOULDER' in rel_skeleton
    has_left = 'LEFT_WRIST' in rel_skeleton and 'LEFT_SHOULDER' in rel_skeleton

    is_right_forward = is_left_forward = False

    if has_right:
        rw, rs = rel_skeleton['RIGHT_WRIST'], rel_skeleton['RIGHT_SHOULDER']
        # китката трябва да е пред рамото по Z
        forward_ok = rw['z'] < rs['z'] - tol_z
        # китката трябва да е приблизително на същата хоризонтална линия (X) като рамото
        aligned_ok = abs(rw['x'] - rs['x']) < tol_x
        is_right_forward = forward_ok and aligned_ok

    if has_left:
        lw, ls = rel_skeleton['LEFT_WRIST'], rel_skeleton['LEFT_SHOULDER']
        forward_ok = lw['z'] < ls['z'] - tol_z
        aligned_ok = abs(lw['x'] - ls['x']) < tol_x
        is_left_forward = forward_ok and aligned_ok

    # изискваме и двете ръце да са изпънати напред
    is_forward = (is_right_forward and has_right) and (is_left_forward and has_left)

    logger.debug(f"arms_forward: right={is_right_forward} (has_right={has_right}), left={is_left_forward} (has_left={has_left})")
    return is_forward, "✓" if is_forward else "✗ Изпънете ръце напред, близо една до друга, насочени към камерата"

def _check_arms_w_shape(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце в W форма"""
    right_wrist_y = rel_skeleton.get('RIGHT_WRIST', {}).get('y', 0)
    left_wrist_y = rel_skeleton.get('LEFT_WRIST', {}).get('y', 0)
    right_shoulder_y = rel_skeleton.get('RIGHT_SHOULDER', {}).get('y', 0)
    left_shoulder_y = rel_skeleton.get('LEFT_SHOULDER', {}).get('y', 0)

    tol = tolerances_data['arm_tol'] * 0.5
    is_w_shape = (abs(right_wrist_y - right_shoulder_y) < tol) and (abs(left_wrist_y - left_shoulder_y) < tol)
    
    return is_w_shape, "✓" if is_w_shape else "✗ Поставете китките близо до раменете (W форма)"

def _check_arms_y_shape(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Ръце в Y форма"""
    right_wrist_y = rel_skeleton.get('RIGHT_WRIST', {}).get('y', 0)
    left_wrist_y = rel_skeleton.get('LEFT_WRIST', {}).get('y', 0)
    head_y = rel_skeleton.get('HEAD', {}).get('y', 0)

    tol = tolerances_data['arm_tol'] * 0.10
    is_y_shape = (right_wrist_y > head_y + tol) and (left_wrist_y > head_y + tol)
    
    return is_y_shape, "✓" if is_y_shape else "✗ Изпънете ръцете нагоре (Y форма)"

def _check_legs_together(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Крака събрани"""
    right_joint = rel_skeleton.get('RIGHT_ANKLE', rel_skeleton.get('RIGHT_KNEE', {}))
    left_joint = rel_skeleton.get('LEFT_ANKLE', rel_skeleton.get('LEFT_KNEE', {}))
    right_x = right_joint.get('x', 0)
    left_x = left_joint.get('x', 0)
    
    # Разликата между краката трябва да е малка
    is_together = abs(right_x - left_x) < user_metrics['hip_width'] + tolerances_data['hip_tol']
    logger.debug(f"legs_together: {is_together}, right_x={right_x:.0f}, left_x={left_x:.0f}")
    
    return is_together, "✓" if is_together else "✗ Приближете краката си"

def _check_legs_apart(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Крака раздалечени"""
    right_joint = rel_skeleton.get('RIGHT_ANKLE', rel_skeleton.get('RIGHT_KNEE', {}))
    left_joint = rel_skeleton.get('LEFT_ANKLE', rel_skeleton.get('LEFT_KNEE', {}))
    right_x = right_joint.get('x', 0)
    left_x = left_joint.get('x', 0)

    # Разликата между краката трябва да е голяма
    is_apart = abs(right_x - left_x) > user_metrics['hip_width'] + tolerances_data['hip_tol']
    logger.debug(f"legs_apart: {is_apart}, right_x={right_x:.0f}, left_x={left_x:.0f}")
    
    return is_apart, "✓" if is_apart else "✗ Разтворете краката си на ширината на раменете"

def _check_lunge_pose(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Lunge поза"""
    tol_dist = tolerances_data['height_tol'] * 0.3 
    tol_bend = tolerances_data['leg_tol'] * 2.5
    has_right_knee = 'RIGHT_KNEE' in rel_skeleton and 'RIGHT_HIP' in rel_skeleton
    has_left_knee = 'LEFT_KNEE' in rel_skeleton and 'LEFT_HIP' in rel_skeleton
    has_right_ankle = 'RIGHT_ANKLE' in rel_skeleton
    has_left_ankle = 'LEFT_ANKLE' in rel_skeleton
    
    # Stagger check (Z diff)
    z_diff = 0
    if has_right_knee and has_left_knee:
        z_diff = abs(rel_skeleton['RIGHT_KNEE']['z'] - rel_skeleton['LEFT_KNEE']['z'])
    elif has_right_ankle and has_left_ankle:
        z_diff = abs(rel_skeleton['RIGHT_ANKLE']['z'] - rel_skeleton['LEFT_ANKLE']['z'])
        logger.debug("Fallback to ankles for lunge stagger check")
    
    is_staggered = z_diff > tol_dist
    
    # Single knee bend check
    is_right_bent = False
    is_left_bent = False
    fallback = False
    
    if has_right_knee:
        y_diff_right = rel_skeleton['RIGHT_HIP']['y'] - rel_skeleton['RIGHT_KNEE']['y']
        is_right_bent = y_diff_right < user_metrics.get('leg_length', 0) - tol_bend  # Use .get() for safety
    
    if has_left_knee:
        y_diff_left = rel_skeleton['LEFT_HIP']['y'] - rel_skeleton['LEFT_KNEE']['y']
        is_left_bent = y_diff_left < user_metrics.get('leg_length', 0) - tol_bend  # Use .get() for safety
    
    # Fallback if no knees/hips: head drop as proxy
    if not (has_right_knee or has_left_knee):
        if 'HEAD' in rel_skeleton:
            head_y = rel_skeleton['HEAD']['y']
            if user_metrics is not None:
                expected_standing_head_y = user_metrics.get('standing_head_y', user_metrics.get('height', 0) * 0.8)
                fallback = head_y < expected_standing_head_y * 0.8
                logger.debug(f"Fallback lunge detection: head_y={head_y:.0f}, expected={expected_standing_head_y:.0f}, bent={fallback}")
    
    # Lunge if staggered and exactly one knee bent (or fallback)
    is_bent = (is_right_bent != is_left_bent) or (fallback and not (is_right_bent and is_left_bent))
    is_lunge = is_staggered and is_bent
    
    logger.debug(f"lunge_pose: staggered={is_staggered} (z_diff={z_diff:.0f}, tol_dist={tol_dist:.0f}), bent={is_bent} (right={is_right_bent}, left={is_left_bent}, fallback={fallback})")
    return is_lunge, "✓" if is_lunge else "✗ Пристъпете напред и сгънете само едното коляно (осигурете дълбочина и видимост)"

def _check_knees_bent(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Колене свити"""
    tol = tolerances_data['height_tol'] * 0.15
    
    # Изисква налични стави
    has_right = 'RIGHT_KNEE' in rel_skeleton and 'RIGHT_HIP' in rel_skeleton
    has_left = 'LEFT_KNEE' in rel_skeleton and 'LEFT_HIP' in rel_skeleton
    
    is_right_bent = False
    if has_right:
        right_knee_y = rel_skeleton['RIGHT_KNEE']['y']
        right_hip_y = rel_skeleton['RIGHT_HIP']['y']
        diff_right = abs(right_hip_y - right_knee_y) # Малка разлика = свито (бедрата спуснати до нивото на коляното)
        is_right_bent = diff_right < tol
    
    is_left_bent = False
    if has_left:
        left_knee_y = rel_skeleton['LEFT_KNEE']['y']
        left_hip_y = rel_skeleton['LEFT_HIP']['y']
        diff_left = abs(left_hip_y - left_knee_y)
        is_left_bent = diff_left < tol
    
    # Разрешава, ако поне едната страна е свита (обработва частично засичане)
    is_bent = (is_right_bent and has_right) or (is_left_bent and has_left)
    
    # Резервен вариант при липса на долна част на тялото
    if not is_bent and not (has_right or has_left):
        if 'TORSO' in rel_skeleton:
            torso_y = rel_skeleton['TORSO']['y']
            calibration_torso_y = user_metrics.get('torso_y', 0)
            if calibration_torso_y and torso_y < calibration_torso_y - tol:
                is_bent = True
                logger.debug(f"Knees bent fallback: Torso Y drop detected ({torso_y:.0f} vs {calibration_torso_y:.0f})")
    
    logger.debug(f"knees_bent: right={is_right_bent} (has_right={has_right}), left={is_left_bent} (has_left={has_left}), fallback={is_bent}")
    return is_bent, "✓" if is_bent else "✗ Сгънете повече коленете си (спуснете бедрата до нивото на коленете)"

def _check_shoulders_retracted(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Рамене прибрани назад (shoulder retraction)"""
    required = required_poses["shoulders_retracted"]
    right_shoulder_z = rel_skeleton.get('RIGHT_SHOULDER', {}).get('z', 0)
    left_shoulder_z = rel_skeleton.get('LEFT_SHOULDER', {}).get('z', 0)
    collar_z = rel_skeleton.get('LEFT_COLLAR', {}).get('z', 0)

    # Толеранс за прибиране (по отношение на дължината на ръката)
    tol = tolerances_data['arm_tol'] * 0.10

    # Shoulders are retracted if both are behind torso by at least
    is_right_retracted = right_shoulder_z > collar_z + tol
    is_left_retracted = left_shoulder_z > collar_z + tol
    is_retracted = is_right_retracted and is_left_retracted
    
    is_ok = (is_retracted == required)
    
    # Check for torso rotation (asymmetry)
    if abs(right_shoulder_z - left_shoulder_z) > tolerances_data['arm_tol']:
        if required:
            msg = "✓" if is_ok else "✗ Стегнете лопатките си равномерно, избягвайте завъртане на торса"
        else:
            msg = "✓" if is_ok else "✗ Не стягайте лопатките (върнете в неутрално, избягвайте завъртане)"
    else:
        if required:
            msg = "✓" if is_ok else "✗ Стегнете лопатките си, като издърпате раменете назад и леко надолу"
        else:
            msg = "✓" if is_ok else "✗ Не стягайте лопатките (върнете раменете в неутрално)"
    
    logger.debug(f"shoulders_retracted: right={is_right_retracted} (z={right_shoulder_z:.0f}), left={is_left_retracted} (z={left_shoulder_z:.0f}), collar_z={collar_z:.0f}, required={required}, ok={is_ok}")
    return is_ok, msg

def _check_pelvis_anterior(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Таз напред (anterior pelvic tilt)"""
    hip_z = (rel_skeleton.get('RIGHT_HIP', {}).get('z', 0) + rel_skeleton.get('LEFT_HIP', {}).get('z', 0)) / 2
    torso_z = rel_skeleton.get('TORSO', {}).get('z', 0)

    tol = tolerances_data['height_tol'] * 0.15

    is_anterior = hip_z > torso_z + tol
    return is_anterior, "✓" if is_anterior else "✗ Приберете таза назад"

def _check_pelvis_posterior(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Таз назад (posterior pelvic tilt)"""
    hip_z = (rel_skeleton.get('RIGHT_HIP', {}).get('z', 0) + rel_skeleton.get('LEFT_HIP', {}).get('z', 0)) / 2
    torso_z = rel_skeleton.get('TORSO', {}).get('z', 0)

    tol = tolerances_data['height_tol'] * 0.05

    is_posterior = hip_z < torso_z + tol
    return is_posterior, "✓" if is_posterior else "✗ Приберете таза напред"

def _check_head_retracted(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Прибрана глава (head retraction)"""
    required = required_poses["head_retracted"]
    head_z = rel_skeleton.get('HEAD', {}).get('z', 0)
    collar_z = rel_skeleton.get('LEFT_COLLAR', {}).get('z', 0)
    
    # Толеранс за прибиране (по отношение на височината) 
    tol = tolerances_data['height_tol'] * 0.01
    
    # Главата е прибрана, ако HEAD е по-назад от ключицата с поне *tol*
    is_head_retracted = head_z > collar_z + tol 
    is_ok = (is_head_retracted == required)
    
    if required:
        msg = "✓" if is_ok else "✗ Приберете брадичката назад"
    else:
        msg = "✓" if is_ok else "✗ Върнете главата в неутрално положение (не прибирайте брадичката)"
    
    logger.debug(f"head_retracted: is_head_retracted={is_head_retracted} (z={head_z:.0f}), collar_z={collar_z:.0f}, required={required}, ok={is_ok}")
    return is_ok, msg

def _check_head_tilted_left(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Глава наклонена наляво"""
    required = required_poses["head_tilted_left"]
    head_x = rel_skeleton.get('HEAD', {}).get('x', 0)
    neck_x = rel_skeleton.get('NECK', {}).get('x', 0)

    tol = tolerances_data['height_tol'] * 0.05

    is_tilted_right = head_x > neck_x + tol
    is_ok = (is_tilted_right == required)
    
    if required:
        msg = "✓" if is_ok else "✗ Наклонете главата наляво"
    else:
        msg = "✓" if is_ok else "✗ Не накланяйте главата наляво (върнете в неутрално)"

    logger.debug(f"head_tilted_left: {is_tilted_right}, head_x={head_x:.0f}, neck_x={neck_x:.0f}, required={required}, ok={is_ok}")
    return is_ok, msg

def _check_head_tilted_right(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Глава наклонена надясно"""
    required = required_poses["head_tilted_right"]
    head_x = rel_skeleton.get('HEAD', {}).get('x', 0)
    neck_x = rel_skeleton.get('NECK', {}).get('x', 0)

    tol = tolerances_data['height_tol'] * 0.05

    is_tilted_left = head_x < neck_x - tol
    is_ok = (is_tilted_left == required)
    
    if required:
        msg = "✓" if is_ok else "✗ Наклонете главата надясно"
    else:
        msg = "✓" if is_ok else "✗ Не накланяйте главата надясно (върнете в неутрално)"

    logger.debug(f"head_tilted_right: {is_tilted_left}, head_x={head_x:.0f}, neck_x={neck_x:.0f}, required={required}, ok={is_ok}")
    return is_ok, msg

def _check_spine_extended(rel_skeleton, required_poses, tolerances_data, user_metrics):
    """Проверка: Гръбнак изпънат (spine extended)"""
    required = required_poses["spine_extended"]
    collar_z = (rel_skeleton.get('LEFT_COLLAR', {}).get('z', 0) + rel_skeleton.get('RIGHT_COLLAR', {}).get('z', 0)) / 2
    torso_z = rel_skeleton.get('TORSO', {}).get('z', 0)

    # Изпънат гръбнак ако collar е по-назад от torso (защото по-голямо Z = назад)
    is_extended = collar_z > torso_z
    is_ok = (is_extended == required)
    
    if required:
        msg = "✓" if is_ok else "✗ Изпънете гръбнака (приберете таза назад)"
    else:
        msg = "✓" if is_ok else "✗ Върнете в неутрално (не изпъвайте гръбнака прекомерно)"

    logger.debug(f"spine_extended: is_extended={is_extended}, collar_z={collar_z:.0f}, torso_z={torso_z:.0f}, required={required}, ok={is_ok}")
    return is_ok, msg
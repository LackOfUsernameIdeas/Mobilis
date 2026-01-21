import math
import globals

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

def normalize_skeleton(user_skeleton):
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

def project_world_to_screen(world_x, world_y, world_z, nuitrack):
    """Конвертира координати от 3D (реален свят) към 2D (екран) за визуализация на обекти върху видео потока."""
    try:
        # Ако нямаме инициализиран Nuitrack обект, прекратяваме функцията
        if not nuitrack:
            return None
        
        # Параметри на проекцията (прозорчето на камерата):
        # fx, fy - фокусни разстояния (мащаба на проекцията - колко близо или далеч камерата вижда скелета, само че в пиксели)
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
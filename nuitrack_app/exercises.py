EXERCISE_JSON_1 = {
    "exercise_name": "Chin Tucks",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака събрани, ръце отпуснати, глава в неутрално положение (поглед напред).",
            "required_poses": {
                "arms_down": True,
                "legs_together": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 2 - Прибиране на брадичката (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Приберете брадичката назад към шията, без да накланяте главата. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_retracted": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 3 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Освободете и върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_retracted": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 4 - Прибиране на брадичката (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Приберете брадичката назад и задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_retracted": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 5 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Освободете и върнете в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_retracted": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 6 - Прибиране на брадичката (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Приберете брадичката назад и задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_retracted": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        }
    ]
}

EXERCISE_JSON_2 = {
    "exercise_name": "Neck Side Tilts (Lateral Neck Flexion)",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака събрани, ръце отпуснати, глава в неутрално положение (поглед напред).",
            "required_poses": {
                "arms_down": True,
                "legs_together": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 2 - Наклон наляво (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата наляво към рамото, без да вдигате раменете. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_left": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 3 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_tilted_left": False,
                "head_tilted_right": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 4 - Наклон надясно (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата надясно към рамото. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_right": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 5 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_tilted_left": False,
                "head_tilted_right": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 6 - Наклон наляво (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата наляво. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_left": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 7 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_tilted_left": False,
                "head_tilted_right": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 8 - Наклон надясно (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата надясно. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_right": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 9 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_tilted_left": False,
                "head_tilted_right": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 10 - Наклон наляво (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата наляво. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_left": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 11 - Неутрална стойка",
            "duration_seconds": 3,
            "instructions": "Върнете главата в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "head_tilted_left": False,
                "head_tilted_right": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        },
        {
            "name": "Позиция 12 - Наклон надясно (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Наклонете главата надясно. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "head_tilted_right": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.15
            }
        }
    ]
}

EXERCISE_JSON_3 = {
    "exercise_name": "Shoulder Blade Squeezes",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака събрани, ръце отпуснати отстрани и рамене отпуснати.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True
            },
            "target_angles": {
                "right_elbow_angle": 160,  # Straight arms down
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 2 - Стискане (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете мускулите между лопатките, като издърпате раменете назад и леко надолу, без да вдигате ръцете.",
            "required_poses": {
                "arms_down": True,
                "shoulders_retracted": True  # New: Check Z-depth of shoulders closer to back (relative to torso)
            },
            "target_angles": {
                "right_elbow_angle": 150,  # Slight bend if arms pull back
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 3 - Освобождаване (1-во повторение)",
            "duration_seconds": 3,
            "instructions": "Освободете раменете и се върнете в неутрална стойка с отпуснати рамене.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "shoulders_retracted": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 4 - Стискане (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете мускулите между лопатките, като издърпате раменете назад и леко надолу.",
            "required_poses": {
                "arms_down": True,
                "shoulders_retracted": True
            },
            "target_angles": {
                "right_elbow_angle": 150,
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 5 - Освобождаване (2-ро повторение)",
            "duration_seconds": 3,
            "instructions": "Освободете раменете и се върнете в неутрална стойка.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True,
                "shoulders_retracted": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 6 - Стискане (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете мускулите между лопатките, като издърпате раменете назад и леко надолу.",
            "required_poses": {
                "arms_down": True,
                "shoulders_retracted": True
            },
            "target_angles": {
                "right_elbow_angle": 150,
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        }
    ]
}

EXERCISE_JSON_4 = {
    "exercise_name": "Wall Angels",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака събрани, ръце отпуснати отстрани, гърба изправен.",
            "required_poses": {
                "arms_down": True,
                "legs_together": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 2 - W форма (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Повдигнете ръцете до W форма: лакти свити на 90°, китки близо до раменете, гърба изправен.",
            "required_poses": {
                "arms_w_shape": True,
                "shoulders_retracted": True 
            },
            "target_angles": {
                "right_elbow_angle": 30,
                "left_elbow_angle": 30
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 3 - Y форма (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Изпънете ръцете нагоре до Y форма, запазвайки гърба изправен и ръцете близо до тялото.",
            "required_poses": {
                "arms_y_shape": True
            },
            "target_angles": {
                "right_elbow_angle": 150,
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 4 - W форма (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Върнете ръцете до W форма: лакти свити, китки близо до раменете.",
            "required_poses": {
                "arms_w_shape": True,
                "shoulders_retracted": True 
            },
            "target_angles": {
                "right_elbow_angle": 30,
                "left_elbow_angle": 30
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 5 - Y форма (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Изпънете ръцете до Y форма, гърба изправен.",
            "required_poses": {
                "arms_y_shape": True
            },
            "target_angles": {
                "right_elbow_angle": 150,
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 6 - W форма (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Върнете ръцете до W форма.",
            "required_poses": {
                "arms_w_shape": True,
                "shoulders_retracted": True 
            },
            "target_angles": {
                "right_elbow_angle": 30,
                "left_elbow_angle": 30
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 7 - Y форма (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Изпънете ръцете до Y форма, гърба изправен.",
            "required_poses": {
                "arms_y_shape": True
            },
            "target_angles": {
                "right_elbow_angle": 150,
                "left_elbow_angle": 150
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        }
    ]
}

EXERCISE_JSON_5 = {
    "exercise_name": "Standing T Stretch",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака на ширината на раменете, ръце отпуснати отстрани.",
            "required_poses": {
                "arms_down": True,
                "legs_apart": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 2 - Ръце напред (1-во повторение)",
            "duration_seconds": 1,
            "instructions": "Застанете изправени с крака на ширината на раменете, ръце отпуснати отстрани.",
            "required_poses": {
                "arms_forward": True,
                "legs_apart": True
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 3 - T Stretch (1-во повторение)",
            "duration_seconds": 4,
            "instructions": "Разтворете ръцете хоризонтално настрани, образувайки форма на 'T'. Задръжте.",
            "required_poses": {
                "legs_apart": True,
                "arms_back": True
            },
            "target_angles": {
                "right_elbow_angle": 140,
                "left_elbow_angle": 140
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 4 - Връщане в стойка с ръце напред (1-во повторение)",
            "duration_seconds": 3,
            "instructions": "Върнете ръцете в неутрална позиция отстрани.",
            "required_poses": {
                "arms_forward": True,
                "legs_apart": True
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 5 - T Stretch (2-ро повторение)",
            "duration_seconds": 4,
            "instructions": "Разтворете ръцете хоризонтално настрани, образувайки форма на 'T'. Задръжте.",
            "required_poses": {
                "legs_apart": True,
                "arms_back": True
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 6 - Връщане в стойка с ръце напред (2-ро повторение)",
            "duration_seconds": 3,
            "instructions": "Върнете ръцете в неутрална позиция отстрани.",
            "required_poses": {
                "arms_forward": True,
                "legs_apart": True
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 7 - T Stretch (3-то повторение)",
            "duration_seconds": 4,
            "instructions": "Разтворете ръцете хоризонтално настрани, образувайки форма на 'T'. Задръжте.",
            "required_poses": {
                "legs_apart": True,
                "arms_back": True
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        }
    ]
}

EXERCISE_JSON_6 = {
    "exercise_name": "Standing Pelvic Tilts",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака на ширината на раменете, ръце отпуснати, таз в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_apart": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 2 - Преден наклон на таза (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и дайте таза назад, за да увеличите извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_anterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 3 - Заден наклон на таза (1-во повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и подайте таза напред, за да изправите долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_posterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 4 - Преден наклон на таза (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и дайте таза назад, за да увеличите извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_anterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 5 - Заден наклон на таза (2-ро повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и подайте таза напред, за да изправите долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_posterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 6 - Преден наклон на таза (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и дайте таза назад, за да увеличите извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_anterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 7 - Заден наклон на таза (3-то повторение)",
            "duration_seconds": 5,
            "instructions": "Стегнете корема и подайте таза напред, за да изправите долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_down": True,
                "pelvis_posterior": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        }       
    ]
}

EXERCISE_JSON_7 = {
    "exercise_name": "Standing Lumbar Extensions",
    "steps": [
        {
            "name": "Позиция 1 - Неутрална стойка",
            "duration_seconds": 2,
            "instructions": "Застанете изправени с крака на ширината на раменете, ръце отпуснати, гръбнак в неутрално положение.",
            "required_poses": {
                "arms_down": True,
                "legs_apart": True
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 2 - Лумбална екстензия (1-во повторение)",
            "duration_seconds": 4,
            "instructions": "Леко се наведете назад, увеличавайки извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_bent_waist": True,
                "spine_extended": True
            },
            "target_angles": {
                "right_elbow_angle": 90,
                "left_elbow_angle": 90
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 3 - Връщане в неутрална стойка (1-во повторение)",
            "duration_seconds": 3,
            "instructions": "Върнете се в неутрална позиция с изправен гръбнак.",
            "required_poses": {
                "arms_down": True,
                "legs_apart": True,
                "arms_bent_waist": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 4 - Лумбална екстензия (2-ро повторение)",
            "duration_seconds": 4,
            "instructions": "Леко се наведете назад, увеличавайки извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_bent_waist": True,
                "spine_extended": True
            },
            "target_angles": {
                "right_elbow_angle": 90,
                "left_elbow_angle": 90
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 5 - Връщане в неутрална стойка (2-ро повторение)",
            "duration_seconds": 3,
            "instructions": "Върнете се в неутрална позиция с изправен гръбнак.",
            "required_poses": {
                "arms_down": True,
                "legs_apart": True,
                "arms_bent_waist": False
            },
            "target_angles": {
                "right_elbow_angle": 160,
                "left_elbow_angle": 160
            },
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        },
        {
            "name": "Позиция 6 - Лумбална екстензия (3-то повторение)",
            "duration_seconds": 4,
            "instructions": "Леко се наведете назад, увеличавайки извивката в долната част на гърба. Задръжте.",
            "required_poses": {
                "arms_bent_waist": True,
                "spine_extended": True
            },
            "target_angles": {
                "right_elbow_angle": 90,
                "left_elbow_angle": 90
            },            
            "tolerance": {
                "angle_tolerance": 20,
                "distance_tolerance": 0.2
            }
        }
    ]
}

ALL_EXERCISES = [EXERCISE_JSON_1, EXERCISE_JSON_2, EXERCISE_JSON_3, EXERCISE_JSON_4, EXERCISE_JSON_5, EXERCISE_JSON_6, EXERCISE_JSON_7]
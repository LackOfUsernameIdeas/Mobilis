from tkinter import messagebox
import threading
import time

import globals

def start_session(update_timer_display, run_nuitrack, app):
    """Започва нова сесия на Nuitrack програмата."""

    if globals.session_running[0]:
        messagebox.showwarning("Session Running", "Session already active!")
        return
    
    globals.session_start_time = time.time()
    globals.session_running[0] = True
    
    threading.Thread(target=update_timer_display, daemon=True).start()
    threading.Thread(target=run_nuitrack, daemon=True).start()
    
    app.start_btn.config(state="disabled")
    app.stop_btn.config(state="normal")
    app.exercise_btn.config(state="normal")

def stop_session(app):
    """Прекратява текуща сесия на Nuitrack програмата."""

    globals.session_running[0] = False
    globals.exercise_active[0] = False
    globals.calibration_active[0] = False 
    globals.current_step[0] = 0
    globals.session_start_time = 0
    globals.nuitrack_instance = None
    
    app.elapsed_label.config(text="Време на сесията: 00:00.00")
    app.instruction_label.config(text="Стартирайте сесия, за да започнете")
    app.accuracy_label.config(text="Точност на изпълнение: --")
    app.timer_label.config(text="Време: --", fg="black", bg="white")
    
    app.start_btn.config(state="normal")
    app.stop_btn.config(state="disabled") 
    app.exercise_btn.config(state="disabled", text="Стартиране на упражнение", bg="blue")

def toggle_exercise(app, perform_calibration):
    """
    Управление на състоянието на упражнението:
    - Ако упражнението е активно → спира го и връща интерфейса в начален режим
    - Ако не е активно → стартира калибриране и след успешна калибриране започва упражнение
    """
            
    # Проверка дали сесията е стартирана
    if not globals.session_running[0]:
        messagebox.showwarning("No Session", "Please start a session first!")
        return
    
    # Ако упражнението вече е активно → спиране
    if globals.exercise_active[0]:
        globals.exercise_active[0] = False
        globals.current_step[0] = 0

        # Възстановяване на UI в изходно състояние
        app.exercise_btn.config(text="Стартиране на упражнение", bg="blue")
        app.instruction_label.config(text="Стартирайте сесия, за да започнете")
        app.accuracy_label.config(text="Точност на изпълнение: --")
        app.timer_label.config(text="Време: --", fg="black", bg="white")
    else:
        # Ако упражнението не е активно → стартиране с калибриране
        while True:
            # Показване на подготовка за калибриране
            globals.calibration_active[0] = True
            globals.calibration_start_time[0] = time.time()
            
            app.instruction_label.config(text="🎯 КАЛИБРИРАНЕТО ЗАПОЧВА...")
            app.instruction_label.config(text="Подгответе се! Застанете пред камерата.")
            app.timer_label.config(text="⏱️ Подготовка за калибриране...")
            app.accuracy_label.config(text="🔍 Уверете се, че цялото тяло е видимо")
            
            globals.user_metrics = perform_calibration(globals.nuitrack_instance)
            globals.calibration_active[0] = False  # край на калибрационен режим
            
            globals.logger.info(f"Calibration metrics: {globals.user_metrics}")

            # Ако калибрирането е успешна
            if globals.user_metrics:
                app.instruction_label.config(text="✅ КАЛИБРИРАНЕТО Е ЗАВЪРШЕНО!")
                app.instruction_label.config(text="Чудесно! Вашите телесни мерки са записани.")
                app.accuracy_label.config(text="✅ Готово за стартиране на упражнение")
                app.timer_label.config(text="🎯 Калибрирането е успешно!")
                app.root.update()
                time.sleep(1)
                break
            else:
                app.instruction_label.config(text="Стартирайте сесия, за да започнете")
                app.accuracy_label.config(text="Точност на изпълнение: --")
                app.timer_label.config(text="Време: --", fg="black", bg="white")
                return
        
        # Стартиране на упражнението след успешна калибриране
        print(f"Calibrated: Height ~{globals.user_metrics['height']:.0f}mm, Arm Length ~{globals.user_metrics['arm_length']:.0f}mm, Hip Width ~{globals.user_metrics['hip_width']:.0f}mm")
        globals.exercise_active[0] = True
        globals.current_step[0] = 0
        globals.step_start_time[0] = time.time()
        app.exercise_btn.config(text="Спиране на упражнението", bg="red")
        print("=== EXERCISE STARTED WITH RELATIVE POSES ===")

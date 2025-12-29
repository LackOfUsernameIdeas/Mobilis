import time
import tkinter as tk
import custom_messagebox as messagebox

from session import start_session, stop_session, toggle_exercise
from theme import ModernTheme, ModernWidget

from utils.nuitrack_runner import update_timer_display, run_nuitrack
from utils.calibration import perform_calibration

import globals

# ===== GUI SETUP =====
class ModernExerciseApp:
    """Модерен редизайн на приложението за упражнения"""
    
    def __init__(self):
        self.theme = ModernTheme()
        self.widget_factory = ModernWidget(self.theme)
        
        self.setup_window()
        self.create_widgets()
    
    def setup_window(self):
        """Настройка на главния прозорец с модерен стил"""
        self.root = tk.Tk()
        
        self.root.iconbitmap(default='logo.ico')

        self.root.title("Персонален треньор за упражнения")
        self.root.geometry("685x385")
        self.root.configure(bg=self.theme.colors['background'])
        
    def create_widgets(self):
        """Създаване на всички уиджети с модерен стил"""
        # Главен контейнер
        main_container = tk.Frame(self.root, bg=self.theme.colors['background'])
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Карта за сесия
        session_card = self.widget_factory.create_card(main_container)
        session_card.pack(fill=tk.X, pady=(0, 16))
        
        session_content = tk.Frame(session_card, bg=self.theme.colors['card'])
        session_content.pack(fill=tk.BOTH, padx=20, pady=16)
        
        session_title = self.widget_factory.create_label(
            session_content,
            "Управление на сесията",
            style="heading_medium"
        )
        session_title.pack(anchor=tk.W, pady=(0, 12))
        
        button_frame = tk.Frame(session_content, bg=self.theme.colors['card'])
        button_frame.pack(fill=tk.X)
        
        self.start_btn = self.widget_factory.create_button(
            button_frame,
            "Стартиране на сесия",
            command=lambda: start_session(update_timer_display, run_nuitrack, self),
            variant="success"
        )
        self.start_btn.pack(side=tk.LEFT, padx=(0, 8))
        
        self.stop_btn = self.widget_factory.create_button(
            button_frame,
            "Спиране на сесия",
            command=lambda: stop_session(self),
            variant="destructive"
        )
        self.stop_btn.pack(side=tk.LEFT)
        self.stop_btn.configure(state="disabled")
        
        self.calibrate_btn = self.widget_factory.create_button(
            button_frame,
            "Стартиране на калибриране",
            command=lambda: self.start_calibration(),
            variant="primary"
        )
        self.calibrate_btn.pack(side=tk.LEFT, padx=(8, 0))

        # Карта за упражнение
        exercise_card = self.widget_factory.create_card(main_container)
        exercise_card.pack(fill=tk.X, pady=(0, 16))
        
        exercise_content = tk.Frame(exercise_card, bg=self.theme.colors['card'])
        exercise_content.pack(fill=tk.BOTH, padx=20, pady=16)
        
        exercise_title = self.widget_factory.create_label(
            exercise_content,
            "Упражнение за конкретна част от тялото",
            style="heading_medium"
        )
        exercise_title.pack(anchor=tk.W, pady=(0, 8))
        
        # Dropdown за избор на упражнение
        select_frame = tk.Frame(exercise_content, bg=self.theme.colors['card'])
        select_frame.pack(fill=tk.X, pady=(0, 8))
        
        select_label = self.widget_factory.create_label(
            select_frame,
            "Изберете упражнение:",
            style="body_medium"
        )
        select_label.pack(side=tk.LEFT, padx=(0, 8))
        
        # Избрано упражнение по подразбиране
        self.exercise_var = tk.StringVar(value=globals.ALL_EXERCISES[0]["exercise_name"])
        self.exercise_menu = tk.OptionMenu(
            select_frame,
            self.exercise_var,
            *[ex["exercise_name"] for ex in globals.ALL_EXERCISES],
            command=self._update_exercise
        )
        self.exercise_menu.pack(side=tk.LEFT)
        self.exercise_menu.config(bg=self.theme.colors['accent'], fg=self.theme.colors['foreground'])

        self.exercise_btn = self.widget_factory.create_button(
            exercise_content,
            "Стартиране на упражнение",
            command=lambda: toggle_exercise(self),
            variant="primary",
            state="disabled"
        )
        self.exercise_btn.pack(anchor=tk.W, pady=(0, 16))
        self.exercise_btn.configure(state="disabled")
        
    def start_calibration(self):
        """Започва процеса на калибриране."""
        if not globals.session_running:
            messagebox.showwarning("Грешка", "Моля, стартирайте сесия преди калибриране!")
            return
        if globals.calibration_completed:
            messagebox.showinfo("Информация", "Калибрирането вече е извършено!")
            return
        globals.calibration_active = True
        globals.calibration_start_time = time.time()
        result = perform_calibration(globals.nuitrack_instance)
        if result:
            globals.calibration_completed = True
            messagebox.showinfo("Успех", "Калибрирането е успешно завършено!", False)
            self.exercise_btn.configure(state="normal")
        globals.calibration_active = False
    
    def _update_exercise(self, value):
        if globals.exercise_active:
            messagebox.showwarning(
                "Упражнение активно",
                "Не можете да смените упражнението докато е активно. Моля, спрете го първо."
            )
            # Връщане към текущото упражнение - принудително актуализиране след затваряне на диалоговия прозорец
            self.root.after(10, lambda: self.exercise_var.set(globals.EXERCISE_JSON["exercise_name"]))
            return
        
        # Намери упражнението по име
        for ex in globals.ALL_EXERCISES:
            if ex["exercise_name"] == value:
                globals.EXERCISE_JSON = ex
                break
        print(f"Selected exercise: {value}")

    def run(self):
        """Стартиране на приложението"""
        self.root.mainloop()
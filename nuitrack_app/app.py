import time
import tkinter as tk
import custom_messagebox as messagebox
import sys
import os

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
        self.update_cache_status()  # Първоначална проверка на статуса
        
        # Auto-size and center window, then show it
        self.auto_size_window()
        self.root.deiconify()  # Show the window after everything is ready
    
    def setup_window(self):
        """Настройка на главния прозорец с модерен стил"""
        self.root = tk.Tk()
        
        # Hide window initially to prevent flicker
        self.root.withdraw()
        
        # Извличане на .ico при компилирано .exe
        if getattr(sys, 'frozen', False):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.dirname(os.path.abspath(__file__))
        
        icon_path = os.path.join(base_path, 'logo.ico')
        try:
            self.root.iconbitmap(default=icon_path)
        except Exception as e:
            print(f"Could not load icon: {e}")

        self.root.title("Персонален треньор за упражнения")
        # Don't set geometry here - let it auto-size
        self.root.configure(bg=self.theme.colors['background'])
        
    def auto_size_window(self, show_on_first_call=False):
        """Automatically sizes the window to fit all content"""
        # Force update to calculate sizes
        self.root.update_idletasks()
        
        # Get required width and height
        required_width = self.root.winfo_reqwidth()
        required_height = self.root.winfo_reqheight()
        
        # Center the window on screen
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width - required_width) // 2
        y = (screen_height - required_height) // 2
        
        # Set size and position in one call
        self.root.geometry(f"{required_width}x{required_height}+{x}+{y}")
        
    def create_widgets(self):
        """Създаване на всички уиджети с модерен стил"""
        # Главен контейнер
        main_container = tk.Frame(self.root, bg=self.theme.colors['background'])
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # === СТАТУС ЛЕНТА ЗА КЕШИРАНЕ ===
        self.cache_status_frame = tk.Frame(main_container, bg="#FFF3CD", relief=tk.SOLID, borderwidth=1)
        self.cache_status_frame.pack(fill=tk.X, pady=(0, 16))
        
        self.cache_status_label = tk.Label(
            self.cache_status_frame,
            text="⏳ Зареждане на аудио инструкции...",
            bg="#FFF3CD",
            fg="#856404",
            font=("Segoe UI", 10),
            padx=12,
            pady=8
        )
        self.cache_status_label.pack()
        
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
    
    def update_cache_status(self):
        """Актуализира статуса на кеширането"""
        from preload_exercises import cache_status
        
        # Store previous visibility state
        was_visible = self.cache_status_frame.winfo_ismapped()
        
        # Не показва нищо ако кеширането не е започнало
        if not cache_status.is_caching and not cache_status.error and not cache_status.is_complete:
            self.cache_status_frame.pack_forget()
            if was_visible:
                self.auto_size_window()  # Resize when hiding
            return
        
        # Ако кеширането е завършено без грешки и нищо ново не е генерирано, не показва нищо
        if cache_status.is_complete and not cache_status.error and cache_status.files_generated == 0:
            self.cache_status_frame.pack_forget()
            if was_visible:
                self.auto_size_window()  # Resize when hiding
            return
        
        # Показва статус лентата само ако има активно кеширане, грешка или генерирани файлове
        if not was_visible:
            self.cache_status_frame.pack(fill=tk.X, pady=(0, 16))
            self.auto_size_window()  # Resize when showing
        
        # Взима текущия статус
        status_text = cache_status.get_progress_text()
        self.cache_status_label.config(text=status_text)
        
        # Променя цветовете според статуса
        if cache_status.is_complete and not cache_status.error:
            # Зелен цвят за успех
            self.cache_status_frame.config(bg="#D4EDDA")
            self.cache_status_label.config(bg="#D4EDDA", fg="#155724")
            
            # Скрива статус лентата след 3 секунди
            def hide_and_resize():
                self.cache_status_frame.pack_forget()
                self.auto_size_window()
            self.root.after(3000, hide_and_resize)
            
        elif cache_status.error:
            # Червен цвят за грешка
            self.cache_status_frame.config(bg="#F8D7DA")
            self.cache_status_label.config(bg="#F8D7DA", fg="#721C24")
            
        else:
            # Жълт цвят за прогрес
            self.cache_status_frame.config(bg="#FFF3CD")
            self.cache_status_label.config(bg="#FFF3CD", fg="#856404")
            
            # Продължава да проверява докато не приключи
            if cache_status.is_caching:
                self.root.after(500, self.update_cache_status)

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
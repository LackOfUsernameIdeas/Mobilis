import tkinter as tk

from session import start_session, stop_session, toggle_exercise
from theme import ModernTheme, ModernWidget
from utils import update_timer_display, run_nuitrack, perform_calibration

# ===== GUI SETUP =====
class ModernExerciseApp:
    """Модерен редизайн на приложението за упражнения"""
    
    def __init__(self):
        self.theme = ModernTheme()
        self.widget_factory = ModernWidget(self.theme)
        self.session_active = False
        self.exercise_active = False
        
        self.setup_window()
        self.create_widgets()
    
    def setup_window(self):
        """Настройка на главния прозорец с модерен стил"""
        self.root = tk.Tk()
        
        self.root.iconbitmap(default='D:/Projects/CodeWithPros/noit_2026/transparent.ico')

        self.root.title("Персонален треньор за упражнения")
        self.root.geometry("950x650")
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
        
        self.elapsed_label = self.widget_factory.create_label(
            session_content,
            "Време на сесията: 00:00.00",
            style="body_large"
        )
        self.elapsed_label.pack(anchor=tk.W, pady=(0, 16))
        
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
        
        exercise_subtitle = self.widget_factory.create_label(
            exercise_content,
            "Проследяване на стойката в реално време",
            style="body_medium"
        )
        exercise_subtitle.pack(anchor=tk.W, pady=(0, 16))
        exercise_subtitle.configure(fg=self.theme.colors['muted_foreground'])
        
        self.exercise_btn = self.widget_factory.create_button(
            exercise_content,
            "Стартиране на упражнение",
            command=lambda: toggle_exercise(self, perform_calibration),
            variant="primary"
        )
        self.exercise_btn.pack(anchor=tk.W, pady=(0, 16))
        self.exercise_btn.configure(state="disabled")
        
        # Секция за статус
        status_frame = tk.Frame(exercise_content, bg=self.theme.colors['card'])
        status_frame.pack(fill=tk.X, pady=(0, 16))
        
        self.instruction_label = self.widget_factory.create_label(
            status_frame,
            "Стартирайте сесия, за да започнете",
            style="body_medium"
        )
        self.instruction_label.pack(anchor=tk.W)
        self.instruction_label.configure(fg=self.theme.colors['muted_foreground'])
        
        # Секция за напредък
        progress_frame = tk.Frame(exercise_content, bg=self.theme.colors['card'])
        progress_frame.pack(fill=tk.X)
        
        metrics_frame = tk.Frame(progress_frame, bg=self.theme.colors['card'])
        metrics_frame.pack(fill=tk.X)
        
        self.accuracy_label = self.widget_factory.create_label(
            metrics_frame,
            "Точност на изпълнение: --",
            style="body_medium"
        )
        self.accuracy_label.pack(side=tk.LEFT, padx=(0, 20))
        
        self.timer_label = self.widget_factory.create_label(
            metrics_frame,
            "Време: --",
            style="body_medium"
        )
        self.timer_label.pack(side=tk.LEFT)
        
        # Карта за съвети
        tips_card = self.widget_factory.create_card(main_container)
        tips_card.pack(fill=tk.X)
        
        tips_content = tk.Frame(tips_card, bg=self.theme.colors['card'])
        tips_content.pack(fill=tk.BOTH, padx=20, pady=16)
        
        tips_title = self.widget_factory.create_label(
            tips_content,
            "💡 Полезни съвети",
            style="heading_small"
        )
        tips_title.pack(anchor=tk.W, pady=(0, 8))
        
        tips_text = """• Застанете на 2.5 до 3 метра от камерата за оптимално улавяне
• Отметките означават, че позата ви е правилна
• X знаците означават, че трябва да коригирате позицията си
• Поддържайте добро осветление
• По време на калибриране: Застанете изправени, ръцете надолу, останете напълно неподвижни"""
        
        tips_label = self.widget_factory.create_label(
            tips_content,
            tips_text,
            style="body_small"
        )
        tips_label.pack(anchor=tk.W, fill=tk.X)
        tips_label.configure(
            justify=tk.LEFT,
            fg=self.theme.colors['muted_foreground']
        )
    
    def run(self):
        """Стартиране на приложението"""
        self.root.mainloop()
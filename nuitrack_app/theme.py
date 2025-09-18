import colorsys
import tkinter as tk

class ModernTheme:
    """Модерна дизайн система, вдъхновена от CSS тематични променливи"""
    
    def __init__(self):
        self.setup_colors()
        self.setup_fonts()
        
    def setup_colors(self):
        """Настройка на цветовата палитра въз основа на CSS дизайн система"""
        self.colors = {
            'background': '#ffffff',
            'foreground': '#252525',
            'card': '#ffffff',
            'card_foreground': '#252525',
            'primary': '#353535',
            'primary_foreground': '#fbfbfb',
            'secondary': '#f7f7f7',
            'secondary_foreground': '#353535',
            'muted': '#f7f7f7',
            'muted_foreground': '#8e8e8e',
            'accent': '#f7f7f7',
            'accent_foreground': '#353535',
            'destructive': '#dc2626',
            'border': '#ebebeb',
            'input': '#ebebeb',
            'ring': '#b5b5b5',
            'success': '#16a34a',
            'warning': '#ea580c',
            'info': '#0ea5e9'
        }

    def setup_fonts(self):
        """Настройка на модерна шрифтова система"""
        self.fonts = {
            'heading_large': ('Segoe UI', 20, 'bold'),
            'heading_medium': ('Segoe UI', 16, 'bold'),
            'heading_small': ('Segoe UI', 14, 'bold'),
            'body_large': ('Segoe UI', 12, 'normal'),
            'body_medium': ('Segoe UI', 11, 'normal'),
            'body_small': ('Segoe UI', 10, 'normal'),
            'caption': ('Segoe UI', 9, 'normal'),
            'button': ('Segoe UI', 11, 'normal')
        }

class ModernWidget:
    """Помощен клас за създаване на модерно стилизирани компоненти"""
    
    def __init__(self, theme: ModernTheme):
        self.theme = theme
    
    def create_button(self, parent, text, command=None, variant="primary", **kwargs):
        """Създаване на модерно стилизиран бутон"""
        if variant == "primary":
            bg = self.theme.colors['primary']
            fg = self.theme.colors['primary_foreground']
            active_bg = self._darken_color(bg, 0.1)
        elif variant == "secondary":
            bg = self.theme.colors['secondary']
            fg = self.theme.colors['secondary_foreground']
            active_bg = self._darken_color(bg, 0.05)
        elif variant == "destructive":
            bg = self.theme.colors['destructive']
            fg = self.theme.colors['primary_foreground']
            active_bg = self._darken_color(bg, 0.1)
        elif variant == "success":
            bg = self.theme.colors['success']
            fg = self.theme.colors['primary_foreground']
            active_bg = self._darken_color(bg, 0.1)
        else:
            bg = self.theme.colors['accent']
            fg = self.theme.colors['accent_foreground']
            active_bg = self._darken_color(bg, 0.05)
        
        button = tk.Button(
            parent,
            text=text,
            command=command,
            bg=bg,
            fg=fg,
            activebackground=active_bg,
            activeforeground=fg,
            font=self.theme.fonts['button'],
            relief='flat',
            borderwidth=0,
            padx=16,
            pady=8,
            cursor='hand2',
            **kwargs
        )
        
        # Добавяне на hover ефекти
        def on_enter(e):
            button.config(bg=active_bg)
        
        def on_leave(e):
            button.config(bg=bg)
        
        button.bind("<Enter>", on_enter)
        button.bind("<Leave>", on_leave)
        
        return button
    
    def update_button(self, button, text=None, variant=None):
        """Обновяване на текста на бутона и/или варианта"""
        if text:
            button.config(text=text)
        
        if variant:
            if variant == "primary":
                bg = self.theme.colors['primary']
                fg = self.theme.colors['primary_foreground']
                active_bg = self._darken_color(bg, 0.1)
            elif variant == "secondary":
                bg = self.theme.colors['secondary']
                fg = self.theme.colors['secondary_foreground']
                active_bg = self._darken_color(bg, 0.05)
            elif variant == "destructive":
                bg = self.theme.colors['destructive']
                fg = self.theme.colors['primary_foreground']
                active_bg = self._darken_color(bg, 0.1)
            elif variant == "success":
                bg = self.theme.colors['success']
                fg = self.theme.colors['primary_foreground']
                active_bg = self._darken_color(bg, 0.1)
            else:
                bg = self.theme.colors['accent']
                fg = self.theme.colors['accent_foreground']
                active_bg = self._darken_color(bg, 0.05)
            
            button.config(
                bg=bg,
                fg=fg,
                activebackground=active_bg,
                activeforeground=fg
            )
            
            # Обновяване на hover връзки
            def on_enter(e):
                button.config(bg=active_bg)
            
            def on_leave(e):
                button.config(bg=bg)
            
            button.bind("<Enter>", on_enter)
            button.bind("<Leave>", on_leave)
    
    def create_card(self, parent, **kwargs):
        """Създаване на модерен карта контейнер"""
        frame = tk.Frame(
            parent,
            bg=self.theme.colors['card'],
            relief='flat',
            borderwidth=1,
            highlightbackground=self.theme.colors['border'],
            highlightthickness=1,
            **kwargs
        )
        return frame
    
    def create_label(self, parent, text, style="body_medium", **kwargs):
        """Създаване на модерно стилизиран етикет"""
        label = tk.Label(
            parent,
            text=text,
            bg=self.theme.colors['card'],
            fg=self.theme.colors['card_foreground'],
            font=self.theme.fonts[style],
            **kwargs
        )
        return label
    
    def create_entry(self, parent, **kwargs):
        """Създаване на модерно стилизирано поле за въвеждане"""
        entry = tk.Entry(
            parent,
            bg=self.theme.colors['input'],
            fg=self.theme.colors['foreground'],
            font=self.theme.fonts['body_medium'],
            relief='flat',
            borderwidth=1,
            highlightbackground=self.theme.colors['border'],
            highlightthickness=1,
            insertbackground=self.theme.colors['foreground'],
            **kwargs
        )
        return entry
    
    def _darken_color(self, hex_color, factor):
        """Затъмняване на hex цвят с даден фактор"""
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)
        l = max(0, l - factor)
        rgb = colorsys.hls_to_rgb(h, l, s)
        return '#%02x%02x%02x' % (int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255))
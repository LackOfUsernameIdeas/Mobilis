import tkinter as tk
from tkinter import font as tkfont

def _create_dialog(parent, title, message, dialog_type="info", buttons="ok", play_sound=True):
    """Create a custom dialog with modern styling matching the web app design"""
    # Get the parent window, defaulting to root
    if parent is None:
        parent = tk._default_root
    
    dialog = tk.Toplevel(parent)
    dialog.title(title)
    dialog.resizable(False, False)
    
    # Color scheme matching web app (converted from oklch to hex approximations)
    colors = {
        "background": "#EEEFF2",  # --background
        "card": "#FFFFFF",  # --card
        "foreground": "#525252",  # --foreground (dark text)
        "primary": "#4338CA",  # --primary (blue/indigo)
        "primary_hover": "#3730A3",  # darker primary
        "accent": "#FBBF24",  # --accent (yellow/gold)
        "destructive": "#DC2626",  # --destructive (red)
        "destructive_hover": "#B91C1C",  # darker destructive
        "border": "#E5E7EB",  # --border
        "muted": "#F3F4F6",  # --muted
        "muted_foreground": "#6B7280",  # --muted-foreground
    }
    
    # Configure dialog background
    dialog.configure(bg=colors["background"])
    
    # Make dialog modal
    dialog.transient(parent)
    dialog.grab_set()
    
    # Ensure dialog appears on top
    dialog.lift()
    dialog.focus_force()
    
    # Play system sound if enabled
    if play_sound:
        dialog.bell()
    
    # Main card container with padding and border
    main_frame = tk.Frame(dialog, bg=colors["card"])
    main_frame.pack(padx=0, pady=0, fill=tk.BOTH, expand=True)
    
    # Icon and message frame
    content_frame = tk.Frame(main_frame, bg=colors["card"], padx=24, pady=20)
    content_frame.pack(fill=tk.BOTH, expand=True)
    
    # Icon configuration based on type
    icon_config = {
        "info": {"symbol": "ℹ", "bg": "#DBEAFE", "fg": "#1E40AF"},  # blue
        "warning": {"symbol": "⚠", "bg": "#FEF3C7", "fg": "#B45309"},  # yellow/amber
        "error": {"symbol": "✕", "bg": "#FEE2E2", "fg": "#991B1B"},  # red
        "question": {"symbol": "?", "bg": "#E0E7FF", "fg": "#3730A3"}  # indigo
    }
    
    config = icon_config.get(dialog_type, icon_config["info"])
    
    # Icon with circular background
    icon_frame = tk.Frame(content_frame, bg=config["bg"], width=48, height=48)
    icon_frame.pack(side=tk.LEFT, padx=(0, 16))
    icon_frame.pack_propagate(False)
    
    icon_label = tk.Label(
        icon_frame, 
        text=config["symbol"], 
        font=("Segoe UI", 20, "bold"),
        fg=config["fg"],
        bg=config["bg"]
    )
    icon_label.place(relx=0.5, rely=0.5, anchor="center")
    
    # Message container
    message_frame = tk.Frame(content_frame, bg=colors["card"])
    message_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    
    # Title
    title_label = tk.Label(
        message_frame, 
        text=title, 
        font=("Segoe UI", 12, "bold"),
        fg=colors["foreground"],
        bg=colors["card"],
        justify=tk.LEFT,
        anchor="w"
    )
    title_label.pack(fill=tk.X, pady=(0, 8))
    
    # Message
    msg_label = tk.Label(
        message_frame, 
        text=message, 
        wraplength=350,
        font=("Segoe UI", 10),
        fg=colors["muted_foreground"],
        bg=colors["card"],
        justify=tk.LEFT,
        anchor="w"
    )
    msg_label.pack(fill=tk.X)
    
    # Button frame with proper spacing
    button_frame = tk.Frame(main_frame, bg=colors["card"], padx=24, pady=16)
    button_frame.pack(fill=tk.X)
    
    result = [None]
    
    def create_button(parent, text, command, style="primary"):
        """Create a styled button matching web app design"""
        if style == "primary":
            bg = colors["primary"]
            hover_bg = colors["primary_hover"]
            fg = "#FFFFFF"
        elif style == "destructive":
            bg = colors["destructive"]
            hover_bg = colors["destructive_hover"]
            fg = "#FFFFFF"
        else:  # secondary
            bg = colors["muted"]
            hover_bg = "#E5E7EB"
            fg = colors["foreground"]
        
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=("Segoe UI", 10, "bold"),
            bg=bg,
            fg=fg,
            activebackground=hover_bg,
            activeforeground=fg,
            relief=tk.FLAT,
            borderwidth=0,
            padx=20,
            pady=10,
            cursor="hand2"
        )
        
        # Hover effects
        def on_enter(e):
            btn.config(bg=hover_bg)
        
        def on_leave(e):
            btn.config(bg=bg)
        
        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)
        
        return btn
    
    def on_ok():
        result[0] = True
        dialog.grab_release()
        dialog.destroy()
    
    def on_cancel():
        result[0] = False
        dialog.grab_release()
        dialog.destroy()
    
    if buttons == "ok":
        ok_btn = create_button(button_frame, "OK", on_ok, "primary")
        ok_btn.pack(side=tk.RIGHT)
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_ok())
        ok_btn.focus_set()
    elif buttons == "yesno":
        no_btn = create_button(button_frame, "Не", on_cancel, "secondary")
        no_btn.pack(side=tk.RIGHT, padx=(8, 0))
        
        yes_btn = create_button(button_frame, "Да", on_ok, "primary")
        yes_btn.pack(side=tk.RIGHT)
        
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_cancel())
        yes_btn.focus_set()
    
    # Center the dialog AFTER all widgets are added
    dialog.update_idletasks()
    width = dialog.winfo_reqwidth()
    height = dialog.winfo_reqheight()
    x = (dialog.winfo_screenwidth() // 2) - (width // 2)
    y = (dialog.winfo_screenheight() // 2) - (height // 2)
    dialog.geometry(f'{width}x{height}+{x}+{y}')
    
    # Protocol for window close button
    dialog.protocol("WM_DELETE_WINDOW", on_cancel if buttons == "yesno" else on_ok)
    
    # Wait for dialog to close
    parent.wait_window(dialog)
    
    return result[0]

def showinfo(title, message, play_sound=True):
    """Custom showinfo with modern styling"""
    return _create_dialog(None, title, message, "info", "ok", play_sound)

def showwarning(title, message, play_sound=True):
    """Custom showwarning with modern styling"""
    return _create_dialog(None, title, message, "warning", "ok", play_sound)

def showerror(title, message, play_sound=True):
    """Custom showerror with modern styling"""
    return _create_dialog(None, title, message, "error", "ok", play_sound)

def askyesno(title, message, play_sound=True):
    """Custom askyesno with modern styling"""
    return _create_dialog(None, title, message, "question", "yesno", play_sound)
import tkinter as tk
from tkinter import font as tkfont
import globals

def _create_dialog(parent, title, message, dialog_type="info", buttons="ok", play_sound=True):
    """Create a custom dialog with optional system sound"""
    # Get the parent window, defaulting to root
    if parent is None:
        parent = tk._default_root
    
    dialog = tk.Toplevel(parent)
    dialog.title(title)
    dialog.resizable(False, False)
    
    # Make dialog modal
    dialog.transient(parent)
    dialog.grab_set()
    
    # Ensure dialog appears on top
    dialog.lift()
    dialog.focus_force()
    
    # Play system sound if enabled
    if play_sound:
        if dialog_type == "info":
            dialog.bell()  # Default beep
        elif dialog_type == "warning":
            dialog.bell()
        elif dialog_type == "error":
            dialog.bell()
        elif dialog_type == "question":
            dialog.bell()
    
    # Icon and message frame
    content_frame = tk.Frame(dialog, padx=20, pady=20)
    content_frame.pack(fill=tk.BOTH, expand=True)
    
    # Icon
    icon_text = {
        "info": "ℹ️",
        "warning": "⚠️",
        "error": "❌",
        "question": "❓"
    }.get(dialog_type, "ℹ️")
    
    icon_label = tk.Label(content_frame, text=icon_text, font=("Arial", 24))
    icon_label.pack(side=tk.LEFT, padx=(0, 10))
    
    # Message
    msg_label = tk.Label(content_frame, text=message, wraplength=300, justify=tk.LEFT)
    msg_label.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    
    # Button frame
    button_frame = tk.Frame(dialog)
    button_frame.pack(pady=(0, 10))
    
    result = [None]  # Use list to store result from nested function
    
    def on_ok():
        result[0] = True
        dialog.grab_release()
        dialog.destroy()
    
    def on_cancel():
        result[0] = False
        dialog.grab_release()
        dialog.destroy()
    
    if buttons == "ok":
        ok_btn = tk.Button(button_frame, text="OK", command=on_ok, width=10, 
                          cursor="hand2")
        ok_btn.pack()
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_ok())
        ok_btn.focus_set()
    elif buttons == "yesno":
        yes_btn = tk.Button(button_frame, text="Да", command=on_ok, width=10,
                           cursor="hand2")
        yes_btn.pack(side=tk.LEFT, padx=5)
        no_btn = tk.Button(button_frame, text="Не", command=on_cancel, width=10,
                          cursor="hand2")
        no_btn.pack(side=tk.LEFT, padx=5)
        dialog.bind('<Return>', lambda e: on_ok())
        dialog.bind('<Escape>', lambda e: on_cancel())
        yes_btn.focus_set()
    
    # Center the dialog AFTER all widgets are added
    dialog.update_idletasks()
    width = dialog.winfo_reqwidth()
    height = dialog.winfo_reqheight()
    x = (dialog.winfo_screenwidth() // 2) - (width // 2)
    y = (dialog.winfo_screenheight() // 2) - (height // 2)
    dialog.geometry(f'+{x}+{y}')
    
    # Protocol for window close button
    dialog.protocol("WM_DELETE_WINDOW", on_cancel if buttons == "yesno" else on_ok)
    
    # Wait for dialog to close
    parent.wait_window(dialog)
    
    return result[0]

def showinfo(title, message, play_sound=True):
    """Custom showinfo with optional system sound (default: enabled)"""
    return _create_dialog(None, title, message, "info", "ok", play_sound)

def showwarning(title, message, play_sound=True):
    """Custom showwarning with optional system sound (default: enabled)"""
    return _create_dialog(None, title, message, "warning", "ok", play_sound)

def showerror(title, message, play_sound=True):
    """Custom showerror with optional system sound (default: enabled)"""
    return _create_dialog(None, title, message, "error", "ok", play_sound)

def askyesno(title, message, play_sound=True):
    """Custom askyesno with optional system sound (default: enabled)"""
    return _create_dialog(None, title, message, "question", "yesno", play_sound)
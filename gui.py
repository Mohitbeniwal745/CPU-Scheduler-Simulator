# gui.py
import tkinter as tk
from tkinter import ttk, messagebox

def create_gui(run_simulation):
    root = tk.Tk()
    root.title("CPU Scheduler Simulator")
    root.geometry("800x600")

    # Main Container
    main_frame = ttk.Frame(root, padding="10")
    main_frame.pack(fill=tk.BOTH, expand=True)

    # Input Section
    input_frame = ttk.LabelFrame(main_frame, text="Configurations", padding="10")
    input_frame.pack(fill=tk.X, pady=5)

    algorithm_var = tk.StringVar(value="FCFS")
    ttk.Label(input_frame, text="Scheduling Algorithm:").grid(row=0, column=0, sticky=tk.W, padx=5)
    algorithm_menu = ttk.Combobox(input_frame, textvariable=algorithm_var,
                                   values=["FCFS", "SJF", "Round Robin", "Priority Scheduling"], state="readonly")
    algorithm_menu.grid(row=0, column=1, sticky=tk.W, padx=5)

    ttk.Label(input_frame, text="Time Quantum:").grid(row=0, column=2, sticky=tk.W, padx=5)
    time_quantum_entry = ttk.Entry(input_frame)
    time_quantum_entry.insert(0, "2")
    time_quantum_entry.grid(row=0, column=3, sticky=tk.W, padx=5)

    # Process Input Section
    proc_input_frame = ttk.LabelFrame(main_frame, text="Add Process", padding="10")
    proc_input_frame.pack(fill=tk.X, pady=5)

    ttk.Label(proc_input_frame, text="Arrival Time:").grid(row=0, column=0, padx=5)
    arrival_entry = ttk.Entry(proc_input_frame, width=10)
    arrival_entry.grid(row=0, column=1, padx=5)

    ttk.Label(proc_input_frame, text="Burst Time:").grid(row=0, column=2, padx=5)
    burst_entry = ttk.Entry(proc_input_frame, width=10)
    burst_entry.grid(row=0, column=3, padx=5)

    ttk.Label(proc_input_frame, text="Priority (min=0):").grid(row=0, column=4, padx=5)
    priority_entry = ttk.Entry(proc_input_frame, width=10)
    priority_entry.insert(0, "0")
    priority_entry.grid(row=0, column=5, padx=5)

    def add_process():
        try:
            arrival = int(arrival_entry.get())
            burst = int(burst_entry.get())
            priority = int(priority_entry.get())
            if arrival < 0 or burst <= 0 or priority < 0:
                messagebox.showerror("Input Error", "Values must be non-negative (Burst must be > 0).")
                return
            
            pid = len(process_table.get_children()) + 1
            process_table.insert("", "end", values=(pid, arrival, burst, priority))
            
            # Clear entries
            arrival_entry.delete(0, tk.END)
            burst_entry.delete(0, tk.END)
            priority_entry.delete(0, tk.END)
            priority_entry.insert(0, "0")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numeric values.")

    ttk.Button(proc_input_frame, text="Add", command=add_process).grid(row=0, column=6, padx=10)

    # Table Section
    table_frame = ttk.Frame(main_frame)
    table_frame.pack(fill=tk.BOTH, expand=True, pady=10)

    columns = ("PID", "Arrival Time", "Burst Time", "Priority")
    process_table = ttk.Treeview(table_frame, columns=columns, show="headings")
    for col in columns:
        process_table.heading(col, text=col)
        process_table.column(col, width=100, anchor=tk.CENTER)
    
    scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=process_table.yview)
    process_table.configure(yscroll=scrollbar.set)
    process_table.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    # Action Section
    action_frame = ttk.Frame(main_frame)
    action_frame.pack(fill=tk.X, pady=5)

    ttk.Button(action_frame, text="Run Simulation", 
               command=lambda: run_simulation(algorithm_var, time_quantum_entry, process_table)).pack(side=tk.RIGHT, padx=5)
    
    def clear_table():
        for item in process_table.get_children():
            process_table.delete(item)
    
    ttk.Button(action_frame, text="Clear Processes", command=clear_table).pack(side=tk.RIGHT, padx=5)

    root.mainloop()

# main.py
from algorithms import calculate_scheduling
from visualization import visualize
from gui import create_gui
from tkinter import messagebox

def run_simulation(algorithm_var, time_quantum_entry, process_table):
    algorithm = algorithm_var.get()
    try:
        time_quantum = int(time_quantum_entry.get()) if algorithm == "Round Robin" else 2
        if time_quantum <= 0:
            raise ValueError
    except ValueError:
        messagebox.showerror("Input Error", "Time Quantum must be a positive integer.")
        return

    processes = []
    for row in process_table.get_children():
        values = process_table.item(row)['values']
        # PID, Arrival, Burst, Priority
        processes.append((values[0], int(values[1]), int(values[2]), int(values[3])))

    if not processes:
        messagebox.showerror("Error", "No processes added.")
        return

    segments, summary = calculate_scheduling(algorithm, processes, time_quantum)
    visualize(segments)

    # Calculate average WT and TAT using summary
    if summary:
        avg_wt = sum(m['wt'] for m in summary.values()) / len(summary)
        avg_tat = sum(m['tat'] for m in summary.values()) / len(summary)
        messagebox.showinfo("Simulation Result", f"Average Waiting Time: {avg_wt:.2f}\nAverage Turnaround Time: {avg_tat:.2f}")

# Main Entry Point
if __name__ == "__main__":
    create_gui(run_simulation)

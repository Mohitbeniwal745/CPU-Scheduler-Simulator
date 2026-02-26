# visualization.py
import matplotlib.pyplot as plt

def visualize(segments):
    if not segments:
        return

    fig, ax = plt.subplots()
    
    # Track which PIDs we've seen to assign colors consistently
    unique_pids = sorted(list(set(s[0] for s in segments)))
    pid_colors = {pid: plt.cm.tab10(i % 10) for i, pid in enumerate(unique_pids)}

    for pid, start, end in segments:
        duration = end - start
        ax.barh(0, duration, left=start, color=pid_colors[pid], edgecolor='black')
        # Add text label in the middle of the bar
        ax.text(start + duration/2, 0, f"P{pid}", ha='center', va='center', color='white', fontweight='bold')

    ax.set_yticks([0])
    ax.set_yticklabels(["CPU"])
    ax.set_xlabel("Time")
    ax.set_title("Gantt Chart")
    
    # Set x-limits to show the full range
    max_time = max(s[2] for s in segments)
    ax.set_xlim(0, max_time + 1)
    
    plt.tight_layout()
    plt.show()

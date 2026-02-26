# algorithms.py

def calculate_scheduling(algorithm, processes, time_quantum=2):
    # processes: list of (pid, arrival, burst, priority)
    if algorithm == "FCFS":
        return fcfs(processes)
    elif algorithm == "SJF":
        return sjf(processes)
    elif algorithm == "Round Robin":
        return round_robin(processes, time_quantum)
    elif algorithm == "Priority Scheduling":
        return priority_scheduling(processes)
    return [], {}

def fcfs(processes):
    processes.sort(key=lambda x: x[1])  # Sort by Arrival Time
    current_time = 0
    segments = []
    pid_metrics = {}

    for pid, arrival, burst, priority in processes:
        if current_time < arrival:
            current_time = arrival
        
        start_time = current_time
        completion_time = start_time + burst
        waiting_time = start_time - arrival
        turnaround_time = completion_time - arrival
        
        segments.append((pid, start_time, completion_time))
        pid_metrics[pid] = {'wt': waiting_time, 'tat': turnaround_time}
        current_time = completion_time

    return segments, pid_metrics

def sjf(processes):
    # Shortest Job First (Non-preemptive)
    # Sort by Arrival, then Burst Time
    processes.sort(key=lambda x: (x[1], x[2]))
    remaining = processes.copy()
    current_time = 0
    segments = []
    pid_metrics = {}

    while remaining:
        available = [p for p in remaining if p[1] <= current_time]
        if not available:
            # Advance time if no process has arrived
            current_time = min(p[1] for p in remaining)
            continue
        
        # Pick process with shortest burst time
        available.sort(key=lambda x: x[2])
        process = available[0]
        remaining.remove(process)
        
        pid, arrival, burst, priority = process
        start_time = current_time
        completion_time = start_time + burst
        waiting_time = start_time - arrival
        turnaround_time = completion_time - arrival
        
        segments.append((pid, start_time, completion_time))
        pid_metrics[pid] = {'wt': waiting_time, 'tat': turnaround_time}
        current_time = completion_time

    return segments, pid_metrics

def round_robin(processes, quantum):
    processes.sort(key=lambda x: x[1])
    remaining = processes.copy()
    ready_queue = []
    current_time = 0
    segments = []
    pid_metrics = {}
    
    # Store remaining burst and original burst
    burst_remaining = {p[0]: p[2] for p in processes}
    arrival_times = {p[0]: p[1] for p in processes}
    original_bursts = {p[0]: p[2] for p in processes}

    while remaining or ready_queue:
        # Add arriving processes to ready queue
        arrived = [p for p in remaining if p[1] <= current_time]
        for p in arrived:
            ready_queue.append(p)
            remaining.remove(p)

        if not ready_queue:
            if remaining:
                current_time = remaining[0][1]
                continue
            else:
                break
        
        process = ready_queue.pop(0)
        pid, arrival, burst, priority = process
        
        start_time = current_time
        exec_time = min(burst_remaining[pid], quantum)
        current_time += exec_time
        burst_remaining[pid] -= exec_time
        
        segments.append((pid, start_time, current_time))
        
        # Check for arrivals during execution
        arrived = [p for p in remaining if p[1] <= current_time]
        for p in arrived:
            ready_queue.append(p)
            remaining.remove(p)
            
        if burst_remaining[pid] > 0:
            ready_queue.append(process)
        else:
            # Process finished
            completion_time = current_time
            tat = completion_time - arrival_times[pid]
            wt = tat - original_bursts[pid]
            pid_metrics[pid] = {'wt': wt, 'tat': tat}

    return segments, pid_metrics

def priority_scheduling(processes):
    # Non-preemptive priority scheduling
    processes.sort(key=lambda x: (x[1], x[3])) # Priority (lower value = higher priority usually)
    remaining = processes.copy()
    current_time = 0
    segments = []
    pid_metrics = {}

    while remaining:
        available = [p for p in remaining if p[1] <= current_time]
        if not available:
            current_time = min(p[1] for p in remaining)
            continue
        
        # Pick process with highest priority
        available.sort(key=lambda x: x[3])
        process = available[0]
        remaining.remove(process)
        
        pid, arrival, burst, priority = process
        start_time = current_time
        completion_time = start_time + burst
        waiting_time = start_time - arrival
        turnaround_time = completion_time - arrival
        
        segments.append((pid, start_time, completion_time))
        pid_metrics[pid] = {'wt': waiting_time, 'tat': turnaround_time}
        current_time = completion_time

    return segments, pid_metrics

export const calculateScheduling = (algorithm, processes, timeQuantum = 2) => {
    const procs = processes.map(p => ({
        pid: p.pid,
        arrival: parseInt(p.arrival),
        burst: parseInt(p.burst),
        priority: parseInt(p.priority) || 0
    }));

    switch (algorithm) {
        case "FCFS": return fcfs(procs);
        case "SJF": return sjf(procs);
        case "Round Robin": return roundRobin(procs, parseInt(timeQuantum));
        case "Priority Scheduling": return priorityScheduling(procs);
        default: return { segments: [], summary: {} };
    }
};

const fcfs = (processes) => {
    processes.sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const segments = [];
    const metrics = {};

    processes.forEach(({ pid, arrival, burst }) => {
        if (currentTime < arrival) currentTime = arrival;
        const startTime = currentTime;
        const completionTime = startTime + burst;
        segments.push({ pid, start: startTime, end: completionTime });
        metrics[pid] = { wt: startTime - arrival, tat: completionTime - arrival };
        currentTime = completionTime;
    });

    return { segments, metrics };
};

const sjf = (processes) => {
    processes.sort((a, b) => a.arrival - b.arrival || a.burst - b.burst);
    const remaining = [...processes];
    let currentTime = 0;
    const segments = [];
    const metrics = {};

    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrival <= currentTime);
        if (available.length === 0) {
            currentTime = Math.min(...remaining.map(p => p.arrival));
            continue;
        }
        available.sort((a, b) => a.burst - b.burst);
        const process = available[0];
        const index = remaining.indexOf(process);
        remaining.splice(index, 1);

        const startTime = currentTime;
        const completionTime = startTime + process.burst;
        segments.push({ pid: process.pid, start: startTime, end: completionTime });
        metrics[process.pid] = { wt: startTime - process.arrival, tat: completionTime - process.arrival };
        currentTime = completionTime;
    }

    return { segments, metrics };
};

const roundRobin = (processes, quantum) => {
    processes.sort((a, b) => a.arrival - b.arrival);
    const remainingProcs = [...processes];
    const readyQueue = [];
    let currentTime = 0;
    const segments = [];
    const metrics = {};

    const burstRemaining = Object.fromEntries(processes.map(p => [p.pid, p.burst]));
    const originalBursts = Object.fromEntries(processes.map(p => [p.pid, p.burst]));
    const arrivalTimes = Object.fromEntries(processes.map(p => [p.pid, p.arrival]));

    while (remainingProcs.length > 0 || readyQueue.length > 0) {
        const arrived = remainingProcs.filter(p => p.arrival <= currentTime);
        arrived.forEach(p => {
            readyQueue.push(p);
            remainingProcs.splice(remainingProcs.indexOf(p), 1);
        });

        if (readyQueue.length === 0) {
            if (remainingProcs.length > 0) {
                currentTime = remainingProcs[0].arrival;
                continue;
            } else break;
        }

        const process = readyQueue.shift();
        const pid = process.pid;
        const startTime = currentTime;
        const execTime = Math.min(burstRemaining[pid], quantum);
        currentTime += execTime;
        burstRemaining[pid] -= execTime;

        segments.push({ pid, start: startTime, end: currentTime });

        const newlyArrived = remainingProcs.filter(p => p.arrival <= currentTime);
        newlyArrived.forEach(p => {
            readyQueue.push(p);
            remainingProcs.splice(remainingProcs.indexOf(p), 1);
        });

        if (burstRemaining[pid] > 0) {
            readyQueue.push(process);
        } else {
            const tat = currentTime - arrivalTimes[pid];
            metrics[pid] = { wt: tat - originalBursts[pid], tat };
        }
    }

    return { segments, metrics };
};

const priorityScheduling = (processes) => {
    processes.sort((a, b) => a.arrival - b.arrival || a.priority - b.priority);
    const remaining = [...processes];
    let currentTime = 0;
    const segments = [];
    const metrics = {};

    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrival <= currentTime);
        if (available.length === 0) {
            currentTime = Math.min(...remaining.map(p => p.arrival));
            continue;
        }
        available.sort((a, b) => a.priority - b.priority);
        const process = available[0];
        remaining.splice(remaining.indexOf(process), 1);

        const startTime = currentTime;
        const completionTime = startTime + process.burst;
        segments.push({ pid: process.pid, start: startTime, end: completionTime });
        metrics[process.pid] = { wt: startTime - process.arrival, tat: completionTime - process.arrival };
        currentTime = completionTime;
    }

    return { segments, metrics };
};

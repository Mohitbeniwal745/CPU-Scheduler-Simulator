import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Play, Trash2, Cpu, Activity, Clock, BarChart3, RefreshCw } from 'lucide-react';
import { calculateScheduling } from './utils/algorithms';
import './styles/index.css';

const App = () => {
    const [processes, setProcesses] = useState([
        { pid: 1, arrival: 0, burst: 6, priority: 1 },
        { pid: 2, arrival: 2, burst: 4, priority: 2 },
        { pid: 3, arrival: 4, burst: 2, priority: 3 },
    ]);
    const [algorithm, setAlgorithm] = useState('FCFS');
    const [quantum, setQuantum] = useState(2);
    const [results, setResults] = useState({ segments: [], metrics: {} });
    const [isSimulating, setIsSimulating] = useState(false);

    const [newProcess, setNewProcess] = useState({ arrival: '', burst: '', priority: '0' });

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const res = calculateScheduling(algorithm, processes, quantum);
            setResults(res);
            setIsSimulating(false);
        }, 600);
    };

    const addProcess = () => {
        if (newProcess.arrival === '' || newProcess.burst === '') return;
        const pid = processes.length > 0 ? Math.max(...processes.map(p => p.pid)) + 1 : 1;
        setProcesses([...processes, { pid, ...newProcess, arrival: parseInt(newProcess.arrival), burst: parseInt(newProcess.burst), priority: parseInt(newProcess.priority) }]);
        setNewProcess({ arrival: '', burst: '', priority: '0' });
    };

    const removeProcess = (pid) => {
        setProcesses(processes.filter(p => p.pid !== pid));
    };

    const clearProcesses = () => {
        setProcesses([]);
        setResults({ segments: [], metrics: {} });
    };

    const avgMetrics = useMemo(() => {
        const values = Object.values(results.metrics);
        if (values.length === 0) return { wt: 0, tat: 0 };
        return {
            wt: (values.reduce((sum, m) => sum + m.wt, 0) / values.length).toFixed(2),
            tat: (values.reduce((sum, m) => sum + m.tat, 0) / values.length).toFixed(2)
        };
    }, [results]);

    const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6'];
    const getPidColor = (pid) => colors[(pid - 1) % colors.length];

    return (
        <div className="container animate-fade-in">
            <header>
                <h1><Cpu style={{ display: 'inline', marginRight: '1rem', marginBottom: '-5px' }} /> CPU Scheduler Simulator</h1>
            </header>

            <div className="grid">
                {/* Configurations */}
                <section className="glass-card">
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={24} color="var(--primary)" /> Configurations
                    </h2>

                    <div className="input-group">
                        <label>Algorithm</label>
                        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                            <option value="FCFS">First Come First Serve (FCFS)</option>
                            <option value="SJF">Shortest Job First (SJF)</option>
                            <option value="Round Robin">Round Robin (RR)</option>
                            <option value="Priority Scheduling">Priority Scheduling</option>
                        </select>
                    </div>

                    {algorithm === 'Round Robin' && (
                        <div className="input-group">
                            <label>Time Quantum</label>
                            <input
                                type="number"
                                value={quantum}
                                onChange={(e) => setQuantum(e.target.value)}
                                min="1"
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Add New Process</h3>
                        <div className="input-group">
                            <label>Arrival Time</label>
                            <input
                                type="number"
                                value={newProcess.arrival}
                                onChange={(e) => setNewProcess({ ...newProcess, arrival: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label>Burst Time</label>
                            <input
                                type="number"
                                value={newProcess.burst}
                                onChange={(e) => setNewProcess({ ...newProcess, burst: e.target.value })}
                                placeholder="5"
                            />
                        </div>
                        <div className="input-group">
                            <label>Priority</label>
                            <input
                                type="number"
                                value={newProcess.priority}
                                onChange={(e) => setNewProcess({ ...newProcess, priority: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <button className="btn btn-outline" onClick={addProcess} style={{ width: '100%', justifyContent: 'center' }}>
                            <Plus size={20} /> Add Process
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn btn-primary" onClick={runSimulation} style={{ flex: 1, justifyContent: 'center' }} disabled={isSimulating}>
                            {isSimulating ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />} Run Simulation
                        </button>
                        <button className="btn btn-outline" onClick={clearProcesses} title="Clear All">
                            <Trash2 size={20} color="var(--danger)" />
                        </button>
                    </div>
                </section>

                {/* Process Table & Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="glass-card">
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={24} color="var(--secondary)" /> Processes Queue
                        </h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>PID</th>
                                        <th>Arrival</th>
                                        <th>Burst</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                                No processes in queue. Add some to start simulation.
                                            </td>
                                        </tr>
                                    ) : processes.map((p) => (
                                        <tr key={p.pid}>
                                            <td><span className="badge badge-primary">P{p.pid}</span></td>
                                            <td>{p.arrival}</td>
                                            <td>{p.burst}</td>
                                            <td>{p.priority}</td>
                                            <td>
                                                <button
                                                    onClick={() => removeProcess(p.pid)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {results.segments.length > 0 && (
                        <section className="glass-card">
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={24} color="var(--accent)" /> Gantt Chart
                            </h2>

                            <div className="gantt-container">
                                <div className="gantt-chart">
                                    {results.segments.map((seg, i) => {
                                        const totalDuration = results.segments[results.segments.length - 1].end;
                                        const width = ((seg.end - seg.start) / totalDuration) * 100;
                                        return (
                                            <div
                                                key={i}
                                                className="gantt-segment"
                                                style={{
                                                    width: `${width}%`,
                                                    backgroundColor: getPidColor(seg.pid)
                                                }}
                                            >
                                                P{seg.pid}
                                                <span className="time-label">{seg.start}</span>
                                                {i === results.segments.length - 1 && <span className="time-label" style={{ left: 'auto', right: 0 }}>{seg.end}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-value">{avgMetrics.wt}ms</div>
                                    <div className="metric-label">Avg Waiting Time</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{avgMetrics.tat}ms</div>
                                    <div className="metric-label">Avg Turnaround Time</div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '2rem' }}>
                <p>© 2026 Intelligent CPU Scheduler Simulator | Modern Visualization Engine</p>
            </footer>
        </div>
    );
};

export default App;

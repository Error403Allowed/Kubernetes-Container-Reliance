import { useState, useEffect } from 'react'

interface HealthData {
  status: string
  hostname: string
  started: string
  uptime: string
}

function App() {
  const [data, setData] = useState<HealthData | null>(null)

  useEffect(() => {
    const fetchHealth = () =>
      fetch('/health')
        .then(res => res.json())
        .then(setData)
        .catch(console.error)

    fetchHealth()
    const interval = setInterval(fetchHealth, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
      <div className="card">
        <div className="card-glow" />
        <div className="badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" /></svg>
          Container App
        </div>
        <h1>Request Handled By</h1>
        <div className="hostname">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          {data?.hostname ?? '...'}
        </div>
        <div className="meta">
          <div className="meta-item">
            <span className="meta-label">Started</span>
            <span className="meta-value">{data?.started ? new Date(data.started).toLocaleString() : '...'}</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <span className="meta-label">Uptime</span>
            <span className="meta-value">{data?.uptime ?? '...'}</span>
          </div>
        </div>
        <div className="status">
          <span className="dot" />
          <span>All Systems Healthy</span>
        </div>
         <div className="peers">
          <p>Replicas managed by Kubernetes</p>
          <p className="hint">Chaos monkey kills a pod every 5-10s and the ReplicaSet brings it back</p>
        </div>
      </div>
    </div>
  )
}

export default App

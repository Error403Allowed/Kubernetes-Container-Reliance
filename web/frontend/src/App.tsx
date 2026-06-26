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
    fetch('/health')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  return (
    <div className="card">
      <div className="badge">Container App</div>
      <h1>Request Handled By</h1>
      <div className="hostname">{data?.hostname ?? '...'}</div>
      <p>Started: {data?.started ?? '...'}</p>
      <p>Uptime: {data?.uptime ?? '...'}</p>
      <div className="status"><span className="dot"></span> Healthy</div>
      <div className="peers">
        <p>Peer containers: web1, web2, web3</p>
        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Try killing this container — the app keeps running via nginx load balancing</p>
      </div>
    </div>
  )
}

export default App

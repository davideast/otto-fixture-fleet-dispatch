import React, { useEffect, useState } from 'react';

function Chrome({ route, tick }) {
  return (
    <header className="dispatch-bar">
      <div className="dispatch-title">MetroHaul EV Dispatch</div>
      <nav className="dispatch-links">
        <a href="#/" className={route === '#/' ? 'active' : ''}>
          Depot Summary
        </a>
        <a href="#/dispatch" className={route === '#/dispatch' ? 'active' : ''}>
          Live Dispatch Board
        </a>
      </nav>
      <div style={{ fontSize: '0.8rem', color: '#95a4b0' }}>
        CAN bus frame #{tick}
      </div>
    </header>
  );
}

function DepotSummary() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetch('/routes.json')
      .then((r) => r.json())
      .then(setZones);
  }, []);

  return (
    <main className="dispatch-page">
      <h1>Bay Area Depot 04 · Shift Overview</h1>
      <p>Active electric delivery fleet and DC fast-charging bay telemetry.</p>
      <ul>
        {zones.map((z) => (
          <li key={z.zone}>
            {z.zone}: {z.parcels} parcels · On-time {z.onTime}
          </li>
        ))}
      </ul>
    </main>
  );
}

function DispatchBoard() {
  const [vans, setVans] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/vehicles.json')
      .then((r) => r.json())
      .then((list) => {
        setTimeout(() => {
          if (active) setVans(list);
        }, 320);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!vans) {
    return (
      <main className="dispatch-page">
        <p id="dispatch-loading">Polling depot telemetry…</p>
      </main>
    );
  }

  // TODO: replace raw vehicle dump with proper dispatch board layout
  return (
    <main className="dispatch-page">
      <h2>Shift Dispatch & Charging Bay Queue</h2>
      <ul id="dispatch-list" className="raw-dispatch-list">
        {vans.map((v) => (
          <li key={v.vanId} style={{ marginBottom: '10px' }}>
            <strong>{v.vanId}</strong> ({v.status}) — Driver: {v.driver} | Route: {v.route} | Battery:{' '}
            {v.socPercent}% ({v.rangeMi} mi) | Stops left: {v.stopsRemaining} | Bay: {v.bay}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [tick, setTick] = useState(1040);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    const interval = setInterval(() => setTick((t) => t + 1), 1500);
    return () => {
      window.removeEventListener('hashchange', onHash);
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Chrome route={route} tick={tick} />
      {route === '#/dispatch' ? <DispatchBoard /> : <DepotSummary />}
    </div>
  );
}

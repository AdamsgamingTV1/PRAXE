import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const Line = ({ direction }) => {
  let animateProps;
  let color;
  let x1, x2, y1, y2;

  switch (direction) {
    case 'bipolar':
      animateProps = { attributeName: "x2", from: "0", to: "90%" };
      color = 'blue';
      break;
    case 'unipolar':
      animateProps = { attributeName: "y2", from: "100%", to: "0" };
      color = 'green';
      x1 = "50%";
      x2 = "50%";
      y1 = "100";
      y2 = "7";
      break;
    case 'negative':
      animateProps = { attributeName: "y1", from: "0", to: "100%" };
      color = 'red';
      x1 = "50%";
      x2 = "50%";
      y1 = "100";
      y2 = "0";
      break;
    case 'yellow':
      animateProps = { attributeName: "y1", from: "0", to: "100%" };
      color = 'yellow';
      break;
    default:
      return null;
  }

  return (
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: 5 }}>
        <animate
          attributeName={animateProps.attributeName}
          begin="0s"
          dur="8s"
          from={animateProps.from}
          to={animateProps.to}
          repeatCount="indefinite"
        />
      </line>
    </svg>
  );
};

const App = () => {
  const [burst, setBurst] = useState(false);
  const [lines, setLines] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const svgRef = useRef(null);
  let T1, T2, T3, T4, polarity;

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem('profiles')) || [];
    setProfiles(savedProfiles);
  }, []);

  const saveProfile = () => {
    const newProfile = {
      name: profileName,
      email: email,
      age: age,
      username: username,
      password: password,
      T1: T1.value,
      T2: T2.value,
      T3: T3.value,
      T4: T4.value,
      polarity: polarity.value,
      burst
    };
    const updatedProfiles = [...profiles, newProfile];
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    setShowSaveModal(false);
  };
  const deleteProfile = (profile) => {
    const updatedProfiles = profiles.filter((p) => p !== profile);
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
  };

  const editProfile = (profile) => {
    setSelectedProfile(profile);
    setEditMode(true);
  };

  const updateProfile = () => {
    setEditMode(false);
    setSelectedProfile(null);
  };

  const importProfiles = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      localStorage.setItem('profiles', JSON.stringify(data));
      setProfiles(data);
    };
    reader.readAsText(file);
  };

  const exportProfiles = () => {
    const data = JSON.stringify(profiles);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profiles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const burstValue = burst ? 1 : 0;

    const response = await fetch('http://localhost:5000/generate_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ T1: T1.value, T2: T2.value, T3: T3.value, T4: T4.value, burst: burstValue, polarity: polarity.value })
    });
    const profileData = await response.json();
    drawProfile(profileData);
  };

  const drawProfile = (profile) => {
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const barWidth = width / profile.length;

    const maxDuration = Math.max(...profile.map(segment => segment.duration));
    const scaleY = height / maxDuration;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    profile.forEach((segment, index) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const x = index * barWidth;
      const y = height - segment.duration * scaleY;
      const rectHeight = segment.duration * scaleY;
      const color = segment.type === 'Positive Pulse' ? 'blue' : (segment.type === 'Negative Pulse' ? 'red' : 'gray');

      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', rectHeight);
      rect.setAttribute('fill', color);

      svg.appendChild(rect);
    });
  };

  const togglePower = () => {
    const powerButton = document.getElementById('powerButton');
    const isOn = powerButton.classList.contains('on');
    powerButton.classList.toggle('on', !isOn);
    powerButton.textContent = isOn ? 'OFF' : 'ON';
    if (!isOn) {
      handleToggleAllLines();
    }
  };

  const handleToggleLine = (direction) => {
    setLines((prevLines) => {
      if (prevLines.includes(direction)) {
        return prevLines.filter((line) => line !== direction);
      } else {
        return [...prevLines, direction];
      }
    });
  };

  const handleToggleAllLines = () => {
    setLines(['bipolar', 'unipolar', 'negative', 'yellow']);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <button id="powerButton" onClick={togglePower} className={`round-button ${burst ? 'on' : 'off'}`}>{burst ? 'ON' : 'OFF'}</button>
        </div>
      </nav>
      <div className="content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="input-row">
            <div className="input-group">
              <label>T1 (ms): </label>
              <input type="number" ref={(input) => T1 = input} />
            </div>
            <div className="input-group">
              <label>T2 (ms): </label>
              <input type="number" ref={(input) => T2 = input} />
            </div>
            <div className="input-group">
              <label>T3 (ms): </label>
              <input type="number" ref={(input) => T3 = input} />
            </div>
            <div className="input-group">
              <label>T4 (ms): </label>
              <input type="number" ref={(input) => T4 = input} />
            </div>
            <div className="input-group">
              <label>Polarity: </label>
              <input type="number" ref={(input) => polarity = input} />
            </div>
          </div>
          <button type='submit'>Generate</button>
          <button type='button' onClick={() => setShowSaveModal(true)}>Save</button>
          <button type='button' onClick={() => setShowLoadModal(true)}>Load</button>
          <div className="controls">
            <button type='button' onClick={() => handleToggleLine('unipolar')}>POSITIVE</button>
            <button type='button' onClick={() => handleToggleLine('bipolar')}>BIPOLAR</button>
            <button type='button' onClick={() => handleToggleLine('negative')}>NEGATIVE</button>
            <button type='button' onClick={() => handleToggleLine('yellow')}>YELLOW</button>
          </div>
          <div className="input-group">
            <label>Burst: </label>
            <label className="switch">
              <input type="checkbox" checked={burst} onChange={() => setBurst(!burst)} />
              <span className="slider round"></span>
            </label>
          </div>
        </form>
        <footer className="footer">
          © 2024 Pulse Profile Generator
        </footer>
        <div id="display" className="display">
          {lines.map((direction, index) => (
            <Line key={index} direction={direction} />
          ))}
        </div>
        <svg ref={svgRef} width="100%" height="200" className="profile-svg"></svg>
      </div>
      {showSaveModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Uložit Profil</h2>
            <input type="text" placeholder="Profile Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            <button onClick={saveProfile}>Save</button>
            <button onClick={() => setShowSaveModal(false)}>Zrušit</button>
          </div>
        </div>
      )}
      {showLoadModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Načíst Profil</h2>
            {profiles.length === 0 ? (
              <p>Profil nenalezen.</p>
            ) : (
              profiles.map((profile, index) => (
                <div key={index} className="profile-item">
                  <span>{profile.name}</span>
                  <button onClick={() => editProfile(profile)}>Upravit</button>
                  <button onClick={() => deleteProfile(profile)}>Vymazat</button>
                </div>
              ))
            )}
            <button onClick={() => setShowLoadModal(false)}>Zrušit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

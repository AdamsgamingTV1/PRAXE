import React from 'react';
import './App.css';

const App = () => {
  let T1, T2, T3, T4, burst, polarity;
  let svgContainer;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const T1Value = T1.value;
    const T2Value = T2.value;
    const T3Value = T3.value;
    const T4Value = T4.value;
    const burstValue = burst.value;
    const polarityValue = polarity.value;

    const response = await fetch('http://localhost:5000/generate_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ T1: T1Value, T2: T2Value, T3: T3Value, T4: T4Value, burst: burstValue, polarity: polarityValue })
    });
    const profileData = await response.json();
    drawProfile(profileData);
  };

  const drawProfile = (profile) => {
    const width = 800;
    const height = 200;
    const svg = svgContainer;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const totalDuration = profile.reduce((sum, segment) => sum + segment.duration, 0);
    let currentTime = 0;

    profile.forEach(segment => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const x = (currentTime / totalDuration) * width;
      const rectWidth = (segment.duration / totalDuration) * width;
      const y = segment.type === 'Positive Pulse' ? 50 : (segment.type === 'Negative Pulse' ? 100 : 150);
      const height = 30;
      const color = segment.type === 'Positive Pulse' ? 'blue' : (segment.type === 'Negative Pulse' ? 'red' : 'gray');

      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', rectWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', color);

      svg.appendChild(rect);

      currentTime += segment.duration;
    });
  };

  const togglePower = () => {
    const powerButton = document.getElementById('powerButton');
    const isOn = powerButton.classList.contains('on');
    powerButton.classList.toggle('on', !isOn);
    powerButton.textContent = isOn ? 'OFF' : 'ON';
  };

  return (
    <div className="App">
      <div className="controls">
        <button id="powerButton" onClick={togglePower} className="round-button">OFF</button>
        <form onSubmit={handleSubmit}>
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
          </div>
          <div className="input-group">
            <label>Burst: </label>
            <input type="number" ref={(input) => burst = input} />
          </div>
          <div className="input-group">
            <label>Polarity: </label>
            <select ref={(select) => polarity = select}>
              <option value="B">Bipolar</option>
              <option value="P">Unipolar Positive</option>
              <option value="N">Unipolar Negative</option>
            </select>
          </div>
          <button type="submit">Generate Profile</button>
        </form>
      </div>
      <svg ref={(el) => svgContainer = el} width="800" height="200"></svg>
    </div>
  );
};

export default App;

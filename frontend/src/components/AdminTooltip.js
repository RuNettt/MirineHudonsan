import React, { useState } from 'react';
import './AdminTooltip.css';

function AdminTooltip({ title, text }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: rect.right + 10, y: rect.top - 30 });
    setShow(true);
  };

  return (
    <div
      className="admin-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      <div className="admin-tooltip-icon">？</div>
      {show && (
        <div
          className="admin-tooltip-box"
          style={{
            top: `${coords.y}px`,
            left: `${coords.x}px`,
          }}
        >
          <div className="admin-tooltip-title">{title}</div>
          <div className="admin-tooltip-text">{text}</div>
        </div>
      )}
    </div>
  );
}

export default AdminTooltip;

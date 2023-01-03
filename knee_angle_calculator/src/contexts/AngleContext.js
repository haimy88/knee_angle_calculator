import React, { useContext, useState } from "react";

const AngleContext = React.createContext();

export function useAngleContext() {
  return useContext(AngleContext);
}

export function AngleContextProvider({ children }) {
  const [kneeAngle, setKneeAngle] = useState();

  function calculateAngle(a, b, c) {
    let radians =
      Math.atan((c.y - b.y) / (c.x - b.x)) -
      Math.atan((a.y - b.y) / (a.x - b.x));
    let angle = Math.abs((radians * 180.0) / 3.141);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    angle = Math.round(180 - angle);
    return angle;
  }

  return (
    <AngleContext.Provider value={{ calculateAngle, kneeAngle, setKneeAngle }}>
      {children}
    </AngleContext.Provider>
  );
}

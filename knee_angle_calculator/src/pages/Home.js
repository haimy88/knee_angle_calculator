import React from "react";
import { useAngleContext } from "../contexts/AngleContext";
import Canvas from "../components/Canvas";

export default function Home() {
  const { kneeAngle } = useAngleContext();

  return (
    <>
      <div className="page_wrapper">
        <div className="title">Your Personal Knee_Angle Calculator</div>
        <div className="description">
          Enough with the guessing game. Know the truth
        </div>
        <Canvas />
        <div className="display">Left Knee Angle: {kneeAngle}</div>
      </div>
    </>
  );
}

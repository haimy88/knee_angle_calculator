import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as Pose from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as draw from "@mediapipe/drawing_utils";

export default function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [knee_angle, setKnee_angle] = useState();

  let camera = null;

  function calculate_angle(a, b, c) {
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

  function onResults(results) {
    canvasRef.current.width = webcamRef.current.video.videoWidth;
    canvasRef.current.height = webcamRef.current.video.videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.globalCompositeOperation = "source-over";
    draw.drawConnectors(
      canvasCtx,
      results.poseLandmarks,
      Pose.POSE_CONNECTIONS,
      {
        color: "#00FF00",
        lineWidth: 4,
      }
    );
    draw.drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });
    canvasCtx.restore();

    try {
      {
        const angle = calculate_angle(
          results.poseLandmarks[23],
          results.poseLandmarks[25],
          results.poseLandmarks[27]
        );
        setKnee_angle(angle);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const pose = new Pose.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      typeof webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  });

  return (
    <>
      <div className="page_wrapper">
        <div className="title">Your Personal Knee_Angle Calculator</div>
        <div className="description">
          Enough with the guessing game. Know the truth
        </div>
        <div className="webcam_wrapper">
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              bottom: -260,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
              border: "7px solid #005282",
              borderRadius: "10px",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              bottom: -260,
              textAlign: "center",
              borderRadius: "10px",
              zindex: 9,
              width: 640,
              height: 480,
              border: "7px solid #005282",
            }}
          />
        </div>
        <div className="display">Left Knee Angle: {knee_angle}</div>
      </div>
    </>
  );
}

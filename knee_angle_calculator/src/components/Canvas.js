import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useAngleContext } from "../contexts/AngleContext";
import * as Pose from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import * as draw from "@mediapipe/drawing_utils";
import { useWindowSize } from "../hooks/windowSize";

export default function Canvas() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const windowSize = useWindowSize();

  useEffect(() => console.log(windowSize));

  const { setKneeAngle, calculateAngle } = useAngleContext();

  let camera = null;

  const cameraStyle = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    right: 0,
    bottom: -340,
    textAlign: "center",
    zindex: 9,
    width: windowSize[1] < 1000 ? (windowSize[1] * 2) / 3 : 640,
    borderRadius: "10px",
    border: "7px solid #005282",
    left: "50%",
    transform: "translateX(-50%)",
  };

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

    if (
      results.poseLandmarks[23].visibility > 0.8 &&
      results.poseLandmarks[25].visibility > 0.8 &&
      results.poseLandmarks[27].visibility > 0.8
    ) {
      try {
        {
          const angle = calculateAngle(
            results.poseLandmarks[23],
            results.poseLandmarks[25],
            results.poseLandmarks[27]
          );
          setKneeAngle(angle);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setKneeAngle("Nope");
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
    <div
      style={{
        position: "relative",
        marginTop: "15%",
      }}
    >
      <Webcam ref={webcamRef} style={cameraStyle} />
      <canvas ref={canvasRef} style={cameraStyle} />
    </div>
  );
}

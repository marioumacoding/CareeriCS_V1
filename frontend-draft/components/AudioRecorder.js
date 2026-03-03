import { useState, useRef } from "react";

export default function VideoRecorder({ onSubmit }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      // Live preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      videoChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (videoChunksRef.current.length === 0) {
          console.error("No video data captured.");
          setRecording(false);
          return;
        }

        const blob = new Blob(videoChunksRef.current, {
          type: "video/webm",
        });

        const file = new File([blob], "answer.webm", {
          type: "video/webm",
        });

        // Stop camera & mic
        streamRef.current.getTracks().forEach((track) => track.stop());

        if (onSubmit) {
          try {
            await onSubmit(file);
          } catch (err) {
            console.error("Error submitting video:", err);
          }
        }

        setRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Could not start video recording:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "320px", marginBottom: "10px" }}
      />

      <div>
        <button onClick={startRecording} disabled={recording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Stop Recording
        </button>
      </div>
    </div>
  );
}

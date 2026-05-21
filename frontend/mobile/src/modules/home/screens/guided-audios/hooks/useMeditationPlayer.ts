import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';

export const useMeditationPlayer = (audioUrl: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const player = useAudioPlayer(audioUrl);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🔥 reset cuando cambia audio
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      player.pause();
      player.seekTo(0); // 🔥 CLAVE: reset real del engine
    } catch {}

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [audioUrl]);

  const startTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCurrentTime((t) => t + 1);
    }, 1000);
  };

  const stopTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const playAudio = async () => {
    try {
      await player.play();
      setIsPlaying(true);
      startTracking();
    } catch {
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    try {
      player.pause();
      setIsPlaying(false);
      stopTracking();
    } catch {}
  };

  const stopAudio = () => {
    try {
      player.pause();
      player.seekTo(0); // 🔥 RESET REAL OBLIGATORIO
    } catch {}

    setIsPlaying(false);
    setCurrentTime(0);
    stopTracking();
  };

  const seek = (time: number) => {
    const safe = Math.max(0, time);

    try {
      player.seekTo(safe);
    } catch {}

    setCurrentTime(safe);
  };

  const skipBack10 = () => seek(currentTime - 10);
  const skipForward10 = () => seek(currentTime + 10);

  return {
    isPlaying,
    currentTime,
    playAudio,
    pauseAudio,
    stopAudio,
    seek,
    skipBack10,
    skipForward10,
  };
};
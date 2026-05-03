import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';

export const useMeditationPlayer = (audioUrl: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const player = useAudioPlayer(audioUrl);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset al cambiar audio
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsMuted(false);

    try {
      player.pause();
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
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    try {
      player.pause();
    } catch {}

    setIsPlaying(false);
    setCurrentTime(0);
    setIsMuted(false);
    stopTracking();
  };

  // SEEK base
  const seek = (time: number) => {
    const safe = Math.max(0, time);

    try {
      player.seekTo(safe);
    } catch {}

    setCurrentTime(safe);
  };

  // 🔥 EXACTAMENTE LO QUE PEDISTE
  const skipBack10 = () => {
    seek(currentTime - 10);
  };

  const skipForward10 = () => {
    seek(currentTime + 10);
  };

  const toggleMute = () => {
    if (!isPlaying) return;

    try {
      if (isMuted) {
        player.play();
        setIsMuted(false);
      } else {
        player.pause();
        setIsMuted(true);
      }
    } catch {}
  };

  return {
    isPlaying,
    currentTime,
    isMuted,
    playAudio,
    pauseAudio,
    stopAudio,
    seek,
    skipBack10,
    skipForward10,
    toggleMute,
  };
};
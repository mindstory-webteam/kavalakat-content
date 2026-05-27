import { useState, useEffect } from "react";

interface TimeRemaining {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function calculateTimeRemaining(endTime: string | Date): TimeRemaining {
  const currentTime = new Date();
  const targetTime = typeof endTime === "string" ? new Date(endTime) : endTime;
  const timeDifference = targetTime.getTime() - currentTime.getTime();

  if (timeDifference <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  return {
    days: days.toString().padStart(2, "0"),
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

export function useCountdownTimer(endTime: string | Date): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(endTime);
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [endTime]);

  return timeRemaining;
}

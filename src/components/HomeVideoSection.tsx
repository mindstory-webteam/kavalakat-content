"use client";
import { useCircularTextByClass } from "@/customHooks/useCircularTextByClass";
import React, { useEffect } from "react";

const HomeVideoSection: React.FC = () => {
  useCircularTextByClass("circular-text2");

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>(".video-area video");
    const playBtn = document.querySelector<HTMLButtonElement>(".play-btn");

    if (!video || !playBtn) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();

      if (video.paused) {
        video.play();
        playBtn.classList.add("active");
      } else {
        video.pause();
        playBtn.classList.remove("active");
      }

      // Optional: Toggle mute/unmute
      video.muted = !video.muted;
    };

    playBtn.addEventListener("click", handleClick);

    return () => {
      playBtn.removeEventListener("click", handleClick);
    };
  }, []);

    return (
        <div className="home3-video-area">
            <div className="video-area">
                <video autoPlay loop muted playsInline src="/assets/new-images/video/v-1.mp4" />
            </div>
            <div className="video-content-wrap">
                <div className="video-content-btn-area">
                    <div className="content">
                        <h2>Empowering</h2>
                        <h2>Industry Growth</h2>
                    </div>
                    <div className="circular-text2">
                        <div className="play-btn active" style={{ cursor: 'pointer' }}>
                            <svg className="play-icon" width={24} height={27} viewBox="0 0 24 27" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.3787 9.99987L4.82154 0.433939C4.34825 0.153923 3.80926 0.00420458 3.25936 0C2.39492 0 1.56589 0.343396 0.954645 0.954644C0.343396 1.56589 0 2.39492 0 3.25936V23.7895C0.000109938 24.3631 0.153886 24.9263 0.445339 25.4203C0.736791 25.9144 1.15528 26.3214 1.65729 26.599C2.1593 26.8766 2.72651 27.0146 3.29994 26.9988C3.87336 26.9829 4.43207 26.8137 4.91797 26.5088L21.4944 16.0364C22.0098 15.7139 22.4329 15.2633 22.7224 14.7286C23.0119 14.1939 23.1579 13.5933 23.1463 12.9854C23.1346 12.3775 22.9657 11.7829 22.6559 11.2597C22.3461 10.7365 21.9061 10.3024 21.3787 9.99987Z" />
                            </svg>
                            <svg className="pause-icon" width={21} height={27} viewBox="0 0 21 27" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.125 3.375C7.125 1.51104 5.61396 0 3.75 0C1.88604 0 0.375 1.51104 0.375 3.375V23.625C0.375 25.489 1.88604 27 3.75 27C5.61396 27 7.125 25.489 7.125 23.625V3.375Z" />
                                <path d="M20.625 3.375C20.625 1.51104 19.114 0 17.25 0C15.386 0 13.875 1.51104 13.875 3.375V23.625C13.875 25.489 15.386 27 17.25 27C19.114 27 20.625 25.489 20.625 23.625V3.375Z" />
                            </svg>
                        </div>
                        <div className="text">
                            <span>
                                INDUSTRY . SECTOR . SERVE .
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default HomeVideoSection

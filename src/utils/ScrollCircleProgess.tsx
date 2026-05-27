"use client";
import { useEffect, useRef, useState } from "react";

const ScrollCircleProgress: React.FC = () => {
  const progressRef = useRef<SVGCircleElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const progressPath = progressRef.current;
    if (!progressPath) return;

    const pathLength = progressPath.getTotalLength();

    progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    progressPath.style.strokeDashoffset = `${pathLength}`;

    const updateProgress = () => {
      const scroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pathLength - (scroll * pathLength) / height;
      progressPath.style.strokeDashoffset = `${progress}`;

      setIsVisible(scroll > 50);
    };

    updateProgress(); // Initialize on mount

    window.addEventListener("scroll", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

    return (
        <>

            <div
                className={`progress-wrap ${isVisible ? "active-progress" : ""}`}
                onClick={scrollToTop}
            >
                <svg
                    className="progress-circle svg-content"
                    width="100%"
                    height="100%"
                    viewBox="-1 -1 102 102"
                >
                    <path
                        ref={progressRef}
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                    />
                </svg>

                <svg
                    className="arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.03516 0.416666L7.03516 15H8.28516L8.28516 0.416666H7.03516Z"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.28516 1.04115C8.28516 3.98115 5.70016 6.38281 2.94349 6.38281H2.31849V5.13281H2.94349C5.03599 5.13281 7.03516 3.26448 7.03516 1.04115V0.416979H8.28516V1.04115Z"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.03333 1.04115C7.03333 3.98115 9.61833 6.38281 12.375 6.38281H13V5.13281H12.375C10.2817 5.13281 8.28333 3.26448 8.28333 1.04115V0.416979H7.03333V1.04115Z"
                        />
                    </g>
                </svg>
            </div>

        </>
    );
};

export default ScrollCircleProgress;

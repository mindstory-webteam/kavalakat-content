"use client"
import Link from 'next/link'
import React, { useMemo, useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
    Autoplay,
    EffectFade,
    Navigation,
    Pagination,
} from "swiper";

import { SwiperOptions } from 'swiper/types';

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

// ── Count-up hook ──────────────────────────────────────────────
function useCountUp(target: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [hasStarted, target, duration]);

    return { count, ref };
}

// ── Single counter component ───────────────────────────────────
interface CounterProps {
    target: number;
    suffix?: string;
    label: string;
    className?: string;
}

const Counter: React.FC<CounterProps> = ({ target, suffix, label, className }) => {
    const { count, ref } = useCountUp(target, 2200);
    return (
        <div ref={ref} className={`single-countdown ${className ?? ''}`}>
            <div className="number">
                <h2 className="counter">{count}</h2>
                {suffix && <span>{suffix}</span>}
            </div>
            <span>{label}</span>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────
const HomeTestimonialSection: React.FC = () => {
    const settings: SwiperOptions = useMemo(() => {
        return {
            slidesPerView: "auto",
            speed: 1500,
            spaceBetween: 24,
            effect: "fade",
            fadeEffect: {
                crossFade: true,
            },
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".testimonial-slider-next",
                prevEl: ".testimonial-slider-prev",
            },
        };
    }, []);

    // SVG quote mark – extracted to avoid repetition
    const QuoteSVG = () => (
        <svg className="quote" width={46} height={42} viewBox="0 0 46 42" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.3074 22.4375C19.0109 24.7824 18.4898 27.0555 17.9059 28.5469C15.8664 33.7848 11.2574 38.277 5.21094 40.9184C4.07891 41.4125 3.00977 41.2418 2.37188 40.4691C2.22813 40.2895 1.64415 39.1754 1.07813 38.0074L1.07111 37.9928C0.0628121 35.8959 0.0449269 35.8587 0.0449268 35.2402C0.0539122 34.0902 0.413287 33.668 2.06641 32.8773C5.27383 31.332 7.16055 29.5801 8.40039 26.9746C8.98438 25.7438 9.28086 24.8543 9.55938 23.4707C9.73907 22.5723 9.97266 20.5867 9.97266 19.9129C9.97266 19.7422 9.87383 19.7422 6.21719 19.7422L2.46172 19.7422L1.99454 19.5086C1.73399 19.3828 1.40157 19.1313 1.25782 18.9516C1.18695 18.8658 1.12525 18.7941 1.07158 18.7167C0.703361 18.1862 0.713199 17.3932 0.736722 10.0301L0.73675 10.0223C0.763674 2.37538 0.763737 2.3573 0.952347 1.99805C1.22188 1.50391 1.58125 1.15352 2.06641 0.928908C2.47071 0.740236 2.5336 0.740236 10.2871 0.740235L18.1035 0.740235L18.4719 0.937891C18.948 1.18945 19.3344 1.57578 19.55 2.01602C19.7117 2.33945 19.7207 2.68086 19.7207 10.2188C19.7207 18.3945 19.6848 19.4996 19.3074 22.4375ZM17.8522 1.74023L10.2871 1.74024C6.40188 1.74024 4.46426 1.74031 3.44357 1.76356C2.92494 1.77537 2.69152 1.79262 2.57391 1.80958C2.54369 1.81394 2.53418 1.81503 2.52538 1.81814C2.51753 1.82092 2.51024 1.82531 2.4893 1.8351L2.48653 1.83637C2.2145 1.96232 2.00802 2.15202 1.83171 2.47421C1.83173 2.47587 1.83148 2.47868 1.83077 2.48319C1.81501 2.58363 1.79708 2.79935 1.78353 3.3051C1.75698 4.29626 1.75022 6.19753 1.73672 10.0336L1.73564 10.3707C1.72277 14.3836 1.71656 16.3201 1.77656 17.3432C1.80775 17.8752 1.85318 18.0523 1.87579 18.1135C1.87661 18.1157 1.87712 18.1175 1.87761 18.1192C1.8816 18.1328 1.88332 18.1387 2.02856 18.3144L2.03367 18.3206L2.03672 18.3244C2.03678 18.3244 2.04731 18.3363 2.07257 18.3595C2.10178 18.3863 2.14029 18.4185 2.18559 18.4527C2.28143 18.5252 2.3731 18.5809 2.42928 18.608L2.69779 18.7422L6.28558 18.7422C8.05331 18.7422 9.00638 18.7422 9.51041 18.7645C9.72208 18.7739 10.0056 18.789 10.2401 18.8738C10.3866 18.9267 10.6434 19.0511 10.8178 19.3404C10.9744 19.6004 10.973 19.8548 10.9727 19.9079C10.9727 19.9098 10.9727 19.9115 10.9727 19.9129C10.9727 20.6739 10.7276 22.7288 10.54 23.6668L10.5397 23.668C10.2453 25.1304 9.92333 26.0976 9.30386 27.4033L9.30337 27.4043C7.94366 30.2617 5.86228 32.1585 2.50046 33.7782L2.49787 33.7795C1.66324 34.1787 1.34343 34.4051 1.19924 34.5738C1.1208 34.6656 1.04893 34.7815 1.04493 35.2443C1.04497 35.4018 1.04745 35.4529 1.05366 35.4966C1.05826 35.529 1.06907 35.5852 1.11714 35.7134C1.22831 36.0099 1.45872 36.4913 1.97867 37.5726C2.25755 38.1481 2.53993 38.7083 2.76871 39.144C2.88347 39.3625 2.98221 39.5449 3.0588 39.6801C3.12413 39.7954 3.15556 39.8442 3.16026 39.8528C3.44126 40.1748 3.98101 40.364 4.81062 40.002C10.659 37.4471 15.0477 33.1312 16.974 28.184L16.9747 28.1823C17.5179 26.7949 18.0248 24.6102 18.3153 22.3121L18.3156 22.3101C18.6836 19.445 18.7207 18.4017 18.7207 10.2188C18.7207 6.44338 18.7184 4.48759 18.6962 3.43299C18.685 2.89883 18.6691 2.63484 18.6521 2.49403C18.6492 2.46982 18.6466 2.45272 18.6447 2.4414C18.5291 2.21446 18.3069 1.98169 18.0048 1.82208L17.8522 1.74023Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M45.3074 22.4375C45.0109 24.7824 44.4898 27.0555 43.9059 28.5469C41.8664 33.7848 37.2574 38.277 31.2109 40.9184C30.0789 41.4125 29.0098 41.2418 28.3719 40.4691C28.2281 40.2895 27.6441 39.1754 27.0781 38.0074L27.0711 37.9928C26.0628 35.8959 26.0449 35.8587 26.0449 35.2402C26.0539 34.0902 26.4133 33.668 28.0664 32.8773C31.2738 31.332 33.1606 29.5801 34.4004 26.9746C34.9844 25.7438 35.2809 24.8543 35.5594 23.4707C35.7391 22.5723 35.9727 20.5867 35.9727 19.9129C35.9727 19.7422 35.8738 19.7422 32.2172 19.7422L28.4617 19.7422L27.9945 19.5086C27.734 19.3828 27.4016 19.1313 27.2578 18.9516C27.187 18.8658 27.1253 18.7941 27.0716 18.7167C26.7034 18.1862 26.7132 17.3932 26.7367 10.0301L26.7368 10.0223C26.7637 2.37538 26.7637 2.3573 26.9523 1.99805C27.2219 1.50391 27.5813 1.15352 28.0664 0.928908C28.4707 0.740236 28.5336 0.740236 36.2871 0.740235L44.1035 0.740235L44.4719 0.937891C44.948 1.18945 45.3344 1.57578 45.55 2.01602C45.7117 2.33945 45.7207 2.68086 45.7207 10.2188C45.7207 18.3945 45.6848 19.4996 45.3074 22.4375ZM43.8522 1.74023L36.2871 1.74024C32.4019 1.74024 30.4643 1.74031 29.4436 1.76356C28.9249 1.77537 28.6915 1.79262 28.5739 1.80958C28.5437 1.81394 28.5342 1.81503 28.5254 1.81814C28.5175 1.82092 28.5102 1.82531 28.4893 1.8351L28.4865 1.83637C28.2145 1.96232 28.008 2.15202 27.8317 2.47421C27.8317 2.47587 27.8315 2.47868 27.8308 2.48319C27.815 2.58363 27.7971 2.79935 27.7835 3.3051C27.757 4.29626 27.7502 6.19753 27.7367 10.0336L27.7356 10.3707C27.7228 14.3836 27.7166 16.3201 27.7766 17.3432C27.8078 17.8752 27.8532 18.0523 27.8758 18.1135C27.8766 18.1157 27.8771 18.1175 27.8776 18.1192C27.8816 18.1328 27.8833 18.1387 28.0286 18.3144L28.0337 18.3206L28.0367 18.3244C28.0368 18.3244 28.0473 18.3363 28.0726 18.3595C28.1018 18.3863 28.1403 18.4185 28.1856 18.4527C28.2814 18.5252 28.3731 18.5809 28.4293 18.608L28.6978 18.7422L32.2856 18.7422C34.0533 18.7422 35.0064 18.7422 35.5104 18.7645C35.7221 18.7739 36.0056 18.789 36.2401 18.8738C36.3866 18.9267 36.6434 19.0511 36.8178 19.3404C36.9744 19.6004 36.973 19.8548 36.9727 19.9079C36.9727 19.9098 36.9727 19.9115 36.9727 19.9129C36.9727 20.6739 36.7276 22.7288 36.54 23.6668L36.5397 23.668C36.2453 25.1304 35.9233 26.0976 35.3039 27.4033L35.3034 27.4043C33.9437 30.2617 31.8623 32.1585 28.5005 33.7782L28.4979 33.7795C27.6632 34.1787 27.3434 34.4051 27.1992 34.5738C27.1208 34.6656 27.0489 34.7815 27.0449 35.2443C27.045 35.4018 27.0475 35.4529 27.0537 35.4966C27.0583 35.529 27.0691 35.5852 27.1171 35.7134C27.2283 36.0099 27.4587 36.4913 27.9787 37.5726C28.2575 38.1481 28.5399 38.7083 28.7687 39.144C28.8835 39.3625 28.9822 39.5449 29.0588 39.6801C29.1241 39.7954 29.1556 39.8442 29.1603 39.8528C29.4413 40.1748 29.981 40.364 30.8106 40.002C36.659 37.4471 41.0477 33.1312 42.974 28.184L42.9747 28.1823C43.5179 26.7949 44.0248 24.6102 44.3153 22.3121L44.3156 22.3101C44.6836 19.445 44.7207 18.4017 44.7207 10.2188C44.7207 6.44338 44.7184 4.48759 44.6962 3.43299C44.685 2.89883 44.6691 2.63484 44.6521 2.49403C44.6492 2.46982 44.6466 2.45272 44.6447 2.4414C44.5291 2.21446 44.3069 1.98169 44.0048 1.82208L43.8522 1.74023Z" />
        </svg>
    );

    return (
        <div className="home3-testimonial-section mb-120">
            <div className="container">
                <div className="row g-4 align-items-end justify-content-between mb-60 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                    <div className="col-lg-5">
                        <div className="section-title two white">
                            <h2>Feedback From The Experts</h2>
                        </div>
                    </div>
                    <div className="col-lg-3 d-flex justify-content-lg-end">
                        <div className="slider-btn-grp two">
                            <div className="slider-btn testimonial-slider-prev">
                                <i className="bi bi-arrow-left" />
                            </div>
                            <div className="slider-btn testimonial-slider-next">
                                <i className="bi bi-arrow-right" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-100">
                    <div className="col-lg-12">
                        <Swiper {...settings} className="swiper home3-testimonial-slider">
                            <div className="swiper-wrapper">

                                {/* Slide 1 — Sobha Mall */}
                                <SwiperSlide className="swiper-slide">
                                    <div className="testimonial-card2">
                                        <div className="row gy-md-5 gy-4 align-items-center justify-content-between">
                                            <div className="col-lg-5">
                                                <div className="testimonial-img">
                                                    <img width={450} height={470} src="/assets/new-images/reviews-logo/sobha-mall.jfif" alt="Sobha Mall" />
                                                </div>
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="testimonial-content">
                                                    <QuoteSVG />
                                                    <span>Excellent quality production!</span>
                                                    <p>" Kavalakat  has been a reliable supplier for our steel and cement requirements. Their product quality, timely delivery, and professional coordination made the procurement process smooth. Highly dependable for large-scale projects ".</p>
                                                    <div className="author-and-social-area">
                                                        <div className="author-area">
                                                            <div className="author-img">
                                                                <img width={450} height={470} src="/assets/new-images/reviews-logo/sobha.png" alt="Sobha" />
                                                            </div>
                                                            <div className="author-content">
                                                                <h5>Sobha Mall</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>

                                {/* Slide 2 — Central Builders */}
                                <SwiperSlide className="swiper-slide">
                                    <div className="testimonial-card2">
                                        <div className="row gy-md-5 gy-4 align-items-center justify-content-between">
                                            <div className="col-lg-5">
                                                <div className="testimonial-img">
                                                    <img width={450} height={470} src="/assets/new-images/reviews-logo/central-buliding.jfif" alt="Central Builders" />
                                                </div>
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="testimonial-content">
                                                    <QuoteSVG />
                                                    <span>Best communication &amp; deliver</span>
                                                    <p>" We sourced steel, cement, and white cement from Kavalakat  and were impressed with their consistency and service standards. Transparent dealings and on-time delivery make them a trusted partner in construction.".</p>
                                                    <div className="author-and-social-area">
                                                        <div className="author-area">
                                                            <div className="author-img">
                                                                <img width={450} height={470} src="/assets/new-images/reviews-logo/central-logo.jfif" alt="Central" />
                                                            </div>
                                                            <div className="author-content">
                                                                <h5>Central Builders</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>

                                {/* Slide 3 — TBPL */}
                                <SwiperSlide className="swiper-slide">
                                    <div className="testimonial-card2">
                                        <div className="row gy-md-5 gy-4 align-items-center justify-content-between">
                                            <div className="col-lg-5">
                                                <div className="testimonial-img">
                                                    <img width={450} height={470} src="/assets/new-images/reviews-logo/tbpl-buildings.jfif" alt="TBPL" />
                                                </div>
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="testimonial-content">
                                                    <QuoteSVG />
                                                    <span>Outstanding material quality!</span>
                                                    <p>"Kavalakat  supplied sheets and pipes for our project, and the quality met all required standards. Their team was responsive, documentation was clear, and deliveries were well-coordinated. A dependable supplier in Kerala.".</p>
                                                    <div className="author-and-social-area">
                                                        <div className="author-area">
                                                            <div className="author-img">
                                                                <img width={450} height={470} src="/assets/new-images/reviews-logo/tbpl-logo.png" alt="TBPL" />
                                                            </div>
                                                            <div className="author-content">
                                                                <h5>TBPL</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>

                            </div>
                        </Swiper>
                    </div>
                </div>

                {/* ── Counters ── */}
                <div className="counter-wrap">
                    <div className="row gy-sm-5 gy-4">
                        <div className="col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center divider">
                            <Counter target={50} suffix="+" label="Years of Experience" />
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center divider">
                            <Counter target={245} suffix="+" label="Employees" />
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 d-flex justify-content-lg-center justify-content-md-end justify-content-center divider">
                            <Counter target={770} suffix="+" label="Retail Partners" />
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center">
                            <Counter target={15000} suffix="+ MT" label="Steel / Month" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HomeTestimonialSection;
"use client"
import { useCircularTextByClass } from '@/customHooks/useCircularTextByClass';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import CircularText from '@/components/common/CircularText';
import Image from 'next/image';

const Banner = () => {
    useCircularTextByClass("circular-text");
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const slides = [
        {
            id: 1,
            title: "Kerala's Most Trusted Construction Material Supplier — Since 1975",
            button1Text: "Start A Project",
            button1Link: "/product",
            button2Text: "Let's Discuss",
            button2Link: "/contact",
            image: "/assets/new-images/home-banner/banner-4.jpeg"
        },
        {
            id: 2,
            title: "50 Years of Building Kerala's Infrastructure",
            button1Text: "Explore Services",
            button1Link: "/product",
            button2Text: "Get Quote",
            button2Link: "/contact",
            image: "/assets/new-images/home-banner/banner-5.jpeg"
        },
        {
            id: 3,
            title: "10,000+ MT of Steel. Every Month. Pan-Kerala.",
            button1Text: "Our Portfolio",
            button1Link: "/gallery",
            button2Text: "Contact Us",
            button2Link: "/contact",
            image: "/assets/new-images/home-banner/banner-3.jpeg"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide((prev) => (prev + 1) % slides.length);
                setTimeout(() => setIsAnimating(false), 600);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentSlide, isAnimating]);

    const goToSlide = (index: number) => {
        if (!isAnimating && index !== currentSlide) {
            setIsAnimating(true);
            setCurrentSlide(index);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    return (
        <>
            <div className="home1-banner-section mb-60">
                {/* ← changed: replaced container-fluid with a plain full-width div */}
                <div style={{ width: '100%', padding: 0 }}>
                    <div className="banner-wrapper">
                        {/* Background Images */}
                        <div className="banner-images-container">
                            {slides.map((slide, index) => (
                                <div
                                    key={`img-${slide.id}`}
                                    className={`banner-image ${
                                        index === currentSlide ? 'active' : ''
                                    }`}
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        priority={index === 0}
                                        quality={90}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div className="banner-overlay"></div>
                                </div>
                            ))}
                        </div>

                        <div className="banner-content-wrap">
                            <div className="banner-carousel-container">
                                {slides.map((slide, index) => (
                                    <div 
                                        key={slide.id}
                                        className={`banner-content wow animate ${
                                            index === currentSlide 
                                                ? 'active fadeInLeft' 
                                                : index < currentSlide 
                                                ? 'prev fadeOutLeft' 
                                                : 'next fadeOutRight'
                                        }`}
                                        data-wow-delay="200ms" 
                                        data-wow-duration="1500ms"
                                    >
                                        <h1>{slide.title}</h1>
                                        <div className="btn-grp">
                                            <Link className="primary-btn1" href={slide.button1Link}>
                                                <span>{slide.button1Text}</span>
                                                <span>{slide.button1Text}</span>
                                                <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                                                    <g>
                                                        <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                                                        <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                                                    </g>
                                                </svg>
                                            </Link>
                                            <Link className="discuss-btn" href={slide.button2Link}>
                                                {slide.button2Text}
                                                <svg width={9} height={9} viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.0445549 0H9.00008V1.67647L1.69308 9L0 7.32353L4.99014 2.38235L0.0445549 2.42647V0Z" />
                                                    <path d="M9.0002 8.99999V3.35294L6.59424 5.73529V8.99999H9.0002Z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* <CircularText /> */}
                        </div>

                        {/* Navigation Lines at Bottom */}
                        <div className="carousel-nav-lines">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`nav-line ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <span className="progress-line"></span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .banner-wrapper {
                    position: relative;
                    overflow: hidden;
                }

                .banner-images-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }

                .banner-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.6s ease-in-out, visibility 0.6s ease-in-out;
                }

                .banner-image.active {
                    opacity: 1;
                    visibility: visible;
                    z-index: 1;
                }

                .banner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.4);
                    z-index: 1;
                }

                .banner-content-wrap {
                    position: relative;
                    z-index: 2;
                }

                .banner-carousel-container {
                    position: relative;
                    min-height: 400px;
                }

                .banner-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.6s ease-in-out;
                    transform: translateX(100px);
                }

                .banner-content.active {
                    opacity: 1;
                    visibility: visible;
                    position: relative;
                    transform: translateX(0);
                    animation: fadeInLeft 0.6s ease-in-out;
                }

                .banner-content.prev {
                    transform: translateX(-100px);
                    animation: fadeOutLeft 0.6s ease-in-out;
                }

                .banner-content.next {
                    transform: translateX(100px);
                    animation: fadeOutRight 0.6s ease-in-out;
                }

                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeOutLeft {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-100px);
                    }
                }

                @keyframes fadeOutRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }

                .carousel-nav-lines {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    position: absolute;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                }

                .nav-line {
                    position: relative;
                    width: 60px;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.3);
                    border: none;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .nav-line:hover {
                    background: rgba(255, 255, 255, 0.5);
                }

                .nav-line.active {
                    background: rgba(255, 255, 255, 0.5);
                }

                .nav-line .progress-line {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: #fff;
                    width: 0;
                    transition: width 0.3s ease;
                }

                .nav-line.active .progress-line {
                    width: 100%;
                    animation: progressLine 5s linear;
                }

                @keyframes progressLine {
                    from {
                        width: 0;
                    }
                    to {
                        width: 100%;
                    }
                }

                @media (max-width: 768px) {
                    .carousel-nav-lines {
                        bottom: 20px;
                        gap: 8px;
                    }

                    .nav-line {
                        width: 40px;
                        height: 2px;
                    }
                }

                @media (max-width: 480px) {
                    .carousel-nav-lines {
                        bottom: 15px;
                        gap: 6px;
                    }

                    .nav-line {
                        width: 30px;
                    }
                }
            `}</style>
        </>
    )
}

export default Banner
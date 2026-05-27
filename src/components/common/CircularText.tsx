
"use client";
import { useCircularTextByClass } from '@/customHooks/useCircularTextByClass';
import React from 'react'

const CircularText = () => {
    useCircularTextByClass("circular-text");
    return (
        <div className="circular-text btn_wrapper">
            <a href="#about" className="center-icon" id="scroll-btn">
                <svg width={16} height={31} viewBox="0 0 16 31" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.66667 6C2.66667 8.94552 5.05448 11.3333 8 11.3333C10.9455 11.3333 13.3333 8.94552 13.3333 6C13.3333 3.05448 10.9455 0.666666 8 0.666667C5.05448 0.666667 2.66667 3.05448 2.66667 6ZM7.29289 30.7071C7.68342 31.0976 8.31658 31.0976 8.70711 30.7071L15.0711 24.3431C15.4616 23.9526 15.4616 23.3195 15.0711 22.9289C14.6805 22.5384 14.0474 22.5384 13.6569 22.9289L8 28.5858L2.34315 22.9289C1.95262 22.5384 1.31946 22.5384 0.928933 22.9289C0.538409 23.3195 0.538409 23.9526 0.928933 24.3431L7.29289 30.7071ZM7 6L7 30L9 30L9 6L7 6Z" />
                </svg>
            </a>
            <div className="text">
                <span>
                    STRATEGY . DESIGN . BRAND .
                </span>
            </div>
        </div>
    )
}

export default CircularText

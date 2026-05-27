"use client"

import React, { useRef } from 'react'

const HomaPageVideoSection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <>
            <div className="home1-video-section" style={{ position: 'relative', height: '765px', overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover'
                    }}
                >
                    <source src="/assets/new-images/video/v-2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </>
    )
}

export default HomaPageVideoSection
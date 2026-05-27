import React from 'react'
import CircularText from './CircularText'
import Link from 'next/link'
import Image from 'next/image'

type BreadcrumbProps = {
    title: string;
    subtitle: string;
    image?: string;  // ✅ Made optional
    imageAlt?: string;
    showCircularText?: boolean;
    showVector?: boolean;
};

const Breadcrumb = ({ 
    title, 
    subtitle, 
    image,
    imageAlt = "breadcrumb image",
    showCircularText = false,
    showVector = false 
}: BreadcrumbProps) => {
    return (
        <div className="breadcrumb-section">
            <div className="breadcrumb-content-wrap">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-9 col-lg-10">
                            <div className="breadcrumb-content">
                                <ul className="breadcrumb-list">
                                    <li>
                                        <Link href="/">
                                            <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0.0594065 0H12.0001V2.2353L2.25745 12L0 9.76471L6.65353 3.17647L0.0594065 3.2353V0Z" />
                                                <path d="M12.0009 12.0001V4.4707L8.79297 7.64718V12.0001H12.0009Z" />
                                            </svg>
                                            Home
                                        </Link>
                                    </li>
                                    <li>{title}</li>
                                </ul>
                                <h1>{subtitle}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {showCircularText && <CircularText />}
                {showVector && (
                    <Image
                        width={92}
                        height={92}
                        src="/assets/img/innerpages/breadcrumb-section-vector.svg"
                        alt="breadcrumb vector"
                        className="vector"
                    />
                )}
            </div>
           {image && (
  <div
    className="breadcrumb-img"
    style={{
      position: "relative",
      width: "100%",
      height: "550px",
      overflow: "hidden"
    }}
  >
    <Image
      src={image}
      alt={imageAlt}
      fill
      priority
      style={{
        objectFit: "cover",
        objectPosition: "center"
      }}
    />
  </div>
)}

        
        </div>
    )
}

export default Breadcrumb
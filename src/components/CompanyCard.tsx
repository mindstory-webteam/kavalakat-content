import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompanyCardProps {
  logo: string;
  logoAlt: string;
  companyName: string;
  description: string;
}

const LOGO_FALLBACK = '/assets/new-images/products/p-1.jpeg'

function cleanLogoSrc(src: string): string {
  const s = (src || '').trim()
  return s && s !== 'null' ? s : ''
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  logo,
  logoAlt,
  companyName,
  description,
}) => {
  const cleanLogo = cleanLogoSrc(logo)
  const [logoSrc, setLogoSrc] = useState(cleanLogo)
  useEffect(() => { setLogoSrc(cleanLogoSrc(logo)) }, [logo])

  // Don't render at all if no meaningful data
  if (!companyName) return null

  return (
    <div className="company-card">
      <div className="card-inner">
        {/* Logo Container with decorative background */}
        <div className="logo-container">
          <div className="logo-background"></div>
          <div className="logo-wrapper">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={logoAlt || companyName}
                fill
                className="company-logo"
                sizes="150px"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                onError={() => setLogoSrc('')}
              />
            ) : (
              /* Fallback: show initials if no logo */
              <div className="logo-initials">
                {companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Company Name with decorative line */}
        <div className="company-name-wrapper">
          <div className="decorative-line"></div>
          <h2 className="company-name">{companyName}</h2>
          <div className="decorative-line"></div>
        </div>

        {/* Description */}
        {description && <p className="company-description">{description}</p>}

        {/* Hover Overlay Effect */}
        <div className="card-overlay"></div>
      </div>

      <style jsx>{`
        .company-card {
          width: 100%;
          height: 100%;
          perspective: 1000px;
          font-family: var(--font-manrope);
        }

        .card-inner {
          position: relative;
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 0px;
          padding: 30px 25px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.08),
            0 1px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-inner:hover {
          transform: translateY(-8px);
        }

        /* Logo Section */
        .logo-container {
          position: relative;
          margin-bottom: 20px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .logo-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 130px;
          height: 130px;
          background: radial-gradient(circle, rgba(56, 53, 255, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          transition: all 0.4s ease;
        }

        .card-inner:hover .logo-background {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(73, 53, 255, 0.1) 0%, transparent 70%);
        }

        .logo-wrapper {
          position: relative;
          width: 150px;
          height: 90px;
          margin: 0 auto;
          z-index: 2;
        }

        .company-logo {
          object-fit: contain !important;
          object-position: center !important;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: transform 0.4s ease;
        }

        .card-inner:hover .company-logo {
          transform: scale(1.05);
        }

        /* Initials fallback when no logo */
        .logo-initials {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3835ff22, #3835ff44);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          font-weight: 800;
          color: #3835ff;
          letter-spacing: 2px;
          font-family: var(--font-manrope);
        }

        /* Company Name Section */
        .company-name-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
          position: relative;
          flex-shrink: 0;
        }

        .decorative-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #3c35ff 50%,
            transparent 100%
          );
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .card-inner:hover .decorative-line {
          opacity: 0.6;
        }

        .company-name {
          font-size: 1.4rem;
          font-weight: 800;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
          margin: 0;
          position: relative;
          font-family: var(--font-manrope);
          transition: all 0.3s ease;
        }

        .card-inner:hover .company-name {
          letter-spacing: 2.5px;
          color: #1a1a1a;
        }

        /* Description */
        .company-description {
          color: #4a5568;
          font-size: 0.875rem;
          line-height: 1.7;
          text-align: justify;
          margin: 0;
          position: relative;
          z-index: 2;
          transition: color 0.3s ease;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          font-family: var(--font-manrope);
        }

        .card-inner:hover .company-description {
          color: #2d3748;
        }

        /* Overlay Effect */
        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(93, 53, 255, 0) 0%,
            rgba(83, 53, 255, 0.03) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          border-radius: 0px;
        }

        .card-inner:hover .card-overlay {
          opacity: 1;
        }

        /* Decorative corner accent */
        .card-inner::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, transparent 50%, rgba(87, 53, 255, 0.05) 50%);
          border-radius: 0;
          transition: all 0.4s ease;
        }

        .card-inner:hover::before {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, transparent 50%, rgba(93, 53, 255, 0.1) 50%);
        }

        /* Bottom accent */
        .card-inner::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 3px;
          transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 0 3px 3px 0;
        }

        .card-inner:hover::after {
          width: 60%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .card-inner {
            padding: 25px 18px;
          }

          .company-name {
            font-size: 1.2rem;
            letter-spacing: 1.5px;
          }

          .card-inner:hover .company-name {
            letter-spacing: 2px;
          }

          .company-description {
            font-size: 0.85rem;
            -webkit-line-clamp: 4;
          }

          .logo-wrapper {
            height: 90px;
          }
        }

        @media (max-width: 480px) {
          .company-name {
            font-size: 1.1rem;
          }

          .decorative-line {
            display: none;
          }

          .company-name-wrapper {
            justify-content: center;
          }

          .company-description {
            -webkit-line-clamp: 4;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyCard;
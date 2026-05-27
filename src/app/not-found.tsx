import Link from 'next/link'
import React from 'react'

const notfound = () => {
  return (
    <div className="error-page-wrapper">
  {/* Breadcrumb Section Start*/}
  <div className="breadcrumb-section two">
    <div className="breadcrumb-content-wrap">
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-8">
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
                <li>Error</li>
              </ul>
              <h1>Sorry! We Are Working That Page.</h1>
            </div>
          </div>
        </div>
      </div>
     <img src="/assets/img/innerpages/breadcrumb-section-vector.svg" alt="" className="vector" />
<img src="/assets/img/innerpages/breadcrumb-section-vector2.svg" alt="" className="vector2" />
    </div>
  </div>
  {/* Breadcrumb Section End*/}
  <div className="error-wrapper">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10">
          <div className="error-content text-center">
           <img src="/assets/img/innerpages/error-img.png" alt="" />
            <h2>Sorry! Page Not Found.</h2>
            <p>The page you are looking for was moved, removed, renamed or never existed. we are open for this constructions &amp; architecture.</p>
            <Link className="primary-btn1" href="/">
              <span>Take Me Home
              </span>
              <span>Take Me Home
              </span>
              <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                  <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                </g>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  )
}

export default notfound

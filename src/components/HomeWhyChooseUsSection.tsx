"use client";

import Link from 'next/link'
import React from 'react'
import { Accordion } from 'react-bootstrap'

const HomeWhyChooseUsSection: React.FC = () => {
    return (
        <>
            <div className="home2-why-choose-us-section mb-120">
                <div className="container">
                    <div className="row g-4 align-items-center justify-content-between mb-60">
                        <div className="col-xl-6 col-lg-8 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                            <div className="section-title two">
                                
                                <h2>Why We’re the Right Choice Industry</h2>
                            </div>
                        </div>
                        {/* <div className="col-lg-3 d-flex justify-content-lg-end btn_wrapper">
                          <Link className="primary-btn3" href="/about">
                                    <span>About Us More
                                    </span>
                                    <span>About Us More
                                    </span>
                                    <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                                        <g>
                                            <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                                            <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                                        </g>
                                    </svg>
                                </Link>
                            
                        </div> */}
                    </div>
                    <div className="row justify-content-xl-end">
                        <div className="col-xl-11">
                            <div className="faq-content">
                               <div className="row justify-content-xl-end">
      <div className="col-xl-11">
        <div className="faq-content">
          <Accordion defaultActiveKey="0">
            {/* 01 */}
            <Accordion.Item
              eventKey="0"
              className="wow animate fadeInDown"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              <Accordion.Header>
                <span>01.</span> Proven Operational Expertise
              </Accordion.Header>
              <Accordion.Body>
                <img
                  width={283}
                  height={171}
                  src="/assets/new-images/about-page/Choice-Industry/pc-1.jpg"
                  alt="choose-img1"
                />
                Decades of hands-on experience enable us to manage large volumes efficiently without compromising speed or accuracy.
              </Accordion.Body>
            </Accordion.Item>

            {/* 02 */}
            <Accordion.Item
              eventKey="1"
              className="wow animate fadeInDown"
              data-wow-delay="400ms"
              data-wow-duration="1500ms"
            >
              <Accordion.Header>
                <span>02.</span> Structured Workflow Systems
              </Accordion.Header>
              <Accordion.Body>
                <img
                  width={283}
                  height={171}
                  src="/assets/new-images/about-page/Choice-Industry/pc-2.jpg"
                  alt="choose-img2"
                />
                Our clearly defined processes ensure smooth coordination from material sourcing to final site delivery.
              </Accordion.Body>
            </Accordion.Item>

            {/* 03 */}
            <Accordion.Item
              eventKey="2"
              className="wow animate fadeInDown"
              data-wow-delay="600ms"
              data-wow-duration="1500ms"
            >
              <Accordion.Header>
                <span>03.</span> Quality-First Execution
              </Accordion.Header>
              <Accordion.Body>
                <img
                  width={283}
                  height={171}
                  src="/assets/new-images/about-page/Choice-Industry/pc-3.jpg"
                  alt="choose-img3"
                />
              Every stage of our workflow follows strict quality checks, ensuring only certified and reliable materials reach your project.
              </Accordion.Body>
            </Accordion.Item>

            {/* 04 */}
            <Accordion.Item
              eventKey="3"
              className="wow animate fadeInDown"
              data-wow-delay="800ms"
              data-wow-duration="1500ms"
            >
              <Accordion.Header>
                <span>04.</span> Logistics-Driven Efficiency
              </Accordion.Header>
              <Accordion.Body>
                <img
                  width={283}
                  height={171}
                  src="/assets/new-images/about-page/Choice-Industry/pc-4.jpg"
                  alt="choose-img4"
                />
                Integrated logistics planning and crane-assisted operations help reduce delays and keep construction schedules on track.
              </Accordion.Body>
            </Accordion.Item>

            {/* 05 */}
            <Accordion.Item
              eventKey="4"
              className="wow animate fadeInDown"
              data-wow-delay="1000ms"
              data-wow-duration="1500ms"
            >
              <Accordion.Header>
                <span>05.</span> Reliability at Scale
              </Accordion.Header>
              <Accordion.Body>
                <img
                  width={283}
                  height={171}
                  src="/assets/new-images/about-page/Choice-Industry/pc-5.jpg"
                  alt="choose-img5"
                />
               Whether for small orders or large projects, our workflow is built to deliver consistent performance and dependable supply.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomeWhyChooseUsSection

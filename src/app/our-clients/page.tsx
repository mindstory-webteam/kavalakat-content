import FooterTop from '@/components/FooterTop'
import HomepageBlogSection from '@/components/HomepageBlogSection'
import InnerPageHeader from '@/components/InnerPageHeader'
import React from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'

const page = () => {
    return (
        <>
            <InnerPageHeader />
            <Breadcrumb title="Our Projects" subtitle="Trusted By Leading Industry Partners Relationships."  image='/assets/new-images/bm/bm-2.jpeg'/>

            <div className="our-client-page pt-120 mb-120" id="scroll-section">
                <div className="container-fluid">
                    <div className="section-title two text-center mb-80">
                        <h2>Our Global Client</h2>
                    </div>
                    <div className="row g-xl-4 g-lg-3 g-4">
                        <div className="col-lg-4 d-lg-block d-none wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                            <div className="our-client-img-area">
                                <Image width={540} height={7750} src="/assets/new-images/clints/clint-b-1.jpeg" alt="" />
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="row g-xl-4 g-lg-3 g-4 gy-md-5">
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/1 (1).jpg" alt="" />
                                        <span>www.qzency.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/10.jpg" alt="" />
                                        <span>www.vernex.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="400ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/11.jpg" alt="" />
                                        <span>www.physical.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="500ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/12.jpg" alt="" />
                                        <span>www.qzency.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="600ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/14.jpg" alt="" />
                                        <span>www.vernex.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="700ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/15.jpg" alt="" />
                                        <span>www.physical.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="800ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/16.jpg" alt="" />
                                        <span>www.qzency.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="800ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/16.jpg" alt="" />
                                        <span>www.vernex.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="700ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/17.jpg" alt="" />
                                        <span>www.physical.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="600ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/18.jpg" alt="" />
                                        <span>www.qzency.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="500ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/19.jpg" alt="" />
                                        <span>www.vernex.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="400ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/2 (2).jpg" alt="" />
                                        <span>www.physical.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/20.jpg" alt="" />
                                        <span>www.egenslab.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/21.jpg" alt="" />
                                        <span>www.egenstheme.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/3 (2).jpg" alt="" />
                                        <span>www.egenslab.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/4 (1).jpg" alt="" />
                                        <span>www.egenslab.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="400ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/5 (1).jpg" alt="" />
                                        <span>www.egenstheme.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="500ms" data-wow-duration="1500ms">
                                    <div className="client-card magnetic-item">
                                        <Image width={120} height={50} src="/assets/new-images/clints/6.jpg" alt="" />
                                        <span>www.egenslab.com</span>
                                        <svg width={35} height={35} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z" />
                                            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <HomepageBlogSection />


            <FooterTop />
            <Footer1 />
        </>
    )
}

export default page

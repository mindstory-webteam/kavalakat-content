import React from 'react'
import CircularText from '../components/common/CircularText'
import Link from 'next/link'

type BreadcrumbProps = {
    title: string;
    subtitle: string;
};
const Breadcrumb = ({ title, subtitle }: BreadcrumbProps) => {
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

                {/* <CircularText /> */}
                {/* <img
                width={92}
                height={92}
                    src="/assets/img/innerpages/breadcrumb-section-vector.svg"
                    alt="breadcrumb vector"
                    className="vector"
                /> */}
            </div>
            <div className="breadcrumb-img">
               <img
                width={1920}
                height={550}src="/assets/new-images/about-page/banner/b-1.jpeg" alt="breadcrumb image" />
            </div>
        </div>
    )
}

export default Breadcrumb

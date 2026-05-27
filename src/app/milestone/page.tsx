
import FooterTop from '@/components/FooterTop'
import Footer1 from '@/components/Footer'
import InnerPageHeader from '@/components/InnerPageHeader'

import MilestoneSection from '@/components/Milestonesection'

import React  from "react";

import Image from 'next/image';
import Breadcrumb from '@/components/common/Breadcrumb';

import HomeProcessSection from '@/components/HomeProcessSection';
import { Milestone } from 'lucide-react';


const OurProcessPage:React.FC = () => {

    return (
        <>
            <InnerPageHeader />
            <Breadcrumb title="Our Milestones" subtitle="Our Process Flow Step From Concept To Execution" image='/assets/new-images/bm/bm-1.png' />
            
<MilestoneSection />

            <FooterTop />
            <Footer1 />
        </>
    )
}

export default OurProcessPage

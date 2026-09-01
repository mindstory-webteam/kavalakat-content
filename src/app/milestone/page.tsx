import FooterTop from '@/components/FooterTop'
import Footer1 from '@/components/Footer'
import InnerPageHeader from '@/components/InnerPageHeader'

import MilestoneSection from '@/components/Milestonesection'

import React from "react";
import type { Metadata } from 'next';

import Image from 'next/image';
import Breadcrumb from '@/components/common/Breadcrumb';

import HomeProcessSection from '@/components/HomeProcessSection';
import { Milestone } from 'lucide-react';

export const metadata: Metadata = {
  title: "Our Milestones | Kavalakat's Journey Since 1975",
  description:
    "From a single cement shop in 1976 to Kerala's leading multi-division construction material group - explore Kavalakat's key milestones.",
  alternates: {
    canonical: "https://www.kavalakat.com/milestone",
  },
  openGraph: {
    title: "Our Milestones | Kavalakat's Journey Since 1975",
    description:
      "From a single cement shop in 1976 to Kerala's leading multi-division construction material group - explore Kavalakat's key milestones.",
    url: "https://www.kavalakat.com/milestone",
    siteName: "Kavalakat",
    type: "website",
  },
};

const OurProcessPage: React.FC = () => {
  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title="Our Milestones"
        subtitle="Our Achievements Built on Trust and Quality"
        image="/assets/new-images/new-images/about-imges/mailstone.webp"
      />

      <MilestoneSection />

      <FooterTop />
      <Footer1 />
    </>
  );
}

export default OurProcessPage
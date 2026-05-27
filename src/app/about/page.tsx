// about/page.tsx
import React from "react";
import InnerPageHeader from "@/components/InnerPageHeader";
import Breadcrumb from "@/components/common/Breadcrumb";
import HomePageAboutSection from "@/components/HomePageAboutSection";
import HomeWhyChooseUsSection from "@/components/HomeWhyChooseUsSection";
import HomePageAboutFeatureSection from "@/components/HomePageAboutFeatureSection";
import HomaPageVideoSection from "@/components/HomaPageVideoSection";
import HomePageCounterSection from "@/components/HomePageCounterSection";
import HomePageTeamSection from "@/components/HomePageTeamSection";
import HomepageBlogSection from "@/components/HomepageBlogSection";
import FooterTop from "@/components/FooterTop";
import Footer from "@/components/Footer";
import MilestoneSection from "@/components/Milestonesection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Kavalakat Group | 50 Years of Construction Material Excellence in Kerala",
  description: "Learn how Kavalakat Group grew from a cement trading shop in 1975 to Kerala's leading multi-division construction material supplier with 245 employees and 440+ retailers.",
 
};



const AboutPage: React.FC = () => {
  return (
    <>
      <InnerPageHeader />
            <Breadcrumb title="About Us" subtitle="Our Story of Excellence Built on."  image="/assets/new-images/about-page/banner/b-1.jpeg"  />
            <HomePageAboutSection />
            <HomeWhyChooseUsSection />
            <HomePageAboutFeatureSection />
             <HomaPageVideoSection />
      <HomePageCounterSection />
     
      <HomePageTeamSection />
      <HomepageBlogSection />
      <FooterTop />
      <Footer />

     
    </>
  );
};

export default AboutPage;

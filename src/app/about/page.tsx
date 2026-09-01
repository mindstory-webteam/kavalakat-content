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
  title: "About Kavalakat | 50 Years of Trusted Material Supply in Kerala",
  description:
    "Kavalakat Group grew from a 1975 cement trading shop into Kerala's leading construction material distributor, serving 770+ retailers statewide.",
  alternates: {
    canonical: "https://www.kavalakat.com/about",
  },
  openGraph: {
    title: "About Kavalakat | 50 Years of Trusted Material Supply in Kerala",
    description:
      "Kavalakat Group grew from a 1975 cement trading shop into Kerala's leading construction material distributor, serving 770+ retailers statewide.",
    url: "https://www.kavalakat.com/about",
    siteName: "Kavalakat",
    type: "website",
  },
};

const AboutPage: React.FC = () => {
  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title="About Us"
        subtitle="Our Story of Excellence is Built on Trust, Quality, and Lasting Relationships."
        image="/assets/new-images/new-images/about-bm.webp"
      />
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
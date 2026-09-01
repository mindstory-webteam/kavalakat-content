import type { Metadata } from 'next';
import React from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import HomeAboutSection from '../components/HomeAboutSection';
import HomeServiceSection from '@/components/HomeServiceSection';
import HomePageFeatureSection from '@/components/HomePageFeatureSection';
import HomeVideoSection from '@/components/HomeVideoSection';
import HomePageProjectSection from '@/components/HomePageProjectSection';
import HomeLogoSection from '@/components/HomeLogoSection';
import HomeTestimonialSection from '@/components/HomeTestimonialSection';
import HomeContactSection from '@/components/HomeContactSection';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import KavakalatPreloader from '@/components/common/KavakalatPreloader';

export const metadata: Metadata = {
  title: 'Kavalakat | TMT Steel & Cement Supplier in Kerala Since 1975',
  description:
    "Kerala's trusted construction material supplier since 1975. TMT steel, cement, paints & construction chemicals delivered pan-Kerala. Get a quote today.",
  alternates: {
    canonical: 'https://www.kavalakat.com/',
  },
  openGraph: {
    title: 'Kavalakat | TMT Steel & Cement Supplier in Kerala Since 1975',
    description:
      "Kerala's trusted construction material supplier since 1975. TMT steel, cement, paints & construction chemicals delivered pan-Kerala. Get a quote today.",
    url: 'https://www.kavalakat.com/',
    siteName: 'Kavalakat',
    type: 'website',
  },
};

export default function Home() {
  return (
    <>
      {/* <KavakalatPreloader/> */}
      <Header />

      <Banner />

      <HomeAboutSection />

      <HomeServiceSection />
      <HomePageFeatureSection />

      <HomePageProjectSection />
      <HomeVideoSection />

      <HomeTestimonialSection />
      <HomeContactSection />
      {/* <HomeLogoSection /> */}
      <Footer />

      <ChatbotWidget
        brandColor="#0077be"
        brandName="Kavalakat AI"
        companyName="Kavalakat"
        whatsappNumber="+919946101649"
        phoneNumber="0487 244 0380"
        email="info@kavalakat.com"
      />
    </>
  );
}
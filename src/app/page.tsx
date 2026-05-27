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

export default function Home() {
  return (
    <>
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
        apiEndpoint="/api/chat"
        brandColor="#6366f1"
        brandName="AI Assistant"
        brochureUrl="/Kavalakat.pdf"   
      />
    </>
  );
}

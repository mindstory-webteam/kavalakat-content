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
  brandColor="#0077be"
  brandName="Kavalakat AI"
  companyName="Kavalakat"
  whatsappNumber="916238000000"
  phoneNumber="0487 244 0380"
  email="contact@kavalakat.com"
/>
    </>
  );
}

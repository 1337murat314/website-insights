import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedDishes from "@/components/home/FeaturedDishes";
import StorySection from "@/components/home/StorySection";
import FeaturesSection from "@/components/home/FeaturesSection";
import GalleryPreview from "@/components/home/GalleryPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedDishes />
      <StorySection />
      <FeaturesSection />
      <GalleryPreview />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
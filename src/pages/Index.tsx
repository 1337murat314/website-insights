import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedDishes from "@/components/home/FeaturedDishes";
import StorySection from "@/components/home/StorySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GalleryPreview from "@/components/home/GalleryPreview";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedDishes />
      <StorySection />
      <GalleryPreview />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
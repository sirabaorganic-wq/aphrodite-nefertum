import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CollectionsSection } from '@/components/CollectionsSection';
import { ClimateSection } from '@/components/ClimateSection';
import { JournalSection } from '@/components/JournalSection';
import { BrandPhilosophy } from '@/components/BrandPhilosophy';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';

export default function Page() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <CollectionsSection />
      <ClimateSection />
      <JournalSection />
      <BrandPhilosophy />
      <Testimonials />
      <Footer />
    </main>
  );
}

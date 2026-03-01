import { HeroSection } from "@/components/hero-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CharactersSection } from "@/components/characters-section"
import { FeaturesSection } from "@/components/features-section"
import { CommunitySection } from "@/components/community-section"
import { QASection } from "@/components/qa-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TestimonialsSection />
      <CharactersSection />
      <FeaturesSection />
      <CommunitySection />
      <QASection />
      <CTASection />
      <Footer />
    </main>
  )
}

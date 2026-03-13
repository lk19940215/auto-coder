<template>
  <div class="min-h-screen hero-bg">
    <Header />
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'
import HeroSection from '../components/home/HeroSection.vue'
import FeaturesSection from '../components/home/FeaturesSection.vue'
import HowItWorks from '../components/home/HowItWorks.vue'
import CTASection from '../components/home/CTASection.vue'
</script>

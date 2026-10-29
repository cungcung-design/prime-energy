import { Discovery } from "@/components/home/discovery";
import { Dna } from "@/components/home/dna";
import { Flavors } from "@/components/home/flavors";
import { Formula } from "@/components/home/formula";
import { Hero } from "@/components/home/hero";
import { Newsletter } from "@/components/home/newsletter";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Flavors />
        <Dna />
        <Formula />
        <Discovery />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

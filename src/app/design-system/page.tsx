// src/app/page.tsx
import { ColorPalette } from "./components/color-pallete";
import { TypographyShowcase } from "./components/typography";
import { ButtonShowcase } from "./components/button-showcase";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#EAEAEA] p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Design System */}
        <div className="mb-10 border-b border-neutral-300 pb-6">
          <h1 className="text-4xl font-bold text-secondary-900 flex items-center gap-3">
            <span className="text-primary-500">❖</span> Crimson Admin
          </h1>
          <p className="text-secondary-500 mt-2">
            Design System & Component Library
          </p>
        </div>

        {/* Section 1: Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            1. Colors
          </h2>
          <ColorPalette />
        </section>

        {/* Section 2: Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            2. Typography
          </h2>
          <TypographyShowcase />
        </section>

        {/* Section 3: Button */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            3. Buttons
          </h2>
          <ButtonShowcase />
        </section>
      </div>
    </div>
  );
}

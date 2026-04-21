import { ColorPalette } from "./components/color-pallete";
import { TypographyShowcase } from "./components/typography";
import { ButtonShowcase } from "./components/button-showcase";
import { FormInputShowcase } from "./components/input-showcase";
import { BadgeShowcase } from "./components/badge-showcase";
import { AppTable } from "./components/member-table";
import { FormCardShowcase } from "./components/form-card-showcase";
import { FilterPopupShowcase } from "./components/filter-popup-showcase";

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

        {/* Section 3: Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            3. Buttons
          </h2>
          <ButtonShowcase />
        </section>

        {/* Section 4: Input Fields */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            4. Input Fields
          </h2>
          <FormInputShowcase />
        </section>

        {/* Section 5: Badges */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            5. Badges
          </h2>
          <BadgeShowcase />
        </section>

        {/* Section 6: Data Tables */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            6. Data Tables
          </h2>
          <div className="w-full">
            <AppTable />
          </div>
        </section>

        {/* Section 7: Form Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            7. Form Card
          </h2>
          <FormCardShowcase />
        </section>

        {/* Section 8: Filter Popup */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            8. Filter Popup
          </h2>
          <FilterPopupShowcase />
        </section>
      </div>
    </div>
  );
}

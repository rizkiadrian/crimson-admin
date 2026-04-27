import { ColorPalette } from "./components/color-pallete";
import { TypographyShowcase } from "./components/typography";
import { ButtonShowcase } from "./components/button-showcase";
import { FormInputShowcase } from "./components/input-showcase";
import { FormSelectShowcase } from "./components/form-select-showcase";
import { BadgeShowcase } from "./components/badge-showcase";
import { AppTable } from "./components/member-table";
import { FormCardShowcase } from "./components/form-card-showcase";
import { FilterPopupShowcase } from "./components/filter-popup-showcase";
import { ConfirmDialogShowcase } from "./components/confirm-dialog-showcase";
import { DetailCardShowcase } from "./components/detail-card-showcase";
import { SearchInputShowcase } from "./components/search-input-showcase";
import { EmptyStateShowcase } from "./components/empty-state-showcase";
import { StatCardShowcase } from "./components/stat-card-showcase";
import { ChartShowcase } from "./components/chart-showcase";
import { ChartCardShowcase } from "./components/chart-card-showcase";
import { NotificationShowcase } from "./components/notification-showcase";
import { ActivityCardShowcase } from "./components/activity-card-showcase";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#EAEAEA] p-8 md:p-12 font-sans">
      <main className="max-w-7xl mx-auto space-y-12">
        {/* Header Design System */}
        <div className="mb-10 border-b border-neutral-300 pb-6">
          <h1 className="text-4xl font-bold text-secondary-900 flex items-center gap-3">
            <span className="text-primary-500">❖</span> Crimson Admin
          </h1>
          <p className="text-secondary-700 mt-2">
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

        {/* Section 4: Input & Select Fields */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            4. Input & Select Fields
          </h2>
          <div className="flex flex-col gap-8">
            <FormInputShowcase />
            <FormSelectShowcase />
          </div>
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

        {/* Section 9: Confirm Dialog */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            9. Confirm Dialog
          </h2>
          <ConfirmDialogShowcase />
        </section>

        {/* Section 10: Detail Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            10. Detail Card
          </h2>
          <DetailCardShowcase />
        </section>

        {/* Section 11: Search Input */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            11. Search Input
          </h2>
          <SearchInputShowcase />
        </section>

        {/* Section 12: Table Empty State */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            12. Table Empty State
          </h2>
          <EmptyStateShowcase />
        </section>

        {/* Section 13: Stat Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            13. Stat Card
          </h2>
          <StatCardShowcase />
        </section>

        {/* Section 14: Charts */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            14. Charts
          </h2>
          <ChartShowcase />
        </section>

        {/* Section 14: Chart Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            15. Chart Card
          </h2>
          <ChartCardShowcase />
        </section>

        {/* Section 16: Notification System */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            16. Notification System
          </h2>
          <NotificationShowcase />
        </section>

        {/* Section 17: Activity Card & Timeline */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-800">
            17. Activity Card & Timeline
          </h2>
          <ActivityCardShowcase />
        </section>
      </main>
    </div>
  );
}

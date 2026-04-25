import React from "react";
import { Text } from "@app/components/ui/Text";
import { Badge } from "@app/components/ui/Table";
import {
  DetailCard,
  DetailCardHeader,
  DetailCardBody,
  DetailSection,
  DetailField,
  DetailFieldGrid,
  DetailImageGrid,
} from "@app/components/ui/DetailCard";

export function DetailCardShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Full DetailCard example */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Complete Detail Card
          </Text>
        </div>

        <div className="w-full">
          <DetailCard>
            <DetailCardHeader
              title="Agus Setiawan"
              description="Cleaning Service"
              badge="Approved"
              badgeVariant="success"
            />

            <DetailCardBody>
              <DetailSection title="Account Information">
                <DetailFieldGrid columns={3}>
                  <DetailField label="Full Name" value="Agus Setiawan" />
                  <DetailField label="Email" value="agus@example.com" />
                  <DetailField label="Phone" value="628921021234" />
                  <DetailField
                    label="Status"
                    value={
                      <Badge variant="success" showDot={false}>
                        Verified
                      </Badge>
                    }
                  />
                  <DetailField
                    label="Online"
                    value={
                      <Badge variant="neutral" showDot={false}>
                        Offline
                      </Badge>
                    }
                  />
                  <DetailField label="Joined" value="25 Maret 2026" />
                </DetailFieldGrid>
              </DetailSection>

              <DetailSection title="Profile Details">
                <DetailFieldGrid columns={3}>
                  <DetailField label="NIK" value="3201012345678903" />
                  <DetailField label="Category" value="Cleaning Service" />
                  <DetailField
                    label="Address"
                    value="Jl. Sudirman No. 45, Bekasi Raya"
                    className="md:col-span-2 lg:col-span-3"
                  />
                </DetailFieldGrid>
              </DetailSection>

              <DetailSection title="Documents">
                <DetailImageGrid
                  images={[
                    { label: "Profile Photo", src: null },
                    { label: "KTP Photo", src: null },
                    { label: "Selfie with KTP", src: null },
                    { label: "SKCK Document", src: null },
                  ]}
                  columns={4}
                />
              </DetailSection>
            </DetailCardBody>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

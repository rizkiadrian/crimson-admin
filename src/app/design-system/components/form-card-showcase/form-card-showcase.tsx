import React from "react";
import { Text } from "@app/components/ui/Text";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { Check } from "lucide-react";

export function FormCardShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Full FormCard example */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Complete Form Card
          </Text>
        </div>

        <div className="w-full max-w-3xl">
          <FormCard>
            <FormCardHeader
              title="Create New Record"
              description="Fill in the required information below to create a new entry."
              badge="Draft"
            />

            <FormCardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput
                  id="ds-name"
                  label="Full Name"
                  placeholder="e.g. Alexander Sterling"
                />
                <FormInput
                  id="ds-email"
                  label="Email Address"
                  placeholder="alexander.s@vanguard.com"
                  type="email"
                />
                <FormInput
                  id="ds-phone"
                  label="Phone Number"
                  placeholder="+62 818 2012 4123"
                  format="phone"
                />
                <FormInput
                  id="ds-password"
                  label="Password"
                  placeholder="Set initial password"
                  type="password"
                />
              </div>
            </FormCardBody>

            <FormCardFooter>
              <Button
                variant="ghost"
                className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-6 font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-8 shadow-md shadow-primary-200/60"
              >
                <Check size={16} strokeWidth={2.5} className="mr-2" />
                Save Record
              </Button>
            </FormCardFooter>
          </FormCard>
        </div>
      </div>
    </div>
  );
}

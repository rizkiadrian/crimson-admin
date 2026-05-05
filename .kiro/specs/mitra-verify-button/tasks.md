# Tasks: Mitra Verify Button

## Task 1: Add Service Layer Function

- [x] 1.1 Add `MitraVerificationStatus` type alias to `src/services/backoffice/mitra-members/mitra-members.types.ts`
  - Extract `"pending" | "approved" | "rejected" | "suspended"` as a named type
  - Update `IMitraProfile.verification_status` to use the new type alias
- [x] 1.2 Add `mitraMembersUpdateVerificationStatus` function to `src/services/backoffice/mitra-members/mitra-members.service.ts`
  - Function signature: `(id: number, status: MitraVerificationStatus) => Promise<IApiResponse<IMitraUser>>`
  - Calls `api.patch(\`/backoffice/mitra-members/${id}/verification-status\`, { verification_status: status })`
  - Import `MitraVerificationStatus` from types file

## Task 2: Add Verify Button to Mitra Table Actions

- [x] 2.1 Update `MitraActions` component props in `src/app/(dashboard)/dashboard/mitra-members/_partials/mitra-table/mitra-table.tsx`
  - Add `verificationStatus: string` prop to `MitraActions`
  - Import `ShieldCheck` from `lucide-react`
- [x] 2.2 Add `handleVerify` function to `MitraActions` component
  - Call `showConfirm` with title: "Approve Mitra Verification?", description explaining status change to approved
  - Set `confirmLabel: "Approve"`, `cancelLabel: "Batal"`
  - In `onConfirm`: call `mitraMembersService.mitraMembersUpdateVerificationStatus(memberId, "approved")`
  - On success: `showNotification(resp.message, "success")` then `onDeleted()` to refetch
  - On error: `showNotification(apiError.message || "Gagal memverifikasi mitra", "error")` then `throw err`
- [x] 2.3 Add verify button JSX to `MitraActions` render
  - Conditionally render when `verificationStatus === "pending"`
  - Use `Button` with `variant="ghost"`, `size="icon"`
  - Apply className: `"h-auto w-auto p-2 rounded-lg hover:text-success-600 hover:bg-success-50 hover:border-transparent"`
  - Set `aria-label="Verify"`, `onClick={handleVerify}`
  - Render `<ShieldCheck size={16} />` as child
  - Place before the View button in the actions row
- [x] 2.4 Update the `actions` column definition in `getColumns` to pass `verificationStatus` to `MitraActions`
  - Pass `member.mitra?.verification_status || ""` as the `verificationStatus` prop

## Task 3: Add Verify Button to Mitra Detail Page

- [x] 3.1 Add verify button and handler to `src/app/(dashboard)/dashboard/mitra-members/[id]/page.tsx`
  - Import `ShieldCheck` from `lucide-react`
  - Import `useConfirmStore` from `@store/useConfirmStore`
  - Import `useNotificationStore` from `@store/useNotificationStore`
  - Import `mitraMembersService` (already imported)
  - Add `handleVerify` function with same confirm flow as table (same title, description, confirmLabel, cancelLabel)
  - On success: `showNotification(resp.message, "success")` then `refetch()`
  - On error: `showNotification(apiError.message || "Gagal memverifikasi mitra", "error")` then `throw err`
- [x] 3.2 Add verify button to `DetailCardHeader` actions area
  - Conditionally render when `verificationStatus === "pending"`
  - Use `Button` with `variant="ghost"`, `size="sm"`, className with success hover styling
  - Set `aria-label="Verify"`, `onClick={handleVerify}`
  - Render `<ShieldCheck size={14} />` icon and "Verify" text
  - Place before the Back button or after the Edit button in the actions div

## Task 4: Verify TypeScript Compilation

- [x] 4.1 Run `npx tsc --noEmit` to verify no type errors in modified files
  - Fix any type errors that arise from the changes

## Task 5: Update Documentation

- [x] 5.1 Update `lingkar-crm/docs/PRD.md`
  - Add Mitra Verify Button feature entry under the Mitra Members module (FM-03)
  - Document the verify/approve action with acceptance criteria reference
- [x] 5.2 Update `lingkar-crm/README.md`
  - Add Mitra verification feature to the features list if applicable
- [x] 5.3 Update `lingkar-crm/docs/ARCHITECTURE.md`
  - Document the new service function and data flow if architecture docs exist
- [x] 5.4 Update `lingkar-id-backend/README.md`
  - Ensure the `PATCH /backoffice/mitra-members/{id}/verification-status` endpoint is documented in the API Endpoints table
- [x] 5.5 Update `lingkar-id-backend/CLAUDE.md`
  - Ensure the Mitra verification endpoint is listed in the API Modules table

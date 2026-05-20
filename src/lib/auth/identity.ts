// Placeholder identity layer.
// Clerk was removed during the open-portal testing phase. This stub exposes
// the minimum shape the AppShells expected from `useUser`/`useClerk` so
// avatars, names, and the sign-out menu item keep rendering without auth.
// Replace this with the magic-link session reader once that ships.

import { useRouter } from "next/navigation";
import { member } from "@/lib/memberData";
import { vendor } from "@/lib/vendorData";

export type PlaceholderIdentity = {
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
};

export function useMemberIdentity(): PlaceholderIdentity {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    initials: member.avatarInitials,
  };
}

export function useVendorIdentity(): PlaceholderIdentity {
  const first = vendor.contactName.split(" ")[0] ?? vendor.displayName;
  const last = vendor.contactName.split(" ").slice(1).join(" ") || "";
  return {
    firstName: first,
    lastName: last,
    email: vendor.contactEmail,
    initials: vendor.avatarInitials,
  };
}

export function useAdminIdentity(): PlaceholderIdentity {
  return {
    firstName: "Team",
    lastName: "Admin",
    email: "team@dentalmembernetwork.com",
    initials: "TA",
  };
}

// Sign-out clears the vendor session cookie (if present) and routes the user
// to a sensible "logged out" destination. Vendors → /vendor/login (so they can
// sign back in). Members + admins → /. Member and admin portals have no real
// session yet, but the destination is still right.
type SignOutTarget = "vendor" | "member" | "admin";

export function useSignOut(target: SignOutTarget = "member") {
  const router = useRouter();
  return async () => {
    try {
      await fetch("/api/vendor/login", { method: "DELETE" });
    } catch {
      // ignore — preview only, just route anyway
    }
    router.push(target === "vendor" ? "/vendor/login" : "/");
  };
}

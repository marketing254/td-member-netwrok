import { Suspense } from "react";
import ThanksClient from "./ThanksClient";

export const metadata = {
  title: "You're on the list · Thriving Dentist Network",
  description:
    "Welcome to the founding waitlist. Come back daily to unlock what we've been building behind the doors.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ThanksClient />
    </Suspense>
  );
}

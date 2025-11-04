import { redirect } from "next/navigation";

export default function WizardPage() {
  redirect("/wizard/step-0");
}

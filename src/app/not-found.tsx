import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="relative grid flex-1 place-items-center overflow-hidden px-6 py-24 text-center">
      <div className="hairline-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]" />
      <div className="relative">
        <div className="mx-auto w-fit opacity-80">
          <LogoMark size={44} />
        </div>
        <div className="mt-6 font-mono text-sm text-fg-3">404 · no signal</div>
        <h1 className="text-title mt-2 text-3xl sm:text-4xl">This node never reported in.</h1>
        <p className="mx-auto mt-3 max-w-md text-fg-2">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <ButtonLink href="/" className="mt-8">
          <ArrowLeft size={16} /> Back to overview
        </ButtonLink>
      </div>
    </div>
  );
}

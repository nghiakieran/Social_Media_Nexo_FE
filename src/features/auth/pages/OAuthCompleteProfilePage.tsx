import { OAuthCompleteProfileForm } from "../components/OAuthCompleteProfileForm";

export const OAuthCompleteProfilePage = () => {
  return (
    <div className="flex min-h-0 w-full max-h-full">
      <div className="max-h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-5 shadow-medium backdrop-blur-xl ring-1 ring-border/30 sm:rounded-[1.5rem] sm:p-7">
        <OAuthCompleteProfileForm />
      </div>
    </div>
  );
};

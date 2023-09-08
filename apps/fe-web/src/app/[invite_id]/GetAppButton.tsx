"use client";

import { Button } from "../../components/Button";

function iOS() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export function InviteCode({ invite_id }: { invite_id: string }) {
  async function onGetApp() {
    await navigator.clipboard.writeText("https://moviepals.io/" + invite_id);

    if (iOS()) {
      window.location.href =
        "https://apps.apple.com/us/app/moviepals-watch-together/id6461212763";
    } else {
      window.location.href =
        "https://play.google.com/store/apps/details?id=io.moviepals";
    }
  }

  return (
    <div className="justify-center">
      <div className="font-secondary text-brand-1 text-sm text-center">
        Your invite code
      </div>
      <div className="py-2 mt-2 bg-brand-1-20 text-center text-brand-1 -mx-8 tracking-widest font-secondary text-3xl">
        {invite_id}
      </div>

      <Button className="mt-7" onPress={onGetApp}>Accept the invite</Button>
    </div>
  );
}

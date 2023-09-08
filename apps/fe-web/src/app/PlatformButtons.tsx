"use client";

import { Button } from "../components/Button";

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

export function PlatformButtons() {
  async function onGetIOS() {
    window.location.href =
      "https://apps.apple.com/us/app/moviepals-watch-together/id6461212763";
  }

  async function onGetAndroid() {
    window.location.href =
      "https://play.google.com/store/apps/details?id=io.moviepals";
  }

  return (
    <div className="justify-center">
      {iOS() ? (
        <>
          <Button onPress={onGetIOS}>Get on IOS</Button>

          <Button outline className="mt-2" onPress={onGetAndroid}>
            Get on Android
          </Button>
        </>
      ) : (
        <>
          <Button onPress={onGetIOS}>Get on Android</Button>

          <Button outline className="mt-2" onPress={onGetAndroid}>
            Get on IOS
          </Button>
        </>
      )}
    </div>
  );
}

import DeviceInfo from "react-native-device-info";

let agent: string | null = null;

export async function sendPageView(screen: string) {
  if (!agent) {
    agent = await DeviceInfo.getUserAgent();
  }

  fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": agent,
    },
    body: JSON.stringify({
      name: "pageview",
      domain: "moviepals.io",
      url: screen ? "https://moviepals.io/" + screen : "https://moviepals.io",
    }),
  });
}

export async function sendEvent(name: string, screen?: string) {
  if (!agent) {
    agent = await DeviceInfo.getUserAgent();
  }

  fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": agent,
    },
    body: JSON.stringify({
      name,
      domain: "moviepals.io",
      url: screen ? "https://moviepals.io/" + screen : "https://moviepals.io",
    }),
  });
}

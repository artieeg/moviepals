import DeviceInfo from "react-native-device-info";

let agent: string | null = null;

const domain = "moviepals.io";

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
      domain: domain,
      url: `https://${domain}`,
    }),
  });
}

export async function sendEvent(name: string) {
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
      domain,
      url: `https://${domain}`,
    }),
  });
}

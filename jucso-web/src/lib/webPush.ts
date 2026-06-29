import { jucsoApi } from "@/api/jucsoApi";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function canUseWebPush(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function subscribeToWebPush(): Promise<boolean> {
  if (!canUseWebPush()) return false;

  try {
    const { public_key: publicKey } = await jucsoApi.getPushPublicKey();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await jucsoApi.subscribePush(subscription.toJSON());
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromWebPush(): Promise<void> {
  if (!canUseWebPush()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await jucsoApi.unsubscribePush(subscription.endpoint);
    await subscription.unsubscribe();
  }
}

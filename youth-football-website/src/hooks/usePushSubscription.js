import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSubscribePushMutation } from "../redux/achievementsApi.js";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function usePushSubscription() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [subscribePush] = useSubscribePushMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !VAPID_PUBLIC_KEY || attempted.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    attempted.current = true;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        const { endpoint, keys } = subscription.toJSON();
        await subscribePush({ endpoint, keys });
      } catch {
        // push subscription is best-effort
      }
    })();
  }, [isAuthenticated, subscribePush]);
}

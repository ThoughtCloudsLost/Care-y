let dismissed = false;

export function dismissSplash(): void {
  if (dismissed) return;
  dismissed = true;

  document.body.classList.add("hydrated");
  const splash = document.getElementById("splash");
  if (splash) {
    splash.addEventListener(
      "transitionend",
      () => {
        splash.remove();
      },
      { once: true },
    );
  }
}

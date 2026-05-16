"use client";

const GOOGLE_DRIVE_LOADING_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Connecting to Google Drive...</title>
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, #f7f9fc 0%, #edf3ff 100%);
        color: #14213d;
        font-family: Arial, sans-serif;
      }

      main {
        width: min(420px, calc(100vw - 48px));
        padding: 32px 28px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 20px 45px rgba(20, 33, 61, 0.16);
        text-align: center;
      }

      .spinner {
        width: 42px;
        height: 42px;
        margin: 0 auto 20px;
        border: 4px solid rgba(20, 33, 61, 0.14);
        border-top-color: #2563eb;
        border-radius: 999px;
        animation: spin 0.8s linear infinite;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 20px;
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: #4b5563;
        font-size: 14px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="spinner" aria-hidden="true"></div>
      <h1>Connecting to Google Drive...</h1>
      <p>Please wait while we finish the upload and open your file in Drive.</p>
    </main>
  </body>
</html>`;

export function renderGoogleDriveLoadingWindow(
  popupWindow: Window | null,
): Window | null {
  if (!popupWindow || popupWindow.closed) {
    return null;
  }

  try {
    popupWindow.document.open();
    popupWindow.document.write(GOOGLE_DRIVE_LOADING_HTML);
    popupWindow.document.close();
  } catch {
    // Ignore document write failures and fall back to navigating the popup later.
  }

  return popupWindow;
}

export function openGoogleDriveLoadingWindow(): Window | null {
  const popupWindow = window.open("", "_blank");
  if (!popupWindow) {
    return null;
  }

  return renderGoogleDriveLoadingWindow(popupWindow);
}

export function navigateGoogleDriveWindow(
  popupWindow: Window | null,
  nextUrl: string,
): void {
  if (popupWindow && !popupWindow.closed) {
    popupWindow.location.replace(nextUrl);
    popupWindow.focus();
    return;
  }

  window.open(nextUrl, "_blank", "noopener,noreferrer");
}

export function closeGoogleDriveWindow(popupWindow: Window | null): void {
  if (popupWindow && !popupWindow.closed) {
    popupWindow.close();
  }
}

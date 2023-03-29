console.info('chrome-ext chrome-element-inspector content script');

import Inspector from './Inspector';

let inspector: Inspector;

async function initialize(): Promise<void> {
  const { default: Inspector } = await import('./Inspector');
  inspector = new Inspector();
}

async function activateHoverInspect(): Promise<void> {
  console.log('activateHoverInspect');
  if (!inspector) {
    await initialize();
  }
  await inspector.activate();
}

function deactivateHoverInspect(): void {
  console.log('deactivateHoverInspect');
  if (inspector) {
    inspector.deactivate();
  }
}

function deactivateNotification(): void {
  console.log('deactivateNotification');
}

function activateNotification(): void {
  console.log('activateNotification');
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'activateHoverInspect') {
    await activateHoverInspect();
  } else if (request.action === 'deactivateHoverInspect') {
    deactivateHoverInspect();
  } else if (request.action === 'activateNotification') {
    activateNotification();
  } else if (request.action === 'deactivateNotification') {
    deactivateNotification();
  }
});

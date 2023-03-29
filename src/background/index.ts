import TabStates from "./ITabStates";

const tabStates: TabStates = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'OFF'
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const tabId: number | undefined = tab.id;
  if(!tabId) return;
  const prevState = tabStates[tabId] || 'OFF';
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  tabStates[tabId] = nextState;

  await chrome.action.setBadgeText({
    tabId: tabId,
    text: nextState
  });

  if (nextState === 'ON') {
    await chrome.tabs.sendMessage(tabId, {
      action: 'activateHoverInspect'
    });
    await chrome.tabs.sendMessage(tabId, {
      action: 'activateNotification'
    });
  } else if (nextState === 'OFF') {
    await chrome.tabs.sendMessage(tabId, {
      action: 'deactivateHoverInspect'
    });
    await chrome.tabs.sendMessage(tabId, {
      action: 'deactivateNotification'
    });
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const state = tabStates[tabId] || 'OFF';

  await chrome.action.setBadgeText({
    tabId: tabId,
    text: state
  });
});

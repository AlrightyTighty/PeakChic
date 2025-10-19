console.log("hi!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_HTML") {
    const html = document.documentElement.innerHTML;
    sendResponse({ html });
  }
  return true; // Required for async `sendResponse`
});
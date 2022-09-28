function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
injectScript(chrome.runtime.getURL('/call_logger.bundle.js'), 'body');
// injectScript(chrome.runtime.getURL('/boomerang.bundle.js'), 'body');
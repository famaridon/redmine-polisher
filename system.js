function getStorage(value, callback) {
	if (chrome.storage.sync) {
		chrome.storage.sync.get(value, callback);
	}
	else if (browser.storage.local) {
		browser.storage.local.get(value, callback);
	}
}

function setStorage(value, callback) {
	if (chrome.storage.sync) {
		chrome.storage.sync.set(value, callback);
	}
	else if (browser.storage.local) {
		browser.storage.local.set(value, callback);
	}
}
// Saves options to chrome.storage
function save_options() {
  var redmineAPIKey = document.getElementById('redmineAPIKey').value;
  setStorage({
    redmineAPIKey: redmineAPIKey
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// stored in chrome.storage.
function restore_options() {
  getStorage({
    redmineAPIKey: ''
  }, function(items) {
    document.getElementById('redmineAPIKey').value = items.redmineAPIKey;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

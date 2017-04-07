// Saves options to chrome.storage
function save_options() {
  var redmineAPIKey = document.getElementById('redmineAPIKey').value;
  var enableInlineEdit = document.getElementById('enableInlineEdit').checked;
  var defaultState = document.getElementById('defaultState').value;
  setStorage({
    redmineAPIKey: redmineAPIKey,
    enableInlineEdit: enableInlineEdit,
    defaultState: defaultState
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
    redmineAPIKey: "",
    enableInlineEdit: true,
    defaultState: "categories"
  }, function(items) {
    document.getElementById('redmineAPIKey').value = items.redmineAPIKey;
    if(items.enableInlineEdit){
      document.getElementById('enableInlineEdit').checked = 'checked';
    }
    document.getElementById('defaultState').value = items.defaultState;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

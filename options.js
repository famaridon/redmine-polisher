// Saves options to chrome.storage
function save_options() {
    const redmineAPIKey = document.getElementById('redmineAPIKey').value;
    const enableInlineEdit = document.getElementById('enableInlineEdit').checked;
    const syncDevelopmentCostToEstimatedHours = document.getElementById('syncDevelopmentCostToEstimatedHours').checked;
    const defaultState = document.getElementById('defaultState').value;
    debugger
    steStorage({
        redmineAPIKey: redmineAPIKey,
        enableInlineEdit: enableInlineEdit,
        syncDevelopmentCostToEstimatedHours: syncDevelopmentCostToEstimatedHours,
        defaultState: defaultState
    }, function () {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 1500);
    });
}

// stored in chrome.storage.
function restore_options() {
    getStorage({
        redmineAPIKey: "",
        enableInlineEdit: true,
        syncDevelopmentCostToEstimatedHours: false,
        defaultState: "categories"
    }, function (items) {
        debugger
        document.getElementById('redmineAPIKey').value = items.redmineAPIKey;
        if (items.enableInlineEdit) {
            document.getElementById('enableInlineEdit').checked = 'checked';
        }
        if (items.syncDevelopmentCostToEstimatedHours) {
            document.getElementById('syncDevelopmentCostToEstimatedHours').checked = 'checked';
        }
        document.getElementById('defaultState').value = items.defaultState;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

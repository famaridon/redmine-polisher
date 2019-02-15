// Saves options to chrome.storage
function save_options() {
    const redmineAPIKey = document.getElementById('redmineAPIKey').value;
    const enableInlineEdit = document.getElementById('enableInlineEdit').checked;
    const syncDevelopmentCostToEstimatedHours = document.getElementById('syncDevelopmentCostToEstimatedHours').checked;
    const defaultState = document.getElementById('defaultState').value;
    const perPage = document.getElementById('perPage').value;

    chrome.storage.sync.set({
        redmineAPIKey: redmineAPIKey,
        perPage: perPage,
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
    chrome.storage.sync.get({
        redmineAPIKey: "",
        perPage: 250,
        enableInlineEdit: true,
        syncDevelopmentCostToEstimatedHours: false,
        defaultState: "categories"
    }, function (items) {
        document.getElementById('redmineAPIKey').value = items.redmineAPIKey;
        document.getElementById('perPage').value = items.perPage;
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

$(document).ready(() => {
  let projectName = $('a.overview').attr('href');
  let newDefectLabel = navigator.language.startsWith('fr') ? "Nouveau bug" : "New defect";
  let newTaskLabel = navigator.language.startsWith('fr') ? "Nouvelle tache" : "New task";
  let newDefect = $(`<li>
      <a class="new-issue" href="${projectName}/issues/new?issue[tracker_id]=37">${newDefectLabel}</a>
    </li>`);
    let newTask = $(`<li>
        <a class="new-issue" href="${projectName}/issues/new?issue[tracker_id]=35">${newTaskLabel}</a>
      </li>`);
  let newIssue = $(".main_menu .new-issue");
  newIssue.parent().after(newTask);
    newIssue.parent().after(newDefect);
});

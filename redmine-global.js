$(document).ready(() => {
  console.log("azertyuiop");
  let newDefect = $(`<li>
      <a class="new-issue" href="/projects/moovapps-process-team/issues/new?issue[tracker_id]=37">New defect</a>
    </li>`);
    let newTask = $(`<li>
        <a class="new-issue" href="/projects/moovapps-process-team/issues/new?issue[tracker_id]=35">New task</a>
      </li>`);
  let newIssue = $(".new-issue");
  newIssue.parent().after(newDefect);
  newIssue.parent().after(newTask);
});

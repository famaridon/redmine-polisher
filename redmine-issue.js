MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
    const $issue_status = $("#issue_status_id");
    if ($issue_status.val() === "24" || $issue_status.val() === "6") { // A valider
        $("#issue_done_ratio").val("100");

        // if we are in backlog we must set target version
        const $issue_fixed_version = $("#issue_fixed_version_id");
        $issue_fixed_version.off('change.redmine-polisher').on('change.redmine-polisher', () => {
            checkTargetVersion($issue_fixed_version);
        })
        checkTargetVersion($issue_fixed_version);

    } else if ($issue_status.val() === "9") { // Réouvert
        $("#issue_done_ratio").val("0");
        $("#issue_assigned_to_id").val("");
    }
});

observer.observe(document.getElementById("all_attributes"), {
    subtree: true,
    attributes: true
});


function checkTargetVersion($issue_fixed_version){
    $("label[for='issue_fixed_version_id']").addClass('mandatory');
    const $commit = $("input[name='commit']");
    if (!$issue_fixed_version.val()) {
        $commit.attr('disabled', 'disabled');
        $commit.addClass('disabled');

    } else {
        $commit.removeAttr('disabled');
        $commit.removeClass('disabled');
    }
}

$(document).ready(function () {
    console.info("Redmine tools started!");

    // build better title
    var subject = new Subject($("div.subject"));

    subject.$subject.html(subject.toBreadcrumbs());

    $(".cf_29.attribute").appendTo($(".issue .attributes"));
    var input = $("#issue_custom_field_values_29").closest("div[class^=\"splitcontent\"]");
    input.removeClass("splitcontentright");
    input.removeClass("splitcontentleft");
    input.appendTo($("#update .attributes"));
    input.find("textarea").attr("rows", 10);

    // build support link
    var ticketId = $('div.cf_1 > div.value').html();
    var ticketLink = $('div.cf_3 > div.value').html();
    $('div.cf_3 > div.value').html('<a href="' + ticketLink + '">' + ticketId + '</a>');
    $('div.cf_1').hide();
    $(".list.issues tr.issue").each(function (index, item) {
        var link = $(item).find("td.subject a");
        link.append(link[0].nextSibling.nodeValue);
        $(item).find("td.subject").html(link);
    });
    chrome.storage.sync.get({
        redmineAPIKey: null
    }, function (configuration) {
        console.info("Configuration loaded : ");
        console.debug(configuration);
        redmineAPIKey = configuration.redmineAPIKey;
        // get the base url
        if (!location.origin) {
            location.origin = location.protocol + "//" + location.host;
        }

        tooltips = new Tooltips(redmineAPIKey, location.origin);

        $("tr.issue").each(function (index, value) {
            var issue = $(value);
            issue.attr('data-tt-id', issue.find("a.issue").attr('href').split('/')[2]);
            tooltips.setupTooltips(issue.find(".subject a"));
        });

        $("#issue_subject").speechInput();
        $("textarea").speechInput();
    });
});

function addSpeechToText(configuration, $input) {
    if (!('webkitSpeechRecognition' in window)) {
        console.log("Speech recognition not available!");
    } else {
        console.debug(`Add speech recognition to input ${$input}!`);
        let $sttButton = $(`<button type="button">STT</button>`);
        $sttButton.insertBefore($input);
        $sttButton.on("click.redmine_poisher", () => {
            startSpeechToText(event, configuration, $input, $sttButton);
        });
    }
}

function startSpeechToText(event, configuration, $input, $sttButton) {
    $sttButton.off("click.redmine_poisher");
    let recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";
    recognition.start();
    recognition.onstart = function (event) {
        console.log(`onstart`);
        console.dir(event);
    }
    recognition.onresult = function (event) {
        console.log(`onresult`);
        console.dir(event);
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            $input.val($input.val() + event.results[0][0].transcript);
        }

    };
    recognition.onerror = function (event) {
        console.log(`onerror`);
        console.dir(event);
        stopSpeechToText(event, configuration, $input, $sttButton);
    }
    recognition.onend = function (event) {
        console.log(`onend`);
        console.dir(event);
    }
    $sttButton.on("click.redmine_poisher", () => {
        recognition.stop();
        stopSpeechToText(event, configuration, $input, $sttButton);
    })
}

function stopSpeechToText(event, configuration, $input, $sttButton, recognition) {
    $sttButton.off("click.redmine_poisher");
    $sttButton.on("click.redmine_poisher", () => {
        startSpeechToText(event, configuration, $input, $sttButton);
    });
}

function speechToTextOnResult(event, $input) {

}

class Subject {
    constructor($subject) {
        this.$subject = $subject;
        this.title = this.$subject.find("div h3").text();

        var $parents = this.$subject.find("div p");
        if ($parents.length > 0) {
            this.parents = new SubjectParent($parents);
        } else {
            this.parents = null;
        }
    }

    toBreadcrumbs() {
        var breadcrumbs = $('<ol class="breadcrumb"></ol>');
        if (this.parents != null) {
            $.each(this.parents.$parents, function (index, parent) {
                breadcrumbs.append('<li><a title="' + parent.parentId + '" href="' + parent.parentUrl + '">' + parent.parentTitle + '</a></li>');
            });
        }
        breadcrumbs.append('<li>' + this.title + '</li>');
        return breadcrumbs;
    }

}

class SubjectParent {
    constructor($parents) {
        this.$parents = $parents;
        var self = this;
        $.each(this.$parents, function (index, $parent) {
            var $parentA = $($parent).find("a.issue");
            $(self.$parents)[index].parentUrl = $parentA.attr("href");
            $(self.$parents)[index].parentId = $parentA.html().substring($parentA.html().indexOf("#") + 1, $parentA.html().length);
            $(self.$parents)[index].parentTitle = $parentA[0].nextSibling.nodeValue;
            $(self.$parents)[index].parentTitle = this.parentTitle.substring(2, this.parentTitle.length);
        });
    }
}

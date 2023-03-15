//Popover
(function () {
    'use strict';

    // Initialize popovers
    const popoverElements = document.querySelectorAll('[data-bs-toggle="popover"]');

    for (const popover of popoverElements) {
        new bootstrap.Popover(popover); // eslint-disable-line no-new
    }

    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    for (const tooltip of tooltipElements) {
        new bootstrap.Tooltip(tooltip); // eslint-disable-line no-new
    }

    // Dismiss popover on next click
    document.querySelector('body').addEventListener('click', function (e) {
        var in_popover = e.target.closest(".popover");

        if (!in_popover) {
            var popovers = document.querySelectorAll('.popover.show');

            if (popovers[0]) {
                var triggler_selector = `[aria-describedby=${popovers[0].id}]`;

                if (!e.target.closest(triggler_selector)) {
                    let the_trigger = document.querySelector(triggler_selector);
                    if (the_trigger) {
                        bootstrap.Popover.getInstance(the_trigger).hide();
                    }
                }
            }
        }
    });

})();

//Generate Button Click
var argonWorker;
var errorModal;
var resModal;
document.getElementById("generatePwd").onclick = function () {
    var memoryCodeEl = document.getElementById("memoryCode");
    var distinguishMarkEl = document.getElementById("distinguishMark");
    var distinguishMarkValue = document.getElementById("distinguishMark").value;
    var generateTimeValue = document.getElementById("generateTime").value;
    var containSymbolsValue = document.getElementById("containSymbols").checked;
    var pwdLengthValue = document.getElementById("pwdLength").value;
    var containUppercaseValue = document.getElementById("containUppercase").checked;
    var iterationValue = document.getElementById("iteration").value;
    var parallelismValue = document.getElementById("parallelism").value;
    var memoryUsageValue = document.getElementById("memoryUsage").value;
    var hashLengthValue = document.getElementById("hashLength").value;

    //Main password input content verification
    if (memoryCodeEl.value.length < 8) {
        memoryCodeEl.setAttribute("placeholder", "Must be 8 or more digits");
        memoryCodeEl.classList.add("is-invalid");
        memoryCodeEl.value = "";
        return;
    }

    //Unique marker input content verification
    if (distinguishMarkValue.length == 0) {
        distinguishMarkEl.setAttribute("placeholder", "Unique marker must be entered");
        distinguishMarkEl.classList.add("is-invalid");
        return;
    }

    //Loading page fade in
    var loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.opacity = 1;
    loadingSpinner.style.display = "flex";

    //Automatically completes when the length of the distinguishing mark is less than 16
    while (distinguishMarkValue.length < 16) {
        distinguishMarkValue += distinguishMarkValue;
    }

    //Special symbol customisation
    var punctuation;
    var checkedSymbols = document.querySelectorAll('[name="customSymbol"]:checked');
    if (checkedSymbols.length != 0) {
        punctuation = Array.from(checkedSymbols).map(x => x.value)
    } else {
        punctuation = ["~", "*", "-", "+", "(", ")", "!", "@", "#", "$", "^", "&"]
    }

    //Reset the Show hidden button in Modal
    document.getElementById("pwdOutput").setAttribute("type", "password");
    document.getElementById("showOrHidePwd").innerText = "Show";

    //Multi-threaded computation of Argon2 to avoid blocking of UI rendering
    if (!argonWorker) {
        argonWorker = new Worker('./js/fidelius.min.js');
    }

    argonWorker.postMessage(
        [memoryCodeEl.value,
        distinguishMarkValue + generateTimeValue,
            hashLengthValue,
            iterationValue,
            memoryUsageValue,
            parallelismValue,
            pwdLengthValue,
            containSymbolsValue,
            containUppercaseValue,
            punctuation]
    );

    argonWorker.onmessage = function (event) {
        var res = event.data;
        if (res[0] == "Error!") {
            //Error Modal
            document.getElementById("errorOutput").value = res[1];
            if (!errorModal) {
                errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            }
            errorModal.show();
        } else {
            document.getElementById("pwdOutput").value = res;
            pwdQualityCal(res);
            copyPwdToClipboard(res);
            //Result Modal
            if (!resModal) {
                resModal = new bootstrap.Modal(document.getElementById('resultModal'));
            }
            resModal.show();
        }

        //Loading page fade out
        loadingSpinner.style.opacity = 0;
        setTimeout(() => {
            loadingSpinner.style.display = "none";
        }, 300)
    };
}

//Copy password https://clipboardjs.com/
function copyPwdToClipboard(copyValue) {
    //复制按钮
    var clipboard = new ClipboardJS('#btnCopy', {
        container: document.getElementById('resultModal'),
        text: function () {
            return copyValue;
        },
    });
    var copyBtn = document.getElementById("btnCopy");
    clipboard.on('success', function (e) {
        //var copyBtn = document.getElementById("btnCopy");
        setTimeout(function () {
            if (copyBtn.innerText == "Success") {
                copyBtn.innerText = "Copy";
            }
        }, 3000);
        copyBtn.innerText = "Success";
    });
    clipboard.on('error', function (e) {
        //var copyBtn = document.getElementById("btnCopy");
        setTimeout(function () {
            if (copyBtn.innerText == "Failed") {
                copyBtn.innerText = "Copy";
            }
        }, 3000);
        copyBtn.innerText = "Failed";
    });

    //Copy & Close
    var clipboardAndClose = new ClipboardJS('#btnCopyClose', {
        container: document.getElementById('resultModal'),
        text: function () {
            return copyValue;
        },
    });
}

//Show/Hide Result
function showPwdOutput() {
    var pwdOutput = document.getElementById("pwdOutput");
    var showOrHidePwd = document.getElementById("showOrHidePwd");
    if (pwdOutput.getAttribute("type") == "password") {
        pwdOutput.setAttribute("type", "text");
        showOrHidePwd.innerText = "Hide";
    }
    else {
        pwdOutput.setAttribute("type", "password");
        showOrHidePwd.innerText = "Show";
    }
}

//Content verification: clear the error message when the user re-enters the main password
document.getElementById("memoryCode").onkeyup = function () {
    var memoryCodeEl = document.getElementById("memoryCode");
    if (memoryCodeEl.value.length < 8) return;
    memoryCodeEl.classList.remove("is-invalid");
}

//Content verification: clear error messages when the user re-enters the Unique marker
document.getElementById("distinguishMark").onkeyup = function () {
    var distinguishMarkEl = document.getElementById("distinguishMark");
    if (distinguishMarkEl.value.length == 0) return;
    distinguishMarkEl.classList.remove("is-invalid");
}

//Password strength rating https://github.com/EYHN/PasswordQualityCalculator
function pwdQualityCal(pwdRes) {
    var qualityScore = PasswordQualityCalculator(pwdRes);
    var qualityBar = document.getElementById("qualityBar");
    var qualityText = document.getElementById("qualityText");
    qualityBar.style.width = qualityScore * 0.8 + "%";
    if (qualityScore >= 112) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-info";
        qualityText.innerText = "Password Strength: Extremely Strong";
        qualityText.className = "text-info";
    } else if (qualityScore >= 80) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-success";
        qualityText.innerText = "Password Strength: Strong";
        qualityText.className = "text-success";
    } else if (qualityScore >= 64) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-warning";
        qualityText.innerText = "Password Strength: Medium";
        qualityText.className = "text-warning";
    } else {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-danger";
        qualityText.innerText = "Password Strength: Weak";
        qualityText.className = "text-danger";
    }
}

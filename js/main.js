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

//点击按钮生成密码
var argonWorker;
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

    //主密码输入内容校验
    if (memoryCodeEl.value.length < 8) {
        memoryCodeEl.setAttribute("placeholder", "必须输入8位以上记忆密码");
        memoryCodeEl.classList.add("is-invalid");
        memoryCodeEl.value = "";
        return;
    }

    //区分标识输入内容校验
    if (distinguishMarkValue.length == 0) {
        distinguishMarkEl.setAttribute("placeholder", "必须输入区分代码");
        distinguishMarkEl.classList.add("is-invalid");
        return;
    }

    //加载页面淡入
    var loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.opacity = 1;
    loadingSpinner.style.display = "flex";

    //区分标识长度小于16时补齐
    while (distinguishMarkValue.length < 16) {
        distinguishMarkValue += distinguishMarkValue;
    }

    //特殊符号自定义
    var punctuation;
    var checkedSymbols = document.querySelectorAll('[name="customSymbol"]:checked');
    if (checkedSymbols.length != 0) {
        punctuation = Array.from(checkedSymbols).map(x => x.value)
    } else {
        punctuation = ["~", "*", "-", "+", "(", ")", "!", "@", "#", "$", "^", "&"]
    }

    //重置Modal中的密码显示隐藏按钮
    document.getElementById("pwdOutput").setAttribute("type", "password");
    document.getElementById("showOrHidePwd").innerText = "显示";

    //多线程运算Argon2，避免UI渲染被阻塞
    if (!argonWorker){
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
        document.getElementById("pwdOutput").value = res;
        pwdQualityCal(res);
        copyPwdToClipboard(res);

        //加载页面淡出
        loadingSpinner.style.opacity = 0;
        setTimeout(() => {
            loadingSpinner.style.display = "none";
        }, 300)

        //结果Modal弹窗
        var myModal = new bootstrap.Modal(document.getElementById('resultModal'));
        myModal.show();

    };

}

//复制密码 https://clipboardjs.com/
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
            if (copyBtn.innerText == "复制成功") {
                copyBtn.innerText = "复制";
            }
        }, 3000);
        copyBtn.innerText = "复制成功";
    });
    clipboard.on('error', function (e) {
        //var copyBtn = document.getElementById("btnCopy");
        setTimeout(function () {
            if (copyBtn.innerText == "复制失败") {
                copyBtn.innerText = "复制";
            }
        }, 3000);
        copyBtn.innerText = "复制失败";
    });

    //复制并关闭按钮
    var clipboardAndClose = new ClipboardJS('#btnCopyClose', {
        container: document.getElementById('resultModal'),
        text: function () {
            return copyValue;
        },
    });
}

//显示或隐藏输出密码
function showPwdOutput() {
    var pwdOutput = document.getElementById("pwdOutput");
    var showOrHidePwd = document.getElementById("showOrHidePwd");
    if (pwdOutput.getAttribute("type") == "password") {
        pwdOutput.setAttribute("type", "text");
        showOrHidePwd.innerText = "隐藏";
    }
    else {
        pwdOutput.setAttribute("type", "password");
        showOrHidePwd.innerText = "显示";
    }
}

//内容校验：用户重新输入主密码时清空报错信息
document.getElementById("memoryCode").onkeyup = function () {
    var memoryCodeEl = document.getElementById("memoryCode");
    if (memoryCodeEl.value.length < 8) return;
    memoryCodeEl.classList.remove("is-invalid");
}

//内容校验：用户重新输入区分标识时清空报错信息
document.getElementById("distinguishMark").onkeyup = function () {
    var distinguishMarkEl = document.getElementById("distinguishMark");
    if (distinguishMarkEl.value.length == 0) return;
    distinguishMarkEl.classList.remove("is-invalid");
}

//密码强度评分 https://github.com/EYHN/PasswordQualityCalculator
function pwdQualityCal(pwdRes) {
    var qualityScore = PasswordQualityCalculator(pwdRes);
    var qualityBar = document.getElementById("qualityBar");
    var qualityText = document.getElementById("qualityText");
    qualityBar.style.width = qualityScore * 0.8 + "%";
    if (qualityScore >= 112) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-info";
        qualityText.innerText = "密码强度评估：极强";
        qualityText.className = "text-info";
    } else if (qualityScore >= 80) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-success";
        qualityText.innerText = "密码强度评估：强";
        qualityText.className = "text-success";
    } else if (qualityScore >= 64) {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-warning";
        qualityText.innerText = "密码强度评估：中等";
        qualityText.className = "text-warning";
    } else {
        qualityBar.innerText = qualityScore + " bits";
        qualityBar.className = "progress-bar progress-bar-striped progress-bar-animated bg-danger";
        qualityText.innerText = "密码强度评估：弱";
        qualityText.className = "text-danger";
    }
}

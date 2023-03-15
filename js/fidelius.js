importScripts('./lib/argon2.min.js');

var res;
onmessage = function (event) {
    var memoryCodeValue = event.data[0];
    var saltValue = event.data[1];
    var hashLenValue = event.data[2];
    var iterationValue = event.data[3];
    var memoryUsageValue = event.data[4];
    var parallelismValue = event.data[5];
    var pwdLengthValue = event.data[6];
    var containSymbolsValue = event.data[7];
    var containUppercaseValue = event.data[8];
    var punctuation = event.data[9];

    //参数校验
    if (pwdLengthValue && pwdLengthValue < 6) pwdLengthValue = 6;
    if (hashLenValue && hashLenValue < (pwdLengthValue || 8)) hashLenValue = "";
    if (iterationValue && iterationValue < 1) iterationValue = "";
    if (memoryUsageValue && memoryUsageValue < 8 * (parallelismValue || 1)) memoryUsageValue = "";
    if (parallelismValue && parallelismValue < 1) parallelismValue = "";

    argon2.hash({
        pass: memoryCodeValue,
        salt: saltValue,
        hashLen: hashLenValue || 64,
        time: iterationValue || 3,
        mem: memoryUsageValue || 65536,
        parallelism: parallelismValue || 1,
        type: argon2.ArgonType.Argon2id
    })
        .then(function (h) {
            var hashRes = h.hashHex;
            var pwdOutputLength = pwdLengthValue || 16;
            var res = seekPassword(hashRes, pwdOutputLength, containSymbolsValue, containUppercaseValue, punctuation);
            this.postMessage(res);
        })
        .catch(e => {
            var errorReport = JSON.stringify({ message: e.message, code: e.code }, null, 2);
            this.postMessage(["Error!", errorReport])
        })


}

/**
 * seek password https://github.com/Wsine/seekpassword
 * 生成密码
 * @param {sha512加密后字符串} hash
 * @param {输出密码长度} length
 * @param {是否使用标点} rule_of_punctuation
 * @param {是否区分大小写} rule_of_letter
 */
function seekPassword(hash, length, rule_of_punctuation, rule_of_letter, punctuation) {
    // 生成字符表
    var lower = "abcdefghijklmnopqrstuvwxyz".split("");
    var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var number = "0123456789".split("");

    var alphabet = lower.concat(number);
    if (rule_of_punctuation) {
        alphabet = alphabet.concat(punctuation);
    }
    if (rule_of_letter) {
        alphabet = alphabet.concat(upper);
    }

    // 生成密码
    // 从0开始截取长度为length的字符串，直到满足密码复杂度为止
    for (var i = 0; i <= hash.length - length; ++i) {
        var sub_hash = hash.slice(i, i + parseInt(length)).split("");
        var count = 0;
        var map_index = sub_hash.map(function (c) {
            count = (count + c.charCodeAt()) % alphabet.length;
            return count;
        });
        var sk_pwd = map_index.map(function (k) {
            return alphabet[k];
        });

        // 验证密码
        var matched = [false, false, false, false];
        sk_pwd.forEach(function (e) {
            matched[0] = matched[0] || lower.includes(e);
            matched[1] = matched[1] || upper.includes(e);
            matched[2] = matched[2] || number.includes(e);
            matched[3] = matched[3] || punctuation.includes(e);
        });
        if (!rule_of_letter) {
            matched[1] = true;
        }
        if (!rule_of_punctuation) {
            matched[3] = true;
        }
        if (!matched.includes(false)) {
            return sk_pwd.join("");
        }
    }
    return "Error!";
}

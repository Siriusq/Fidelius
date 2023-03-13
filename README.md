# Fidelius
![Github license](https://img.shields.io/github/license/Siriusq/Fidelius?style=flat-square)
![GitHub deployments](https://img.shields.io/github/deployments/Siriusq/Fidelius/github-pages?label=Github%20Pages&logo=github&style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/Siriusq/Fidelius?logo=git&style=flat-square)

Fidelius 是一款基于 [Argon2](https://en.wikipedia.org/wiki/Argon2) 加密算法的密码生成器。它以记忆密码为主密码P，以域名区分标识与生成时间为哈希盐S，将二者进行多次哈希运算迭代，再使用 [SeekPassword](https://github.com/Wsine/seekpassword) 的算法对结果进行进一步处理，最终得到用户需要的密码。

## 预览
🔗[Live Demo](https://siriusq.top/Fidelius/)

![](https://github.com/Siriusq/Fidelius/blob/master/preview.png)

## 特性
- 基于 Argon2 算法， Argon2 算法曾在 2015 年获得 Password Hashing Competition 冠军，能够有效抵御暴力破解(包括基于GPU的暴力破解)
- 默认使用 Argon2 的推荐参数，用户也可以自行修改相关参数
- 可在哈希盐中加入密码生成日期，方便日后定期修改密码
- 可自定义密码中使用的特殊符号
- 所有运算均在本地运行，代码开源

## 引用/参考
- [alexrintt/argon2](https://github.com/alexrintt/argon2)
- [mrjooz/password-generator](https://github.com/mrjooz/password-generator/tree/master)
- [Wsine/seekpassword](https://github.com/Wsine/seekpassword)
- [EYHN/PasswordQualityCalculator](https://github.com/EYHN/PasswordQualityCalculator)
- [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)
- [Quartz](https://bootswatch.com/quartz/)

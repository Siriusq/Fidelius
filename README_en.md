# Fidelius
![Github license](https://img.shields.io/github/license/Siriusq/Fidelius?style=flat-square)
![GitHub deployments](https://img.shields.io/github/deployments/Siriusq/Fidelius/github-pages?label=Github%20Pages&logo=github&style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/Siriusq/Fidelius?logo=git&style=flat-square)

Fidelius is a password generator based on the [Argon2](https://en.wikipedia.org/wiki/Argon2) cryptographic algorithm. It uses the memorised password as the main password P and the domain identifier and generation time as the hash salt S. The two are hashed several times and then the [SeekPassword](https://github.com/Wsine/seekpassword) algorithm is used to further process the outcome to obtain the password required by the user.

## Preview
🔗[Live Demo](https://siriusq.top/Fidelius/)
🔗[简体中文文档](https://github.com/Siriusq/Fidelius/blob/master/README.md)

![](https://github.com/Siriusq/Fidelius/blob/master/preview.png)

## Features
- Based on the Argon2 algorithm, which won the Password Hashing Competition in 2015 and is effective against brute force cracking (including GPU-based brute force cracking).
- The recommended parameters of Argon2 are used by default, but you can also change them yourself.
- Password generation date can be added to the hash salt to easily change the password periodically in the future.
- Customisable special symbols used in passwords.
- All operations run locally, and the code is open source.

## Reference
- [alexrintt/argon2](https://github.com/alexrintt/argon2)
- [mrjooz/password-generator](https://github.com/mrjooz/password-generator/tree/master)
- [Wsine/seekpassword](https://github.com/Wsine/seekpassword)
- [EYHN/PasswordQualityCalculator](https://github.com/EYHN/PasswordQualityCalculator)
- [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)
- [Quartz](https://bootswatch.com/quartz/)

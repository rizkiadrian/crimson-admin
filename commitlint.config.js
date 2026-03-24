// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0, "never"], // Membebaskan huruf besar/kecil di subject
  },
};

// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Fitur baru
        "fix", // Perbaikan bug
        "docs", // Dokumentasi
        "style", // Styling (bukan perubahan logic)
        "refactor", // Refactoring kode
        "perf", // Peningkatan performa
        "test", // Menambah/memperbaiki test
        "build", // Build system atau dependencies
        "ci", // Konfigurasi CI/CD
        "chore", // Maintenance rutin
        "revert", // Membatalkan commit sebelumnya
      ],
    ],
    "subject-case": [0], // 0 artinya rule ini dimatikan (sesuai mau kamu)
  },
};

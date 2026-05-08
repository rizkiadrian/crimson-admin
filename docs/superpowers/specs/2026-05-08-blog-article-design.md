# 2026-05-08 — Blog/Article Feature Design

> Spec location: `.kiro/specs/blog-article/`

This document summarizes the brainstorming session for the Blog/Article feature in Lingkar CRM.

## Summary

- **Scope:** Backend API (Laravel) + CRM UI (Next.js). No mobile/public frontend.
- **Approach:** Modular — Authors, Categories, Tags, Articles as separate entities with own CRUD.
- **Editor:** Tiptap (new dependency) with inline image upload support.
- **Status workflow:** Draft → Published (direct) or Draft → Scheduled → Published. Plus archive/unpublish.
- **Author:** Separate table, selected via autocomplete. Fields: name, email, avatar.

## Spec Files

- Requirements: `.kiro/specs/blog-article/requirements.md`
- Design: `.kiro/specs/blog-article/design.md`

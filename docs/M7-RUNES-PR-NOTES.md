# M7.1 PR Notes

This pass is intentionally the first M7 realm built outside the legacy monolithic SPA. The standalone route pattern is intended to become the template for later Lenormand and other content-heavy realms.

Key design choice: server-render the hub and meaning pages directly from the V2 Worker, then use a tiny client module only for the interactive cast. This keeps the new SEO surface crawlable and prevents continued growth of the legacy application bundle.

// ArticleEditor imports ProseMirror + DOMPurify which require a DOM.
// This page is behind auth and never has meaningful SSR content.
export const ssr = false;

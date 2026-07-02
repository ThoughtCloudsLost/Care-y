import { createContext } from "svelte";

export interface LibraryLayoutCtx {
  readonly openArticle: (articleId: string) => void;
  readonly selectedArticleId: () => string | undefined;
}

export const [getLibraryLayoutCtx, setLibraryLayoutCtx] =
  createContext<LibraryLayoutCtx>();

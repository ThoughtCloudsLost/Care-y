<!--
  KB article detail route: renders decrypted article body with voting.

  Responsibilities:
  - Overrides Navbar with back arrow + category name + edit pencil
  - Fetches article via trpc.kb.getItem, decrypts title and body
  - Renders body through renderArticleBody() (DOMPurify-sanitized)
  - Manages vote state with optimistic updates
  - Shows DecryptPlaceholder for loading/error states
-->
<script lang="ts">
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Link, Chip } from "konsta/svelte";
  import { ChevronLeft, Pencil } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    resolveOrgDecrypt,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { renderArticleBody } from "$lib/utils/render-article.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";
  import ArticleVote from "$lib/components/library/ArticleVote.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  if (!trpc.kb) throw new RouterNotAvailableError("kb");
  const kbRouter = trpc.kb;
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  const navbarCtx = getNavbarOverrideCtx();

  const articleId = $derived(page.params.articleId ?? "");

  // ── Summary from list cache (instant, no query needed) ──
  // The library page's infinite query already fetched and decrypted summary
  // data. Read it from the TanStack Query cache for immediate rendering.
  // Same pattern as ticket detail's cachedFollowUpCount.

  interface CachedSummary {
    categoryId: string;
    encryptedTitle: SerializedBuffer;
    createdBy: string;
    voteUpCount: number;
    voteDownCount: number;
    rating: number;
    createdAt: Date | string;
    updatedAt: Date | string;
  }

  const cachedSummary = $derived.by((): CachedSummary | undefined => {
    const entries = queryClient.getQueriesData<{
      pages: { items: (CachedSummary & { id: string })[] }[];
    }>({ queryKey: ["kb", "items"] });
    for (const [, data] of entries) {
      if (data?.pages == null) continue;
      for (const queryPage of data.pages) {
        const match = queryPage.items.find((item) => item.id === articleId);
        if (match != null) return match;
      }
    }
    return undefined;
  });

  // ── Detail query (provides encryptedBody, not in the list cache) ──

  const articleQuery = createQuery(() => ({
    queryKey: ["kb", "item", articleId],
    queryFn: async () => kbRouter.getItem.query({ itemId: articleId }),
    enabled: articleId !== "",
  }));

  const article = $derived(articleQuery.data);

  // Merge: use detail query data when available, fall back to list cache.
  const categoryId = $derived(
    article?.categoryId ?? cachedSummary?.categoryId ?? null,
  );
  const encryptedTitle = $derived(
    (article?.encryptedTitle ??
      cachedSummary?.encryptedTitle ??
      null) as SerializedBuffer | null,
  );
  const createdBy = $derived(
    article?.createdBy ?? cachedSummary?.createdBy ?? null,
  );
  const voteUpCount = $derived(
    article?.voteUpCount ?? cachedSummary?.voteUpCount ?? 0,
  );
  const voteDownCount = $derived(
    article?.voteDownCount ?? cachedSummary?.voteDownCount ?? 0,
  );
  const rawUpdatedAt = $derived(
    article?.updatedAt ?? cachedSummary?.updatedAt ?? null,
  );

  // ── Decrypt title (available instantly if list page already decrypted it) ──

  const titleRaw = $derived(
    encryptedTitle !== null
      ? orgCache.decrypt(`kb-item:${articleId}`, encryptedTitle)
      : null,
  );
  const titleResult: DecryptResult = $derived(
    resolveOrgDecrypt(titleRaw, orgKeyManager.isLoaded),
  );

  // ── Category name for navbar ──

  const categoryQuery = createQuery(() => ({
    queryKey: ["kb", "categories"],
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  const categoryName = $derived.by((): string | null => {
    if (categoryId === null || categoryQuery.data == null) return null;
    const cat = categoryQuery.data.find((c) => c.id === categoryId);
    if (cat == null) return null;
    return orgCache.decrypt(
      `kb-cat:${cat.id}`,
      cat.encryptedName as SerializedBuffer,
    );
  });

  // ── Author name (decrypt from cache, createdBy available from list) ──

  const authorName = $derived(
    createdBy !== null
      ? orgCache.decrypt(`volunteer:${createdBy}`, null)
      : null,
  );

  // ── Metadata (available from list cache instantly) ──

  const updatedAt = $derived(
    rawUpdatedAt !== null
      ? rawUpdatedAt instanceof Date
        ? rawUpdatedAt
        : new Date(rawUpdatedAt)
      : null,
  );
  const relativeTime = $derived(
    updatedAt !== null ? formatRelativeTime(updatedAt) : null,
  );

  // ── Body decryption (only available after detail query resolves) ──

  const renderedBody = $derived.by((): string | null => {
    if (article == null || !orgKeyManager.isLoaded) return null;
    try {
      const raw = article.encryptedBody;
      const ciphertext =
        raw instanceof Uint8Array
          ? raw
          : new Uint8Array((raw as SerializedBuffer).data);
      const plainBytes = orgKeyManager.decrypt(ciphertext);
      return renderArticleBody(plainBytes);
    } catch (err: unknown) {
      console.error("[KB] Article body decryption failed", { articleId, err });
      return null;
    }
  });

  const bodyIsLoading = $derived(
    articleQuery.isLoading ||
      (renderedBody === null && !orgKeyManager.isLoaded),
  );
  const bodyDecryptFailed = $derived(
    !articleQuery.isLoading &&
      article != null &&
      orgKeyManager.isLoaded &&
      renderedBody === null,
  );

  // ── Voting ──

  const userVoteQuery = createQuery(() => ({
    queryKey: ["kb", "vote", articleId],
    queryFn: async () => kbRouter.getUserVote.query({ itemId: articleId }),
    enabled: articleId !== "",
  }));

  function toVoteDirection(raw: string | undefined): "up" | "down" | null {
    if (raw === "up" || raw === "down") return raw;
    return null;
  }

  const userVoteDirection = $derived(
    toVoteDirection(userVoteQuery.data?.direction),
  );

  const castVoteMutation = createMutation(() => ({
    mutationFn: async (direction: "up" | "down") =>
      kbRouter.castVote.mutate({ itemId: articleId, direction }),
    onMutate: async (direction) => {
      await queryClient.cancelQueries({ queryKey: ["kb", "vote", articleId] });
      await queryClient.cancelQueries({ queryKey: ["kb", "item", articleId] });

      const prevVote = queryClient.getQueryData(["kb", "vote", articleId]);
      const prevItem = queryClient.getQueryData(["kb", "item", articleId]);

      // Optimistic: update vote direction
      queryClient.setQueryData(["kb", "vote", articleId], { direction });

      // Optimistic: adjust counts on the article (detail query cache)
      if (article != null) {
        const prev = userVoteDirection;
        let upDelta = 0;
        let downDelta = 0;

        if (prev === "up") upDelta--;
        else if (prev === "down") downDelta--;

        if (direction === "up") upDelta++;
        else downDelta++;

        queryClient.setQueryData(["kb", "item", articleId], {
          ...article,
          voteUpCount: article.voteUpCount + upDelta,
          voteDownCount: article.voteDownCount + downDelta,
        });
      }

      haptic();
      return { prevVote, prevItem };
    },
    onSuccess: (_data, direction) => {
      const msg =
        direction === "up"
          ? m.library_your_vote_up()
          : m.library_your_vote_down();
      announceToLiveRegion("polite", msg);
    },
    onError: (_err, _direction, context) => {
      if (context?.prevVote != null)
        queryClient.setQueryData(["kb", "vote", articleId], context.prevVote);
      if (context?.prevItem != null)
        queryClient.setQueryData(["kb", "item", articleId], context.prevItem);
      toastStore.show(m.error_generic());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["kb", "vote", articleId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["kb", "item", articleId],
      });
    },
  }));

  const removeVoteMutation = createMutation(() => ({
    mutationFn: async () => kbRouter.removeVote.mutate({ itemId: articleId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["kb", "vote", articleId] });
      await queryClient.cancelQueries({ queryKey: ["kb", "item", articleId] });

      const prevVote = queryClient.getQueryData(["kb", "vote", articleId]);
      const prevItem = queryClient.getQueryData(["kb", "item", articleId]);

      queryClient.setQueryData(["kb", "vote", articleId], null);

      if (article != null) {
        const prev = userVoteDirection;
        queryClient.setQueryData(["kb", "item", articleId], {
          ...article,
          voteUpCount: article.voteUpCount + (prev === "up" ? -1 : 0),
          voteDownCount: article.voteDownCount + (prev === "down" ? -1 : 0),
        });
      }

      haptic();
      return { prevVote, prevItem };
    },
    onSuccess: () => {
      announceToLiveRegion("polite", m.library_vote_removed());
    },
    onError: (_err, _vars, context) => {
      if (context?.prevVote != null)
        queryClient.setQueryData(["kb", "vote", articleId], context.prevVote);
      if (context?.prevItem != null)
        queryClient.setQueryData(["kb", "item", articleId], context.prevItem);
      toastStore.show(m.error_generic());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["kb", "vote", articleId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["kb", "item", articleId],
      });
    },
  }));

  function handleVote(direction: "up" | "down"): void {
    castVoteMutation.mutate(direction);
  }

  function handleRemoveVote(): void {
    removeVoteMutation.mutate();
  }

  // ── Navbar override ──

  function goBack(): void {
    shellBack("/library");
  }

  $effect(() => {
    navbarCtx.current = {
      left: navLeft,
      title: categoryName ?? m.library_title(),
      right: navRight,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });
</script>

{#snippet navLeft()}
  <Link
    iconOnly
    onclick={goBack}
    role="button"
    aria-label={m.library_back_to_library()}
  >
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={() => void goto(resolve(`/library/${articleId}/edit`))}
    role="button"
    aria-label={m.library_edit_article()}
  >
    <Pencil size={20} aria-hidden="true" />
  </Link>
{/snippet}

<div class="article-detail">
  <!-- Category badge -->
  {#if categoryName}
    <Chip outline class="category-chip">{categoryName}</Chip>
  {/if}

  <!-- Title (h1, outside .article-body prose container) -->
  <h1 class="article-title">
    <DecryptPlaceholder result={titleResult} length={30}>
      {#if titleResult.status === "ready"}
        {titleResult.value}
      {/if}
    </DecryptPlaceholder>
  </h1>

  <!-- Metadata row -->
  <div class="article-meta" role="group" aria-label={m.library_article_info()}>
    {#if authorName !== null}
      <span>{m.library_article_by({ author: authorName })}</span>
    {:else if createdBy === null}
      <InlineSkeleton width="8ch" />
    {/if}
    {#if relativeTime !== null}
      <span aria-label={updatedAt?.toLocaleDateString()}>
        {m.library_article_updated({ time: relativeTime })}
      </span>
    {:else if rawUpdatedAt === null}
      <InlineSkeleton width="10ch" />
    {/if}
  </div>

  <!-- Article body -->
  {#if renderedBody !== null}
    <article class="article-body">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by DOMPurify in renderArticleBody() -->
      {@html renderedBody}
    </article>
  {:else if bodyIsLoading}
    <DecryptPlaceholder block length={200} />
  {:else if bodyDecryptFailed}
    <DecryptPlaceholder result={{ status: "error" }} block length={100} />
  {/if}

  <!-- Voting (available from list cache before detail query resolves) -->
  {#if cachedSummary != null || article != null}
    <ArticleVote
      {voteUpCount}
      {voteDownCount}
      userDirection={userVoteDirection}
      onvote={handleVote}
      onremove={handleRemoveVote}
      disabled={castVoteMutation.isPending || removeVoteMutation.isPending}
    />
  {/if}
</div>

<style>
  .article-detail {
    padding: var(--space-lg) var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  :global(.category-chip) {
    align-self: flex-start;
    height: 1.25rem !important;
    font-size: var(--text-xs) !important;
    padding-left: var(--space-md) !important;
    padding-right: var(--space-md) !important;
  }

  .article-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--ink);
    line-height: 1.3;
    margin: 0;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .article-meta span + span::before {
    content: "·";
    margin-right: var(--space-md);
  }

  /* ── Prose styling for rendered article body ──
     Shared contract with 06f.2 editor preview. */
  .article-body {
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--ink);
  }

  .article-body :global(h1),
  .article-body :global(h2),
  .article-body :global(h3) {
    font-family: var(--font-display);
    color: var(--ink);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  .article-body :global(p) {
    margin-bottom: 0.75em;
  }

  .article-body :global(a) {
    color: var(--brand-text);
    text-decoration: underline;
  }

  .article-body :global(code) {
    background: var(--surface-1);
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .article-body :global(pre) {
    background: var(--surface-1);
    padding: var(--space-lg);
    border-radius: var(--card-radius);
    overflow-x: auto;
  }

  .article-body :global(ul),
  .article-body :global(ol) {
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .article-body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .article-body :global(blockquote) {
    border-left: 3px solid var(--brand-primary);
    padding-left: var(--space-lg);
    color: var(--muted);
    font-style: italic;
  }

  .article-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.75em;
  }

  .article-body :global(th),
  .article-body :global(td) {
    border: 1px solid var(--divider);
    padding: var(--space-sm) var(--space-md);
    text-align: left;
  }

  .article-body :global(th) {
    background: var(--surface-1);
    font-weight: 600;
  }

  .article-body :global(hr) {
    border: none;
    border-top: 1px solid var(--divider);
    margin: 1.5em 0;
  }
</style>

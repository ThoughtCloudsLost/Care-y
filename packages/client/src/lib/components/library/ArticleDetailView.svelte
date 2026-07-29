<!--
  KB article detail: renders decrypted article body with voting.

  Reusable across full-page route and split-view detail pane.
  Accepts articleId as a prop (not from route params).
  Sets NavbarOverride with back arrow + category name + edit pencil.
  Fetches article via trpc.kb.getItem, decrypts title and body,
  renders body through renderArticleBody() (DOMPurify-sanitized),
  and manages vote state with optimistic updates.
-->
<script lang="ts">
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { decode } from "@care-y/crypto";
  import { Link } from "konsta/svelte";
  import { ChevronLeft, Pencil } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { kbKeys } from "$lib/query/keys.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    resolveOrgDecrypt,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { requireRouter } from "$lib/errors.js";
  import { renderArticleBody } from "$lib/utils/render-article.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    resolveKbImages,
    type KbImageResolverDeps,
  } from "$lib/utils/resolve-kb-images.js";
  import ArticleVote from "$lib/components/library/ArticleVote.svelte";
  import { untrack } from "svelte";
  import { recentViews } from "$lib/search/recent-views.js";
  import KbAttachmentChip from "$lib/components/library/KbAttachmentChip.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  let {
    articleId,
    onback,
    onedit,
  }: {
    articleId: string;
    onback: () => void;
    onedit: () => void;
  } = $props();

  const kbRouter = requireRouter(trpc.kb, "kb");
  const orgCache = getOrgDecryptCache();

  // Recently-viewed history: an article open counts as a view. Covers the
  // full-page route and the split pane (both mount this component).
  // record() mutates + reads a SvelteMap internally (applyCaps -> sorted),
  // so untrack prevents the effect from subscribing to the map and looping.
  $effect(() => {
    const id = articleId;
    untrack(() => recentViews.record("article", id));
  });
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  const navbarCtx = getNavbarOverrideCtx();

  // ── Summary from list cache (instant, no query needed) ──

  interface CachedSummary {
    categoryId: string;
    encryptedTitle: string;
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
    }>({ queryKey: kbKeys.items() });
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
    queryKey: kbKeys.item(articleId),
    queryFn: async () => kbRouter.getItem.query({ itemId: articleId }),
    enabled: articleId !== "",
  }));

  const article = $derived(articleQuery.data);

  const categoryId = $derived(
    article?.categoryId ?? cachedSummary?.categoryId ?? null,
  );
  const encryptedTitle = $derived(
    article?.encryptedTitle ?? cachedSummary?.encryptedTitle ?? null,
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

  // ── Decrypt title ──

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
    queryKey: kbKeys.categories(),
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  const categoryName = $derived.by((): string | null => {
    if (categoryId === null || categoryQuery.data == null) return null;
    const cat = categoryQuery.data.find((c) => c.id === categoryId);
    if (cat == null) return null;
    return orgCache.decrypt(`kb-cat:${cat.id}`, cat.encryptedName);
  });

  // ── Author name ──

  const authorName = $derived(
    createdBy !== null
      ? orgCache.decrypt(`volunteer:${createdBy}`, null)
      : null,
  );

  // ── Metadata ──

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

  // ── Body decryption (async Worker, $effect + $state) ──

  let renderedBody: string | null = $state(null);
  let bodyDecryptAttempted = $state(false);
  let bodyDecryptVersion = 0;

  $effect(() => {
    if (article == null || !orgKeyManager.isLoaded) {
      renderedBody = null;
      bodyDecryptAttempted = false;
      return;
    }

    const ciphertext = decode(article.encryptedBody);
    const title =
      titleResult.status === "ready" ? titleResult.value : undefined;
    const version = ++bodyDecryptVersion;

    void (async (): Promise<void> => {
      try {
        const plainBytes = await orgKeyManager.decrypt(ciphertext);
        if (version !== bodyDecryptVersion) return;
        renderedBody = renderArticleBody(plainBytes, { title });
      } catch (err: unknown) {
        if (version !== bodyDecryptVersion) return;
        console.error("[KB] Article body decryption failed", {
          articleId,
          err,
        });
        renderedBody = null;
      } finally {
        if (version === bodyDecryptVersion) bodyDecryptAttempted = true;
      }
    })();
  });

  const bodyIsLoading = $derived(
    articleQuery.isLoading ||
      (!bodyDecryptAttempted && !orgKeyManager.isLoaded),
  );
  const bodyDecryptFailed = $derived(
    !articleQuery.isLoading &&
      article != null &&
      bodyDecryptAttempted &&
      renderedBody === null,
  );

  // ── Image resolver ──

  const imageResolverDeps: KbImageResolverDeps = $derived({
    downloadBlob: async (attachmentId: string) =>
      kbRouter.downloadAttachmentBlob.query({ attachmentId }),
    decrypt: async (ciphertext: Uint8Array) =>
      orgKeyManager.decrypt(ciphertext),
    contentKey: renderedBody,
  });

  // ── Non-image attachments ──

  const attachmentsQuery = createQuery(() => ({
    queryKey: kbKeys.attachments(articleId),
    queryFn: async () => kbRouter.listAttachments.query({ itemId: articleId }),
    enabled: articleId !== "" && (article?.attachmentCount ?? 0) > 0,
  }));

  interface DecryptedAttachment {
    id: string;
    filename: string;
    sizeBytes: number;
  }

  let nonImageAttachments: DecryptedAttachment[] = $state([]);
  let attachmentDecryptVersion = 0;

  $effect(() => {
    const raw = attachmentsQuery.data;
    if (raw == null || !orgKeyManager.isLoaded) {
      nonImageAttachments = [];
      return;
    }

    const version = ++attachmentDecryptVersion;

    void (async (): Promise<void> => {
      const results: DecryptedAttachment[] = [];
      for (const att of raw) {
        if (att.contentType?.startsWith("image/") === true) continue;
        let filename = "attachment";
        if (att.encryptedFilename != null) {
          try {
            const plain = await orgKeyManager.decrypt(
              decode(att.encryptedFilename),
            );
            filename = new TextDecoder().decode(plain);
          } catch {
            // Decryption failed; fall back to generic name
          }
        }
        results.push({ id: att.id, filename, sizeBytes: att.sizeBytes });
      }
      if (version === attachmentDecryptVersion) {
        nonImageAttachments = results;
      }
    })();
  });

  // ── Voting ──

  const userVoteQuery = createQuery(() => ({
    queryKey: kbKeys.vote(articleId),
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
      await queryClient.cancelQueries({ queryKey: kbKeys.vote(articleId) });
      await queryClient.cancelQueries({ queryKey: kbKeys.item(articleId) });

      const prevVote = queryClient.getQueryData(kbKeys.vote(articleId));
      const prevItem = queryClient.getQueryData(kbKeys.item(articleId));

      queryClient.setQueryData(kbKeys.vote(articleId), { direction });

      if (article != null) {
        const prev = userVoteDirection;
        let upDelta = 0;
        let downDelta = 0;

        if (prev === "up") upDelta--;
        else if (prev === "down") downDelta--;

        if (direction === "up") upDelta++;
        else downDelta++;

        queryClient.setQueryData(kbKeys.item(articleId), {
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
        queryClient.setQueryData(kbKeys.vote(articleId), context.prevVote);
      if (context?.prevItem != null)
        queryClient.setQueryData(kbKeys.item(articleId), context.prevItem);
      toastStore.show(m.error_generic());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: kbKeys.vote(articleId),
      });
      void queryClient.invalidateQueries({
        queryKey: kbKeys.item(articleId),
      });
    },
  }));

  const removeVoteMutation = createMutation(() => ({
    mutationFn: async () => kbRouter.removeVote.mutate({ itemId: articleId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: kbKeys.vote(articleId) });
      await queryClient.cancelQueries({ queryKey: kbKeys.item(articleId) });

      const prevVote = queryClient.getQueryData(kbKeys.vote(articleId));
      const prevItem = queryClient.getQueryData(kbKeys.item(articleId));

      queryClient.setQueryData(kbKeys.vote(articleId), null);

      if (article != null) {
        const prev = userVoteDirection;
        queryClient.setQueryData(kbKeys.item(articleId), {
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
        queryClient.setQueryData(kbKeys.vote(articleId), context.prevVote);
      if (context?.prevItem != null)
        queryClient.setQueryData(kbKeys.item(articleId), context.prevItem);
      toastStore.show(m.error_generic());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: kbKeys.vote(articleId),
      });
      void queryClient.invalidateQueries({
        queryKey: kbKeys.item(articleId),
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

  $effect(() => {
    navbarCtx.current = {
      left: navLeft,
      title: categoryName ?? m.library_title(withTerms()),
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
    onclick={onback}
    role="button"
    aria-label={m.library_back_to_library(withTerms())}
  >
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={onedit}
    role="button"
    aria-label={m.library_edit_article()}
  >
    <Pencil size={20} aria-hidden="true" />
  </Link>
{/snippet}

<div class="article-detail">
  <h1 class="article-title">
    <DecryptPlaceholder result={titleResult} length={30}>
      {#if titleResult.status === "ready"}
        {titleResult.value}
      {/if}
    </DecryptPlaceholder>
  </h1>

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

  {#if renderedBody !== null}
    <article
      class="article-body prose-quotes"
      use:resolveKbImages={imageResolverDeps}
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by DOMPurify in renderArticleBody() -->
      {@html renderedBody}
    </article>
  {:else if bodyIsLoading}
    <DecryptPlaceholder block length={200} />
  {:else if bodyDecryptFailed}
    <DecryptPlaceholder result={{ status: "error" }} block length={100} />
  {/if}

  {#if nonImageAttachments.length > 0}
    <section class="attachments" aria-label={m.library_attachments()}>
      {#each nonImageAttachments as att (att.id)}
        <KbAttachmentChip
          attachmentId={att.id}
          filename={att.filename}
          sizeBytes={att.sizeBytes}
        />
      {/each}
    </section>
  {/if}

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
    padding: var(--space-lg) var(--page-pad-x);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .article-title {
    font-size: 1.5rem;
    font-family: var(--theme-font-display, var(--font-display));
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

  .attachments {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .article-body {
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--ink);
  }

  .article-body :global(h1),
  .article-body :global(h2),
  .article-body :global(h3),
  .article-body :global(h4) {
    font-family: var(--theme-font-display, var(--font-display));
    font-weight: 600;
    color: var(--ink);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  .article-body :global(h1) {
    font-size: 1.5rem;
  }

  .article-body :global(h2) {
    font-size: 1.25rem;
  }

  .article-body :global(h3) {
    font-size: 1.0625rem;
  }

  .article-body :global(h4) {
    font-size: 0.9375rem;
  }

  .article-body :global(p) {
    margin-bottom: 0.75em;
  }

  .article-body :global(a) {
    color: var(--brand-text);
    text-decoration: underline;
  }

  .article-body :global(code) {
    background: var(--paper-deep, var(--surface-1));
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .article-body :global(pre) {
    background: var(--paper-deep, var(--surface-1));
    padding: var(--space-lg);
    border-radius: var(--card-radius);
    overflow-x: auto;
  }

  .article-body :global(ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .article-body :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .article-body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .article-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.75em;
  }

  .article-body :global(th),
  .article-body :global(td) {
    border: 1px solid var(--hair, var(--divider));
    padding: var(--space-sm) var(--space-md);
    text-align: left;
  }

  .article-body :global(th) {
    background: var(--paper-deep, var(--surface-1));
    font-weight: 600;
  }

  .article-body :global(hr) {
    border: none;
    border-top: 1px solid var(--hair, var(--divider));
    margin: 1.5em 0;
  }
</style>

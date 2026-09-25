/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_BodyInputs */

const en_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket belongs to this section when it meets every condition below. The section is absent when no ticket qualifies. [[#client-data #privacy]]
- The ticket is open and not on hold.
- Its priority is urgent or high.
- It is either unassigned or assigned to the signed-in user with unread replies.
**Read-position encryption and unread.** Each account stores its own read position on each ticket as ciphertext that only that account can open. The browser's crypto worker decrypts these positions. Nothing derived from read state leaves the browser, so the server cannot learn which tickets anyone has read. The section fills in as those positions decrypt rather than arriving complete, which is why it populates over the first moments after a page load. [[#encryption #privacy]]
**Overview page boundary.** The overview loads one page of open tickets and does not run the full read-state check. The membership rule applies only to the tickets on that page. A qualifying ticket in an accessible queue beyond the page does not appear here, though it appears on the tickets list, where the full check runs. [Filters](#tickets/filters) covers the same rule applied there. [[#failure-states]]
**Filter source and read-state assembly.** \`isNeedsAttention\` and \`bucketTickets\` in \`packages/client/src/lib/components/dashboard/filters.ts\` are shared with the tickets-page filter, so the see-all landing shows the same set. Read state is assembled in \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` and the cursor row is \`048_create_ticket_read_cursors.ts\`. [Unread badges](#tickets/unread-badges) covers how a reply counts as unread. [[#client-data]]`)
};

const es_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket pertenece a esta sección cuando cumple todas las condiciones siguientes. La sección no aparece cuando ningún ticket las cumple. [[#client-data #privacy]]
- El ticket está abierto y no está en espera.
- Su prioridad es urgente o alta.
- No tiene a nadie asignado, o está asignado al usuario con sesión activa y tiene respuestas sin leer.
**Cifrado de posición de lectura y no leídos.** Cada cuenta almacena su propia posición de lectura en cada ticket como texto cifrado que solo esa cuenta puede abrir. El crypto worker del navegador descifra esas posiciones. Ningún dato derivado del estado de lectura sale del navegador, por lo que el servidor no puede saber qué tickets ha leído cada persona. La sección se llena a medida que esas posiciones se descifran en lugar de llegar completa, por lo que se puebla durante los primeros instantes tras la carga de página. [[#encryption #privacy]]
**Límite de página del resumen.** El resumen carga una página de tickets abiertos y no ejecuta la comprobación completa del estado de lectura. La regla de pertenencia se aplica solo a los tickets de esa página. Un ticket que cumpla las condiciones en una cola accesible más allá de esa página no aparece aquí, aunque sí aparece en la lista de tickets, donde la comprobación completa se ejecuta. [Filtros](#tickets/filters) cubre la misma regla aplicada allí. [[#failure-states]]
**Origen del filtro y ensamblaje del estado de lectura.** \`isNeedsAttention\` y \`bucketTickets\` en \`packages/client/src/lib/components/dashboard/filters.ts\` se comparten con el filtro de la página de tickets, por lo que la vista general muestra el mismo conjunto. El estado de lectura se ensambla en \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` y la fila del cursor es \`048_create_ticket_read_cursors.ts\`. [Indicadores de no leído](#tickets/unread-badges) cubre cómo se determina que una respuesta está sin leer. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À tìckèt bèlòngs tò thìs sèctìòn whèn ìt mèèts èvèry còndìtìòn bèlòw. Thè sèctìòn ìs àbsènt whèn nò tìckèt qùàlìfìès. [[#clìènt-dàtà #prìvàcy]]
- Thè tìckèt ìs òpèn ànd nòt òn hòld.
- Ìts prìòrìty ìs ùrgènt òr hìgh.
- Ìt ìs èìthèr ùnàssìgnèd òr àssìgnèd tò thè sìgnèd-ìn ùsèr wìth ùnrèàd rèplìès.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèàd-pòsìtìòn èncryptìòn ànd ùnrèàd. •••••••••••** Èàch àccòùnt stòrès ìts òwn rèàd pòsìtìòn òn èàch tìckèt às cìphèrtèxt thàt ònly thàt àccòùnt càn òpèn. Thè bròwsèr's cryptò wòrkèr dècrypts thèsè pòsìtìòns. Nòthìng dèrìvèd fròm rèàd stàtè lèàvès thè bròwsèr, sò thè sèrvèr cànnòt lèàrn whìch tìckèts ànyònè hàs rèàd. Thè sèctìòn fìlls ìn às thòsè pòsìtìòns dècrypt ràthèr thàn àrrìvìng còmplètè, whìch ìs why ìt pòpùlàtès òvèr thè fìrst mòmènts àftèr à pàgè lòàd. [[#èncryptìòn #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Òvèrvìèw pàgè bòùndàry. •••••••** Thè òvèrvìèw lòàds ònè pàgè òf òpèn tìckèts ànd dòès nòt rùn thè fùll rèàd-stàtè chèck. Thè mèmbèrshìp rùlè àpplìès ònly tò thè tìckèts òn thàt pàgè. À qùàlìfyìng tìckèt ìn àn àccèssìblè qùèùè bèyònd thè pàgè dòès nòt àppèàr hèrè, thòùgh ìt àppèàrs òn thè tìckèts lìst, whèrè thè fùll chèck rùns. [Fìltèrs](#tìckèts/fìltèrs) còvèrs thè sàmè rùlè àpplìèd thèrè. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèr sòùrcè ànd rèàd-stàtè àssèmbly. ••••••••••••** \`ìsNèèdsÀttèntìòn\` ànd \`bùckètTìckèts\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/dàshbòàrd/fìltèrs.ts\` àrè shàrèd wìth thè tìckèts-pàgè fìltèr, sò thè sèè-àll làndìng shòws thè sàmè sèt. Rèàd stàtè ìs àssèmblèd ìn \`pàckàgès/clìènt/src/lìb/tìckèts/crèàtè-lìst-rèàd-stàtè.svèltè.ts\` ànd thè cùrsòr ròw ìs \`048_crèàtè_tìckèt_rèàd_cùrsòrs.ts\`. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs hòw à rèply còùnts às ùnrèàd. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A ticket belongs to this section when it meets every condition below. The section is absent when no ticket qualifies. [[#client-data #privacy]] - The ticket ..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_needs_attention_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_needs_attention_body(inputs)
	return en_demo_narrative_dashboard_needs_attention_body(inputs)
});
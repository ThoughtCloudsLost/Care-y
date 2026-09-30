/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_BodyInputs */

const en_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket belongs to this section when it meets every condition below. In the stacked layout the section disappears when no ticket qualifies, unless a filter is active or the lane is still loading. In the side-by-side layout the lane keeps its place. [[#client-data #privacy]]
- The ticket is open and not on hold.
- Its priority is urgent or high.
- It is either unassigned or assigned to the signed-in user with unread replies.
**Read-position encryption and unread.** Each account stores its own read position on each ticket as ciphertext that only that user can open. The browser's crypto worker decrypts these positions. Nothing derived from read state leaves the browser, so the server cannot learn which tickets anyone has read. The section fills in as those positions decrypt rather than arriving complete, which is why it populates over the first moments after a page load. [[#encryption #privacy]]
**Lane filters and membership.** "See all" on this lane opens the tickets page filtered to New and Active needs-attention tickets. Lane heading counts are exact for the lane's filters. The lane has a filter button that uses the tickets-page filters, minus the ones the lane itself fixes. The membership rule limits the section to the queues the user belongs to. [Filters](#tickets/filters) covers the same rule applied on the tickets list. [View switcher](#dashboard/view-switcher) covers how many tickets a lane shows. [[#failure-states]]
**Filter source and read-state assembly.** \`isNeedsAttention\` in \`packages/client/src/lib/components/dashboard/filters.ts\` is shared with the tickets-page filter, so the see-all landing shows the same set. Read state is assembled in \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` and the cursor row is \`048_create_ticket_read_cursors.ts\`. [Unread badges](#tickets/unread-badges) covers how a reply counts as unread. [[#client-data]]`)
};

const es_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket pertenece a esta sección cuando cumple todas las condiciones siguientes. En la disposición apilada, la sección no aparece cuando ningún ticket las cumple, salvo que haya un filtro activo o que el carril aún esté cargando. En la disposición en paralelo, el carril mantiene su lugar. [[#client-data #privacy]]
- El ticket está abierto y no está en espera.
- Su prioridad es urgente o alta.
- No tiene a nadie asignado, o está asignado a la persona usuaria con sesión activa y tiene respuestas sin leer.
**Cifrado de posición de lectura y no leídos.** Cada cuenta almacena su propia posición de lectura en cada ticket como texto cifrado que solo esa persona puede abrir. El crypto worker del navegador descifra esas posiciones. Ningún dato derivado del estado de lectura sale del navegador, por lo que el servidor no puede saber qué tickets ha leído cada persona. La sección se llena a medida que esas posiciones se descifran en lugar de llegar completa, por lo que se puebla durante los primeros instantes tras la carga de página. [[#encryption #privacy]]
**Filtros y pertenencia del carril.** "Ver todos" en este carril abre la página de tickets filtrada a tickets Nuevos y Activos que necesitan atención. Los recuentos en los encabezados de carril son exactos para los filtros del carril. El carril tiene un botón de filtro que usa los filtros de la página de tickets, menos los que el propio carril fija. La regla de pertenencia limita la sección a las colas a las que pertenece la persona usuaria. [Filtros](#tickets/filters) trata la misma regla aplicada en la lista de tickets. [Selector de vista](#dashboard/view-switcher) explica cuántos tickets muestra un carril. [[#failure-states]]
**Origen del filtro y ensamblaje del estado de lectura.** \`isNeedsAttention\` en \`packages/client/src/lib/components/dashboard/filters.ts\` se comparte con el filtro de la página de tickets, por lo que la vista general muestra el mismo conjunto. El estado de lectura se ensambla en \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` y la fila del cursor es \`048_create_ticket_read_cursors.ts\`. [Insignias de no leídos](#tickets/unread-badges) trata cómo se determina que una respuesta está sin leer. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À tìckèt bèlòngs tò thìs sèctìòn whèn ìt mèèts èvèry còndìtìòn bèlòw. Ìn thè stàckèd làyòùt thè sèctìòn dìsàppèàrs whèn nò tìckèt qùàlìfìès, ùnlèss à fìltèr ìs àctìvè òr thè lànè ìs stìll lòàdìng. Ìn thè sìdè-by-sìdè làyòùt thè lànè kèèps ìts plàcè. [[#clìènt-dàtà #prìvàcy]]
- Thè tìckèt ìs òpèn ànd nòt òn hòld.
- Ìts prìòrìty ìs ùrgènt òr hìgh.
- Ìt ìs èìthèr ùnàssìgnèd òr àssìgnèd tò thè sìgnèd-ìn ùsèr wìth ùnrèàd rèplìès.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèàd-pòsìtìòn èncryptìòn ànd ùnrèàd. •••••••••••** Èàch àccòùnt stòrès ìts òwn rèàd pòsìtìòn òn èàch tìckèt às cìphèrtèxt thàt ònly thàt ùsèr càn òpèn. Thè bròwsèr's cryptò wòrkèr dècrypts thèsè pòsìtìòns. Nòthìng dèrìvèd fròm rèàd stàtè lèàvès thè bròwsèr, sò thè sèrvèr cànnòt lèàrn whìch tìckèts ànyònè hàs rèàd. Thè sèctìòn fìlls ìn às thòsè pòsìtìòns dècrypt ràthèr thàn àrrìvìng còmplètè, whìch ìs why ìt pòpùlàtès òvèr thè fìrst mòmènts àftèr à pàgè lòàd. [[#èncryptìòn #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Lànè fìltèrs ànd mèmbèrshìp. •••••••••** "Sèè àll" òn thìs lànè òpèns thè tìckèts pàgè fìltèrèd tò Nèw ànd Àctìvè nèèds-àttèntìòn tìckèts. Lànè hèàdìng còùnts àrè èxàct fòr thè lànè's fìltèrs. Thè lànè hàs à fìltèr bùttòn thàt ùsès thè tìckèts-pàgè fìltèrs, mìnùs thè ònès thè lànè ìtsèlf fìxès. Thè mèmbèrshìp rùlè lìmìts thè sèctìòn tò thè qùèùès thè ùsèr bèlòngs tò. [Fìltèrs](#tìckèts/fìltèrs) còvèrs thè sàmè rùlè àpplìèd òn thè tìckèts lìst. [Vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr) còvèrs hòw màny tìckèts à lànè shòws. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèr sòùrcè ànd rèàd-stàtè àssèmbly. ••••••••••••** \`ìsNèèdsÀttèntìòn\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/dàshbòàrd/fìltèrs.ts\` ìs shàrèd wìth thè tìckèts-pàgè fìltèr, sò thè sèè-àll làndìng shòws thè sàmè sèt. Rèàd stàtè ìs àssèmblèd ìn \`pàckàgès/clìènt/src/lìb/tìckèts/crèàtè-lìst-rèàd-stàtè.svèltè.ts\` ànd thè cùrsòr ròw ìs \`048_crèàtè_tìckèt_rèàd_cùrsòrs.ts\`. [Ùnrèàd bàdgès](#tìckèts/ùnrèàd-bàdgès) còvèrs hòw à rèply còùnts às ùnrèàd. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A ticket belongs to this section when it meets every condition below. In the stacked layout the section disappears when no ticket qualifies, unless a filter ..." |
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
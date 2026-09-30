/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Split_View_BodyInputs */

const en_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A wide window shows the ticket list and an open ticket side by side. Choosing a ticket in the list replaces the open ticket in the second pane. The list keeps its scroll position and its loaded pages. [[#client-data]]
**Each ticket as its own page in a narrow window.** A narrow window opens each ticket as its own page. Narrowing the window with a ticket open navigates to that ticket's page rather than closing it. [[#client-data]]
**What does the address hold?** Opening a ticket in the pane pushes a history entry whose state carries the ticket's ID, but the address bar stays unchanged. The pane offers expanding the ticket to its own page. That action puts the ticket's ID in the address, which is what makes the page linkable. [[#privacy #metadata]]
**What does the pane ask the server?** The pane fetches one ticket exactly as its own page does. Reading ten tickets in the pane produces the same ten reads as opening them one page at a time. [[#server-holds #metadata]]
**The layout and its handoff.** \`+layout.svelte\` in \`packages/client/src/routes/(app)/tickets/\` chooses between the two arrangements. \`layout-mode.svelte.ts\` in \`packages/client/src/lib/stores/\` holds the width test. \`split-handoff.svelte.ts\` preserves the open ticket across a width change. [The case header](#ticket-detail/case-header) covers what the open pane renders. [[#client-data]]`)
};

const es_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una ventana amplia muestra la lista de tickets y un ticket abierto lado a lado. Al elegir un ticket en la lista se reemplaza el ticket abierto en el segundo panel. La lista conserva su posición de desplazamiento y las páginas que ya cargó. [[#client-data]]
**Cada ticket como su propia página en una ventana estrecha.** Una ventana estrecha abre cada ticket como su propia página. Reducir la ventana con un ticket abierto navega a la página de ese ticket en lugar de cerrarlo. [[#client-data]]
**¿Qué contiene la dirección?** Abrir un ticket en el panel agrega una entrada al historial cuyo estado lleva el ID del ticket, pero la barra de direcciones no cambia. El panel ofrece expandir el ticket a su propia página. Esa acción pone el ID del ticket en la dirección, que es lo que hace enlazable la página. [[#privacy #metadata]]
**¿Qué le pide el panel al servidor?** El panel obtiene un ticket exactamente como lo hace su propia página. Leer diez tickets en el panel produce las mismas diez lecturas que abrirlos uno por uno en páginas separadas. [[#server-holds #metadata]]
**La disposición y su traspaso.** \`+layout.svelte\` en \`packages/client/src/routes/(app)/tickets/\` elige entre las dos disposiciones. \`layout-mode.svelte.ts\` en \`packages/client/src/lib/stores/\` contiene la prueba de ancho. \`split-handoff.svelte.ts\` conserva el ticket abierto durante un cambio de ancho. [El encabezado del caso](#ticket-detail/case-header) cubre lo que el panel abierto muestra. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À wìdè wìndòw shòws thè tìckèt lìst ànd àn òpèn tìckèt sìdè by sìdè. Chòòsìng à tìckèt ìn thè lìst rèplàcès thè òpèn tìckèt ìn thè sècònd pànè. Thè lìst kèèps ìts scròll pòsìtìòn ànd ìts lòàdèd pàgès. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èàch tìckèt às ìts òwn pàgè ìn à nàrròw wìndòw. •••••••••••••••** À nàrròw wìndòw òpèns èàch tìckèt às ìts òwn pàgè. Nàrròwìng thè wìndòw wìth à tìckèt òpèn nàvìgàtès tò thàt tìckèt's pàgè ràthèr thàn clòsìng ìt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè àddrèss hòld? •••••••••** Òpènìng à tìckèt ìn thè pànè pùshès à hìstòry èntry whòsè stàtè càrrìès thè tìckèt's ÌD, bùt thè àddrèss bàr stàys ùnchàngèd. Thè pànè òffèrs èxpàndìng thè tìckèt tò ìts òwn pàgè. Thàt àctìòn pùts thè tìckèt's ÌD ìn thè àddrèss, whìch ìs whàt màkès thè pàgè lìnkàblè. [[#prìvàcy #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè pànè àsk thè sèrvèr? •••••••••••** Thè pànè fètchès ònè tìckèt èxàctly às ìts òwn pàgè dòès. Rèàdìng tèn tìckèts ìn thè pànè pròdùcès thè sàmè tèn rèàds às òpènìng thèm ònè pàgè àt à tìmè. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè làyòùt ànd ìts hàndòff. •••••••••** \`+làyòùt.svèltè\` ìn \`pàckàgès/clìènt/src/ròùtès/(àpp)/tìckèts/\` chòòsès bètwèèn thè twò àrràngèmènts. \`làyòùt-mòdè.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/stòrès/\` hòlds thè wìdth tèst. \`splìt-hàndòff.svèltè.ts\` prèsèrvès thè òpèn tìckèt àcròss à wìdth chàngè. [Thè càsè hèàdèr](#tìckèt-dètàìl/càsè-hèàdèr) còvèrs whàt thè òpèn pànè rèndèrs. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A wide window shows the ticket list and an open ticket side by side. Choosing a ticket in the list replaces the open ticket in the second pane. The list keep..." |
*
* @param {Demo_Narrative_Topic_Split_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_split_view_body = /** @type {((inputs?: Demo_Narrative_Topic_Split_View_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Split_View_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_split_view_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_split_view_body(inputs)
	return en_demo_narrative_topic_split_view_body(inputs)
});
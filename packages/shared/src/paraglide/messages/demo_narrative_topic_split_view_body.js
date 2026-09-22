/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Split_View_BodyInputs */

const en_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On a wide enough window the list keeps a ticket open alongside it, so choosing another ticket replaces the open one and never the list. [[#client-data]]
**What stays out of the address while a ticket is open beside the list.** The open ticket is carried in the browser's history state rather than in the address, so the address bar and the session's history hold no ticket identifier for as long as the pane is used this way. Opening a ticket on its own page puts the identifier in the address, which is what makes that page linkable. [[#privacy #metadata]]
**What the window width decides.** A window at least 1024 pixels wide arranges the two panes; a narrower one opens each ticket as its own page. Narrowing a window with a ticket open moves that ticket to its own page rather than closing it, and the list is where a return lands. [[#client-data]]
**What the server is asked either way.** The same queries. The pane fetches one ticket the way its own page would, and the list keeps the pages it had already loaded, so a reader moving through ten tickets in the pane produces the same ten reads it would have produced one page at a time. [[#server-holds #metadata]]
**The layout and its handoff.** \`packages/client/src/routes/(app)/tickets/+layout.svelte\` chooses between the two arrangements, the width test is \`packages/client/src/lib/stores/layout-mode.svelte.ts\`, and \`split-handoff.svelte.ts\` holds the ticket across the frames of a width change so neither arrangement drops it. [The case header](#ticket-detail/case-header) covers what the pane renders. [[#client-data]]`)
};

const es_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En una ventana lo bastante ancha, la lista mantiene un ticket abierto a su lado, de modo que elegir otro ticket sustituye al abierto y nunca a la lista. [[#client-data]]
**Qué queda fuera de la dirección mientras un ticket está abierto junto a la lista.** El ticket abierto se lleva en el estado de historial del navegador y no en la dirección, así que la barra de direcciones y el historial de la sesión no guardan ningún identificador de ticket mientras el panel se use así. Abrir un ticket en su propia página pone el identificador en la dirección, que es lo que hace que esa página se pueda enlazar. [[#privacy #metadata]]
**Qué decide el ancho de la ventana.** Una ventana de al menos 1024 píxeles de ancho dispone los dos paneles; una más estrecha abre cada ticket como página propia. Estrechar una ventana con un ticket abierto traslada ese ticket a su propia página en lugar de cerrarlo, y la lista es donde aterriza la vuelta. [[#client-data]]
**Qué se le pide al servidor en ambos casos.** Las mismas consultas. El panel pide un ticket igual que lo haría su propia página, y la lista conserva las páginas que ya había cargado, de modo que quien recorra diez tickets en el panel produce las mismas diez lecturas que habría producido de página en página. [[#server-holds #metadata]]
**La disposición y su relevo.** \`packages/client/src/routes/(app)/tickets/+layout.svelte\` elige entre las dos disposiciones, la prueba de ancho es \`packages/client/src/lib/stores/layout-mode.svelte.ts\`, y \`split-handoff.svelte.ts\` sostiene el ticket durante los fotogramas de un cambio de ancho para que ninguna de las dos lo suelte. [La cabecera del caso](#ticket-detail/case-header) trata lo que muestra el panel. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_split_view_body = /** @type {(inputs: Demo_Narrative_Topic_Split_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òn wìdèr scrèèns, thè tìckèt lìst sùppòrts à splìt vìèw whèrè thè lìst ànd à tìckèt dètàìl pànè sìt sìdè by sìdè. Sèlèctìng à tìckèt fròm thè lìst òpèns ìts dètàìl ìn thè rìght pànè wìthòùt nàvìgàtìng àwày fròm thè lìst.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt àppèàrs. •••••** Thè splìt vìèw àctìvàtès àùtòmàtìcàlly whèn thè scrèèn ìs wìdè ènòùgh. Òn mòbìlè òr nàrròw wìndòws, tàppìng à tìckèt nàvìgàtès tò à fùll scrèèn dètàìl vìèw ìnstèàd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••**Fùll scrèèn. ••••** Dòùblè tàppìng à tìckèt òr clìckìng thè èxpànd ìcòn ìn thè tìckèt dètàìl pànè òpèns ìt fùll scrèèn èvèn whìlè thè splìt vìèw ìs àctìvè. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "On a wide enough window the list keeps a ticket open alongside it, so choosing another ticket replaces the open one and never the list. [[#client-data]] **Wh..." |
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
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Search_BodyInputs */

const en_demo_narrative_topic_list_search_body = /** @type {(inputs: Demo_Narrative_Topic_List_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching this page matches what the browser has already decrypted and steps through the matches one at a time without leaving the list. [[#client-data #privacy #search]]
**What a term is matched against.** The title, the client alias, the queue name and the assignee of each loaded row, joined and matched loosely, so a term can hit any of the four. A row whose title has not finished decrypting is left out until it has, which is why a match can appear a moment after typing stops. The term itself is compared in the browser and never sent anywhere. [[#encryption #client-data]]
**When the loaded rows hold no match.** A deeper pass starts on its own: it fetches the remaining pages of the list, then asks for the follow-up ciphertext of those tickets in batches and decrypts it in the browser to match message content as well, reporting how far it has reached. A page it cannot fetch ends the pass rather than letting a partial sweep report itself as complete coverage. [[#failure-states]]
**What the server sees during a search.** No term and no result. What it serves is the paging it would serve anyway and, during a deeper pass, requests for follow-up content by ticket id, so what a database dump or a request log shows is that an account read a large part of its queues at one moment, without which words it was looking for. [Filters](#tickets/filters) covers the same question for a filter request. [[#server-holds #metadata #trust-boundary]]
**The overlay, the pass and the provider.** The in-page navigation is \`packages/client/src/lib/search/search-overlay.svelte.ts\`, the deeper pass is \`packages/client/src/lib/search/deep-search.svelte.ts\`, and the matching and content fetching are the tickets provider in \`packages/client/src/lib/search/providers/tickets.ts\`, which the navigation bar's search shares. [Search](#search/how-it-works) covers the shared surface. [[#client-data]]`)
};

const es_demo_narrative_topic_list_search_body = /** @type {(inputs: Demo_Narrative_Topic_List_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en esta página compara con lo que el navegador ya ha descifrado y recorre las coincidencias de una en una sin salir de la lista. [[#client-data #privacy #search]]
**Con qué se compara un término.** El título, el alias del cliente, el nombre de la cola y la persona asignada de cada fila cargada, unidos y comparados de forma laxa, de modo que un término puede acertar en cualquiera de los cuatro. Una fila cuyo título no ha terminado de descifrarse queda fuera hasta que lo haga, y por eso una coincidencia puede aparecer un momento después de dejar de escribir. El término se compara en el navegador y no se envía a ninguna parte. [[#encryption #client-data]]
**Cuando las filas cargadas no tienen ninguna coincidencia.** Se inicia por su cuenta una pasada más profunda: recupera las páginas restantes de la lista, luego pide por lotes el texto cifrado de los seguimientos de esos tickets y lo descifra en el navegador para comparar también el contenido de los mensajes, e informa de hasta dónde ha llegado. Una página que no consigue recuperar termina la pasada en lugar de dejar que un barrido parcial se presente como cobertura completa. [[#failure-states]]
**Qué ve el servidor durante una búsqueda.** Ningún término y ningún resultado. Lo que sirve es la paginación que serviría de todos modos y, durante una pasada profunda, peticiones de contenido de seguimientos por identificador de ticket, así que lo que muestra un volcado de la base de datos o un registro de peticiones es que una cuenta leyó gran parte de sus colas en un momento dado, sin qué palabras buscaba. [Filtros](#tickets/filters) trata esa misma pregunta para una petición de filtro. [[#server-holds #metadata #trust-boundary]]
**La capa de navegación, la pasada y el proveedor.** La navegación dentro de la página es \`packages/client/src/lib/search/search-overlay.svelte.ts\`, la pasada profunda es \`packages/client/src/lib/search/deep-search.svelte.ts\`, y la comparación y la recuperación de contenido son el proveedor de tickets de \`packages/client/src/lib/search/providers/tickets.ts\`, que comparte la búsqueda de la barra de navegación. [Búsqueda](#search/how-it-works) trata esa superficie compartida. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_list_search_body = /** @type {(inputs: Demo_Narrative_Topic_List_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè màgnìfìèr nèxt tò thè fìltèr pìlls ìn thè tòòlbàr òpèns à sèàrch ròw fòr thè tìckèt lìst. Typìng màtchès àgàìnst thè tìckèts thè bròwsèr hàs àlrèàdy dècryptèd, ànd nàvìgàtìòn bùttòns stèp thròùgh thè màtchès ìn òrdèr.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèèp sèàrch. ••••** Whèn thè lòàdèd tìckèts pròdùcè nò màtch, thè sèàrch òffèrs tò fètch ànd dècrypt thè rèmàìnìng tìckèts ànd sèàrch thòsè às wèll. À prògrèss ìndìcàtòr shòws hòw màny hàvè bèèn còvèrèd òùt òf thè tòtàl.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèlàtìònshìp tò glòbàl sèàrch. •••••••••** Thìs sèàrch stàys òn thè tìckèt lìst ànd wàlks thròùgh màtchès ìn plàcè. Thè glòbàl sèàrch ìn thè nàvìgàtìòn bàr, dèscrìbèd ìn ìts òwn sèctìòn, sèàrchès àcròss tìckèts, àrtìclès, ànd vòlùntèèrs àt òncè, ànd lìkè èvèry sèàrch ìn CÀRÈ-Y thè tèrms nèvèr lèàvè thè dèvìcè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Searching this page matches what the browser has already decrypted and steps through the matches one at a time without leaving the list. [[#client-data #priv..." |
*
* @param {Demo_Narrative_Topic_List_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_search_body = /** @type {((inputs?: Demo_Narrative_Topic_List_Search_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Search_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_list_search_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_list_search_body(inputs)
	return en_demo_narrative_topic_list_search_body(inputs)
});
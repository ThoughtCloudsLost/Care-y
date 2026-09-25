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
	return /** @type {LocalizedString} */ (`⟦Sèàrchìng thìs pàgè màtchès whàt thè bròwsèr hàs àlrèàdy dècryptèd ànd stèps thròùgh thè màtchès ònè àt à tìmè wìthòùt lèàvìng thè lìst. [[#clìènt-dàtà #prìvàcy #sèàrch]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt à tèrm ìs màtchèd àgàìnst. ••••••••••** Thè tìtlè, thè clìènt àlìàs, thè qùèùè nàmè ànd thè àssìgnèè òf èàch lòàdèd ròw, jòìnèd ànd màtchèd lòòsèly, sò à tèrm càn hìt àny òf thè fòùr. À ròw whòsè tìtlè hàs nòt fìnìshèd dècryptìng ìs lèft òùt ùntìl ìt hàs, whìch ìs why à màtch càn àppèàr à mòmènt àftèr typìng stòps. Thè tèrm ìtsèlf ìs còmpàrèd ìn thè bròwsèr ànd nèvèr sènt ànywhèrè. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn thè lòàdèd ròws hòld nò màtch. •••••••••••** À dèèpèr pàss stàrts òn ìts òwn: ìt fètchès thè rèmàìnìng pàgès òf thè lìst, thèn àsks fòr thè fòllòw-ùp cìphèrtèxt òf thòsè tìckèts ìn bàtchès ànd dècrypts ìt ìn thè bròwsèr tò màtch mèssàgè còntènt às wèll, rèpòrtìng hòw fàr ìt hàs rèàchèd. À pàgè ìt cànnòt fètch ènds thè pàss ràthèr thàn lèttìng à pàrtìàl swèèp rèpòrt ìtsèlf às còmplètè còvèràgè. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr sèès dùrìng à sèàrch. ••••••••••••** Nò tèrm ànd nò rèsùlt. Whàt ìt sèrvès ìs thè pàgìng ìt wòùld sèrvè ànywày ànd, dùrìng à dèèpèr pàss, rèqùèsts fòr fòllòw-ùp còntènt by tìckèt ìd, sò whàt à dàtàbàsè dùmp òr à rèqùèst lòg shòws ìs thàt àn àccòùnt rèàd à làrgè pàrt òf ìts qùèùès àt ònè mòmènt, wìthòùt whìch wòrds ìt wàs lòòkìng fòr. [Fìltèrs](#tìckèts/fìltèrs) còvèrs thè sàmè qùèstìòn fòr à fìltèr rèqùèst. [[#sèrvèr-hòlds #mètàdàtà #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè òvèrlày, thè pàss ànd thè pròvìdèr. ••••••••••••** Thè ìn-pàgè nàvìgàtìòn ìs \`pàckàgès/clìènt/src/lìb/sèàrch/sèàrch-òvèrlày.svèltè.ts\`, thè dèèpèr pàss ìs \`pàckàgès/clìènt/src/lìb/sèàrch/dèèp-sèàrch.svèltè.ts\`, ànd thè màtchìng ànd còntènt fètchìng àrè thè tìckèts pròvìdèr ìn \`pàckàgès/clìènt/src/lìb/sèàrch/pròvìdèrs/tìckèts.ts\`, whìch thè nàvìgàtìòn bàr's sèàrch shàrès. [Sèàrch](#sèàrch/hòw-ìt-wòrks) còvèrs thè shàrèd sùrfàcè. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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
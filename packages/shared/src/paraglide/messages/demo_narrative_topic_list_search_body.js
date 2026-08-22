/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Search_BodyInputs */

const en_demo_narrative_topic_list_search_body = /** @type {(inputs: Demo_Narrative_Topic_List_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The magnifier next to the filter pills in the toolbar opens a search row for the ticket list. Typing matches against the tickets the browser has already decrypted, and navigation buttons step through the matches in order.
**Deep search.** When the loaded tickets produce no match, the search offers to fetch and decrypt the remaining tickets and search those as well. A progress indicator shows how many have been covered out of the total.
**Relationship to global search.** This search stays on the ticket list and walks through matches in place. The global search in the navigation bar, described in its own section, searches across tickets, articles, and volunteers at once, and like every search in CARE-Y the terms never leave the device.`)
};

const es_demo_narrative_topic_list_search_body = /** @type {(inputs: Demo_Narrative_Topic_List_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lupa junto a las pastillas de filtro en la barra de herramientas abre una fila de búsqueda para la lista de tickets. Al escribir, compara contra los tickets que el navegador ya ha descifrado, y botones de navegación avanzan por las coincidencias en orden.
**Búsqueda profunda.** Cuando los tickets cargados no producen ninguna coincidencia, la búsqueda ofrece obtener y descifrar los tickets restantes y buscar en ellos también. Un indicador de progreso muestra cuántos se han cubierto del total.
**Relación con la búsqueda global.** Esta búsqueda se mantiene en la lista de tickets y recorre las coincidencias en su lugar. La búsqueda global en la barra de navegación, descrita en su propia sección, busca en tickets, artículos y voluntarios a la vez, y como toda búsqueda en CARE-Y los términos nunca salen del dispositivo.`)
};

/**
* | output |
* | --- |
* | "The magnifier next to the filter pills in the toolbar opens a search row for the ticket list. Typing matches against the tickets the browser has already decr..." |
*
* @param {Demo_Narrative_Topic_List_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_search_body = /** @type {((inputs?: Demo_Narrative_Topic_List_Search_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Search_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_list_search_body(inputs)
	return es_demo_narrative_topic_list_search_body(inputs)
});
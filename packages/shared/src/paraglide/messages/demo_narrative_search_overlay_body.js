/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Overlay_BodyInputs */

const en_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The search sheet shows recent searches and strips of recently viewed tickets and articles.
**Result groups.** Results group by type, and the group matching the current page sorts first, so searching from the ticket list puts ticket results on top. Each group shows how many matches were found.`)
};

const es_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de búsqueda muestra búsquedas recientes y tiras de tickets y artículos vistos recientemente.
**Grupos de resultados.** Los resultados se agrupan por tipo, y el grupo que coincide con la página actual se ordena primero, por lo que buscar desde la lista de tickets pone los resultados de tickets arriba. Cada grupo muestra cuántas coincidencias se encontraron.`)
};

/**
* | output |
* | --- |
* | "The search sheet shows recent searches and strips of recently viewed tickets and articles. **Result groups.** Results group by type, and the group matching t..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body = /** @type {((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_overlay_body(inputs)
	return en_demo_narrative_search_overlay_body(inputs)
});
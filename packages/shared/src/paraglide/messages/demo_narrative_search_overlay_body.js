/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Overlay_BodyInputs */

const en_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The magnifier in the navigation bar swaps the title for a search field, and results appear in a sheet below as you type.
**Before typing.** The sheet shows recent searches, which can be removed one at a time or cleared, and strips of recently viewed tickets and articles for jumping back to something already open.
**Result groups.** Results group by type, and the group matching the current page sorts first, so searching from the ticket list puts ticket results on top. Each group shows how many matches were found and a show all link that opens the full filtered list.
**Navigation.** Tapping a result opens it and closes the search, and tapping a recent search runs it again.`)
};

const es_demo_narrative_search_overlay_body = /** @type {(inputs: Demo_Narrative_Search_Overlay_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lupa en la barra de navegación reemplaza el título por un campo de búsqueda, y los resultados aparecen en una hoja debajo mientras escribes.
**Antes de escribir.** La hoja muestra búsquedas recientes, que se pueden eliminar una por una o borrar todas, y tiras de tickets y artículos vistos recientemente para volver rápidamente a algo ya abierto.
**Grupos de resultados.** Los resultados se agrupan por tipo, y el grupo que coincide con la página actual se ordena primero, por lo que buscar desde la lista de tickets pone los resultados de tickets arriba. Cada grupo muestra cuántas coincidencias se encontraron y un enlace de mostrar todos que abre la lista filtrada completa.
**Navegación.** Tocar un resultado lo abre y cierra la búsqueda, y tocar una búsqueda reciente la ejecuta de nuevo.`)
};

/**
* | output |
* | --- |
* | "The magnifier in the navigation bar swaps the title for a search field, and results appear in a sheet below as you type. **Before typing.** The sheet shows r..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body = /** @type {((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_overlay_body(inputs)
	return es_demo_narrative_search_overlay_body(inputs)
});
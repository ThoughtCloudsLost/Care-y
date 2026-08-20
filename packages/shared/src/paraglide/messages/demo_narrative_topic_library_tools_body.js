/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Tools_BodyInputs */

const en_demo_narrative_topic_library_tools_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library list carries the same toolbox as the ticket list, tuned for articles.
**View modes.** Table, rows, cards, and grid layouts, with the choice saved locally.
**Sort.** Articles sort by creation date, last update, or rating.
**Filters.** Pills narrow by category, rating, author, and date range, and filter combinations can be saved as named presets.
**Bulk actions.** Select mode allows moving articles between categories, exporting them, and deleting them, with deletion behind both a permission check and a confirmation.`)
};

const es_demo_narrative_topic_library_tools_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de la biblioteca lleva la misma caja de herramientas que la lista de tickets, adaptada para artículos.
**Modos de vista.** Disposiciones de tabla, filas, tarjetas y cuadrícula, con la elección guardada localmente.
**Ordenar.** Los artículos se ordenan por fecha de creación, última actualización o valoración.
**Filtros.** Pastillas filtran por categoría, valoración, autor y rango de fechas, y las combinaciones de filtros se pueden guardar como presets con nombre.
**Acciones masivas.** El modo de selección permite mover artículos entre categorías, exportarlos y eliminarlos, con la eliminación protegida tanto por una comprobación de permisos como por una confirmación.`)
};

/**
* | output |
* | --- |
* | "The library list carries the same toolbox as the ticket list, tuned for articles. **View modes.** Table, rows, cards, and grid layouts, with the choice saved..." |
*
* @param {Demo_Narrative_Topic_Library_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_tools_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Tools_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Tools_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_tools_body(inputs)
	return es_demo_narrative_topic_library_tools_body(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Search_BodyInputs */

const en_demo_entry_search_body = /** @type {(inputs: Demo_Entry_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The magnifying glass in the top bar searches across all handbook sections. Click a result to jump to that part of the handbook.`)
};

const es_demo_entry_search_body = /** @type {(inputs: Demo_Entry_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lupa en la barra superior o la fila de búsqueda en el menú de contenidos abre una búsqueda de texto completo en todas las secciones del manual. Los resultados aparecen como entradas del manual con las coincidencias resaltadas, y las etiquetas en la parte superior filtran por sección para saltar directamente al encabezado que corresponda.`)
};

/**
* | output |
* | --- |
* | "The magnifying glass in the top bar searches across all handbook sections. Click a result to jump to that part of the handbook." |
*
* @param {Demo_Entry_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_search_body = /** @type {((inputs?: Demo_Entry_Search_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Search_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_search_body(inputs)
	return en_demo_entry_search_body(inputs)
});
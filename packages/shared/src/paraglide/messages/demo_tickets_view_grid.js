/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_View_GridInputs */

const en_demo_tickets_view_grid = /** @type {(inputs: Demo_Tickets_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching to grid view`)
};

const es_demo_tickets_view_grid = /** @type {(inputs: Demo_Tickets_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiando a vista de cuadricula`)
};

/**
* | output |
* | --- |
* | "Switching to grid view" |
*
* @param {Demo_Tickets_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_grid = /** @type {((inputs?: Demo_Tickets_View_GridInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_View_GridInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tickets_view_grid(inputs)
	return es_demo_tickets_view_grid(inputs)
});
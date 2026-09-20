/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_View_GridInputs */

const en_demo_tickets_view_grid = /** @type {(inputs: Demo_Tickets_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching to grid view`)
};

const es_demo_tickets_view_grid = /** @type {(inputs: Demo_Tickets_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiando a vista de cuadrícula`)
};

const en_xa2_demo_tickets_view_grid = /** @type {(inputs: Demo_Tickets_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtchìng tò grìd vìèw •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switching to grid view" |
*
* @param {Demo_Tickets_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_grid = /** @type {((inputs?: Demo_Tickets_View_GridInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_View_GridInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_tickets_view_grid(inputs)
	if (locale === "en-XA") return en_xa2_demo_tickets_view_grid(inputs)
	return en_demo_tickets_view_grid(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Agg_Menu_LabelInputs */

const en_demo_agg_menu_label = /** @type {(inputs: Demo_Agg_Menu_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reference pages`)
};

const es_demo_agg_menu_label = /** @type {(inputs: Demo_Agg_Menu_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paginas de referencia`)
};

/**
* | output |
* | --- |
* | "Reference pages" |
*
* @param {Demo_Agg_Menu_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_agg_menu_label = /** @type {((inputs?: Demo_Agg_Menu_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Agg_Menu_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_agg_menu_label(inputs)
	return en_demo_agg_menu_label(inputs)
});
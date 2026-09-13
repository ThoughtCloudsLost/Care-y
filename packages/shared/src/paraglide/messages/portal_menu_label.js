/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Menu_LabelInputs */

const en_portal_menu_label = /** @type {(inputs: Portal_Menu_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Menu`)
};

const es_portal_menu_label = /** @type {(inputs: Portal_Menu_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Menú`)
};

/**
* | output |
* | --- |
* | "Menu" |
*
* @param {Portal_Menu_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_menu_label = /** @type {((inputs?: Portal_Menu_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Menu_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_menu_label(inputs)
	return es_portal_menu_label(inputs)
});
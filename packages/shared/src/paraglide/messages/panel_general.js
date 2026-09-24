/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_GeneralInputs */

const en_panel_general = /** @type {(inputs: Panel_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General`)
};

const es_panel_general = /** @type {(inputs: Panel_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General`)
};

const en_xa2_panel_general = /** @type {(inputs: Panel_GeneralInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràl •••⟧`)
};

/**
* | output |
* | --- |
* | "General" |
*
* @param {Panel_GeneralInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_general = /** @type {((inputs?: Panel_GeneralInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_GeneralInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_general(inputs)
	if (locale === "en-XA") return en_xa2_panel_general(inputs)
	return en_panel_general(inputs)
});
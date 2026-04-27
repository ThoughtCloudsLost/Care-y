/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_RetentionInputs */

const en_panel_retention = /** @type {(inputs: Panel_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention`)
};

const es_panel_retention = /** @type {(inputs: Panel_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retencion`)
};

/**
* | output |
* | --- |
* | "Retention" |
*
* @param {Panel_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_retention = /** @type {((inputs?: Panel_RetentionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_RetentionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_retention(inputs)
	return es_panel_retention(inputs)
});
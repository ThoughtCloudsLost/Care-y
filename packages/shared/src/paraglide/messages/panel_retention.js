/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_RetentionInputs */

const en_panel_retention = /** @type {(inputs: Panel_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention`)
};

const es_panel_retention = /** @type {(inputs: Panel_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retención`)
};

const en_xa2_panel_retention = /** @type {(inputs: Panel_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètèntìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Retention" |
*
* @param {Panel_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_retention = /** @type {((inputs?: Panel_RetentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_RetentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_retention(inputs)
	if (locale === "en-XA") return en_xa2_panel_retention(inputs)
	return en_panel_retention(inputs)
});
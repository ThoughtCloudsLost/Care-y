/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_KeysInputs */

const en_panel_keys = /** @type {(inputs: Panel_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keys`)
};

const es_panel_keys = /** @type {(inputs: Panel_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves`)
};

/**
* | output |
* | --- |
* | "Keys" |
*
* @param {Panel_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_keys = /** @type {((inputs?: Panel_KeysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_KeysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_keys(inputs)
	return es_panel_keys(inputs)
});
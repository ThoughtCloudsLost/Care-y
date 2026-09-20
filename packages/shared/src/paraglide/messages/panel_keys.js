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

const en_xa2_panel_keys = /** @type {(inputs: Panel_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèys ••⟧`)
};

/**
* | output |
* | --- |
* | "Keys" |
*
* @param {Panel_KeysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_keys = /** @type {((inputs?: Panel_KeysInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_KeysInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_keys(inputs)
	if (locale === "en-XA") return en_xa2_panel_keys(inputs)
	return en_panel_keys(inputs)
});
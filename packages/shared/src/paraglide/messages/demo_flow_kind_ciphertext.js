/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_CiphertextInputs */

const en_demo_flow_kind_ciphertext = /** @type {(inputs: Demo_Flow_Kind_CiphertextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ciphertext`)
};

const es_demo_flow_kind_ciphertext = /** @type {(inputs: Demo_Flow_Kind_CiphertextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto cifrado`)
};

const en_xa2_demo_flow_kind_ciphertext = /** @type {(inputs: Demo_Flow_Kind_CiphertextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cìphèrtèxt •••⟧`)
};

/**
* | output |
* | --- |
* | "Ciphertext" |
*
* @param {Demo_Flow_Kind_CiphertextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_ciphertext = /** @type {((inputs?: Demo_Flow_Kind_CiphertextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_CiphertextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_ciphertext(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_ciphertext(inputs)
	return en_demo_flow_kind_ciphertext(inputs)
});
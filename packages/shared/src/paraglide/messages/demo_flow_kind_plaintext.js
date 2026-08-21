/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_PlaintextInputs */

const en_demo_flow_kind_plaintext = /** @type {(inputs: Demo_Flow_Kind_PlaintextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plaintext`)
};

const es_demo_flow_kind_plaintext = /** @type {(inputs: Demo_Flow_Kind_PlaintextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto plano`)
};

/**
* | output |
* | --- |
* | "Plaintext" |
*
* @param {Demo_Flow_Kind_PlaintextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext = /** @type {((inputs?: Demo_Flow_Kind_PlaintextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_PlaintextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_plaintext(inputs)
	return es_demo_flow_kind_plaintext(inputs)
});
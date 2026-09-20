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

const en_xa2_demo_flow_kind_plaintext = /** @type {(inputs: Demo_Flow_Kind_PlaintextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plàìntèxt •••⟧`)
};

/**
* | output |
* | --- |
* | "Plaintext" |
*
* @param {Demo_Flow_Kind_PlaintextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext = /** @type {((inputs?: Demo_Flow_Kind_PlaintextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_PlaintextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_kind_plaintext(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_kind_plaintext(inputs)
	return en_demo_flow_kind_plaintext(inputs)
});
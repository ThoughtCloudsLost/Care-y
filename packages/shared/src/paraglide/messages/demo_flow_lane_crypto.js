/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Lane_CryptoInputs */

const en_demo_flow_lane_crypto = /** @type {(inputs: Demo_Flow_Lane_CryptoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encryption`)
};

const es_demo_flow_lane_crypto = /** @type {(inputs: Demo_Flow_Lane_CryptoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrado`)
};

const en_xa2_demo_flow_lane_crypto = /** @type {(inputs: Demo_Flow_Lane_CryptoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Encryption" |
*
* @param {Demo_Flow_Lane_CryptoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_crypto = /** @type {((inputs?: Demo_Flow_Lane_CryptoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_CryptoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_lane_crypto(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_lane_crypto(inputs)
	return en_demo_flow_lane_crypto(inputs)
});
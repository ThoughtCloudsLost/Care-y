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

/**
* | output |
* | --- |
* | "Encryption" |
*
* @param {Demo_Flow_Lane_CryptoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_crypto = /** @type {((inputs?: Demo_Flow_Lane_CryptoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_CryptoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_lane_crypto(inputs)
	return es_demo_flow_lane_crypto(inputs)
});
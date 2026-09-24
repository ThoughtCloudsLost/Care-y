/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Lane_TrpcInputs */

const en_demo_flow_lane_trpc = /** @type {(inputs: Demo_Flow_Lane_TrpcInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`API`)
};

const es_demo_flow_lane_trpc = /** @type {(inputs: Demo_Flow_Lane_TrpcInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`API`)
};

const en_xa2_demo_flow_lane_trpc = /** @type {(inputs: Demo_Flow_Lane_TrpcInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÀPÌ •⟧`)
};

/**
* | output |
* | --- |
* | "API" |
*
* @param {Demo_Flow_Lane_TrpcInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_trpc = /** @type {((inputs?: Demo_Flow_Lane_TrpcInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_TrpcInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_lane_trpc(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_lane_trpc(inputs)
	return en_demo_flow_lane_trpc(inputs)
});
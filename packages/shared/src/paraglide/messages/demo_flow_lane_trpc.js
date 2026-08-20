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

/**
* | output |
* | --- |
* | "API" |
*
* @param {Demo_Flow_Lane_TrpcInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_trpc = /** @type {((inputs?: Demo_Flow_Lane_TrpcInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_TrpcInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_lane_trpc(inputs)
	return es_demo_flow_lane_trpc(inputs)
});
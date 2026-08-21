/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_Round_TripInputs */

const en_demo_flow_detail_round_trip = /** @type {(inputs: Demo_Flow_Detail_Round_TripInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Round trip`)
};

const es_demo_flow_detail_round_trip = /** @type {(inputs: Demo_Flow_Detail_Round_TripInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ida y vuelta`)
};

/**
* | output |
* | --- |
* | "Round trip" |
*
* @param {Demo_Flow_Detail_Round_TripInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_round_trip = /** @type {((inputs?: Demo_Flow_Detail_Round_TripInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Round_TripInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_round_trip(inputs)
	return es_demo_flow_detail_round_trip(inputs)
});
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

const en_xa2_demo_flow_detail_round_trip = /** @type {(inputs: Demo_Flow_Detail_Round_TripInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròùnd trìp •••⟧`)
};

/**
* | output |
* | --- |
* | "Round trip" |
*
* @param {Demo_Flow_Detail_Round_TripInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_round_trip = /** @type {((inputs?: Demo_Flow_Detail_Round_TripInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Round_TripInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_round_trip(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_round_trip(inputs)
	return en_demo_flow_detail_round_trip(inputs)
});
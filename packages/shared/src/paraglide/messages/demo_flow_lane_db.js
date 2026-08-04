/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Lane_DbInputs */

const en_demo_flow_lane_db = /** @type {(inputs: Demo_Flow_Lane_DbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Database`)
};

const es_demo_flow_lane_db = /** @type {(inputs: Demo_Flow_Lane_DbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Base de datos`)
};

/**
* | output |
* | --- |
* | "Database" |
*
* @param {Demo_Flow_Lane_DbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_db = /** @type {((inputs?: Demo_Flow_Lane_DbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_DbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_lane_db(inputs)
	return es_demo_flow_lane_db(inputs)
});
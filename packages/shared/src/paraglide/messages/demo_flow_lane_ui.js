/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Lane_UiInputs */

const en_demo_flow_lane_ui = /** @type {(inputs: Demo_Flow_Lane_UiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Screen`)
};

const es_demo_flow_lane_ui = /** @type {(inputs: Demo_Flow_Lane_UiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pantalla`)
};

/**
* | output |
* | --- |
* | "Screen" |
*
* @param {Demo_Flow_Lane_UiInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_ui = /** @type {((inputs?: Demo_Flow_Lane_UiInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_UiInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_lane_ui(inputs)
	return es_demo_flow_lane_ui(inputs)
});
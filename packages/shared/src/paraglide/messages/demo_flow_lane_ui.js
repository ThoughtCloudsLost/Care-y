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

const en_xa2_demo_flow_lane_ui = /** @type {(inputs: Demo_Flow_Lane_UiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Scrèèn ••⟧`)
};

/**
* | output |
* | --- |
* | "Screen" |
*
* @param {Demo_Flow_Lane_UiInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_ui = /** @type {((inputs?: Demo_Flow_Lane_UiInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Lane_UiInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_lane_ui(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_lane_ui(inputs)
	return en_demo_flow_lane_ui(inputs)
});
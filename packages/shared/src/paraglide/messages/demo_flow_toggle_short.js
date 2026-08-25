/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Toggle_ShortInputs */

const en_demo_flow_toggle_short = /** @type {(inputs: Demo_Flow_Toggle_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data flow`)
};

const es_demo_flow_toggle_short = /** @type {(inputs: Demo_Flow_Toggle_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Flujo de datos`)
};

/**
* | output |
* | --- |
* | "Data flow" |
*
* @param {Demo_Flow_Toggle_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_short = /** @type {((inputs?: Demo_Flow_Toggle_ShortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Toggle_ShortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_toggle_short(inputs)
	return es_demo_flow_toggle_short(inputs)
});
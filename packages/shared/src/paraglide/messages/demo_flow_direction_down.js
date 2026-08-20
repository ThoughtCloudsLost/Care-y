/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Direction_DownInputs */

const en_demo_flow_direction_down = /** @type {(inputs: Demo_Flow_Direction_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Response`)
};

const es_demo_flow_direction_down = /** @type {(inputs: Demo_Flow_Direction_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta`)
};

/**
* | output |
* | --- |
* | "Response" |
*
* @param {Demo_Flow_Direction_DownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_down = /** @type {((inputs?: Demo_Flow_Direction_DownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Direction_DownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_direction_down(inputs)
	return es_demo_flow_direction_down(inputs)
});
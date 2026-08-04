/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Direction_UpInputs */

const en_demo_flow_direction_up = /** @type {(inputs: Demo_Flow_Direction_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request`)
};

const es_demo_flow_direction_up = /** @type {(inputs: Demo_Flow_Direction_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solicitud`)
};

/**
* | output |
* | --- |
* | "Request" |
*
* @param {Demo_Flow_Direction_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_up = /** @type {((inputs?: Demo_Flow_Direction_UpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Direction_UpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_direction_up(inputs)
	return es_demo_flow_direction_up(inputs)
});
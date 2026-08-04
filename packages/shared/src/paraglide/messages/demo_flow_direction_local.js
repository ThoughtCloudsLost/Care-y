/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Direction_LocalInputs */

const en_demo_flow_direction_local = /** @type {(inputs: Demo_Flow_Direction_LocalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In place`)
};

const es_demo_flow_direction_local = /** @type {(inputs: Demo_Flow_Direction_LocalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En el sitio`)
};

/**
* | output |
* | --- |
* | "In place" |
*
* @param {Demo_Flow_Direction_LocalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_local = /** @type {((inputs?: Demo_Flow_Direction_LocalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Direction_LocalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_direction_local(inputs)
	return es_demo_flow_direction_local(inputs)
});
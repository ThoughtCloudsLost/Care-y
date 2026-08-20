/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ms: NonNullable<unknown> }} Demo_Flow_Duration_MsInputs */

const en_demo_flow_duration_ms = /** @type {(inputs: Demo_Flow_Duration_MsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.ms} ms`)
};

const es_demo_flow_duration_ms = /** @type {(inputs: Demo_Flow_Duration_MsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.ms} ms`)
};

/**
* | output |
* | --- |
* | "{ms} ms" |
*
* @param {Demo_Flow_Duration_MsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_duration_ms = /** @type {((inputs: Demo_Flow_Duration_MsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Duration_MsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_duration_ms(inputs)
	return es_demo_flow_duration_ms(inputs)
});
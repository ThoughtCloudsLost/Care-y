/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Stack_SpreadInputs */

const en_demo_flow_stack_spread = /** @type {(inputs: Demo_Flow_Stack_SpreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spread these steps apart`)
};

const es_demo_flow_stack_spread = /** @type {(inputs: Demo_Flow_Stack_SpreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Separar estos pasos`)
};

/**
* | output |
* | --- |
* | "Spread these steps apart" |
*
* @param {Demo_Flow_Stack_SpreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_stack_spread = /** @type {((inputs?: Demo_Flow_Stack_SpreadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Stack_SpreadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_stack_spread(inputs)
	return es_demo_flow_stack_spread(inputs)
});
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

const en_xa2_demo_flow_stack_spread = /** @type {(inputs: Demo_Flow_Stack_SpreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sprèàd thèsè stèps àpàrt ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Spread these steps apart" |
*
* @param {Demo_Flow_Stack_SpreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_stack_spread = /** @type {((inputs?: Demo_Flow_Stack_SpreadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Stack_SpreadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_stack_spread(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_stack_spread(inputs)
	return en_demo_flow_stack_spread(inputs)
});
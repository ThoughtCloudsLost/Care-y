/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Stack_RestackInputs */

const en_demo_flow_stack_restack = /** @type {(inputs: Demo_Flow_Stack_RestackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stack these steps back up`)
};

const es_demo_flow_stack_restack = /** @type {(inputs: Demo_Flow_Stack_RestackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver a apilar estos pasos`)
};

/**
* | output |
* | --- |
* | "Stack these steps back up" |
*
* @param {Demo_Flow_Stack_RestackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_stack_restack = /** @type {((inputs?: Demo_Flow_Stack_RestackInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Stack_RestackInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_stack_restack(inputs)
	return es_demo_flow_stack_restack(inputs)
});
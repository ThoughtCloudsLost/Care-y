/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_CollapseInputs */

const en_demo_flow_collapse = /** @type {(inputs: Demo_Flow_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide step details`)
};

const es_demo_flow_collapse = /** @type {(inputs: Demo_Flow_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocultar detalles del paso`)
};

const en_xa2_demo_flow_collapse = /** @type {(inputs: Demo_Flow_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìdè stèp dètàìls ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Hide step details" |
*
* @param {Demo_Flow_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_collapse = /** @type {((inputs?: Demo_Flow_CollapseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_CollapseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_collapse(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_collapse(inputs)
	return en_demo_flow_collapse(inputs)
});
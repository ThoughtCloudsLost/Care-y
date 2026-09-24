/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Toggle_LabelInputs */

const en_demo_flow_toggle_label = /** @type {(inputs: Demo_Flow_Toggle_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data flow panel`)
};

const es_demo_flow_toggle_label = /** @type {(inputs: Demo_Flow_Toggle_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Panel de flujo de datos`)
};

const en_xa2_demo_flow_toggle_label = /** @type {(inputs: Demo_Flow_Toggle_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtà flòw pànèl •••••⟧`)
};

/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Flow_Toggle_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_label = /** @type {((inputs?: Demo_Flow_Toggle_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Toggle_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_toggle_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_toggle_label(inputs)
	return en_demo_flow_toggle_label(inputs)
});
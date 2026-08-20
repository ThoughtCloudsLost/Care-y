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

/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Flow_Toggle_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_label = /** @type {((inputs?: Demo_Flow_Toggle_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Toggle_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_toggle_label(inputs)
	return es_demo_flow_toggle_label(inputs)
});
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

const en_xa2_demo_flow_direction_down = /** @type {(inputs: Demo_Flow_Direction_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèspònsè •••⟧`)
};

/**
* | output |
* | --- |
* | "Response" |
*
* @param {Demo_Flow_Direction_DownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_direction_down = /** @type {((inputs?: Demo_Flow_Direction_DownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Direction_DownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_direction_down(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_direction_down(inputs)
	return en_demo_flow_direction_down(inputs)
});
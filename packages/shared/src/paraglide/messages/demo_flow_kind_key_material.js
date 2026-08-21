/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_Key_MaterialInputs */

const en_demo_flow_kind_key_material = /** @type {(inputs: Demo_Flow_Kind_Key_MaterialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key material`)
};

const es_demo_flow_kind_key_material = /** @type {(inputs: Demo_Flow_Kind_Key_MaterialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Material de clave`)
};

/**
* | output |
* | --- |
* | "Key material" |
*
* @param {Demo_Flow_Kind_Key_MaterialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_key_material = /** @type {((inputs?: Demo_Flow_Kind_Key_MaterialInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_Key_MaterialInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_key_material(inputs)
	return es_demo_flow_kind_key_material(inputs)
});
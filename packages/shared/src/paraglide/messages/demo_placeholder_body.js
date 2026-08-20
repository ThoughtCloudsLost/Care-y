/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Placeholder_BodyInputs */

const en_demo_placeholder_body = /** @type {(inputs: Demo_Placeholder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a feature from the list to begin.`)
};

const es_demo_placeholder_body = /** @type {(inputs: Demo_Placeholder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona una función de la lista para comenzar.`)
};

/**
* | output |
* | --- |
* | "Select a feature from the list to begin." |
*
* @param {Demo_Placeholder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_placeholder_body = /** @type {((inputs?: Demo_Placeholder_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Placeholder_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_placeholder_body(inputs)
	return es_demo_placeholder_body(inputs)
});
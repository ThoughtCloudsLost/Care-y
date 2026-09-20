/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_LabelInputs */

const en_demo_mode_label = /** @type {(inputs: Demo_Mode_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Viewing mode`)
};

const es_demo_mode_label = /** @type {(inputs: Demo_Mode_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modo de vista`)
};

const en_xa2_demo_mode_label = /** @type {(inputs: Demo_Mode_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèwìng mòdè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Viewing mode" |
*
* @param {Demo_Mode_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_mode_label = /** @type {((inputs?: Demo_Mode_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_mode_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_mode_label(inputs)
	return en_demo_mode_label(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_EmptyInputs */

const en_admin_presets_empty = /** @type {(inputs: Admin_Presets_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No saved replies yet.`)
};

const es_admin_presets_empty = /** @type {(inputs: Admin_Presets_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay respuestas guardadas.`)
};

/**
* | output |
* | --- |
* | "No saved replies yet." |
*
* @param {Admin_Presets_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_empty = /** @type {((inputs?: Admin_Presets_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_empty(inputs)
	return en_admin_presets_empty(inputs)
});
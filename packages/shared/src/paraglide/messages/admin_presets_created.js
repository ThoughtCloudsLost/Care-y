/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_CreatedInputs */

const en_admin_presets_created = /** @type {(inputs: Admin_Presets_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved reply created.`)
};

const es_admin_presets_created = /** @type {(inputs: Admin_Presets_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta guardada creada.`)
};

/**
* | output |
* | --- |
* | "Saved reply created." |
*
* @param {Admin_Presets_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_created = /** @type {((inputs?: Admin_Presets_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_created(inputs)
	return en_admin_presets_created(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_DeleteInputs */

const en_admin_presets_delete = /** @type {(inputs: Admin_Presets_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete`)
};

const es_admin_presets_delete = /** @type {(inputs: Admin_Presets_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_admin_presets_delete = /** @type {(inputs: Admin_Presets_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè ••⟧`)
};

/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Admin_Presets_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_delete = /** @type {((inputs?: Admin_Presets_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_delete(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_delete(inputs)
	return en_admin_presets_delete(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_SaveInputs */

const en_admin_branding_save = /** @type {(inputs: Admin_Branding_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_branding_save = /** @type {(inputs: Admin_Branding_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

const en_xa2_admin_branding_save = /** @type {(inputs: Admin_Branding_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Branding_SaveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_save = /** @type {((inputs?: Admin_Branding_SaveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_SaveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_save(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_save(inputs)
	return en_admin_branding_save(inputs)
});
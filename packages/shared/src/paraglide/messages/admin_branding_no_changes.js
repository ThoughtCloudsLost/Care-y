/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_No_ChangesInputs */

const en_admin_branding_no_changes = /** @type {(inputs: Admin_Branding_No_ChangesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No changes to save`)
};

const es_admin_branding_no_changes = /** @type {(inputs: Admin_Branding_No_ChangesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin cambios para guardar`)
};

/**
* | output |
* | --- |
* | "No changes to save" |
*
* @param {Admin_Branding_No_ChangesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_no_changes = /** @type {((inputs?: Admin_Branding_No_ChangesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_No_ChangesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_no_changes(inputs)
	return es_admin_branding_no_changes(inputs)
});
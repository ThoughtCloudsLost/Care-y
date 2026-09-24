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

const en_xa2_admin_branding_no_changes = /** @type {(inputs: Admin_Branding_No_ChangesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò chàngès tò sàvè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No changes to save" |
*
* @param {Admin_Branding_No_ChangesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_no_changes = /** @type {((inputs?: Admin_Branding_No_ChangesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_No_ChangesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_no_changes(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_no_changes(inputs)
	return en_admin_branding_no_changes(inputs)
});
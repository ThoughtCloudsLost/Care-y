/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_SavedInputs */

const en_admin_org_general_saved = /** @type {(inputs: Admin_Org_General_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization details saved`)
};

const es_admin_org_general_saved = /** @type {(inputs: Admin_Org_General_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos de la organización guardados`)
};

const en_xa2_admin_org_general_saved = /** @type {(inputs: Admin_Org_General_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn dètàìls sàvèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization details saved" |
*
* @param {Admin_Org_General_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_saved = /** @type {((inputs?: Admin_Org_General_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_saved(inputs)
	return en_admin_org_general_saved(inputs)
});
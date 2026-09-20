/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_No_AccessInputs */

const en_admin_org_no_access = /** @type {(inputs: Admin_Org_No_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You do not have permission to access organization settings.`)
};

const es_admin_org_no_access = /** @type {(inputs: Admin_Org_No_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tienes permiso para acceder a la configuración de la organización.`)
};

const en_xa2_admin_org_no_access = /** @type {(inputs: Admin_Org_No_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù dò nòt hàvè pèrmìssìòn tò àccèss òrgànìzàtìòn sèttìngs. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You do not have permission to access organization settings." |
*
* @param {Admin_Org_No_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_no_access = /** @type {((inputs?: Admin_Org_No_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_No_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_no_access(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_no_access(inputs)
	return en_admin_org_no_access(inputs)
});
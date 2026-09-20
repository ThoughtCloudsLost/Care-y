/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_Status_No_Org_KeyInputs */

const en_admin_key_status_no_org_key = /** @type {(inputs: Admin_Key_Status_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs a key share`)
};

const es_admin_key_status_no_org_key = /** @type {(inputs: Admin_Key_Status_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita una clave compartida`)
};

const en_xa2_admin_key_status_no_org_key = /** @type {(inputs: Admin_Key_Status_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèèds à kèy shàrè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Needs a key share" |
*
* @param {Admin_Key_Status_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_no_org_key = /** @type {((inputs?: Admin_Key_Status_No_Org_KeyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_Status_No_Org_KeyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_key_status_no_org_key(inputs)
	if (locale === "en-XA") return en_xa2_admin_key_status_no_org_key(inputs)
	return en_admin_key_status_no_org_key(inputs)
});
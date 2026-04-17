/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Org_Key_MissingInputs */

const en_admin_keys_org_key_missing = /** @type {(inputs: Admin_Keys_Org_Key_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key not configured`)
};

const es_admin_keys_org_key_missing = /** @type {(inputs: Admin_Keys_Org_Key_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de la organizacion no configurada`)
};

/**
* | output |
* | --- |
* | "Organization key not configured" |
*
* @param {Admin_Keys_Org_Key_MissingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_org_key_missing = /** @type {((inputs?: Admin_Keys_Org_Key_MissingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Org_Key_MissingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_keys_org_key_missing(inputs)
	return es_admin_keys_org_key_missing(inputs)
});
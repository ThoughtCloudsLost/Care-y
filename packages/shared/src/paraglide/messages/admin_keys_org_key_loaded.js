/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Org_Key_LoadedInputs */

const en_admin_keys_org_key_loaded = /** @type {(inputs: Admin_Keys_Org_Key_LoadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key loaded`)
};

const es_admin_keys_org_key_loaded = /** @type {(inputs: Admin_Keys_Org_Key_LoadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de la organización cargada`)
};

const en_xa2_admin_keys_org_key_loaded = /** @type {(inputs: Admin_Keys_Org_Key_LoadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn kèy lòàdèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization key loaded" |
*
* @param {Admin_Keys_Org_Key_LoadedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_org_key_loaded = /** @type {((inputs?: Admin_Keys_Org_Key_LoadedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Org_Key_LoadedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_org_key_loaded(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_org_key_loaded(inputs)
	return en_admin_keys_org_key_loaded(inputs)
});
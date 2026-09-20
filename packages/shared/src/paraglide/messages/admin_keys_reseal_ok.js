/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Reseal_OkInputs */

const en_admin_keys_reseal_ok = /** @type {(inputs: Admin_Keys_Reseal_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All records are on the current key.`)
};

const es_admin_keys_reseal_ok = /** @type {(inputs: Admin_Keys_Reseal_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los registros usan la clave actual.`)
};

const en_xa2_admin_keys_reseal_ok = /** @type {(inputs: Admin_Keys_Reseal_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll rècòrds àrè òn thè cùrrènt kèy. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "All records are on the current key." |
*
* @param {Admin_Keys_Reseal_OkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_ok = /** @type {((inputs?: Admin_Keys_Reseal_OkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Reseal_OkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_reseal_ok(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_reseal_ok(inputs)
	return en_admin_keys_reseal_ok(inputs)
});
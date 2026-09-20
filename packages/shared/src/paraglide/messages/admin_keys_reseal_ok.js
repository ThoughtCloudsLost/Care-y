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

/**
* | output |
* | --- |
* | "All records are on the current key." |
*
* @param {Admin_Keys_Reseal_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_ok = /** @type {((inputs?: Admin_Keys_Reseal_OkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Reseal_OkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_reseal_ok(inputs)
	return en_admin_keys_reseal_ok(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Username_UpdatedInputs */

const en_admin_username_updated = /** @type {(inputs: Admin_Username_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Username updated`)
};

const es_admin_username_updated = /** @type {(inputs: Admin_Username_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario actualizado`)
};

const en_xa2_admin_username_updated = /** @type {(inputs: Admin_Username_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrnàmè ùpdàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Username updated" |
*
* @param {Admin_Username_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_username_updated = /** @type {((inputs?: Admin_Username_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Username_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_username_updated(inputs)
	if (locale === "en-XA") return en_xa2_admin_username_updated(inputs)
	return en_admin_username_updated(inputs)
});
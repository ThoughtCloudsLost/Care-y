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

/**
* | output |
* | --- |
* | "Username updated" |
*
* @param {Admin_Username_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_username_updated = /** @type {((inputs?: Admin_Username_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Username_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_username_updated(inputs)
	return es_admin_username_updated(inputs)
});
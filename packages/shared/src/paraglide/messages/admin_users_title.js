/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_TitleInputs */

const en_admin_users_title = /** @type {(inputs: Admin_Users_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Users`)
};

const es_admin_users_title = /** @type {(inputs: Admin_Users_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuarios`)
};

const en_xa2_admin_users_title = /** @type {(inputs: Admin_Users_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrs ••⟧`)
};

/**
* | output |
* | --- |
* | "Users" |
*
* @param {Admin_Users_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_title = /** @type {((inputs?: Admin_Users_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_title(inputs)
	return en_admin_users_title(inputs)
});
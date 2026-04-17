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

/**
* | output |
* | --- |
* | "Users" |
*
* @param {Admin_Users_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_title = /** @type {((inputs?: Admin_Users_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_title(inputs)
	return es_admin_users_title(inputs)
});
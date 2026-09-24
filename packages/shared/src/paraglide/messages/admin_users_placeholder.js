/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_PlaceholderInputs */

const en_admin_users_placeholder = /** @type {(inputs: Admin_Users_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User management loading...`)
};

const es_admin_users_placeholder = /** @type {(inputs: Admin_Users_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando gestión de usuarios...`)
};

const en_xa2_admin_users_placeholder = /** @type {(inputs: Admin_Users_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèr mànàgèmènt lòàdìng... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "User management loading..." |
*
* @param {Admin_Users_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_placeholder = /** @type {((inputs?: Admin_Users_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_placeholder(inputs)
	return en_admin_users_placeholder(inputs)
});
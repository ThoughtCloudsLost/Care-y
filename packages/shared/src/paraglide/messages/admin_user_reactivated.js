/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_User_ReactivatedInputs */

const en_admin_user_reactivated = /** @type {(inputs: Admin_User_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User reactivated`)
};

const es_admin_user_reactivated = /** @type {(inputs: Admin_User_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario reactivado`)
};

const en_xa2_admin_user_reactivated = /** @type {(inputs: Admin_User_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèr rèàctìvàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "User reactivated" |
*
* @param {Admin_User_ReactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_user_reactivated = /** @type {((inputs?: Admin_User_ReactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_ReactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_user_reactivated(inputs)
	if (locale === "en-XA") return en_xa2_admin_user_reactivated(inputs)
	return en_admin_user_reactivated(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_User_DeactivatedInputs */

const en_admin_user_deactivated = /** @type {(inputs: Admin_User_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User deactivated`)
};

const es_admin_user_deactivated = /** @type {(inputs: Admin_User_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario desactivado`)
};

/**
* | output |
* | --- |
* | "User deactivated" |
*
* @param {Admin_User_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_deactivated = /** @type {((inputs?: Admin_User_DeactivatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_DeactivatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_user_deactivated(inputs)
	return es_admin_user_deactivated(inputs)
});
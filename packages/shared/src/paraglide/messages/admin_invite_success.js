/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_SuccessInputs */

const en_admin_invite_success = /** @type {(inputs: Admin_Invite_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account created`)
};

const es_admin_invite_success = /** @type {(inputs: Admin_Invite_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta creada`)
};

/**
* | output |
* | --- |
* | "Account created" |
*
* @param {Admin_Invite_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_success = /** @type {((inputs?: Admin_Invite_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_success(inputs)
	return es_admin_invite_success(inputs)
});
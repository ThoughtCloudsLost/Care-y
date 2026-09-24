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

const en_xa2_admin_invite_success = /** @type {(inputs: Admin_Invite_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt crèàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Account created" |
*
* @param {Admin_Invite_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_success = /** @type {((inputs?: Admin_Invite_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_success(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_success(inputs)
	return en_admin_invite_success(inputs)
});
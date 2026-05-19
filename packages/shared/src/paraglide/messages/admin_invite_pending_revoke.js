/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_RevokeInputs */

const en_admin_invite_pending_revoke = /** @type {(inputs: Admin_Invite_Pending_RevokeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke`)
};

const es_admin_invite_pending_revoke = /** @type {(inputs: Admin_Invite_Pending_RevokeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar`)
};

/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Admin_Invite_Pending_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke = /** @type {((inputs?: Admin_Invite_Pending_RevokeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_RevokeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_revoke(inputs)
	return es_admin_invite_pending_revoke(inputs)
});
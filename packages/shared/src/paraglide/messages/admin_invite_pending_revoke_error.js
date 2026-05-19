/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_Revoke_ErrorInputs */

const en_admin_invite_pending_revoke_error = /** @type {(inputs: Admin_Invite_Pending_Revoke_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to revoke invite`)
};

const es_admin_invite_pending_revoke_error = /** @type {(inputs: Admin_Invite_Pending_Revoke_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al revocar la invitacion`)
};

/**
* | output |
* | --- |
* | "Failed to revoke invite" |
*
* @param {Admin_Invite_Pending_Revoke_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke_error = /** @type {((inputs?: Admin_Invite_Pending_Revoke_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Revoke_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_revoke_error(inputs)
	return es_admin_invite_pending_revoke_error(inputs)
});
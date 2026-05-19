/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_RevokedInputs */

const en_admin_invite_pending_revoked = /** @type {(inputs: Admin_Invite_Pending_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite revoked`)
};

const es_admin_invite_pending_revoked = /** @type {(inputs: Admin_Invite_Pending_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitacion revocada`)
};

/**
* | output |
* | --- |
* | "Invite revoked" |
*
* @param {Admin_Invite_Pending_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoked = /** @type {((inputs?: Admin_Invite_Pending_RevokedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_RevokedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_revoked(inputs)
	return es_admin_invite_pending_revoked(inputs)
});
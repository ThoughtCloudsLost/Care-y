/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_RevokedInputs */

const en_admin_invite_pending_revoked = /** @type {(inputs: Admin_Invite_Pending_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite revoked`)
};

const es_admin_invite_pending_revoked = /** @type {(inputs: Admin_Invite_Pending_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitación revocada`)
};

const en_xa2_admin_invite_pending_revoked = /** @type {(inputs: Admin_Invite_Pending_RevokedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè rèvòkèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite revoked" |
*
* @param {Admin_Invite_Pending_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoked = /** @type {((inputs?: Admin_Invite_Pending_RevokedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_RevokedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_pending_revoked(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_pending_revoked(inputs)
	return en_admin_invite_pending_revoked(inputs)
});
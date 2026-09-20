/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_Invited_By_UnknownInputs */

const en_admin_invite_pending_invited_by_unknown = /** @type {(inputs: Admin_Invite_Pending_Invited_By_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invited by unknown`)
};

const es_admin_invite_pending_invited_by_unknown = /** @type {(inputs: Admin_Invite_Pending_Invited_By_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitado por desconocido`)
};

const en_xa2_admin_invite_pending_invited_by_unknown = /** @type {(inputs: Admin_Invite_Pending_Invited_By_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtèd by ùnknòwn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invited by unknown" |
*
* @param {Admin_Invite_Pending_Invited_By_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_invited_by_unknown = /** @type {((inputs?: Admin_Invite_Pending_Invited_By_UnknownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Invited_By_UnknownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_pending_invited_by_unknown(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_pending_invited_by_unknown(inputs)
	return en_admin_invite_pending_invited_by_unknown(inputs)
});
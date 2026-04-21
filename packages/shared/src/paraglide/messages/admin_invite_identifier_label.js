/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Identifier_LabelInputs */

const en_admin_invite_identifier_label = /** @type {(inputs: Admin_Invite_Identifier_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_admin_invite_identifier_label = /** @type {(inputs: Admin_Invite_Identifier_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de usuario`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Admin_Invite_Identifier_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_identifier_label = /** @type {((inputs?: Admin_Invite_Identifier_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Identifier_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_identifier_label(inputs)
	return es_admin_invite_identifier_label(inputs)
});
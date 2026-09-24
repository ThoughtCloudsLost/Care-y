/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_TitleInputs */

const en_admin_invite_title = /** @type {(inputs: Admin_Invite_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite User`)
};

const es_admin_invite_title = /** @type {(inputs: Admin_Invite_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar Usuario`)
};

const en_xa2_admin_invite_title = /** @type {(inputs: Admin_Invite_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè Ùsèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite User" |
*
* @param {Admin_Invite_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_title = /** @type {((inputs?: Admin_Invite_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_title(inputs)
	return en_admin_invite_title(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_GenerateInputs */

const en_admin_invite_link_generate = /** @type {(inputs: Admin_Invite_Link_GenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate Invite Link`)
};

const es_admin_invite_link_generate = /** @type {(inputs: Admin_Invite_Link_GenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar enlace de invitacion`)
};

/**
* | output |
* | --- |
* | "Generate Invite Link" |
*
* @param {Admin_Invite_Link_GenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_generate = /** @type {((inputs?: Admin_Invite_Link_GenerateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_GenerateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_generate(inputs)
	return es_admin_invite_link_generate(inputs)
});
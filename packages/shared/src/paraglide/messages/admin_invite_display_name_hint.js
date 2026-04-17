/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Display_Name_HintInputs */

const en_admin_invite_display_name_hint = /** @type {(inputs: Admin_Invite_Display_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`End-to-end encrypted. Only your team can read this.`)
};

const es_admin_invite_display_name_hint = /** @type {(inputs: Admin_Invite_Display_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrado de extremo a extremo. Solo su equipo puede leerlo.`)
};

/**
* | output |
* | --- |
* | "End-to-end encrypted. Only your team can read this." |
*
* @param {Admin_Invite_Display_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_display_name_hint = /** @type {((inputs?: Admin_Invite_Display_Name_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Display_Name_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_display_name_hint(inputs)
	return es_admin_invite_display_name_hint(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Identifier_HintInputs */

const en_admin_invite_identifier_hint = /** @type {(inputs: Admin_Invite_Identifier_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auto-generated. Change only if needed.`)
};

const es_admin_invite_identifier_hint = /** @type {(inputs: Admin_Invite_Identifier_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generado automaticamente. Cambie solo si es necesario.`)
};

/**
* | output |
* | --- |
* | "Auto-generated. Change only if needed." |
*
* @param {Admin_Invite_Identifier_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_identifier_hint = /** @type {((inputs?: Admin_Invite_Identifier_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Identifier_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_identifier_hint(inputs)
	return es_admin_invite_identifier_hint(inputs)
});
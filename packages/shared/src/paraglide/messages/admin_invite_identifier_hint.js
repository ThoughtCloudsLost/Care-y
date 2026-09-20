/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Identifier_HintInputs */

const en_admin_invite_identifier_hint = /** @type {(inputs: Admin_Invite_Identifier_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auto-generated. Change only if needed.`)
};

const es_admin_invite_identifier_hint = /** @type {(inputs: Admin_Invite_Identifier_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generado automáticamente. Cambie solo si es necesario.`)
};

const en_xa2_admin_invite_identifier_hint = /** @type {(inputs: Admin_Invite_Identifier_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùtò-gènèràtèd. Chàngè ònly ìf nèèdèd. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Auto-generated. Change only if needed." |
*
* @param {Admin_Invite_Identifier_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_identifier_hint = /** @type {((inputs?: Admin_Invite_Identifier_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Identifier_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_identifier_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_identifier_hint(inputs)
	return en_admin_invite_identifier_hint(inputs)
});
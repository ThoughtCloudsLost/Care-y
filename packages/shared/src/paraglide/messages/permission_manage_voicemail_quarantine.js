/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Voicemail_QuarantineInputs */

const en_permission_manage_voicemail_quarantine = /** @type {(inputs: Permission_Manage_Voicemail_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handle held-back voicemail`)
};

const es_permission_manage_voicemail_quarantine = /** @type {(inputs: Permission_Manage_Voicemail_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar correos de voz retenidos`)
};

/**
* | output |
* | --- |
* | "Handle held-back voicemail" |
*
* @param {Permission_Manage_Voicemail_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_voicemail_quarantine = /** @type {((inputs?: Permission_Manage_Voicemail_QuarantineInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Voicemail_QuarantineInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_voicemail_quarantine(inputs)
	return en_permission_manage_voicemail_quarantine(inputs)
});
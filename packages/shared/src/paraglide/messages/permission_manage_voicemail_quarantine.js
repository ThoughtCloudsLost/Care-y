/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Voicemail_QuarantineInputs */

const en_permission_manage_voicemail_quarantine = /** @type {(inputs: Permission_Manage_Voicemail_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage voicemail quarantine`)
};

const es_permission_manage_voicemail_quarantine = /** @type {(inputs: Permission_Manage_Voicemail_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar cuarentena de correo de voz`)
};

const en_xa2_permission_manage_voicemail_quarantine = /** @type {(inputs: Permission_Manage_Voicemail_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè vòìcèmàìl qùàràntìnè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage voicemail quarantine" |
*
* @param {Permission_Manage_Voicemail_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_voicemail_quarantine = /** @type {((inputs?: Permission_Manage_Voicemail_QuarantineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Voicemail_QuarantineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_voicemail_quarantine(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_voicemail_quarantine(inputs)
	return en_permission_manage_voicemail_quarantine(inputs)
});
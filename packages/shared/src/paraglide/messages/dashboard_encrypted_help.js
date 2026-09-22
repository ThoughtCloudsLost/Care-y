/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, ticket: NonNullable<unknown> }} Dashboard_Encrypted_HelpInputs */

const en_dashboard_encrypted_help = /** @type {(inputs: Dashboard_Encrypted_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You have ${i?.queue} access but not the decryption key for this ${i?.ticket}. Access arrives automatically the next time a teammate who can read it signs in.`)
};

const es_dashboard_encrypted_help = /** @type {(inputs: Dashboard_Encrypted_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tienes acceso a la ${i?.queue} pero no la clave de descifrado para este ${i?.ticket}. El acceso llega automáticamente la próxima vez que inicie sesión alguien del equipo que pueda leerlo.`)
};

const en_xa2_dashboard_encrypted_help = /** @type {(inputs: Dashboard_Encrypted_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòù hàvè  •••${i?.queue} àccèss bùt nòt thè dècryptìòn kèy fòr thìs  ••••••••••••••${i?.ticket}. À tèàmmàtè whò càn rèàd ìt wìll shàrè àccèss àùtòmàtìcàlly whèn thèy òpèn ìt. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You have {queue} access but not the decryption key for this {ticket}. Access arrives automatically the next time a teammate who can read it signs in." |
*
* @param {Dashboard_Encrypted_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help = /** @type {((inputs: Dashboard_Encrypted_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_encrypted_help(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_encrypted_help(inputs)
	return en_dashboard_encrypted_help(inputs)
});
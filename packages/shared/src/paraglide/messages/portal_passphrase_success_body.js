/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Success_BodyInputs */

const en_portal_passphrase_success_body = /** @type {(inputs: Portal_Passphrase_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your link now also needs the password you just set. Anyone who only has the link will not be able to read your messages.`)
};

const es_portal_passphrase_success_body = /** @type {(inputs: Portal_Passphrase_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu enlace ahora también necesita la contraseña que acabas de establecer. Cualquier persona que solo tenga el enlace no podrá leer tus mensajes.`)
};

const en_xa2_portal_passphrase_success_body = /** @type {(inputs: Portal_Passphrase_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr lìnk nòw àlsò nèèds thè pàsswòrd yòù jùst sèt. Ànyònè whò ònly hàs thè lìnk wìll nòt bè àblè tò rèàd yòùr mèssàgès. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your link now also needs the password you just set. Anyone who only has the link will not be able to read your messages." |
*
* @param {Portal_Passphrase_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_body = /** @type {((inputs?: Portal_Passphrase_Success_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Success_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_success_body(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_success_body(inputs)
	return en_portal_passphrase_success_body(inputs)
});
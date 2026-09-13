/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Sharing_BodyInputs */

const en_intake_privacy_sharing_body = /** @type {(inputs: Intake_Privacy_Sharing_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers assigned to your case can read your information after decrypting it on their own devices. If you call or text the hotline, your phone number passes through the phone service provider (currently Twilio, a US company) to connect the call or deliver the message.`)
};

const es_intake_privacy_sharing_body = /** @type {(inputs: Intake_Privacy_Sharing_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios asignados a tu caso pueden leer tu informacion despues de descifrarla en sus propios dispositivos. Si llamas o envias un mensaje de texto a la linea de ayuda, tu numero de telefono pasa por el proveedor de servicio telefonico (actualmente Twilio, una empresa estadounidense) para conectar la llamada o entregar el mensaje.`)
};

/**
* | output |
* | --- |
* | "Volunteers assigned to your case can read your information after decrypting it on their own devices. If you call or text the hotline, your phone number passe..." |
*
* @param {Intake_Privacy_Sharing_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_body = /** @type {((inputs?: Intake_Privacy_Sharing_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Sharing_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_sharing_body(inputs)
	return es_intake_privacy_sharing_body(inputs)
});
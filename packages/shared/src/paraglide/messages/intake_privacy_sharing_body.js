/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Sharing_BodyInputs */

const en_intake_privacy_sharing_body = /** @type {(inputs: Intake_Privacy_Sharing_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers decrypt your information on their own devices. Until someone first opens your case it can be unlocked with the organization's key; after that, only the volunteers working on your case can read it. If you call or text the hotline, your phone number passes through the phone service provider (currently Twilio, a US company) to connect the call or deliver the message.`)
};

const es_intake_privacy_sharing_body = /** @type {(inputs: Intake_Privacy_Sharing_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios descifran tu información en sus propios dispositivos. Hasta que alguien abra tu caso por primera vez, se puede acceder con la clave de la organización; después, solo los voluntarios que trabajan en tu caso pueden leerla. Si llamas o envías un mensaje de texto a la línea de ayuda, tu número de teléfono pasa por el proveedor de servicio telefónico (actualmente Twilio, una empresa estadounidense) para conectar la llamada o entregar el mensaje.`)
};

/**
* | output |
* | --- |
* | "Volunteers decrypt your information on their own devices. Until someone first opens your case it can be unlocked with the organization's key; after that, onl..." |
*
* @param {Intake_Privacy_Sharing_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_body = /** @type {((inputs?: Intake_Privacy_Sharing_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Sharing_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_sharing_body(inputs)
	return en_intake_privacy_sharing_body(inputs)
});
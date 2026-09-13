/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Rights_BodyInputs */

const en_intake_privacy_rights_body = /** @type {(inputs: Intake_Privacy_Rights_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can ask to see, correct, or delete your information. Contact the organization and provide your reference code (shown after you submit this form) so they can locate your records. You also have the right to restrict how your data is used or to receive a copy of the data you provided.`)
};

const es_intake_privacy_rights_body = /** @type {(inputs: Intake_Privacy_Rights_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puedes pedir ver, corregir o eliminar tu informacion. Contacta a la organizacion y proporciona tu codigo de referencia (que se muestra despues de enviar este formulario) para que puedan localizar tus registros. Tambien tienes derecho a restringir el uso de tus datos o a recibir una copia de los datos que proporcionaste.`)
};

/**
* | output |
* | --- |
* | "You can ask to see, correct, or delete your information. Contact the organization and provide your reference code (shown after you submit this form) so they ..." |
*
* @param {Intake_Privacy_Rights_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_body = /** @type {((inputs?: Intake_Privacy_Rights_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Rights_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_rights_body(inputs)
	return es_intake_privacy_rights_body(inputs)
});
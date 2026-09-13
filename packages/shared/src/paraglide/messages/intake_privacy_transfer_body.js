/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Transfer_BodyInputs */

const en_intake_privacy_transfer_body = /** @type {(inputs: Intake_Privacy_Transfer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you use the phone service, your phone number is processed by Twilio, which operates in the United States. This transfer is covered by Standard Contractual Clauses. Your encrypted web submissions stay on the European server and are never sent to a third party.`)
};

const es_intake_privacy_transfer_body = /** @type {(inputs: Intake_Privacy_Transfer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si usas el servicio telefonico, tu numero de telefono es procesado por Twilio, que opera en Estados Unidos. Esta transferencia esta cubierta por Clausulas Contractuales Tipo. Tus envios cifrados por la web permanecen en el servidor europeo y nunca se envian a terceros.`)
};

/**
* | output |
* | --- |
* | "If you use the phone service, your phone number is processed by Twilio, which operates in the United States. This transfer is covered by Standard Contractual..." |
*
* @param {Intake_Privacy_Transfer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_transfer_body = /** @type {((inputs?: Intake_Privacy_Transfer_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Transfer_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_transfer_body(inputs)
	return es_intake_privacy_transfer_body(inputs)
});
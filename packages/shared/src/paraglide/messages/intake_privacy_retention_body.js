/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Retention_BodyInputs */

const en_intake_privacy_retention_body = /** @type {(inputs: Intake_Privacy_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encrypted information is kept as long as your case is open, plus any retention period set by the organization. See the telephony data disclosure below for phone and text message retention by the phone provider.`)
};

const es_intake_privacy_retention_body = /** @type {(inputs: Intake_Privacy_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu informacion cifrada se conserva mientras tu caso este abierto, mas cualquier periodo de retencion establecido por la organizacion. Consulta la divulgacion de datos telefonicos a continuacion para la retencion de llamadas y mensajes de texto por parte del proveedor telefonico.`)
};

/**
* | output |
* | --- |
* | "Your encrypted information is kept as long as your case is open, plus any retention period set by the organization. See the telephony data disclosure below f..." |
*
* @param {Intake_Privacy_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_retention_body = /** @type {((inputs?: Intake_Privacy_Retention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Retention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_retention_body(inputs)
	return es_intake_privacy_retention_body(inputs)
});
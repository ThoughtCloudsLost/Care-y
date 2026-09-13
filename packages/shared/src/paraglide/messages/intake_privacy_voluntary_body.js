/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Voluntary_BodyInputs */

const en_intake_privacy_voluntary_body = /** @type {(inputs: Intake_Privacy_Voluntary_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Providing your information is voluntary. If you choose not to share contact details, the organization will not be able to reach out to you, but you can check back on your own.`)
};

const es_intake_privacy_voluntary_body = /** @type {(inputs: Intake_Privacy_Voluntary_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proporcionar tu informacion es voluntario. Si decides no compartir datos de contacto, la organizacion no podra comunicarse contigo, pero puedes volver a consultar por tu cuenta.`)
};

/**
* | output |
* | --- |
* | "Providing your information is voluntary. If you choose not to share contact details, the organization will not be able to reach out to you, but you can check..." |
*
* @param {Intake_Privacy_Voluntary_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_voluntary_body = /** @type {((inputs?: Intake_Privacy_Voluntary_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Voluntary_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_voluntary_body(inputs)
	return es_intake_privacy_voluntary_body(inputs)
});
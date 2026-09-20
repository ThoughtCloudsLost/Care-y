/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_MetadataInputs */

const en_intake_privacy_metadata = /** @type {(inputs: Intake_Privacy_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your answer is encrypted, but your selection shares routing metadata with the service.`)
};

const es_intake_privacy_metadata = /** @type {(inputs: Intake_Privacy_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su respuesta está cifrada, pero su selección comparte datos de enrutamiento con el servicio.`)
};

const en_xa2_intake_privacy_metadata = /** @type {(inputs: Intake_Privacy_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ànswèr ìs èncryptèd, bùt yòùr sèlèctìòn shàrès ròùtìng mètàdàtà wìth thè sèrvìcè. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your answer is encrypted, but your selection shares routing metadata with the service." |
*
* @param {Intake_Privacy_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_metadata = /** @type {((inputs?: Intake_Privacy_MetadataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_MetadataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_metadata(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_metadata(inputs)
	return en_intake_privacy_metadata(inputs)
});
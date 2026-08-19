/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_MetadataInputs */

const en_intake_privacy_metadata = /** @type {(inputs: Intake_Privacy_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your answer is encrypted, but your selection shares routing metadata with the service.`)
};

const es_intake_privacy_metadata = /** @type {(inputs: Intake_Privacy_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su respuesta esta cifrada, pero su seleccion comparte datos de enrutamiento con el servicio.`)
};

/**
* | output |
* | --- |
* | "Your answer is encrypted, but your selection shares routing metadata with the service." |
*
* @param {Intake_Privacy_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_metadata = /** @type {((inputs?: Intake_Privacy_MetadataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_MetadataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_metadata(inputs)
	return es_intake_privacy_metadata(inputs)
});
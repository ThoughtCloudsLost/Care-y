/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ phone: NonNullable<unknown> }} Portal_Correction_MessageInputs */

const en_portal_correction_message = /** @type {(inputs: Portal_Correction_MessageInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Contact correction request. New phone number: ${i?.phone}`)
};

const es_portal_correction_message = /** @type {(inputs: Portal_Correction_MessageInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Solicitud de corrección de contacto. Nuevo número de teléfono: ${i?.phone}`)
};

/**
* | output |
* | --- |
* | "Contact correction request. New phone number: {phone}" |
*
* @param {Portal_Correction_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_message = /** @type {((inputs: Portal_Correction_MessageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_MessageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_message(inputs)
	return es_portal_correction_message(inputs)
});
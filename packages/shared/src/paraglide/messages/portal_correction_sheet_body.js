/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Sheet_BodyInputs */

const en_portal_correction_sheet_body = /** @type {(inputs: Portal_Correction_Sheet_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the phone number you want the support team to use. A volunteer will review it before anything changes. For your safety this page never shows the number currently on file.`)
};

const es_portal_correction_sheet_body = /** @type {(inputs: Portal_Correction_Sheet_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe el número de teléfono que quieres que use el equipo de apoyo. Una persona voluntaria lo revisará antes de aplicar cualquier cambio. Por tu seguridad, esta página nunca muestra el número registrado.`)
};

/**
* | output |
* | --- |
* | "Enter the phone number you want the support team to use. A volunteer will review it before anything changes. For your safety this page never shows the number..." |
*
* @param {Portal_Correction_Sheet_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_body = /** @type {((inputs?: Portal_Correction_Sheet_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Sheet_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_sheet_body(inputs)
	return es_portal_correction_sheet_body(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Followup_Type_ReservedInputs */

const en_error_followup_type_reserved = /** @type {(inputs: Error_Followup_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That kind of entry is recorded from the Assistance card.`)
};

const es_error_followup_type_reserved = /** @type {(inputs: Error_Followup_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese tipo de entrada se registra desde la tarjeta de Asistencia.`)
};

const en_xa2_error_followup_type_reserved = /** @type {(inputs: Error_Followup_Type_ReservedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt kìnd òf èntry ìs rècòrdèd fròm thè Àssìstàncè càrd. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That kind of entry is recorded from the Assistance card." |
*
* @param {Error_Followup_Type_ReservedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_type_reserved = /** @type {((inputs?: Error_Followup_Type_ReservedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Followup_Type_ReservedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_followup_type_reserved(inputs)
	if (locale === "en-XA") return en_xa2_error_followup_type_reserved(inputs)
	return en_error_followup_type_reserved(inputs)
});
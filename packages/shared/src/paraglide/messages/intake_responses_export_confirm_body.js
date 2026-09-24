/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ exportedCount: NonNullable<unknown> }} Intake_Responses_Export_Confirm_BodyInputs */

const en_intake_responses_export_confirm_body = /** @type {(inputs: Intake_Responses_Export_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This will download a CSV file containing plaintext client data. The file is not encrypted. ${i?.exportedCount} responses will be exported.`)
};

const es_intake_responses_export_confirm_body = /** @type {(inputs: Intake_Responses_Export_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se descargara un archivo CSV con datos de clientes en texto plano. El archivo no está cifrado. Se exportaran ${i?.exportedCount} respuestas.`)
};

const en_xa2_intake_responses_export_confirm_body = /** @type {(inputs: Intake_Responses_Export_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs wìll dòwnlòàd à CSV fìlè còntàìnìng plàìntèxt clìènt dàtà. Thè fìlè ìs nòt èncryptèd.  ••••••••••••••••••••••••••••${i?.exportedCount} rèspònsès wìll bè èxpòrtèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This will download a CSV file containing plaintext client data. The file is not encrypted. {exportedCount} responses will be exported." |
*
* @param {Intake_Responses_Export_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_body = /** @type {((inputs: Intake_Responses_Export_Confirm_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_export_confirm_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_export_confirm_body(inputs)
	return en_intake_responses_export_confirm_body(inputs)
});
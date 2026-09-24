/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ max: NonNullable<unknown> }} Intake_Forms_Content_Cap_ErrorInputs */

const en_intake_forms_content_cap_error = /** @type {(inputs: Intake_Forms_Content_Cap_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Content exceeds the ${i?.max} character limit for this locale.`)
};

const es_intake_forms_content_cap_error = /** @type {(inputs: Intake_Forms_Content_Cap_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El contenido excede el limite de ${i?.max} caracteres para este idioma.`)
};

const en_xa2_intake_forms_content_cap_error = /** @type {(inputs: Intake_Forms_Content_Cap_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còntènt èxcèèds thè  ••••••${i?.max} chàràctèr lìmìt fòr thìs lòcàlè. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Content exceeds the {max} character limit for this locale." |
*
* @param {Intake_Forms_Content_Cap_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_content_cap_error = /** @type {((inputs: Intake_Forms_Content_Cap_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Content_Cap_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_content_cap_error(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_content_cap_error(inputs)
	return en_intake_forms_content_cap_error(inputs)
});
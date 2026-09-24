/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, clients: NonNullable<unknown> }} Admin_Branding_Text_HintInputs */

const en_admin_branding_text_hint = /** @type {(inputs: Admin_Branding_Text_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Shown on the ${i?.client} intake form.`)
};

const es_admin_branding_text_hint = /** @type {(inputs: Admin_Branding_Text_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mostrado en el formulario de admisión de ${i?.clients}.`)
};

const en_xa2_admin_branding_text_hint = /** @type {(inputs: Admin_Branding_Text_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shòwn òn thè  ••••${i?.client} ìntàkè fòrm. ••••⟧`)
};

/**
* | output |
* | --- |
* | "Shown on the {client} intake form." |
*
* @param {Admin_Branding_Text_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_text_hint = /** @type {((inputs: Admin_Branding_Text_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Text_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_text_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_text_hint(inputs)
	return en_admin_branding_text_hint(inputs)
});
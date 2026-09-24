/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Contact_Correction_Pending_WarningInputs */

const en_contact_correction_pending_warning = /** @type {(inputs: Contact_Correction_Pending_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A contact correction is pending below. Verify before contacting.`)
};

const es_contact_correction_pending_warning = /** @type {(inputs: Contact_Correction_Pending_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hay una corrección de contacto pendiente abajo. Verifica antes de contactar.`)
};

const en_xa2_contact_correction_pending_warning = /** @type {(inputs: Contact_Correction_Pending_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À còntàct còrrèctìòn ìs pèndìng bèlòw. Vèrìfy bèfòrè còntàctìng. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A contact correction is pending below. Verify before contacting." |
*
* @param {Contact_Correction_Pending_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const contact_correction_pending_warning = /** @type {((inputs?: Contact_Correction_Pending_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Correction_Pending_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_contact_correction_pending_warning(inputs)
	if (locale === "en-XA") return en_xa2_contact_correction_pending_warning(inputs)
	return en_contact_correction_pending_warning(inputs)
});
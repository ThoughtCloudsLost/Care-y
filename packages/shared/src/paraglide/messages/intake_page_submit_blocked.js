/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_Submit_BlockedInputs */

const en_intake_page_submit_blocked = /** @type {(inputs: Intake_Page_Submit_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fix all issues before submitting.`)
};

const es_intake_page_submit_blocked = /** @type {(inputs: Intake_Page_Submit_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrige todos los problemas antes de enviar.`)
};

const en_xa2_intake_page_submit_blocked = /** @type {(inputs: Intake_Page_Submit_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìx àll ìssùès bèfòrè sùbmìttìng. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Fix all issues before submitting." |
*
* @param {Intake_Page_Submit_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_submit_blocked = /** @type {((inputs?: Intake_Page_Submit_BlockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_Submit_BlockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_submit_blocked(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_submit_blocked(inputs)
	return en_intake_page_submit_blocked(inputs)
});
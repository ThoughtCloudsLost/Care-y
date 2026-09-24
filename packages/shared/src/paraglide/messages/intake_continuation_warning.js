/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Continuation_WarningInputs */

const en_intake_continuation_warning = /** @type {(inputs: Intake_Continuation_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link is the only way back to your conversation. CARE-Y cannot recover it if lost. Anyone who has the link can read and add to this thread.`)
};

const es_intake_continuation_warning = /** @type {(inputs: Intake_Continuation_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace es la única forma de volver a tu conversación. CARE-Y no puede recuperarlo si lo pierdes. Cualquier persona que tenga el enlace puede leer y agregar a este hilo.`)
};

const en_xa2_intake_continuation_warning = /** @type {(inputs: Intake_Continuation_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk ìs thè ònly wày bàck tò yòùr cònvèrsàtìòn. CÀRÈ-Y cànnòt rècòvèr ìt ìf lòst. Ànyònè whò hàs thè lìnk càn rèàd ànd àdd tò thìs thrèàd. •••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link is the only way back to your conversation. CARE-Y cannot recover it if lost. Anyone who has the link can read and add to this thread." |
*
* @param {Intake_Continuation_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_warning = /** @type {((inputs?: Intake_Continuation_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Continuation_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_continuation_warning(inputs)
	if (locale === "en-XA") return en_xa2_intake_continuation_warning(inputs)
	return en_intake_continuation_warning(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Retention_BodyInputs */

const en_intake_privacy_retention_body = /** @type {(inputs: Intake_Privacy_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encrypted information is kept as long as your case is open, plus any retention period set by the organization. See the telephony data disclosure below for phone and text message retention by the phone provider.`)
};

const es_intake_privacy_retention_body = /** @type {(inputs: Intake_Privacy_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu información cifrada se conserva mientras tu caso este abierto, más cualquier periodo de retención establecido por la organización. Consulta la divulgación de datos telefónicos a continuación para la retención de llamadas y mensajes de texto por parte del proveedor telefónico.`)
};

const en_xa2_intake_privacy_retention_body = /** @type {(inputs: Intake_Privacy_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr èncryptèd ìnfòrmàtìòn ìs kèpt às lòng às yòùr càsè ìs òpèn, plùs àny rètèntìòn pèrìòd sèt by thè òrgànìzàtìòn. Sèè thè tèlèphòny dàtà dìsclòsùrè bèlòw fòr phònè ànd tèxt mèssàgè rètèntìòn by thè phònè pròvìdèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your encrypted information is kept as long as your case is open, plus any retention period set by the organization. See the telephony data disclosure below f..." |
*
* @param {Intake_Privacy_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_retention_body = /** @type {((inputs?: Intake_Privacy_Retention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Retention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_retention_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_retention_body(inputs)
	return en_intake_privacy_retention_body(inputs)
});
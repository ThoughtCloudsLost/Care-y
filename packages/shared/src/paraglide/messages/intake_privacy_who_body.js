/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ orgName: NonNullable<unknown> }} Intake_Privacy_Who_BodyInputs */

const en_intake_privacy_who_body = /** @type {(inputs: Intake_Privacy_Who_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Your data is collected by ${i?.orgName}, supported by the CARE-Y platform operator.`)
};

const es_intake_privacy_who_body = /** @type {(inputs: Intake_Privacy_Who_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tus datos son recopilados por ${i?.orgName}, con el apoyo del operador de la plataforma CARE-Y.`)
};

const en_xa2_intake_privacy_who_body = /** @type {(inputs: Intake_Privacy_Who_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòùr dàtà ìs còllèctèd by  ••••••••${i?.orgName}, sùppòrtèd by thè CÀRÈ-Y plàtfòrm òpèràtòr. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your data is collected by {orgName}, supported by the CARE-Y platform operator." |
*
* @param {Intake_Privacy_Who_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_who_body = /** @type {((inputs: Intake_Privacy_Who_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Who_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_who_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_who_body(inputs)
	return en_intake_privacy_who_body(inputs)
});
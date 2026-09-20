/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Rights_BodyInputs */

const en_intake_privacy_rights_body = /** @type {(inputs: Intake_Privacy_Rights_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can ask to see, correct, or delete your information. Contact the organization and provide your reference code (shown after you submit this form) so they can locate your records. You also have the right to restrict how your data is used or to receive a copy of the data you provided.`)
};

const es_intake_privacy_rights_body = /** @type {(inputs: Intake_Privacy_Rights_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puedes pedir ver, corregir o eliminar tu información. Contacta a la organización y proporciona tu código de referencia (que se muestra después de enviar este formulario) para que puedan localizar tus registros. También tienes derecho a restringir el uso de tus datos o a recibir una copia de los datos que proporcionaste.`)
};

const en_xa2_intake_privacy_rights_body = /** @type {(inputs: Intake_Privacy_Rights_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù càn àsk tò sèè, còrrèct, òr dèlètè yòùr ìnfòrmàtìòn. Còntàct thè òrgànìzàtìòn ànd pròvìdè yòùr rèfèrèncè còdè (shòwn àftèr yòù sùbmìt thìs fòrm) sò thèy càn lòcàtè yòùr rècòrds. Yòù àlsò hàvè thè rìght tò rèstrìct hòw yòùr dàtà ìs ùsèd òr tò rècèìvè à còpy òf thè dàtà yòù pròvìdèd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You can ask to see, correct, or delete your information. Contact the organization and provide your reference code (shown after you submit this form) so they ..." |
*
* @param {Intake_Privacy_Rights_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_body = /** @type {((inputs?: Intake_Privacy_Rights_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Rights_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_rights_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_rights_body(inputs)
	return en_intake_privacy_rights_body(inputs)
});
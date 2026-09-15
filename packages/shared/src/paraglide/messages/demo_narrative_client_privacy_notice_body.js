/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Privacy_Notice_BodyInputs */

const en_demo_narrative_client_privacy_notice_body = /** @type {(inputs: Demo_Narrative_Client_Privacy_Notice_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The privacy notice is a localized page covering the full set of standard GDPR disclosure items, and it is accessible before and after a submission.
**Telephony retention.** The telephony provider keeps a record of the visitor's phone number for up to 150 days and message content for up to 60 days, which sits outside the encryption boundary and cannot be changed by the organization.
**Content source.** The privacy notice is rendered in the visitor's current language, with the organization's name as the only value that changes per deployment.`)
};

const es_demo_narrative_client_privacy_notice_body = /** @type {(inputs: Demo_Narrative_Client_Privacy_Notice_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El aviso de privacidad es una página localizada que cubre el conjunto completo de elementos estándar de divulgación del RGPD, y es accesible tanto antes como después de un envío.
**Retención de telefonía.** El proveedor de telefonía conserva un registro del número de teléfono del visitante hasta 150 días y el contenido de los mensajes hasta 60 días, lo cual queda fuera del perímetro de cifrado y la organización no puede modificarlo.
**Fuente del contenido.** El aviso de privacidad se muestra en el idioma actual del visitante, con el nombre de la organización como único valor que cambia por despliegue.`)
};

/**
* | output |
* | --- |
* | "The privacy notice is a localized page covering the full set of standard GDPR disclosure items, and it is accessible before and after a submission. **Telepho..." |
*
* @param {Demo_Narrative_Client_Privacy_Notice_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_privacy_notice_body = /** @type {((inputs?: Demo_Narrative_Client_Privacy_Notice_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Privacy_Notice_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_privacy_notice_body(inputs)
	return en_demo_narrative_client_privacy_notice_body(inputs)
});
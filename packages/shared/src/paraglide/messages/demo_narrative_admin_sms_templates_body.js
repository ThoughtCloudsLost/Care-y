/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Sms_Templates_BodyInputs */

const en_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS templates define the automated messages the system sends to clients. Templates support multiple languages so the system can send messages in the client's preferred language.`)
};

const es_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las plantillas SMS definen los mensajes automatizados que el sistema envia a los clientes. Las plantillas admiten multiples idiomas para que el sistema pueda enviar mensajes en el idioma preferido del cliente.`)
};

/**
* | output |
* | --- |
* | "SMS templates define the automated messages the system sends to clients. Templates support multiple languages so the system can send messages in the client's..." |
*
* @param {Demo_Narrative_Admin_Sms_Templates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_sms_templates_body = /** @type {((inputs?: Demo_Narrative_Admin_Sms_Templates_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Sms_Templates_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_sms_templates_body(inputs)
	return es_demo_narrative_admin_sms_templates_body(inputs)
});
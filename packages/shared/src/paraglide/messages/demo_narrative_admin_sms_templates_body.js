/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Sms_Templates_BodyInputs */

const en_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS templates define the automated messages the system sends to clients, and templates support multiple languages so the system can send messages in the client's preferred language.
**Message length.** Template text is capped at 1600 characters, which is ten standard SMS segments, and the server rejects a save that exceeds the limit.
**Permissions.** Editing SMS templates requires the Write automatic replies permission.`)
};

const es_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las plantillas SMS definen los mensajes automatizados que el sistema envía a los clientes, y admiten múltiples idiomas para que el sistema pueda enviar mensajes en el idioma preferido del cliente.
**Longitud del mensaje.** El texto de la plantilla tiene un límite de 1600 caracteres, lo que equivale a diez segmentos SMS estándar, y el servidor rechaza un guardado que exceda el límite.
**Permisos.** Editar plantillas SMS requiere el permiso Escribir respuestas automáticas.`)
};

const en_xa2_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS tèmplàtès dèfìnè thè àùtòmàtèd mèssàgès thè systèm sènds tò clìènts, ànd tèmplàtès sùppòrt mùltìplè làngùàgès sò thè systèm càn sènd mèssàgès ìn thè clìènt's prèfèrrèd làngùàgè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Mèssàgè lèngth. •••••** Tèmplàtè tèxt ìs càppèd àt 1600 chàràctèrs, whìch ìs tèn stàndàrd SMS sègmènts, ànd thè sèrvèr rèjècts à sàvè thàt èxcèèds thè lìmìt.
 •••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng SMS tèmplàtès rèqùìrès thè Wrìtè àùtòmàtìc rèplìès pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS templates define the automated messages the system sends to clients, and templates support multiple languages so the system can send messages in the clie..." |
*
* @param {Demo_Narrative_Admin_Sms_Templates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_sms_templates_body = /** @type {((inputs?: Demo_Narrative_Admin_Sms_Templates_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Sms_Templates_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_sms_templates_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_sms_templates_body(inputs)
	return en_demo_narrative_admin_sms_templates_body(inputs)
});
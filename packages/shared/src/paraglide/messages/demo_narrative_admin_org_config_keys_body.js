/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Org_Config_Keys_BodyInputs */

const en_demo_narrative_admin_org_config_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Org_Config_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization page has six sections: general info, branding, terminology, retention policy, follow-up types, and encryption keys. Branding and terminology are encrypted with the organization key before storage. The keys section shows the org key status, supports key rotation, and provides escrow export. Escrow splits the key across two independent servers in separate jurisdictions using the same OPRF threshold model that protects your login. No single server, and no single subpoena, can reconstruct the key. Every value on this page is a real query against the in-browser database.`)
};

const es_demo_narrative_admin_org_config_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Org_Config_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pagina de la organizacion tiene seis secciones: informacion general, marca, terminologia, politica de retencion, tipos de seguimiento y claves de cifrado. La marca y la terminologia se cifran con la clave de la organizacion antes del almacenamiento. La seccion de claves muestra el estado de la clave, permite la rotacion y ofrece exportacion de custodia. La custodia divide la clave entre dos servidores independientes en jurisdicciones separadas usando el mismo modelo OPRF de umbral que protege tu inicio de sesion. Ningun servidor individual, y ninguna orden judicial individual, puede reconstruir la clave. Cada valor en esta pagina es una consulta real contra la base de datos en el navegador.`)
};

/**
* | output |
* | --- |
* | "The organization page has six sections: general info, branding, terminology, retention policy, follow-up types, and encryption keys. Branding and terminology..." |
*
* @param {Demo_Narrative_Admin_Org_Config_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_org_config_keys_body = /** @type {((inputs?: Demo_Narrative_Admin_Org_Config_Keys_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Org_Config_Keys_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_org_config_keys_body(inputs)
	return es_demo_narrative_admin_org_config_keys_body(inputs)
});
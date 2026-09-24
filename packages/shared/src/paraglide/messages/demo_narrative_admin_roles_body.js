/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roles_BodyInputs */

const en_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The role reference pages summarize what users in each role can see and do, and the security status link on each page is in development.
**Permissions.** Viewing the role reference pages requires the Manage users permission.`)
};

const es_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las páginas de referencia de roles resumen lo que las personas usuarias en cada rol pueden ver y hacer, y el enlace de estado de seguridad en cada página está en desarrollo.
**Permisos.** Ver las páginas de referencia de roles requiere el permiso Gestionar usuarios.`)
};

const en_xa2_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ròlè rèfèrèncè pàgès sùmmàrìzè whàt ùsèrs ìn èàch ròlè càn sèè ànd dò, ànd thè sècùrìty stàtùs lìnk òn èàch pàgè ìs ìn dèvèlòpmènt.
 •••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng thè ròlè rèfèrèncè pàgès rèqùìrès thè Mànàgè ùsèrs pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The role reference pages summarize what users in each role can see and do, and the security status link on each page is in development. **Permissions.** View..." |
*
* @param {Demo_Narrative_Admin_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roles_body = /** @type {((inputs?: Demo_Narrative_Admin_Roles_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roles_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roles_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roles_body(inputs)
	return en_demo_narrative_admin_roles_body(inputs)
});
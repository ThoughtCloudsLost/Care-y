/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Blocklist_BodyInputs */

const en_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone numbers can be blocked from reaching the organization, and a blocked number is rejected before a ticket is created.
**Encryption.** Blocked numbers are encrypted with the organization key before storage, so the server stores ciphertext it cannot read.
**Permissions.** Managing the blocklist requires the Manage infrastructure permission.`)
};

const es_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los números de teléfono pueden bloquearse para que no lleguen a la organización, y un número bloqueado se rechaza antes de que se cree un ticket.
**Cifrado.** Los números bloqueados se cifran con la clave de la organización antes de almacenarse, de modo que el servidor almacena texto cifrado que no puede leer.
**Permisos.** Gestionar la lista de bloqueo requiere el permiso Gestionar infraestructura.`)
};

const en_xa2_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèrs càn bè blòckèd fròm rèàchìng thè òrgànìzàtìòn, ànd à blòckèd nùmbèr ìs rèjèctèd bèfòrè à tìckèt ìs crèàtèd.
 •••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Blòckèd nùmbèrs àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè, sò thè sèrvèr stòrès cìphèrtèxt ìt cànnòt rèàd.
 •••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Mànàgìng thè blòcklìst rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone numbers can be blocked from reaching the organization, and a blocked number is rejected before a ticket is created. **Encryption.** Blocked numbers are..." |
*
* @param {Demo_Narrative_Admin_Blocklist_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_blocklist_body = /** @type {((inputs?: Demo_Narrative_Admin_Blocklist_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Blocklist_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_blocklist_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_blocklist_body(inputs)
	return en_demo_narrative_admin_blocklist_body(inputs)
});
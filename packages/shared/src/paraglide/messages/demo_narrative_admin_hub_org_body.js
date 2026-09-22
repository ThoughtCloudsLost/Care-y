/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Org_BodyInputs */

const en_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization group holds seven destinations that shape the whole workspace rather than any one case, from the organization's name to its retention policy. [[#permissions]]
**What is readable and why.** The name, the logo, the colors and the support label are plaintext columns, because the sign-in page and the client-facing pages render them before anyone has a key. Terminology, note type names and their escalation targets are organization-key ciphertext, so the words an organization chooses for its own work stay with it. [General info](#admin-org/general) covers what that exposes. [[#encryption #server-holds]]
**Which permissions sort this group.** General, branding and terminology share Manage org identity, while retention, note types, intake forms and key custody each carry their own. Key custody is one of the three permissions locked to the administrator role, and intake form design is the one destination in this group a default manager holds. [The permission matrix](#admin-people/role-permissions) covers which of those an organization can move. [[#permissions #keys]]`)
};

const es_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de organización tiene siete destinos que definen el espacio de trabajo entero y no un caso concreto, desde el nombre de la organización hasta su política de retención. [[#permissions]]
**Qué se puede leer y por qué.** El nombre, el logotipo, los colores y la etiqueta de apoyo son columnas en texto plano, porque la página de inicio de sesión y las páginas dirigidas al cliente los muestran antes de que nadie tenga una clave. La terminología, los nombres de los tipos de nota y sus destinos de escalado son texto cifrado con la clave de la organización, de modo que las palabras que una organización elige para su propio trabajo se quedan con ella. [Información general](#admin-org/general) trata qué expone eso. [[#encryption #server-holds]]
**Qué permisos ordenan este grupo.** La información general, la marca y la terminología comparten Gestionar identidad de la organización, mientras que la retención, los tipos de nota, los formularios de admisión y la custodia de claves tienen cada uno el suyo. La custodia de claves es uno de los tres permisos bloqueados al rol de administración, y el diseño de formularios de admisión es el único destino de este grupo que tiene un rol de gestión predeterminado. [La matriz de permisos](#admin-people/role-permissions) trata cuáles de ellos puede mover una organización. [[#permissions #keys]]`)
};

const en_xa2_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèttìngs thàt shàpè thè whòlè wòrkspàcè: gènèràl ìnfò, bràndìng, tèrmìnòlògy, èncryptìòn kèys, dàtà rètèntìòn, nòtè typès, ànd ìntàkè fòrm mànàgèmènt. Gènèràl ìnfò ànd bràndìng àrè stòrèd wìthòùt èncryptìòn sò pàgès vìsìblè bèfòrè sìgn-ìn càn dìsplày thèm. Tèrmìnòlògy ànd nòtè typès àrè èncryptèd wìth thè òrgànìzàtìòn kèy. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization group holds seven destinations that shape the whole workspace rather than any one case, from the organization's name to its retention policy..." |
*
* @param {Demo_Narrative_Admin_Hub_Org_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_org_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Org_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Org_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_org_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_org_body(inputs)
	return en_demo_narrative_admin_hub_org_body(inputs)
});
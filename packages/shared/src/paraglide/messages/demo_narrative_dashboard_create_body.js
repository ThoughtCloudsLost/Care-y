/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Create_BodyInputs */

const en_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The navigation bar's create button opens a menu of options gated by the signed-in account's permissions. The button does not appear when the account holds none of the required permissions. [[#permissions]]
**What does each option require?** [[#permissions]]
- Ticket opens the new ticket form. Requires the Open cases permission.
- Article opens the article editor. Requires the Edit knowledge base permission.
- Category opens category management. Requires the Manage knowledge base categories permission.
- Queue opens the queue creation form. Requires the Manage queues permission.
- Invitation opens the invitation form. Requires the Manage users permission.
The server enforces the same permission when the destination form is submitted. [The permission system](#deep-dive/the-permission-system) covers where permissions come from.
**Single option.** When only one option is available the button skips the menu and opens that form directly. [Creating a new ticket](#tickets/new-ticket) covers the ticket form. [[#permissions]]
**The manifests and the menu.** The ticket, article, category, and queue gates read from the \`PROCEDURE_PERMISSIONS\` manifest, which is test-locked to the server router. The invitation gate reads from \`INLINE_CHECKED_CAPABILITIES\` because the server checks that permission inside the resolver. Both manifests are in \`packages/shared/src/\`. The menu is assembled in \`packages/client/src/routes/(app)/+page.svelte\`. [The permission matrix](#admin-people/role-permissions) covers which role holds which permission. [[#permissions]]`)
};

const es_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón de crear de la barra de navegación abre un menú de opciones condicionadas por los permisos de la cuenta que ha iniciado sesión. El botón no aparece cuando la cuenta no tiene ninguno de los permisos requeridos. [[#permissions]]
**¿Qué necesita cada opción?** [[#permissions]]
- Ticket abre el formulario de nuevo ticket. Requiere el permiso Abrir casos.
- Artículo abre el editor de artículos. Requiere el permiso Editar base de conocimiento.
- Categoría abre la gestión de categorías. Requiere el permiso Gestionar categorías de la base de conocimiento.
- Cola abre el formulario de creación de cola. Requiere el permiso Gestionar colas.
- Invitación abre el formulario de invitación. Requiere el permiso Gestionar usuarios.
El servidor aplica el mismo permiso cuando se envía el formulario de destino. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen los permisos.
**Opción única.** Cuando solo hay una opción disponible el botón salta el menú y abre ese formulario directamente. [Creando un nuevo ticket](#tickets/new-ticket) trata el formulario de ticket. [[#permissions]]
**Los manifiestos y el menú.** Las comprobaciones de ticket, artículo, categoría y cola leen del manifiesto \`PROCEDURE_PERMISSIONS\`, que está fijado por test al router del servidor. La comprobación de invitación lee de \`INLINE_CHECKED_CAPABILITIES\` porque el servidor comprueba ese permiso dentro del resolver. Ambos manifiestos están en \`packages/shared/src/\`. El menú se arma en \`packages/client/src/routes/(app)/+page.svelte\`. [La matriz de permisos](#admin-people/role-permissions) trata qué rol tiene cada permiso. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè nàvìgàtìòn bàr's crèàtè bùttòn òpèns à mènù òf òptìòns gàtèd by thè sìgnèd-ìn àccòùnt's pèrmìssìòns. Thè bùttòn dòès nòt àppèàr whèn thè àccòùnt hòlds nònè òf thè rèqùìrèd pèrmìssìòns. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch òptìòn rèqùìrè? •••••••••** [[#pèrmìssìòns]]
- Tìckèt òpèns thè nèw tìckèt fòrm. Rèqùìrès thè Òpèn càsès pèrmìssìòn.
- Àrtìclè òpèns thè àrtìclè èdìtòr. Rèqùìrès thè Èdìt knòwlèdgè bàsè pèrmìssìòn.
- Càtègòry òpèns càtègòry mànàgèmènt. Rèqùìrès thè Mànàgè knòwlèdgè bàsè càtègòrìès pèrmìssìòn.
- Qùèùè òpèns thè qùèùè crèàtìòn fòrm. Rèqùìrès thè Mànàgè qùèùès pèrmìssìòn.
- Ìnvìtàtìòn òpèns thè ìnvìtàtìòn fòrm. Rèqùìrès thè Mànàgè ùsèrs pèrmìssìòn.
Thè sèrvèr ènfòrcès thè sàmè pèrmìssìòn whèn thè dèstìnàtìòn fòrm ìs sùbmìttèd. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs whèrè pèrmìssìòns còmè fròm.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sìnglè òptìòn. •••••** Whèn ònly ònè òptìòn ìs àvàìlàblè thè bùttòn skìps thè mènù ànd òpèns thàt fòrm dìrèctly. [Crèàtìng à nèw tìckèt](#tìckèts/nèw-tìckèt) còvèrs thè tìckèt fòrm. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè mànìfèsts ànd thè mènù. •••••••••** Thè tìckèt, àrtìclè, càtègòry, ànd qùèùè gàtès rèàd fròm thè \`PRÒCÈDÙRÈ_PÈRMÌSSÌÒNS\` mànìfèst, whìch ìs tèst-lòckèd tò thè sèrvèr ròùtèr. Thè ìnvìtàtìòn gàtè rèàds fròm \`ÌNLÌNÈ_CHÈCKÈD_CÀPÀBÌLÌTÌÈS\` bècàùsè thè sèrvèr chècks thàt pèrmìssìòn ìnsìdè thè rèsòlvèr. Bòth mànìfèsts àrè ìn \`pàckàgès/shàrèd/src/\`. Thè mènù ìs àssèmblèd ìn \`pàckàgès/clìènt/src/ròùtès/(àpp)/+pàgè.svèltè\`. [Thè pèrmìssìòn màtrìx](#àdmìn-pèòplè/ròlè-pèrmìssìòns) còvèrs whìch ròlè hòlds whìch pèrmìssìòn. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The navigation bar's create button opens a menu of options gated by the signed-in account's permissions. The button does not appear when the account holds no..." |
*
* @param {Demo_Narrative_Dashboard_Create_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_create_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Create_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Create_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_create_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_create_body(inputs)
	return en_demo_narrative_dashboard_create_body(inputs)
});
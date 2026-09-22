/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Create_BodyInputs */

const en_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The create action in the navigation bar opens a menu whose options depend on what the account has permission to do. A new ticket is offered on every account; an article, a category, a queue and an invitation each appear with the matching permission. [[#permissions]]
**What each option needs.** Articles need permission to edit the knowledge base, categories to manage knowledge base categories, queues to manage queues, and invitations to manage users. Opening a ticket needs permission to open cases, which the server checks when the form is submitted. [The permission system](#deep-dive/the-permission-system) covers where a permission comes from. [[#permissions]]
**When there is only one.** With a single option available the control goes straight to that form and no menu opens, so an account with the narrowest permissions reaches the ticket form in one step. [Creating a new ticket](#tickets/new-ticket) covers the form itself. [[#permissions]]
**Where the options are assembled.** The list is built in \`packages/client/src/routes/(app)/+page.svelte\` from the session's permission set, and each option navigates to a route that enforces the same permission server-side. [Permission matrix](#admin-people/role-permissions) covers which role holds which of them. [[#permissions]]`)
};

const es_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La acción de crear de la barra de navegación abre un menú cuyas opciones dependen de lo que la cuenta tiene permiso para hacer. Todas las cuentas reciben la opción de un ticket nuevo; un artículo, una categoría, una cola y una invitación aparecen cada uno con el permiso correspondiente. [[#permissions]]
**Qué necesita cada opción.** Los artículos necesitan permiso para editar la base de conocimiento, las categorías para gestionar sus categorías, las colas para gestionar colas y las invitaciones para gestionar cuentas. Abrir un ticket necesita permiso para abrir casos, que el servidor comprueba al enviar el formulario. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde sale un permiso. [[#permissions]]
**Cuando solo hay una.** Con una única opción disponible el control va directo a ese formulario y no se abre ningún menú, de modo que una cuenta con los permisos más estrechos llega al formulario de ticket en un solo paso. [Creando un nuevo ticket](#tickets/new-ticket) trata el formulario en sí. [[#permissions]]
**Dónde se arma la lista de opciones.** La lista se construye en \`packages/client/src/routes/(app)/+page.svelte\` a partir del conjunto de permisos de la sesión, y cada opción navega a una ruta que aplica ese mismo permiso en el servidor. [Matriz de permisos](#admin-people/role-permissions) trata qué rol tiene cada uno de ellos. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè plùs bùttòn ìn thè nàvìgàtìòn bàr òpèns à crèàtìòn mènù. Òptìòns dèpènd òn thè cùrrènt ròlè ànd pèrmìssìòns. Àll vòlùntèèrs càn crèàtè à nèw tìckèt by dèfàùlt. Àdmìnìstràtòrs ànd mànàgèrs mày àlsò sèè òptìòns fòr knòwlèdgè bàsè àrtìclès, càtègòrìès, qùèùès, òr ìnvìtìng nèw vòlùntèèrs.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sìnglè òptìòn shòrtcùt. •••••••** Whèn ònly ònè crèàtìòn òptìòn ìs àvàìlàblè, thè bùttòn skìps thè mènù ànd gòès dìrèctly tò thè crèàtìòn fòrm. •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The create action in the navigation bar opens a menu whose options depend on what the account has permission to do. A new ticket is offered on every account;..." |
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